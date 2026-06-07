import { WorkflowStatus, CauseOfDeath, DisposalMethod, UserRole } from '../enums';

export const DEATH_CASE_WORKFLOW = {
  VALID_TRANSITIONS: {
    [WorkflowStatus.draft]:             [WorkflowStatus.reported],
    [WorkflowStatus.reported]:          [WorkflowStatus.vet_requested, WorkflowStatus.disposal_pending],
    [WorkflowStatus.vet_requested]:     [WorkflowStatus.vet_confirmed],
    [WorkflowStatus.vet_confirmed]:     [WorkflowStatus.disposal_pending],
    [WorkflowStatus.disposal_pending]:  [WorkflowStatus.disposal_recorded],
    [WorkflowStatus.disposal_recorded]: [WorkflowStatus.review_pending],
    [WorkflowStatus.review_pending]:    [WorkflowStatus.approved, WorkflowStatus.correction_needed],
    [WorkflowStatus.correction_needed]: [WorkflowStatus.disposal_pending, WorkflowStatus.reported, WorkflowStatus.review_pending],
    [WorkflowStatus.approved]:          [WorkflowStatus.archived],
    [WorkflowStatus.archived]:          [],
  } as Record<WorkflowStatus, WorkflowStatus[]>,

  STATUS_PERMISSIONS: {
    [WorkflowStatus.draft]:             { roles: [UserRole.caretaker, UserRole.manager, UserRole.admin], actions: ['update_event'] },
    [WorkflowStatus.reported]:          { roles: [UserRole.caretaker, UserRole.manager, UserRole.admin], actions: ['update_event', 'request_vet'] },
    [WorkflowStatus.vet_requested]:     { roles: [UserRole.veterinarian, UserRole.admin], actions: ['confirm_vet'] },
    [WorkflowStatus.vet_confirmed]:     { roles: [UserRole.caretaker, UserRole.manager, UserRole.admin], actions: ['record_disposal'] },
    [WorkflowStatus.disposal_pending]:  { roles: [UserRole.caretaker, UserRole.manager, UserRole.admin], actions: ['record_disposal'] },
    [WorkflowStatus.disposal_recorded]: { roles: [UserRole.manager, UserRole.admin], actions: ['review'] },
    [WorkflowStatus.review_pending]:    { roles: [UserRole.manager, UserRole.admin], actions: ['review'] },
    [WorkflowStatus.correction_needed]: { roles: [UserRole.caretaker, UserRole.manager, UserRole.admin], actions: ['update_event', 'record_disposal'] },
    [WorkflowStatus.approved]:          { roles: [UserRole.manager, UserRole.admin], actions: ['archive'] },
    [WorkflowStatus.archived]:          { roles: [UserRole.admin], actions: ['read'] },
  } as Record<WorkflowStatus, { roles: UserRole[]; actions: string[] }>,

  REQUIRED_FIELDS: {
    event:    ['dateOfDeath', 'causeOfDeath', 'placeOfDeath'],
    vet:      ['confirmedCauseOfDeath', 'vetName'],
    disposal: ['disposalMethod', 'disposalDate'],
  },

  AUTO_TRANSITIONS: {
    [WorkflowStatus.vet_confirmed]:     WorkflowStatus.disposal_pending,
    [WorkflowStatus.disposal_recorded]: WorkflowStatus.review_pending,
  } as Partial<Record<WorkflowStatus, WorkflowStatus>>,

  DEFAULTS: {
    causeOfDeath: CauseOfDeath.unknown,
    tags: ['investigation_pending'],
  },
};

export const WorkflowHelper = {
  canTransition(from: WorkflowStatus, to: WorkflowStatus): boolean {
    return DEATH_CASE_WORKFLOW.VALID_TRANSITIONS[from]?.includes(to) ?? false;
  },

  canPerformAction(status: WorkflowStatus, action: string, userRole: UserRole): boolean {
    const p = DEATH_CASE_WORKFLOW.STATUS_PERMISSIONS[status];
    if (!p) return false;
    return p.roles.includes(userRole) && p.actions.includes(action);
  },

  getAutoTransition(status: WorkflowStatus): WorkflowStatus | undefined {
    return DEATH_CASE_WORKFLOW.AUTO_TRANSITIONS[status];
  },

  isValidCauseOfDeath(cause: string): cause is CauseOfDeath {
    return Object.values(CauseOfDeath).includes(cause as CauseOfDeath);
  },

  isValidDisposalMethod(method: string): method is DisposalMethod {
    return Object.values(DisposalMethod).includes(method as DisposalMethod);
  },

  getRequiredFields(section: string): string[] {
    return DEATH_CASE_WORKFLOW.REQUIRED_FIELDS[section as keyof typeof DEATH_CASE_WORKFLOW.REQUIRED_FIELDS] ?? [];
  },
};
