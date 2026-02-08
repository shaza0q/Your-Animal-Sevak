import { DeceasedAnimalRecord } from "@/types/deceased";

// Mock deceased animal records with full audit metadata
// These records extend the base animal data with death-specific information
export const mockDeceasedRecords: DeceasedAnimalRecord[] = [
  {
    animalId: "animal11",
    location: "Barn A, Pen 3",
    ageAtDeath: "8 years",
    deathRecord: {
      dateOfDeath: "2025-06-20",
      timeOfDeath: "14:30",
      causeOfDeath: "natural",
      causeDetails: "Age-related organ failure. Animal showed gradual decline over 2 weeks prior to death.",
      placeOfDeath: "barn",
      reportedBy: "John Smith",
      reportedById: "user2",
      confirmedBy: "Dr. Sarah Wilson",
      confirmedById: "user4",
      necropsyPerformed: true,
      necropsyReportLink: "#necropsy-report-001",
      disposalMethod: "burial",
      disposalDate: "2025-06-21",
      disposalLocation: "Farm Memorial Ground, Plot 12",
    },
    medicalContext: {
      lastVetVisit: "2025-06-18",
      lastVetVisitReason: "End-of-life assessment",
      recentTreatments: [
        "Pain management - June 15, 2025",
        "Fluid therapy - June 17, 2025",
      ],
      knownConditions: [
        "Chronic arthritis",
        "Reduced kidney function",
      ],
      vaccinationSummary: "All vaccinations up to date. Last vaccination: FMD on March 10, 2025",
    },
    auditMetadata: {
      recordCreatedBy: "John Smith",
      recordCreatedAt: "2025-06-20T15:45:00Z",
      lastModified: "2025-06-22T09:30:00Z",
      lastModifiedBy: "Dr. Sarah Wilson",
      attachments: [
        {
          id: "att1",
          name: "Death Certificate - Clover",
          type: "death_certificate",
          uploadedAt: "2025-06-21T10:00:00Z",
        },
        {
          id: "att2",
          name: "Necropsy Report",
          type: "necropsy",
          uploadedAt: "2025-06-22T09:00:00Z",
        },
      ],
      complianceChecklist: [
        {
          id: "chk1",
          label: "Death reported within 24 hours",
          completed: true,
          completedAt: "2025-06-20T15:45:00Z",
          completedBy: "John Smith",
        },
        {
          id: "chk2",
          label: "Veterinary confirmation obtained",
          completed: true,
          completedAt: "2025-06-20T16:30:00Z",
          completedBy: "Dr. Sarah Wilson",
        },
        {
          id: "chk3",
          label: "Disposal completed per regulations",
          completed: true,
          completedAt: "2025-06-21T14:00:00Z",
          completedBy: "John Smith",
        },
        {
          id: "chk4",
          label: "Documentation archived",
          completed: true,
          completedAt: "2025-06-22T09:30:00Z",
          completedBy: "Dr. Sarah Wilson",
        },
      ],
    },
  },
  {
    animalId: "animal13",
    location: "Barn B, Pen 7",
    ageAtDeath: "2 years",
    deathRecord: {
      dateOfDeath: "2025-09-15",
      timeOfDeath: "08:45",
      causeOfDeath: "accident",
      causeDetails: "Injury sustained from fence collision during routine herd movement.",
      placeOfDeath: "field",
      reportedBy: "Emma Johnson",
      reportedById: "user3",
      confirmedBy: "Dr. Sarah Wilson",
      confirmedById: "user4",
      necropsyPerformed: false,
      disposalMethod: "rendering",
      disposalDate: "2025-09-16",
      disposalLocation: "County Rendering Facility",
    },
    medicalContext: {
      lastVetVisit: "2025-08-20",
      lastVetVisitReason: "Routine health check",
      recentTreatments: [],
      knownConditions: [],
      vaccinationSummary: "All vaccinations current. Last: Brucellosis on July 5, 2025",
    },
    auditMetadata: {
      recordCreatedBy: "Emma Johnson",
      recordCreatedAt: "2025-09-15T09:15:00Z",
      lastModified: "2025-09-16T11:00:00Z",
      lastModifiedBy: "Dr. Sarah Wilson",
      attachments: [
        {
          id: "att3",
          name: "Death Certificate - Daisy Mae",
          type: "death_certificate",
          uploadedAt: "2025-09-15T16:00:00Z",
        },
        {
          id: "att4",
          name: "Incident Report",
          type: "other",
          uploadedAt: "2025-09-15T10:30:00Z",
        },
      ],
      complianceChecklist: [
        {
          id: "chk5",
          label: "Death reported within 24 hours",
          completed: true,
          completedAt: "2025-09-15T09:15:00Z",
          completedBy: "Emma Johnson",
        },
        {
          id: "chk6",
          label: "Veterinary confirmation obtained",
          completed: true,
          completedAt: "2025-09-15T10:00:00Z",
          completedBy: "Dr. Sarah Wilson",
        },
        {
          id: "chk7",
          label: "Disposal completed per regulations",
          completed: true,
          completedAt: "2025-09-16T11:00:00Z",
          completedBy: "Emma Johnson",
        },
        {
          id: "chk8",
          label: "Documentation archived",
          completed: true,
          completedAt: "2025-09-16T14:00:00Z",
          completedBy: "Dr. Sarah Wilson",
        },
      ],
    },
  },
];

// Helper function to get deceased record by animal ID
export const getDeceasedRecord = (animalId: string): DeceasedAnimalRecord | undefined => {
  return mockDeceasedRecords.find((record) => record.animalId === animalId);
};

// Generate a placeholder record for animals without detailed records
export const getDeceasedRecordOrPlaceholder = (animalId: string, animalName: string): DeceasedAnimalRecord => {
  const existing = getDeceasedRecord(animalId);
  if (existing) return existing;
  
  // Return a placeholder with minimal required data
  return {
    animalId,
    location: "Location not recorded",
    ageAtDeath: "Unknown",
    deathRecord: {
      dateOfDeath: "Unknown",
      causeOfDeath: "unknown",
      placeOfDeath: "unknown",
      reportedBy: "System",
      reportedById: "system",
      necropsyPerformed: false,
    },
    auditMetadata: {
      recordCreatedBy: "System",
      recordCreatedAt: new Date().toISOString(),
      complianceChecklist: [],
    },
  };
};