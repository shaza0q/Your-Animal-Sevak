export type WorkflowStatus = 
  | "draft"
  | "submitted"
  | "vet_requested"
  | "vet_confirmed"
  | "correction_needed"
  | "disposal_recorded"
  | "approved"
  | "archived";

export type UserRole = "caretaker" | "veterinarian" | "manager" | "admin";

export interface DeathCase {
  id: string;
  caseNumber: string;
  animalId: string;
  animal?: {
    id: string;
    name: string;
    tagNumber: string;
    species: string;
    enclosure?: string;
  };
  workflowStatus: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  assignedToId?: string;
  
  // Snapshot data (when animal details might change after death)
  snapshot?: {
    name: string;
    tagNumber: string;
    species: string;
    enclosure: string;
    age?: number;
    sex?: string;
  };
  
  // Workflow-specific data
  deathDate?: string;
  causeOfDeath?: string;
  vetNotes?: string;
  disposalMethod?: string;
  disposalDate?: string;
  approvalDate?: string;
  approvedById?: string;
  
  // UI helpers
  isPendingForMe?: boolean;
}

export interface DeathCaseListResponse {
  items: DeathCase[];
  total: number;
  page: number;
  limit: number;
  stats?: {
    pending: number;
    awaitingVet: number;
    needsCorrection: number;
    approved: number;
    total: number;
  };
}