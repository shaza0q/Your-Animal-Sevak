// Types specific to deceased animal records for audit/compliance views
// These extend the base Animal type with death-specific metadata

export interface DeathRecord {
  dateOfDeath: string;
  timeOfDeath?: string;
  causeOfDeath: CauseOfDeathType;
  causeDetails?: string;
  placeOfDeath: PlaceOfDeath;
  reportedBy: string;
  reportedById: string;
  confirmedBy?: string;
  confirmedById?: string;
  necropsyPerformed: boolean;
  necropsyReportLink?: string;
  disposalMethod?: DisposalMethod;
  disposalDate?: string;
  disposalLocation?: string;
}

export interface MedicalContext {
  lastVetVisit?: string;
  lastVetVisitReason?: string;
  recentTreatments?: string[];
  knownConditions?: string[];
  vaccinationSummary?: string;
}

export interface AuditMetadata {
  recordCreatedBy: string;
  recordCreatedAt: string;
  lastModified?: string;
  lastModifiedBy?: string;
  attachments?: AuditAttachment[];
  complianceChecklist?: ComplianceItem[];
}

export interface AuditAttachment {
  id: string;
  name: string;
  type: "death_certificate" | "lab_report" | "necropsy" | "other";
  uploadedAt: string;
}

export interface ComplianceItem {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export type CauseOfDeathType = 
  | "natural"
  | "medical"
  | "accident"
  | "infectious"
  | "non_infectious"
  | "euthanasia"
  | "unknown";

export type PlaceOfDeath =
  | "barn"
  | "field"
  | "clinic"
  | "hospital"
  | "transport"
  | "unknown";

export type DisposalMethod =
  | "burial"
  | "cremation"
  | "rendering"
  | "composting"
  | "other";

export interface DeceasedAnimalRecord {
  animalId: string;
  location?: string; // Pen/barn location at time of death
  ageAtDeath?: string;
  deathRecord: DeathRecord;
  medicalContext?: MedicalContext;
  auditMetadata: AuditMetadata;
}

// Age range filter options
export type AgeAtDeathRange = 
  | "all"
  | "under_1"
  | "1_to_3"
  | "3_to_5"
  | "over_5";

export const ageAtDeathRangeLabels: Record<AgeAtDeathRange, string> = {
  all: "All ages",
  under_1: "Under 1 year",
  "1_to_3": "1-3 years",
  "3_to_5": "3-5 years",
  over_5: "Over 5 years",
};

export const causeOfDeathLabels: Record<CauseOfDeathType, string> = {
  natural: "Natural",
  medical: "Medical Condition",
  accident: "Accident",
  infectious: "Infectious Disease",
  non_infectious: "Non-Infectious",
  euthanasia: "Euthanasia",
  unknown: "Unknown",
};

export const placeOfDeathLabels: Record<PlaceOfDeath, string> = {
  barn: "Barn",
  field: "Field/Pasture",
  clinic: "Veterinary Clinic",
  hospital: "Animal Hospital",
  transport: "During Transport",
  unknown: "Unknown",
};

export const disposalMethodLabels: Record<DisposalMethod, string> = {
  burial: "Burial",
  cremation: "Cremation",
  rendering: "Rendering",
  composting: "Composting",
  other: "Other",
};