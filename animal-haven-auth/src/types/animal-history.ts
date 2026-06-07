export type AnimalHistoryEventType =
  | "CREATED"
  | "ASSIGNED"
  | "UNASSIGNED"
  | "STATUS_CHANGED"
  | "HEALTH_EVENT"
  | "WEIGHT_UPDATED"
  | "VACCINATION_ADDED"
  | "MEDICATION_ADDED";

export type AnimalAssignmentRole = "caretaker" | "veterinarian";

export interface HistoryUser {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
}

export interface StatusChange {
  from: string;
  to: string;
  reason?: string;
  notes?: string;
}

/** Shape returned by the backend for health/vaccination/breeding events */
export interface HealthEvent {
  eventType: string | null;
  description: string | null;
  severity?: string | null;
  treatment?: string | null;
  diseaseName?: string | null;
  vaccineName?: string | null;
}

export interface WeightUpdate {
  previous?: number | null;
  current?: number | null;
  unit?: "kg" | "lbs";
}

export interface AnimalHistoryEvent {
  id?: string;
  _id?: string;
  type: AnimalHistoryEventType;
  at: string;

  role?: AnimalAssignmentRole;
  user?: HistoryUser | null;
  status?: StatusChange;
  health?: HealthEvent | null;
  weight?: WeightUpdate | null;

  createdBy?: HistoryUser | null;
  farmId?: string;
  animalId?: string;
}
