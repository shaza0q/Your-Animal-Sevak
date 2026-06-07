import { api } from "@/lib/api";
import {
  DeathCase,
  WorkflowStatus,
  UserRole,
} from "@/types/deathCase";

// ─── Backend response shapes ──────────────────────────────────────────────────

export interface BackendDeathCaseRecord {
  id: string;
  animalId: string;
  farmId: string;
  workflowStatus: string;
  snapshotTagNumber: string;
  snapshotName: string | null;
  snapshotType: string;
  snapshotBreed: string | null;
  snapshotGender: string | null;
  snapshotDateOfBirth: string | null;
  snapshotFarmName: string;
  snapshotOwnerName: string | null;
  snapshotOwnerId: string | null;
  snapshotLastKnownWeight: number | null;
  snapshotLastKnownLocation: string | null;
  snapshotReproductiveStatus: string | null;
  locationAtDeath: string | null;
  tags: string[];
  recordVersion: number;
  createdAt: string;
  updatedAt: string;
  deathEvent: {
    id?: string;
    dateOfDeath: string;
    causeOfDeath: string;
    causeDetails: string | null;
    placeOfDeath: string;
    reportedById: string;
    confirmedById: string | null;
    confirmedAt: string | null;
  } | null;
  postDeathHandling: {
    id?: string;
    necropsyPerformed: boolean;
    necropsyFindings: string | null;
    necropsyReportLink: string | null;
    labSamplesTaken: string[];
    disposalMethod: string | null;
    disposalDate: string | null;
    disposalLocation: string | null;
    disposalCompany: string | null;
    disposalCost: number | null;
    disposalCertificateId: string | null;
  } | null;
  legalFinancial: unknown | null;
  medicalContext: {
    attendingVetId: string | null;
    lastVetVisitDate: string | null;
    lastVetVisitReason: string | null;
  } | null;
  auditMetadata: {
    activityLog: Array<{
      timestamp: string;
      userId: string;
      action: string;
      section: string;
      changes: unknown[];
      comments?: string;
    }>;
    corrections: unknown[];
    attachments: Array<{
      name: string;
      type: string;
      url: string;
      size: number;
      uploadedAt: string;
      uploadedBy: string;
      category: string;
    }>;
    complianceChecklist: Array<{
      label: string;
      required: boolean;
      completed: boolean;
      completedAt?: string;
      completedBy?: string;
      notes?: string;
    }>;
    approvalStatus: string;
    reviewedBy: string | null;
    reviewedAt: string | null;
    approvalNotes: string | null;
  } | null;
  permissions?: {
    canEdit: boolean;
    canApprove: boolean;
    canRequestCorrection: boolean;
    nextActions: string[];
    lockedReasons: string[];
  };
}

export interface BackendPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── Adapter: backend record → frontend DeathCase ────────────────────────────

function mapPlaceOfDeath(
  place: string,
): "barn" | "field" | "clinic" | "hospital" | "transport" | "unknown" {
  switch (place) {
    case "barn": return "barn";
    case "field": return "field";
    case "clinic": return "clinic";
    case "hospital": return "hospital";
    case "transport": return "transport";
    default: return "unknown";
  }
}

function mapDisposalMethod(
  method: string,
): "burial" | "cremation" | "rendering" | "composting" | "other" {
  switch (method) {
    case "burial": return "burial";
    case "cremation": return "cremation";
    case "rendering": return "rendering";
    case "composting": return "composting";
    default: return "other";
  }
}

export function mapBackendToDeathCase(r: BackendDeathCaseRecord): DeathCase {
  const caseNumber = `DC-${r.id.slice(0, 8).toUpperCase()}`;

  return {
    id: r.id,
    caseNumber,
    animalId: r.animalId,
    workflowStatus: r.workflowStatus as WorkflowStatus,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,

    snapshot: {
      id: r.animalId,
      name: r.snapshotName ?? "Unknown",
      tagNumber: r.snapshotTagNumber,
      species: r.snapshotType,
      breed: r.snapshotBreed ?? undefined,
      gender: r.snapshotGender?.toLowerCase() === "female" ? "female" : "male",
      dateOfBirth: r.snapshotDateOfBirth ?? undefined,
      farmId: r.farmId,
      farmName: r.snapshotFarmName,
      location: r.snapshotLastKnownLocation ?? undefined,
    },

    eventInfo: r.deathEvent
      ? {
          dateOfDeath: r.deathEvent.dateOfDeath,
          placeOfDeath: mapPlaceOfDeath(r.deathEvent.placeOfDeath),
          reportedCause: r.deathEvent.causeOfDeath,
          reportedCauseDetails: r.deathEvent.causeDetails ?? undefined,
          discoveredBy: "Reported",
          discoveredById: r.deathEvent.reportedById,
        }
      : undefined,

    vetConfirmation:
      r.deathEvent?.confirmedById && r.deathEvent?.confirmedAt
        ? {
            confirmedBy: r.deathEvent.confirmedById,
            confirmedById: r.deathEvent.confirmedById,
            confirmedAt: r.deathEvent.confirmedAt,
            confirmedCause: r.deathEvent.causeOfDeath,
            confirmedCauseDetails: r.deathEvent.causeDetails ?? undefined,
            necropsyRequired: r.postDeathHandling?.necropsyPerformed ?? false,
            necropsyPerformed: r.postDeathHandling?.necropsyPerformed,
            necropsyFindings: r.postDeathHandling?.necropsyFindings ?? undefined,
          }
        : undefined,

    disposalInfo: r.postDeathHandling?.disposalMethod
      ? {
          method: mapDisposalMethod(r.postDeathHandling.disposalMethod),
          date: r.postDeathHandling.disposalDate ?? "",
          handledBy: "Recorded",
          handledById: "system",
          location: r.postDeathHandling.disposalLocation ?? undefined,
        }
      : undefined,

    managerReview:
      r.auditMetadata?.reviewedBy && r.auditMetadata?.reviewedAt
        ? {
            reviewedBy: r.auditMetadata.reviewedBy,
            reviewedById: r.auditMetadata.reviewedBy,
            reviewedAt: r.auditMetadata.reviewedAt,
            decision:
              r.auditMetadata.approvalStatus === "approved"
                ? "approved"
                : "correction_needed",
            comments: r.auditMetadata.approvalNotes ?? undefined,
          }
        : undefined,

    auditTrail: (r.auditMetadata?.activityLog ?? []).map((entry, i) => ({
      id: `${i}-${entry.timestamp}`,
      timestamp: entry.timestamp,
      userId: entry.userId,
      userName: entry.userId,
      userRole: "admin" as UserRole,
      action: entry.action,
      section: entry.section as "event" | "vet" | "disposal" | "general" | undefined,
      notes: entry.comments,
    })),

    attachments: (r.auditMetadata?.attachments ?? []).map((a, i) => ({
      id: `${i}-${a.name}`,
      name: a.name,
      type: "other" as const,
      url: a.url,
      uploadedAt: a.uploadedAt,
      uploadedBy: a.uploadedBy,
      uploadedById: a.uploadedBy,
      section: "general" as const,
    })),

    complianceChecklist: (r.auditMetadata?.complianceChecklist ?? []).map(
      (item, i) => ({
        id: `checklist-${i}`,
        label: item.label,
        required: item.required,
        completed: item.completed,
        completedAt: item.completedAt,
        completedBy: item.completedBy,
        notes: item.notes,
      }),
    ),

    permissions: r.permissions
      ? {
          canViewCase: true,
          canEditEvent: r.permissions.canEdit,
          canEditVet: r.permissions.nextActions.includes("confirm_vet"),
          canEditDisposal: r.permissions.nextActions.includes("record_disposal"),
          canReview: r.permissions.canApprove,
          canApprove: r.permissions.canApprove,
          canAddAttachments: r.permissions.canEdit,
          canRequestCorrection: r.permissions.canRequestCorrection,
        }
      : undefined,
  };
}

// ─── API params / request types ───────────────────────────────────────────────

export interface ListDeathCasesParams {
  farmId?: string;
  status?: WorkflowStatus | WorkflowStatus[];
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  cause?: string;
  type?: string;
}

export interface UpdateEventPayload {
  dateOfDeath: string;
  causeOfDeath: string;
  placeOfDeath: string;
  causeDetails?: string;
}

export interface ConfirmVetPayload {
  causeOfDeath?: string;
  causeDetails?: string;
  necropsyPerformed?: boolean;
  necropsyFindings?: string;
  necropsyReportLink?: string;
  labSamplesTaken?: string[];
}

export interface RecordDisposalPayload {
  disposalMethod: string;
  disposalDate: string;
  disposalLocation?: string;
  disposalCompany?: string;
  disposalCost?: number;
  disposalCertificateId?: string;
}

export interface ManagerReviewPayload {
  decision: "approved" | "correction_needed";
  comments?: string;
  correctionRequests?: Array<{ field: string; expectedValue: unknown; reason: string }>;
}

// ─── API object ───────────────────────────────────────────────────────────────

export const DeathCaseAPI = {
  list: (params?: ListDeathCasesParams, signal?: AbortSignal) => {
    const p: Record<string, unknown> = { ...params };
    if (Array.isArray(p.status)) p.status = (p.status as string[]).join(",");
    return api.get("/deathCases/death-cases", { params: p, signal });
  },

  get: (id: string) => api.get(`/deathCases/death-cases/${id}`),

  createForAnimal: (animalId: string) =>
    api.post(`/deathCases/animals/${animalId}/death-case`),

  updateEventInfo: (caseId: string, payload: UpdateEventPayload) =>
    api.patch(`/deathCases/death-cases/${caseId}/event`, payload),

  requestVet: (caseId: string, requiresVet = true) =>
    api.patch(`/deathCases/death-cases/${caseId}/vet-request`, { requiresVet }),

  confirmVet: (caseId: string, payload: ConfirmVetPayload) =>
    api.patch(`/deathCases/death-cases/${caseId}/vet-confirmation`, payload),

  recordDisposal: (caseId: string, payload: RecordDisposalPayload) =>
    api.patch(`/deathCases/death-cases/${caseId}/disposal`, payload),

  managerReview: (caseId: string, payload: ManagerReviewPayload) =>
    api.patch(`/deathCases/death-cases/${caseId}/review`, payload),

  addAttachment: (caseId: string, file: FormData) =>
    api.post(`/deathCases/death-cases/${caseId}/attachments/single`, file, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateChecklist: (
    caseId: string,
    item: { label: string; completed: boolean; required?: boolean; notes?: string },
  ) => api.patch(`/deathCases/death-cases/${caseId}/compliance`, item),

  getStats: (params?: { farmId?: string; startDate?: string; endDate?: string }) =>
    api.get("/deathCases/workflow-stats", { params }),
};
