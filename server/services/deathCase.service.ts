import { Prisma, WorkflowStatus, CauseOfDeath, PlaceOfDeath, DisposalMethod, ApprovalStatus, UserRole } from '../generated/prisma';
import prisma from '../lib/prisma';
import { paginationMeta } from '../lib/pagination';
import {
  DeathCaseNotFoundException,
  InvalidWorkflowTransitionException,
  UnauthorizedWorkflowActionException,
  ImmutableRecordException,
  InvalidSectionException,
} from '../common/exceptions/deathCase.exceptions';
import { DEATH_CASE_WORKFLOW, WorkflowHelper } from '../common/workflow/death-case.workflow';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface UserContext {
  userId: string;
  role: string;
  username?: string;
}

interface ActivityLogEntry {
  timestamp: string;
  userId: string;
  action: string;
  section: string;
  changes: unknown[];
  comments?: string;
}

interface CorrectionEntry {
  timestamp: string;
  userId: string;
  reason: string;
  changes: unknown[];
}

// Full record type returned by _getDeathCaseById
type FullDeathCaseRecord = Prisma.DeceasedAnimalRecordGetPayload<{
  include: {
    deathEvent: true;
    postDeathHandling: true;
    legalFinancial: true;
    medicalContext: true;
    auditMetadata: true;
  };
}>;

// ─── Service ──────────────────────────────────────────────────────────────────

class DeathCaseService {
  // ── Private helpers ─────────────────────────────────────────────────────────

  private async _getDeathCaseById(caseId: string): Promise<FullDeathCaseRecord> {
    const record = await prisma.deceasedAnimalRecord.findUnique({
      where: { id: caseId },
      include: {
        deathEvent: true,
        postDeathHandling: true,
        legalFinancial: true,
        medicalContext: true,
        auditMetadata: true,
      },
    });
    if (!record) throw new DeathCaseNotFoundException(caseId);
    return record;
  }

  private _ensureCaseIsMutable(deathCase: FullDeathCaseRecord): void {
    if (
      deathCase.workflowStatus === WorkflowStatus.approved ||
      deathCase.workflowStatus === WorkflowStatus.archived
    ) {
      throw new ImmutableRecordException(deathCase.id);
    }
  }

  private _isEventSectionComplete(payload: Record<string, unknown>): boolean {
    const requiredFields = WorkflowHelper.getRequiredFields('event');
    return requiredFields.every(
      (field) => payload[field] !== undefined && payload[field] !== null,
    );
  }

  private _extractChanges(
    previous: Record<string, unknown> | null,
    current: Record<string, unknown> | null,
  ): Record<string, { from: unknown; to: unknown }> {
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    if (!previous && !current) return changes;

    const allKeys = new Set([
      ...Object.keys(previous ?? {}),
      ...Object.keys(current ?? {}),
    ]);

    for (const key of allKeys) {
      const prevValue = previous?.[key];
      const currValue = current?.[key];
      if (JSON.stringify(prevValue) !== JSON.stringify(currValue)) {
        changes[key] = { from: prevValue, to: currValue };
      }
    }
    return changes;
  }

  private _prepareChangesForActivityLog(
    changes: unknown,
  ): Array<{ field: string; from: unknown; to: unknown; note: string }> {
    const activityChanges: Array<{ field: string; from: unknown; to: unknown; note: string }> = [];
    if (!changes || typeof changes !== 'object') return activityChanges;

    for (const [field, change] of Object.entries(changes as Record<string, unknown>)) {
      if (change && typeof change === 'object' && 'from' in change && 'to' in change) {
        const c = change as { from: unknown; to: unknown };
        activityChanges.push({
          field,
          from: c.from,
          to: c.to,
          note: `Changed from ${JSON.stringify(c.from)} to ${JSON.stringify(c.to)}`,
        });
      } else {
        activityChanges.push({
          field,
          from: null,
          to: change,
          note: `Set to ${JSON.stringify(change)}`,
        });
      }
    }
    return activityChanges;
  }

  private async _addActivityLogEntry(
    caseId: string,
    userContext: UserContext,
    action: string,
    section: string,
    changes: unknown,
    comments: string,
  ): Promise<void> {
    const entry: ActivityLogEntry = {
      timestamp: new Date().toISOString(),
      userId: userContext.userId,
      action,
      section,
      changes: changes ? this._prepareChangesForActivityLog(changes) : [],
      comments,
    };
    await prisma.$executeRaw`
      UPDATE "AuditMetadata"
      SET "activityLog" = "activityLog" || ${JSON.stringify([entry])}::jsonb
      WHERE "recordId" = ${caseId}
    `;
  }

  private _determineCategory(mimetype: string): string {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype === 'application/pdf') return 'document';
    if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'spreadsheet';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype === 'text/plain') return 'text';
    return 'other';
  }

  private _computePermissions(
    deathCase: FullDeathCaseRecord,
    userRole: UserRole,
  ): {
    canEdit: boolean;
    canApprove: boolean;
    canRequestCorrection: boolean;
    nextActions: string[];
    lockedReasons: string[];
  } {
    const permissions = {
      canEdit: false,
      canApprove: false,
      canRequestCorrection: false,
      nextActions: [] as string[],
      lockedReasons: [] as string[],
    };

    const status = deathCase.workflowStatus;

    const p = DEATH_CASE_WORKFLOW.STATUS_PERMISSIONS[status];
    if (!p || !p.roles.includes(userRole)) {
      permissions.lockedReasons.push(`Role ${userRole} cannot access ${status} status`);
      return permissions;
    }

    permissions.nextActions = p.actions.filter((action) =>
      WorkflowHelper.canPerformAction(status, action, userRole),
    );

    permissions.canEdit = WorkflowHelper.canPerformAction(status, 'update_event', userRole);
    permissions.canApprove = WorkflowHelper.canPerformAction(status, 'review', userRole);
    permissions.canRequestCorrection = WorkflowHelper.canPerformAction(status, 'review', userRole);

    if (status === WorkflowStatus.approved || status === WorkflowStatus.archived) {
      permissions.lockedReasons.push(`Case is ${status} and cannot be modified`);
      permissions.canEdit = false;
      permissions.canApprove = false;
      permissions.canRequestCorrection = false;
      permissions.nextActions = [];
    }

    return permissions;
  }

  // ── Public methods ──────────────────────────────────────────────────────────

  async createDeathCase(animalId: string, userContext: UserContext) {
    // Idempotency: return existing case if one already exists
    const existing = await prisma.deceasedAnimalRecord.findUnique({
      where: { animalId },
    });
    if (existing) {
      console.log(`Death case already exists for animal ${animalId}, returning existing case`);
      return existing;
    }

    // Fetch animal with farm + owner
    const animal = await prisma.animal.findFirst({
      where: { id: animalId, isDeleted: false },
      include: { farm: { include: { owner: true } } },
    });
    if (!animal) throw new Error(`Animal with ID ${animalId} not found`);

    const [latestWeight, latestBreeding] = await Promise.all([
      prisma.animalUpdate.findFirst({
        where: { animalId, updateType: 'Weight' },
        orderBy: { date: 'desc' },
      }),
      prisma.animalUpdate.findFirst({
        where: { animalId, updateType: 'Breeding' },
        orderBy: { date: 'desc' },
      }),
    ]);

    const record = await prisma.$transaction(async (tx) => {
      const rec = await tx.deceasedAnimalRecord.create({
        data: {
          animalId,
          farmId: animal.farmId,
          recordVersion: 1,
          workflowStatus: WorkflowStatus.draft,
          tags: DEATH_CASE_WORKFLOW.DEFAULTS.tags,
          snapshotTagNumber: animal.tagNumber,
          snapshotName: animal.name,
          snapshotType: animal.animalType,
          snapshotBreed: animal.breed ?? null,
          snapshotGender: animal.gender ?? null,
          snapshotDateOfBirth: animal.dateOfBirth ?? null,
          snapshotFarmName: animal.farm?.name ?? 'Unknown Farm',
          snapshotOwnerName: animal.farm?.owner?.fullName ?? null,
          snapshotOwnerId: animal.farm?.ownerId ?? null,
          snapshotLastKnownWeight: latestWeight?.weight ?? animal.weight ?? null,
          snapshotLastKnownLocation: animal.farm?.location ?? null,
          snapshotReproductiveStatus: latestBreeding?.status ?? null,
        },
      });

      await tx.deathEvent.create({
        data: {
          recordId: rec.id,
          dateOfDeath: new Date(),
          causeOfDeath: CauseOfDeath.unknown,
          placeOfDeath: PlaceOfDeath.unknown,
          reportedById: userContext.userId,
        },
      });

      await tx.auditMetadata.create({
        data: {
          recordId: rec.id,
          recordCreatedById: userContext.userId,
          recordCreatedAt: new Date(),
          approvalStatus: ApprovalStatus.pending,
          activityLog: [],
          corrections: [],
          attachments: [],
          complianceChecklist: [],
        },
      });

      return rec;
    });

    await this._addActivityLogEntry(
      record.id,
      userContext,
      'case_created',
      'system',
      null,
      'Death case created',
    );

    return record;
  }

  async updateEventSection(
    caseId: string,
    payload: Record<string, unknown>,
    userContext: UserContext,
  ) {
    const record = await this._getDeathCaseById(caseId);
    this._ensureCaseIsMutable(record);

    if (
      !WorkflowHelper.canPerformAction(
        record.workflowStatus,
        'update_event',
        userContext.role as UserRole,
      )
    ) {
      throw new UnauthorizedWorkflowActionException(userContext.role, 'update_event');
    }

    const missing = WorkflowHelper.getRequiredFields('event').filter((f) => !payload[f]);
    if (missing.length) {
      throw new InvalidSectionException('event', `Missing required fields: ${missing.join(', ')}`);
    }

    if (payload.causeOfDeath && !WorkflowHelper.isValidCauseOfDeath(payload.causeOfDeath as string)) {
      throw new InvalidSectionException('event', `Invalid cause of death: ${payload.causeOfDeath}`);
    }

    const isComplete = this._isEventSectionComplete(payload);
    const nextStatus = isComplete ? WorkflowStatus.reported : WorkflowStatus.draft;

    if (!WorkflowHelper.canTransition(record.workflowStatus, nextStatus)) {
      throw new InvalidWorkflowTransitionException(record.workflowStatus, nextStatus);
    }

    let tags = record.tags;
    if (
      payload.causeOfDeath &&
      payload.causeOfDeath !== DEATH_CASE_WORKFLOW.DEFAULTS.causeOfDeath
    ) {
      tags = tags.filter((t) => t !== 'investigation_pending');
    }

    // Capture previous event values for audit
    const previousEvent = record.deathEvent
      ? {
          dateOfDeath: record.deathEvent.dateOfDeath,
          causeOfDeath: record.deathEvent.causeOfDeath,
          causeDetails: record.deathEvent.causeDetails,
          placeOfDeath: record.deathEvent.placeOfDeath,
        }
      : null;

    await prisma.$transaction(async (tx) => {
      await tx.deceasedAnimalRecord.update({
        where: { id: caseId },
        data: {
          workflowStatus: nextStatus,
          recordVersion: { increment: 1 },
          tags,
          ...(payload.locationAtDeath
            ? { locationAtDeath: payload.locationAtDeath as string }
            : {}),
        },
      });

      if (record.deathEvent) {
        await tx.deathEvent.update({
          where: { recordId: caseId },
          data: {
            dateOfDeath: payload.dateOfDeath
              ? new Date(payload.dateOfDeath as string)
              : undefined,
            causeOfDeath: payload.causeOfDeath
              ? (payload.causeOfDeath as CauseOfDeath)
              : undefined,
            causeDetails: payload.causeDetails
              ? (payload.causeDetails as string)
              : undefined,
            placeOfDeath: payload.placeOfDeath
              ? (payload.placeOfDeath as PlaceOfDeath)
              : undefined,
            reportedById: userContext.userId,
          },
        });
      }
    });

    const currentEvent = payload as Record<string, unknown>;
    const changes = this._extractChanges(
      previousEvent as Record<string, unknown> | null,
      currentEvent,
    );

    await this._addActivityLogEntry(
      caseId,
      userContext,
      'event_section_updated',
      'event',
      changes,
      `Event information ${isComplete ? 'completed' : 'updated'}`,
    );

    return this._getDeathCaseById(caseId);
  }

  async requestVetReview(caseId: string, requiresVet: boolean, userContext: UserContext) {
    const record = await this._getDeathCaseById(caseId);
    this._ensureCaseIsMutable(record);

    if (
      !WorkflowHelper.canPerformAction(
        record.workflowStatus,
        'request_vet',
        userContext.role as UserRole,
      )
    ) {
      throw new UnauthorizedWorkflowActionException(userContext.role, 'request_vet');
    }

    const nextStatus = requiresVet
      ? WorkflowStatus.vet_requested
      : WorkflowStatus.disposal_pending;

    if (!WorkflowHelper.canTransition(record.workflowStatus, nextStatus)) {
      throw new InvalidWorkflowTransitionException(record.workflowStatus, nextStatus);
    }

    await prisma.deceasedAnimalRecord.update({
      where: { id: caseId },
      data: { workflowStatus: nextStatus, recordVersion: { increment: 1 } },
    });

    await this._addActivityLogEntry(
      caseId,
      userContext,
      'vet_review_requested',
      'workflow',
      { requiresVet },
      `Veterinary review ${requiresVet ? 'requested' : 'not required'}`,
    );

    return this._getDeathCaseById(caseId);
  }

  async confirmVet(caseId: string, vetPayload: Record<string, unknown>, userContext: UserContext) {
    const record = await this._getDeathCaseById(caseId);
    this._ensureCaseIsMutable(record);

    if (
      !WorkflowHelper.canPerformAction(
        record.workflowStatus,
        'confirm_vet',
        userContext.role as UserRole,
      )
    ) {
      throw new UnauthorizedWorkflowActionException(userContext.role, 'confirm_vet');
    }

    if (!WorkflowHelper.canTransition(record.workflowStatus, WorkflowStatus.vet_confirmed)) {
      throw new InvalidWorkflowTransitionException(record.workflowStatus, WorkflowStatus.vet_confirmed);
    }

    if (
      vetPayload.causeOfDeath &&
      !WorkflowHelper.isValidCauseOfDeath(vetPayload.causeOfDeath as string)
    ) {
      throw new InvalidSectionException('vet', `Invalid cause of death: ${vetPayload.causeOfDeath}`);
    }

    // Apply auto-transition after vet_confirmed -> disposal_pending
    const autoTransition = WorkflowHelper.getAutoTransition(WorkflowStatus.vet_confirmed);
    const finalStatus =
      autoTransition && WorkflowHelper.canTransition(WorkflowStatus.vet_confirmed, autoTransition)
        ? autoTransition
        : WorkflowStatus.vet_confirmed;

    const versionIncrement = finalStatus !== WorkflowStatus.vet_confirmed ? 2 : 1;

    await prisma.$transaction(async (tx) => {
      await tx.deceasedAnimalRecord.update({
        where: { id: caseId },
        data: {
          workflowStatus: finalStatus,
          recordVersion: { increment: versionIncrement },
        },
      });

      if (record.deathEvent) {
        await tx.deathEvent.update({
          where: { recordId: caseId },
          data: {
            ...(vetPayload.causeOfDeath
              ? { causeOfDeath: vetPayload.causeOfDeath as CauseOfDeath }
              : {}),
            ...(vetPayload.causeDetails
              ? { causeDetails: vetPayload.causeDetails as string }
              : {}),
            confirmedById: userContext.userId,
            confirmedAt: new Date(),
          },
        });
      }

      await tx.postDeathHandling.upsert({
        where: { recordId: caseId },
        create: {
          recordId: caseId,
          necropsyPerformed: (vetPayload.necropsyPerformed as boolean | undefined) ?? false,
          necropsyFindings: (vetPayload.necropsyFindings as string | undefined) ?? null,
          necropsyReportLink: (vetPayload.necropsyReportLink as string | undefined) ?? null,
          labSamplesTaken: (vetPayload.labSamplesTaken as string[] | undefined) ?? [],
        },
        update: {
          ...(vetPayload.necropsyPerformed !== undefined
            ? { necropsyPerformed: vetPayload.necropsyPerformed as boolean }
            : {}),
          ...(vetPayload.necropsyFindings
            ? { necropsyFindings: vetPayload.necropsyFindings as string }
            : {}),
          ...(vetPayload.necropsyReportLink
            ? { necropsyReportLink: vetPayload.necropsyReportLink as string }
            : {}),
          ...(vetPayload.labSamplesTaken
            ? { labSamplesTaken: vetPayload.labSamplesTaken as string[] }
            : {}),
        },
      });

      await tx.medicalContext.upsert({
        where: { recordId: caseId },
        create: {
          recordId: caseId,
          attendingVetId: userContext.userId,
          lastVetVisitDate: new Date(),
          lastVetVisitReason: 'death_confirmation',
        },
        update: {
          attendingVetId: userContext.userId,
          lastVetVisitDate: new Date(),
          lastVetVisitReason: 'death_confirmation',
        },
      });
    });

    await this._addActivityLogEntry(
      caseId,
      userContext,
      'vet_confirmation_completed',
      'vet',
      { causeOfDeath: vetPayload.causeOfDeath },
      'Veterinary confirmation completed',
    );

    if (finalStatus !== WorkflowStatus.vet_confirmed) {
      await this._addActivityLogEntry(
        caseId,
        userContext,
        'auto_transition',
        'workflow',
        { from: WorkflowStatus.vet_confirmed, to: finalStatus },
        'Auto-transitioned to disposal pending',
      );
    }

    return this._getDeathCaseById(caseId);
  }

  async recordDisposal(
    caseId: string,
    disposalPayload: Record<string, unknown>,
    userContext: UserContext,
  ) {
    const record = await this._getDeathCaseById(caseId);
    this._ensureCaseIsMutable(record);

    if (
      !WorkflowHelper.canPerformAction(
        record.workflowStatus,
        'record_disposal',
        userContext.role as UserRole,
      )
    ) {
      throw new UnauthorizedWorkflowActionException(userContext.role, 'record_disposal');
    }

    const missing = WorkflowHelper.getRequiredFields('disposal').filter(
      (f) => !disposalPayload[f],
    );
    if (missing.length) {
      throw new InvalidSectionException('disposal', `Missing required fields: ${missing.join(', ')}`);
    }

    if (
      disposalPayload.disposalMethod &&
      !WorkflowHelper.isValidDisposalMethod(disposalPayload.disposalMethod as string)
    ) {
      throw new InvalidSectionException(
        'disposal',
        `Invalid disposal method: ${disposalPayload.disposalMethod}`,
      );
    }

    if (!WorkflowHelper.canTransition(record.workflowStatus, WorkflowStatus.disposal_recorded)) {
      throw new InvalidWorkflowTransitionException(
        record.workflowStatus,
        WorkflowStatus.disposal_recorded,
      );
    }

    const autoTransition = WorkflowHelper.getAutoTransition(WorkflowStatus.disposal_recorded);
    const finalStatus =
      autoTransition &&
      WorkflowHelper.canTransition(WorkflowStatus.disposal_recorded, autoTransition)
        ? autoTransition
        : WorkflowStatus.disposal_recorded;

    const versionIncrement = finalStatus !== WorkflowStatus.disposal_recorded ? 2 : 1;

    await prisma.$transaction(async (tx) => {
      await tx.deceasedAnimalRecord.update({
        where: { id: caseId },
        data: {
          workflowStatus: finalStatus,
          recordVersion: { increment: versionIncrement },
        },
      });

      await tx.postDeathHandling.upsert({
        where: { recordId: caseId },
        create: {
          recordId: caseId,
          necropsyPerformed: false,
          disposalMethod: disposalPayload.disposalMethod as DisposalMethod,
          disposalDate: disposalPayload.disposalDate
            ? new Date(disposalPayload.disposalDate as string)
            : null,
          disposalLocation: (disposalPayload.disposalLocation as string | undefined) ?? null,
          disposalCompany: (disposalPayload.disposalCompany as string | undefined) ?? null,
          disposalCost: (disposalPayload.disposalCost as number | undefined) ?? null,
          disposalCertificateId:
            (disposalPayload.disposalCertificateId as string | undefined) ?? null,
        },
        update: {
          disposalMethod: disposalPayload.disposalMethod as DisposalMethod,
          disposalDate: disposalPayload.disposalDate
            ? new Date(disposalPayload.disposalDate as string)
            : undefined,
          ...(disposalPayload.disposalLocation
            ? { disposalLocation: disposalPayload.disposalLocation as string }
            : {}),
          ...(disposalPayload.disposalCompany
            ? { disposalCompany: disposalPayload.disposalCompany as string }
            : {}),
          ...(disposalPayload.disposalCost !== undefined
            ? { disposalCost: disposalPayload.disposalCost as number }
            : {}),
          ...(disposalPayload.disposalCertificateId
            ? { disposalCertificateId: disposalPayload.disposalCertificateId as string }
            : {}),
        },
      });
    });

    await this._addActivityLogEntry(
      caseId,
      userContext,
      'disposal_recorded',
      'disposal',
      disposalPayload,
      'Disposal recorded',
    );

    if (finalStatus !== WorkflowStatus.disposal_recorded) {
      await this._addActivityLogEntry(
        caseId,
        userContext,
        'auto_transition',
        'workflow',
        { from: WorkflowStatus.disposal_recorded, to: finalStatus },
        'Auto-transitioned to review pending',
      );
    }

    return this._getDeathCaseById(caseId);
  }

  async managerReview(
    caseId: string,
    decision: string,
    comments: string | undefined,
    correctionRequests: Array<{ field: string; expectedValue: unknown; reason: string }> | undefined,
    userContext: UserContext,
  ) {
    const record = await this._getDeathCaseById(caseId);
    this._ensureCaseIsMutable(record);

    if (
      !WorkflowHelper.canPerformAction(
        record.workflowStatus,
        'review',
        userContext.role as UserRole,
      )
    ) {
      throw new UnauthorizedWorkflowActionException(userContext.role, 'review');
    }

    const nextStatus =
      decision === 'approved' ? WorkflowStatus.approved : WorkflowStatus.correction_needed;

    if (!WorkflowHelper.canTransition(record.workflowStatus, nextStatus)) {
      throw new InvalidWorkflowTransitionException(record.workflowStatus, nextStatus);
    }

    const previousApprovalStatus = record.auditMetadata?.approvalStatus;

    await prisma.$transaction(async (tx) => {
      await tx.deceasedAnimalRecord.update({
        where: { id: caseId },
        data: { workflowStatus: nextStatus, recordVersion: { increment: 1 } },
      });

      if (decision === 'approved') {
        const audit = await tx.auditMetadata.findUniqueOrThrow({
          where: { recordId: caseId },
          select: { complianceChecklist: true },
        });
        const checklist = (audit.complianceChecklist as unknown[]).map((item) => ({
          ...(item as object),
          completed: true,
          completedAt: new Date().toISOString(),
          completedBy: userContext.userId,
        }));
        await tx.auditMetadata.update({
          where: { recordId: caseId },
          data: {
            reviewedBy: userContext.userId,
            reviewedAt: new Date(),
            approvalStatus: ApprovalStatus.approved,
            approvalNotes: comments ?? null,
            complianceChecklist: checklist,
          },
        });
      } else {
        // correction_needed
        if (correctionRequests && correctionRequests.length > 0) {
          const correctionEntry: CorrectionEntry = {
            timestamp: new Date().toISOString(),
            userId: userContext.userId,
            reason: 'Manager requested corrections',
            changes: correctionRequests.map((req) => ({
              field: req.field,
              from: null,
              to: req.expectedValue,
              note: req.reason,
            })),
          };
          await prisma.$executeRaw`
            UPDATE "AuditMetadata"
            SET "corrections" = "corrections" || ${JSON.stringify([correctionEntry])}::jsonb
            WHERE "recordId" = ${caseId}
          `;
        }
        await tx.auditMetadata.update({
          where: { recordId: caseId },
          data: {
            reviewedBy: userContext.userId,
            reviewedAt: new Date(),
            approvalStatus: ApprovalStatus.requires_correction,
            approvalNotes: comments ?? null,
          },
        });
      }
    });

    await this._addActivityLogEntry(
      caseId,
      userContext,
      'manager_review',
      'review',
      {
        approvalStatus: {
          from: previousApprovalStatus,
          to: decision === 'approved' ? ApprovalStatus.approved : ApprovalStatus.requires_correction,
        },
        decision,
        comments,
      },
      `Manager review: ${decision}`,
    );

    return this._getDeathCaseById(caseId);
  }

  async getDeathCase(caseId: string, userContext: UserContext) {
    const record = await this._getDeathCaseById(caseId);
    const permissions = this._computePermissions(record, userContext.role as UserRole);
    return { ...record, permissions };
  }

  async findDeathCases(
    filters: {
      farmId: string;
      workflowStatus?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      causeOfDeath?: string;
      page?: number;
      limit?: number;
    },
    userContext: UserContext,
  ) {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, filters.limit ?? 20);
    const skip = (page - 1) * limit;

    const where: Prisma.DeceasedAnimalRecordWhereInput = { farmId: filters.farmId };

    if (filters.workflowStatus) {
      where.workflowStatus = filters.workflowStatus as WorkflowStatus;
    }
    if (filters.type) {
      where.snapshotType = filters.type;
    }
    if (filters.startDate || filters.endDate) {
      where.deathEvent = {
        dateOfDeath: {
          ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
          ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
        },
      };
    }
    if (filters.causeOfDeath) {
      where.deathEvent = {
        ...(where.deathEvent as object),
        causeOfDeath: filters.causeOfDeath as CauseOfDeath,
      };
    }

    const [records, total] = await Promise.all([
      prisma.deceasedAnimalRecord.findMany({
        where,
        include: { deathEvent: true, postDeathHandling: true, auditMetadata: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deceasedAnimalRecord.count({ where }),
    ]);

    const data = records.map((r) => ({
      ...r,
      permissions: this._computePermissions(r as FullDeathCaseRecord, userContext.role as UserRole),
    }));

    return { data, pagination: paginationMeta(page, limit, total) };
  }

  async addAttachment(caseId: string, file: Express.Multer.File, userContext: UserContext) {
    const record = await this._getDeathCaseById(caseId);
    this._ensureCaseIsMutable(record);

    const newAttachment = [
      {
        name: file.filename ?? file.originalname ?? 'file',
        type: file.mimetype,
        url: file.path ?? `/uploads/death-cases/${file.filename}`,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: userContext.userId,
        category: this._determineCategory(file.mimetype),
      },
    ];

    await prisma.$executeRaw`
      UPDATE "AuditMetadata"
      SET "attachments" = "attachments" || ${JSON.stringify(newAttachment)}::jsonb
      WHERE "recordId" = ${caseId}
    `;
    await prisma.deceasedAnimalRecord.update({
      where: { id: caseId },
      data: { recordVersion: { increment: 1 } },
    });

    await this._addActivityLogEntry(
      caseId,
      userContext,
      'attachment_added',
      'attachments',
      { filename: newAttachment[0].name },
      'Attachment added',
    );

    return this._getDeathCaseById(caseId);
  }

  async addAttachments(caseId: string, files: Express.Multer.File[], userContext: UserContext) {
    const record = await this._getDeathCaseById(caseId);
    this._ensureCaseIsMutable(record);

    const newAttachments = files.map((f) => ({
      name: f.filename ?? f.originalname ?? 'file',
      type: f.mimetype,
      url: f.path ?? `/uploads/death-cases/${f.filename}`,
      size: f.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userContext.userId,
      category: this._determineCategory(f.mimetype),
    }));

    await prisma.$executeRaw`
      UPDATE "AuditMetadata"
      SET "attachments" = "attachments" || ${JSON.stringify(newAttachments)}::jsonb
      WHERE "recordId" = ${caseId}
    `;
    await prisma.deceasedAnimalRecord.update({
      where: { id: caseId },
      data: { recordVersion: { increment: 1 } },
    });

    await this._addActivityLogEntry(
      caseId,
      userContext,
      'attachments_added',
      'attachments',
      { count: newAttachments.length },
      `${newAttachments.length} attachment(s) added`,
    );

    return this._getDeathCaseById(caseId);
  }

  async updateComplianceChecklist(
    caseId: string,
    checklistItem: {
      label: string;
      required?: boolean;
      completed?: boolean;
      notes?: string;
    },
    userContext: UserContext,
  ) {
    const record = await this._getDeathCaseById(caseId);
    this._ensureCaseIsMutable(record);

    await prisma.$transaction(async (tx) => {
      const audit = await tx.auditMetadata.findUniqueOrThrow({
        where: { recordId: caseId },
        select: { complianceChecklist: true },
      });

      let checklist = audit.complianceChecklist as unknown[];
      const idx = (checklist as Array<{ label: string }>).findIndex(
        (i) => i.label === checklistItem.label,
      );

      const updated = {
        label: checklistItem.label,
        required: checklistItem.required ?? false,
        completed: checklistItem.completed ?? false,
        completedAt: checklistItem.completed ? new Date().toISOString() : null,
        completedBy: checklistItem.completed ? userContext.userId : null,
        notes: checklistItem.notes,
      };

      if (idx >= 0) {
        checklist = checklist.map((item, i) =>
          i === idx ? { ...(item as object), ...updated } : item,
        );
      } else {
        checklist = [...checklist, updated];
      }

      await tx.auditMetadata.update({
        where: { recordId: caseId },
        data: { complianceChecklist: checklist as Prisma.InputJsonValue },
      });
      await tx.deceasedAnimalRecord.update({
        where: { id: caseId },
        data: { recordVersion: { increment: 1 } },
      });
    });

    await this._addActivityLogEntry(
      caseId,
      userContext,
      'compliance_checklist_updated',
      'compliance',
      null,
      'Compliance checklist updated',
    );

    return this._getDeathCaseById(caseId);
  }
}

export default DeathCaseService;
