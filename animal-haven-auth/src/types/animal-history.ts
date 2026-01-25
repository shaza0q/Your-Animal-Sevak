// 📁 src/types/animal-history.ts
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
  _id: string;
  name: string;
  email?: string;
}

export interface StatusChange {
  from: string;
  to: string;
  reason?: string;
  notes?: string;
}

export interface HealthEvent {
  eventType: string;
  description: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  treatment?: string;
}

export interface WeightUpdate {
  previous: number;
  current: number;
  unit?: "kg" | "lbs";
}

export interface AnimalHistoryEvent {
  _id: string; // ✅ REQUIRED - guaranteed by backend
  type: AnimalHistoryEventType;
  at: string; // ISO string
  
  // Context
  role?: AnimalAssignmentRole;
  user?: HistoryUser;
  status?: StatusChange;
  health?: HealthEvent;
  weight?: WeightUpdate;
  
  // Metadata
  createdBy: HistoryUser;
  farmId?: string;
  animalId: string;
}