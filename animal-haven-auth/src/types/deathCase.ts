// Death Case Workflow Types
// Legal-compliant, audit-proof system where deceased animals become immutable cases

// Workflow status - sequential steps that cannot be skipped
export type WorkflowStatus =
  | "draft"
  | "reported"           // Step 1: Death reported by caretaker
  | "vet_requested"      // Step 2: Waiting for vet confirmation
  | "vet_confirmed"      // Step 2.5: Vet has confirmed cause
  | "disposal_pending"   // Step 3: Waiting for disposal info
  | "disposal_recorded"  // Step 3.5: Disposal info added
  | "review_pending"     // Step 4: Manager review needed
  | "correction_needed"  // Step 4.5: Manager requested corrections
  | "approved"           // Step 5: Case closed and approved
  | "archived";          // Final: Case archived for compliance

export type UserRole = "caretaker" | "veterinarian" | "manager" | "admin" | "owner";

export interface WorkflowStep {
  id: number;
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  requiredRole: UserRole[];
  statuses: WorkflowStatus[];
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    key: "report",
    label: "Report Death",
    shortLabel: "Reported",
    description: "Initial death report by caretaker",
    requiredRole: ["caretaker", "manager", "admin"],
    statuses: ["reported"],
  },
  {
    id: 2,
    key: "vet",
    label: "Veterinary Confirmation",
    shortLabel: "Vet",
    description: "Cause of death confirmation by veterinarian",
    requiredRole: ["veterinarian", "admin"],
    statuses: ["vet_requested", "vet_confirmed"],
  },
  {
    id: 3,
    key: "disposal",
    label: "Disposal Information",
    shortLabel: "Disposal",
    description: "Record disposal method and details",
    requiredRole: ["caretaker", "manager", "admin"],
    statuses: ["disposal_pending", "disposal_recorded"],
  },
  {
    id: 4,
    key: "review",
    label: "Manager Review",
    shortLabel: "Review",
    description: "Final review by farm manager",
    requiredRole: ["manager", "admin"],
    statuses: ["review_pending", "correction_needed"],
  },
  {
    id: 5,
    key: "approve",
    label: "Final Approval",
    shortLabel: "Approved",
    description: "Case approved and closed",
    requiredRole: ["manager", "admin"],
    statuses: ["approved", "archived"],
  },
];

// Get step index from status
export function getStepFromStatus(status: WorkflowStatus): number {
  for (const step of WORKFLOW_STEPS) {
    if (step.statuses.includes(status)) {
      return step.id;
    }
  }
  return 1;
}

// Check if step is complete
export function isStepComplete(stepId: number, status: WorkflowStatus): boolean {
  const currentStep = getStepFromStatus(status);
  return stepId < currentStep;
}

// Check if step is current
export function isStepCurrent(stepId: number, status: WorkflowStatus): boolean {
  return getStepFromStatus(status) === stepId;
}

// Check if step is locked
export function isStepLocked(stepId: number, status: WorkflowStatus): boolean {
  const currentStep = getStepFromStatus(status);
  return stepId > currentStep;
}

// Animal snapshot at time of death
export interface AnimalSnapshot {
  id: string;
  name: string;
  tagNumber: string;
  species: string;
  breed?: string;
  gender: "male" | "female";
  dateOfBirth?: string;
  photoUrl?: string;
  farmId: string;
  farmName: string;
  location?: string; // Pen/barn at time of death
}

// Death event details (Step 1)
export interface DeathEventInfo {
  dateOfDeath: string;
  timeOfDeath?: string;
  discoveredBy: string;
  discoveredById: string;
  reportedCause: string; // Initial cause reported by caretaker
  reportedCauseDetails?: string;
  placeOfDeath: "barn" | "field" | "clinic" | "hospital" | "transport" | "unknown";
  circumstances?: string;
  witnesses?: string[];
}

// Veterinary confirmation (Step 2)
export interface VetConfirmation {
  confirmedBy: string;
  confirmedById: string;
  confirmedAt: string;
  confirmedCause: string; // Official cause from vet
  confirmedCauseDetails?: string;
  necropsyRequired: boolean;
  necropsyPerformed?: boolean;
  necropsyFindings?: string;
  necropsyReportUrl?: string;
  additionalNotes?: string;
}

// Disposal information (Step 3)
export interface DisposalInfo {
  method: "burial" | "cremation" | "rendering" | "composting" | "other";
  methodDetails?: string;
  date: string;
  location?: string;
  handledBy: string;
  handledById: string;
  witnessedBy?: string;
  witnessedById?: string;
  transportUsed?: boolean;
  transportDetails?: string;
  certificateUrl?: string;
}

// Manager review (Step 4)
export interface ManagerReview {
  reviewedBy: string;
  reviewedById: string;
  reviewedAt: string;
  decision: "approved" | "correction_needed";
  comments?: string;
  correctionRequests?: CorrectionRequest[];
}

// Correction request
export interface CorrectionRequest {
  id: string;
  section: "event" | "vet" | "disposal";
  field: string;
  reason: string;
  requestedBy: string;
  requestedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

// Audit trail entry
export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  section?: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  notes?: string;
}

// Attachment
export interface CaseAttachment {
  id: string;
  name: string;
  type: "photo" | "document" | "certificate" | "lab_report" | "necropsy" | "other";
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedById: string;
  section: "event" | "vet" | "disposal" | "general";
}

// Compliance checklist item
export interface ComplianceCheckItem {
  id: string;
  label: string;
  required: boolean;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

// Role-based permissions for a case
export interface CasePermissions {
  canViewCase: boolean;
  canEditEvent: boolean;
  canEditVet: boolean;
  canEditDisposal: boolean;
  canReview: boolean;
  canApprove: boolean;
  canAddAttachments: boolean;
  canRequestCorrection: boolean;
}

// Full death case record
export interface DeathCase {
  id: string;
  caseNumber: string; // e.g., "D-2024-001"
  animalId: string;
  workflowStatus: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  
  // Snapshot of animal at time of death
  snapshot: AnimalSnapshot;
  
  // Section data (filled progressively)
  eventInfo?: DeathEventInfo;
  vetConfirmation?: VetConfirmation;
  disposalInfo?: DisposalInfo;
  managerReview?: ManagerReview;
  
  // Audit & compliance
  auditTrail: AuditEntry[];
  attachments: CaseAttachment[];
  complianceChecklist: ComplianceCheckItem[];
  
  // Permissions (calculated based on current user and status)
  permissions?: CasePermissions;
  
  // Metadata
  assignedVetId?: string;
  assignedVetName?: string;
  nextActionBy?: UserRole;
  nextActionDescription?: string;
  expectedCompletionDate?: string;
}

// Status display configuration
export interface StatusConfig {
  status: WorkflowStatus;
  label: string;
  description: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  icon: string;
}

export const STATUS_CONFIG: Record<WorkflowStatus, StatusConfig> = {
  draft: {
    status: "draft",
    label: "Draft",
    description: "Death case is in draft status",
    color: "blue",
    bgClass: "bg-blue-500/15",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500/30",
    icon: "FileText",
  },
  reported: {
    status: "reported",
    label: "Reported",
    description: "Death case has been reported",
    color: "blue",
    bgClass: "bg-blue-500/15",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500/30",
    icon: "FileText",
  },
  vet_requested: {
    status: "vet_requested",
    label: "Awaiting Vet",
    description: "Waiting for veterinarian confirmation",
    color: "amber",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500/30",
    icon: "Clock",
  },
  vet_confirmed: {
    status: "vet_confirmed",
    label: "Vet Confirmed",
    description: "Veterinarian has confirmed cause of death",
    color: "emerald",
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500/30",
    icon: "CheckCircle",
  },
  disposal_pending: {
    status: "disposal_pending",
    label: "Disposal Pending",
    description: "Waiting for disposal information",
    color: "violet",
    bgClass: "bg-violet-500/15",
    textClass: "text-violet-600 dark:text-violet-400",
    borderClass: "border-violet-500/30",
    icon: "Package",
  },
  disposal_recorded: {
    status: "disposal_recorded",
    label: "Disposal Recorded",
    description: "Disposal has been completed and recorded",
    color: "violet",
    bgClass: "bg-violet-500/15",
    textClass: "text-violet-600 dark:text-violet-400",
    borderClass: "border-violet-500/30",
    icon: "PackageCheck",
  },
  review_pending: {
    status: "review_pending",
    label: "Pending Review",
    description: "Waiting for manager review",
    color: "indigo",
    bgClass: "bg-indigo-500/15",
    textClass: "text-indigo-600 dark:text-indigo-400",
    borderClass: "border-indigo-500/30",
    icon: "Eye",
  },
  correction_needed: {
    status: "correction_needed",
    label: "Correction Needed",
    description: "Manager has requested corrections",
    color: "rose",
    bgClass: "bg-rose-500/15",
    textClass: "text-rose-600 dark:text-rose-400",
    borderClass: "border-rose-500/30",
    icon: "AlertCircle",
  },
  approved: {
    status: "approved",
    label: "Approved",
    description: "Case has been approved and closed",
    color: "emerald",
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500/30",
    icon: "CheckCircle2",
  },
  archived: {
    status: "archived",
    label: "Archived",
    description: "Case has been archived",
    color: "slate",
    bgClass: "bg-slate-500/15",
    textClass: "text-slate-600 dark:text-slate-400",
    borderClass: "border-slate-500/30",
    icon: "Archive",
  },
};

// Role display configuration
export interface RoleConfig {
  role: UserRole;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  caretaker: {
    role: "caretaker",
    label: "Caretaker",
    color: "sky",
    bgClass: "bg-sky-500/15",
    textClass: "text-sky-600 dark:text-sky-400",
  },
  veterinarian: {
    role: "veterinarian",
    label: "Veterinarian",
    color: "emerald",
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  manager: {
    role: "manager",
    label: "Manager",
    color: "violet",
    bgClass: "bg-violet-500/15",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  admin: {
    role: "admin",
    label: "Administrator",
    color: "amber",
    bgClass: "bg-amber-500/15",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  owner: {
    role: "owner",
    label: "Owner",
    color: "rose",
    bgClass: "bg-rose-500/15",
    textClass: "text-rose-600 dark:text-rose-400",
  },
};

// Helper to get permissions based on role and status
export function getPermissions(role: UserRole, status: WorkflowStatus): CasePermissions {
  const step = getStepFromStatus(status);
  
  const basePermissions: CasePermissions = {
    canViewCase: true,
    canEditEvent: false,
    canEditVet: false,
    canEditDisposal: false,
    canReview: false,
    canApprove: false,
    canAddAttachments: true,
    canRequestCorrection: false,
  };
  
  switch (role) {
    case "admin":
      // Admins can do everything
      return {
        ...basePermissions,
        canEditEvent: step <= 1 || status === "correction_needed",
        canEditVet: step === 2,
        canEditDisposal: step === 3 || status === "correction_needed",
        canReview: step === 4,
        canApprove: step >= 4,
        canRequestCorrection: step === 4,
      };
    
    case "manager":
      return {
        ...basePermissions,
        canEditEvent: step === 1,
        canEditDisposal: step === 3,
        canReview: step === 4,
        canApprove: step >= 4,
        canRequestCorrection: step === 4,
      };
    
    case "veterinarian":
      return {
        ...basePermissions,
        canEditVet: step === 2,
      };
    
    case "caretaker":
      return {
        ...basePermissions,
        canEditEvent: step === 1 || status === "correction_needed",
        canEditDisposal: step === 3 || status === "correction_needed",
      };
    
    default:
      return basePermissions;
  }
}

// Get next action description
export function getNextAction(status: WorkflowStatus): { role: UserRole; description: string } {
  switch (status) {
    case "reported":
      return { role: "caretaker", description: "Complete death event details" };
    case "vet_requested":
      return { role: "veterinarian", description: "Confirm cause of death" };
    case "vet_confirmed":
    case "disposal_pending":
      return { role: "caretaker", description: "Record disposal information" };
    case "disposal_recorded":
    case "review_pending":
      return { role: "manager", description: "Review and approve case" };
    case "correction_needed":
      return { role: "caretaker", description: "Address correction requests" };
    case "approved":
    case "archived":
      return { role: "admin", description: "Case complete" };
    default:
      return { role: "admin", description: "Unknown status" };
  }
}

// Get locked reason for a step
export function getLockedReason(stepId: number, status: WorkflowStatus): string | null {
  const currentStep = getStepFromStatus(status);
  
  if (stepId <= currentStep) return null;
  
  switch (stepId) {
    case 2:
      return "Complete death report first";
    case 3:
      return "Waiting for veterinarian confirmation";
    case 4:
      return "Complete disposal information first";
    case 5:
      return "Waiting for manager review";
    default:
      return "Previous steps must be completed";
  }
}

export interface DeathCaseListResponse {
  items: DeathCase[];
  total: number;
  page: number;
  limit: number;
  stats: {
    pending: number;
    awaitingVet: number;
    needsCorrection: number;
    approved: number;
    total: number;
  };
}

export interface DeathCaseStats {
  pending: number;
  awaitingVet: number;
  needsCorrection: number;
  approved: number;
  total: number;
}
