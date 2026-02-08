import { DeathCase, UserRole, WorkflowStatus } from "@/types/deathCase";

// Mock death cases for development
export const mockDeathCases: DeathCase[] = [
  {
    id: "dc-001",
    caseNumber: "D-2025-001",
    animalId: "animal11",
    workflowStatus: "approved",
    createdAt: "2025-06-20T14:30:00Z",
    updatedAt: "2025-06-22T09:30:00Z",
    snapshot: {
      id: "animal11",
      name: "Clover",
      tagNumber: "COW-2017-001",
      species: "Cattle",
      breed: "Holstein",
      gender: "female",
      dateOfBirth: "2017-03-15",
      farmId: "farm1",
      farmName: "Green Valley Farm",
      location: "Barn A, Pen 3",
    },
    eventInfo: {
      dateOfDeath: "2025-06-20",
      timeOfDeath: "14:30",
      discoveredBy: "John Smith",
      discoveredById: "user2",
      reportedCause: "natural",
      reportedCauseDetails: "Found deceased during morning rounds. Animal had shown gradual decline over 2 weeks.",
      placeOfDeath: "barn",
      circumstances: "Animal was in normal resting position. No signs of distress or struggle.",
    },
    vetConfirmation: {
      confirmedBy: "Dr. Sarah Wilson",
      confirmedById: "user4",
      confirmedAt: "2025-06-20T16:30:00Z",
      confirmedCause: "Age-related organ failure",
      confirmedCauseDetails: "Multi-organ failure consistent with advanced age. No infectious disease indicators.",
      necropsyRequired: true,
      necropsyPerformed: true,
      necropsyFindings: "Confirmed age-related degeneration of heart and kidneys. No evidence of disease or trauma.",
      necropsyReportUrl: "#necropsy-report-001",
    },
    disposalInfo: {
      method: "burial",
      date: "2025-06-21",
      location: "Farm Memorial Ground, Plot 12",
      handledBy: "John Smith",
      handledById: "user2",
      witnessedBy: "Dr. Sarah Wilson",
      witnessedById: "user4",
    },
    managerReview: {
      reviewedBy: "Mike Thompson",
      reviewedById: "user1",
      reviewedAt: "2025-06-22T09:00:00Z",
      decision: "approved",
      comments: "All documentation complete. Case approved for archival.",
    },
    auditTrail: [
      {
        id: "audit-001",
        timestamp: "2025-06-20T14:45:00Z",
        userId: "user2",
        userName: "John Smith",
        userRole: "caretaker",
        action: "Created death case",
        notes: "Initial report submitted",
      },
      {
        id: "audit-002",
        timestamp: "2025-06-20T15:00:00Z",
        userId: "user2",
        userName: "John Smith",
        userRole: "caretaker",
        action: "Completed event details",
        section: "event",
      },
      {
        id: "audit-003",
        timestamp: "2025-06-20T15:05:00Z",
        userId: "user2",
        userName: "John Smith",
        userRole: "caretaker",
        action: "Status changed",
        field: "workflowStatus",
        oldValue: "reported",
        newValue: "vet_requested",
      },
      {
        id: "audit-004",
        timestamp: "2025-06-20T16:30:00Z",
        userId: "user4",
        userName: "Dr. Sarah Wilson",
        userRole: "veterinarian",
        action: "Confirmed cause of death",
        section: "vet",
        newValue: "Age-related organ failure",
      },
      {
        id: "audit-005",
        timestamp: "2025-06-21T10:00:00Z",
        userId: "user2",
        userName: "John Smith",
        userRole: "caretaker",
        action: "Recorded disposal",
        section: "disposal",
        newValue: "Burial at Farm Memorial Ground",
      },
      {
        id: "audit-006",
        timestamp: "2025-06-22T09:00:00Z",
        userId: "user1",
        userName: "Mike Thompson",
        userRole: "manager",
        action: "Approved case",
        notes: "All documentation verified and complete",
      },
    ],
    attachments: [
      {
        id: "att-001",
        name: "Death Certificate - Clover",
        type: "certificate",
        url: "#",
        uploadedAt: "2025-06-21T10:00:00Z",
        uploadedBy: "John Smith",
        uploadedById: "user2",
        section: "general",
      },
      {
        id: "att-002",
        name: "Necropsy Report",
        type: "necropsy",
        url: "#",
        uploadedAt: "2025-06-22T09:00:00Z",
        uploadedBy: "Dr. Sarah Wilson",
        uploadedById: "user4",
        section: "vet",
      },
    ],
    complianceChecklist: [
      { id: "chk-001", label: "Death reported within 24 hours", required: true, completed: true, completedAt: "2025-06-20T14:45:00Z", completedBy: "John Smith" },
      { id: "chk-002", label: "Veterinary confirmation obtained", required: true, completed: true, completedAt: "2025-06-20T16:30:00Z", completedBy: "Dr. Sarah Wilson" },
      { id: "chk-003", label: "Disposal completed per regulations", required: true, completed: true, completedAt: "2025-06-21T14:00:00Z", completedBy: "John Smith" },
      { id: "chk-004", label: "Documentation archived", required: true, completed: true, completedAt: "2025-06-22T09:30:00Z", completedBy: "Mike Thompson" },
    ],
    nextActionBy: "admin",
    nextActionDescription: "Case complete",
  },
  {
    id: "dc-002",
    caseNumber: "D-2025-002",
    animalId: "animal13",
    workflowStatus: "review_pending",
    createdAt: "2025-09-15T08:45:00Z",
    updatedAt: "2025-09-16T11:00:00Z",
    snapshot: {
      id: "animal13",
      name: "Daisy Mae",
      tagNumber: "COW-2023-005",
      species: "Cattle",
      breed: "Jersey",
      gender: "female",
      dateOfBirth: "2023-05-20",
      farmId: "farm1",
      farmName: "Green Valley Farm",
      location: "Barn B, Pen 7",
    },
    eventInfo: {
      dateOfDeath: "2025-09-15",
      timeOfDeath: "08:45",
      discoveredBy: "Emma Johnson",
      discoveredById: "user3",
      reportedCause: "accident",
      reportedCauseDetails: "Injury sustained from fence collision during routine herd movement.",
      placeOfDeath: "field",
      circumstances: "Animal panicked during herd movement and collided with fence post at high speed.",
      witnesses: ["Tom Richards", "Maria Garcia"],
    },
    vetConfirmation: {
      confirmedBy: "Dr. Sarah Wilson",
      confirmedById: "user4",
      confirmedAt: "2025-09-15T10:00:00Z",
      confirmedCause: "Traumatic injury - internal hemorrhage",
      confirmedCauseDetails: "Severe internal bleeding from blunt force trauma. Death was rapid.",
      necropsyRequired: false,
      necropsyPerformed: false,
      additionalNotes: "Recommend review of fencing in pasture area to prevent future incidents.",
    },
    disposalInfo: {
      method: "rendering",
      date: "2025-09-16",
      location: "County Rendering Facility",
      handledBy: "Emma Johnson",
      handledById: "user3",
      transportUsed: true,
      transportDetails: "Farm truck to rendering facility, 45 minute transport",
    },
    auditTrail: [
      {
        id: "audit-007",
        timestamp: "2025-09-15T09:00:00Z",
        userId: "user3",
        userName: "Emma Johnson",
        userRole: "caretaker",
        action: "Created death case",
        notes: "Emergency report - accident during herd movement",
      },
      {
        id: "audit-008",
        timestamp: "2025-09-15T09:15:00Z",
        userId: "user3",
        userName: "Emma Johnson",
        userRole: "caretaker",
        action: "Completed event details",
        section: "event",
      },
      {
        id: "audit-009",
        timestamp: "2025-09-15T10:00:00Z",
        userId: "user4",
        userName: "Dr. Sarah Wilson",
        userRole: "veterinarian",
        action: "Confirmed cause of death",
        section: "vet",
        newValue: "Traumatic injury - internal hemorrhage",
      },
      {
        id: "audit-010",
        timestamp: "2025-09-16T11:00:00Z",
        userId: "user3",
        userName: "Emma Johnson",
        userRole: "caretaker",
        action: "Recorded disposal",
        section: "disposal",
        newValue: "Rendering at County Facility",
      },
    ],
    attachments: [
      {
        id: "att-003",
        name: "Incident Report",
        type: "document",
        url: "#",
        uploadedAt: "2025-09-15T10:30:00Z",
        uploadedBy: "Emma Johnson",
        uploadedById: "user3",
        section: "event",
      },
      {
        id: "att-004",
        name: "Fence damage photo",
        type: "photo",
        url: "#",
        uploadedAt: "2025-09-15T09:30:00Z",
        uploadedBy: "Emma Johnson",
        uploadedById: "user3",
        section: "event",
      },
    ],
    complianceChecklist: [
      { id: "chk-005", label: "Death reported within 24 hours", required: true, completed: true, completedAt: "2025-09-15T09:00:00Z", completedBy: "Emma Johnson" },
      { id: "chk-006", label: "Veterinary confirmation obtained", required: true, completed: true, completedAt: "2025-09-15T10:00:00Z", completedBy: "Dr. Sarah Wilson" },
      { id: "chk-007", label: "Disposal completed per regulations", required: true, completed: true, completedAt: "2025-09-16T11:00:00Z", completedBy: "Emma Johnson" },
      { id: "chk-008", label: "Documentation archived", required: false, completed: false },
    ],
    nextActionBy: "manager",
    nextActionDescription: "Review and approve case",
  },
  {
    id: "dc-003",
    caseNumber: "D-2025-003",
    animalId: "animal99",
    workflowStatus: "vet_requested",
    createdAt: "2025-01-25T10:00:00Z",
    updatedAt: "2025-01-25T10:30:00Z",
    snapshot: {
      id: "animal99",
      name: "Butterscotch",
      tagNumber: "SHP-2022-012",
      species: "Sheep",
      breed: "Merino",
      gender: "female",
      dateOfBirth: "2022-02-10",
      farmId: "farm1",
      farmName: "Green Valley Farm",
      location: "Pasture C",
    },
    eventInfo: {
      dateOfDeath: "2025-01-25",
      timeOfDeath: "09:30",
      discoveredBy: "John Smith",
      discoveredById: "user2",
      reportedCause: "unknown",
      reportedCauseDetails: "Found deceased in pasture. No visible injuries or signs of illness.",
      placeOfDeath: "field",
      circumstances: "Separated from flock overnight. Found during morning rounds.",
    },
    auditTrail: [
      {
        id: "audit-011",
        timestamp: "2025-01-25T10:00:00Z",
        userId: "user2",
        userName: "John Smith",
        userRole: "caretaker",
        action: "Created death case",
        notes: "Unexpected death - cause unknown",
      },
      {
        id: "audit-012",
        timestamp: "2025-01-25T10:30:00Z",
        userId: "user2",
        userName: "John Smith",
        userRole: "caretaker",
        action: "Requested veterinary confirmation",
        notes: "Necropsy recommended due to unknown cause",
      },
    ],
    attachments: [],
    complianceChecklist: [
      { id: "chk-009", label: "Death reported within 24 hours", required: true, completed: true, completedAt: "2025-01-25T10:00:00Z", completedBy: "John Smith" },
      { id: "chk-010", label: "Veterinary confirmation obtained", required: true, completed: false },
      { id: "chk-011", label: "Disposal completed per regulations", required: true, completed: false },
      { id: "chk-012", label: "Documentation archived", required: false, completed: false },
    ],
    assignedVetId: "user4",
    assignedVetName: "Dr. Sarah Wilson",
    nextActionBy: "veterinarian",
    nextActionDescription: "Confirm cause of death",
  },
  {
    id: "dc-004",
    caseNumber: "D-2025-004",
    animalId: "animal88",
    workflowStatus: "disposal_pending",
    createdAt: "2025-01-24T14:00:00Z",
    updatedAt: "2025-01-25T08:00:00Z",
    snapshot: {
      id: "animal88",
      name: "Pepper",
      tagNumber: "GOT-2020-003",
      species: "Goat",
      breed: "Nubian",
      gender: "male",
      dateOfBirth: "2020-08-15",
      farmId: "farm1",
      farmName: "Green Valley Farm",
      location: "Barn D, Pen 2",
    },
    eventInfo: {
      dateOfDeath: "2025-01-24",
      timeOfDeath: "13:45",
      discoveredBy: "Emma Johnson",
      discoveredById: "user3",
      reportedCause: "medical",
      reportedCauseDetails: "Chronic respiratory condition. Had been under veterinary care.",
      placeOfDeath: "barn",
      circumstances: "Expected death due to progressive illness. Was receiving palliative care.",
    },
    vetConfirmation: {
      confirmedBy: "Dr. Sarah Wilson",
      confirmedById: "user4",
      confirmedAt: "2025-01-24T15:30:00Z",
      confirmedCause: "Chronic obstructive pulmonary disease",
      confirmedCauseDetails: "End-stage COPD. Death was expected and peaceful.",
      necropsyRequired: false,
      necropsyPerformed: false,
      additionalNotes: "Animal was under palliative care for 2 weeks prior to death.",
    },
    auditTrail: [
      {
        id: "audit-013",
        timestamp: "2025-01-24T14:00:00Z",
        userId: "user3",
        userName: "Emma Johnson",
        userRole: "caretaker",
        action: "Created death case",
        notes: "Expected death from chronic illness",
      },
      {
        id: "audit-014",
        timestamp: "2025-01-24T15:30:00Z",
        userId: "user4",
        userName: "Dr. Sarah Wilson",
        userRole: "veterinarian",
        action: "Confirmed cause of death",
        section: "vet",
        newValue: "Chronic obstructive pulmonary disease",
      },
    ],
    attachments: [
      {
        id: "att-005",
        name: "Medical history summary",
        type: "document",
        url: "#",
        uploadedAt: "2025-01-24T14:15:00Z",
        uploadedBy: "Emma Johnson",
        uploadedById: "user3",
        section: "vet",
      },
    ],
    complianceChecklist: [
      { id: "chk-013", label: "Death reported within 24 hours", required: true, completed: true, completedAt: "2025-01-24T14:00:00Z", completedBy: "Emma Johnson" },
      { id: "chk-014", label: "Veterinary confirmation obtained", required: true, completed: true, completedAt: "2025-01-24T15:30:00Z", completedBy: "Dr. Sarah Wilson" },
      { id: "chk-015", label: "Disposal completed per regulations", required: true, completed: false },
      { id: "chk-016", label: "Documentation archived", required: false, completed: false },
    ],
    nextActionBy: "caretaker",
    nextActionDescription: "Record disposal information",
  },
  {
    id: "dc-005",
    caseNumber: "D-2025-005",
    animalId: "animal77",
    workflowStatus: "correction_needed",
    createdAt: "2025-01-20T09:00:00Z",
    updatedAt: "2025-01-23T14:00:00Z",
    snapshot: {
      id: "animal77",
      name: "Thunder",
      tagNumber: "HRS-2018-001",
      species: "Horse",
      breed: "Quarter Horse",
      gender: "male",
      dateOfBirth: "2018-04-20",
      farmId: "farm2",
      farmName: "Sunny Meadows Ranch",
      location: "Stable A, Stall 5",
    },
    eventInfo: {
      dateOfDeath: "2025-01-20",
      timeOfDeath: "08:30",
      discoveredBy: "Tom Richards",
      discoveredById: "user5",
      reportedCause: "medical",
      reportedCauseDetails: "Acute colic episode. Emergency vet called but animal passed before arrival.",
      placeOfDeath: "barn",
      circumstances: "Found in distress during morning feeding. Showed signs of severe colic.",
    },
    vetConfirmation: {
      confirmedBy: "Dr. James Miller",
      confirmedById: "user6",
      confirmedAt: "2025-01-20T10:00:00Z",
      confirmedCause: "Gastric torsion (twisted gut)",
      confirmedCauseDetails: "Severe gastric volvulus. Would have required emergency surgery.",
      necropsyRequired: true,
      necropsyPerformed: true,
      necropsyFindings: "Confirmed 270-degree gastric rotation. Tissue necrosis present.",
    },
    disposalInfo: {
      method: "cremation",
      date: "2025-01-21",
      location: "Equine Cremation Services",
      handledBy: "Tom Richards",
      handledById: "user5",
      transportUsed: true,
      transportDetails: "Specialized equine transport",
    },
    managerReview: {
      reviewedBy: "Sarah Mitchell",
      reviewedById: "user7",
      reviewedAt: "2025-01-23T14:00:00Z",
      decision: "correction_needed",
      comments: "Need additional documentation for insurance claim.",
      correctionRequests: [
        {
          id: "corr-001",
          section: "vet",
          field: "necropsyReportUrl",
          reason: "Please upload the full necropsy report for insurance documentation",
          requestedBy: "Sarah Mitchell",
          requestedAt: "2025-01-23T14:00:00Z",
          resolved: false,
        },
      ],
    },
    auditTrail: [
      {
        id: "audit-015",
        timestamp: "2025-01-20T09:00:00Z",
        userId: "user5",
        userName: "Tom Richards",
        userRole: "caretaker",
        action: "Created death case",
        notes: "Emergency - colic death",
      },
      {
        id: "audit-016",
        timestamp: "2025-01-20T10:00:00Z",
        userId: "user6",
        userName: "Dr. James Miller",
        userRole: "veterinarian",
        action: "Confirmed cause of death",
        section: "vet",
        newValue: "Gastric torsion",
      },
      {
        id: "audit-017",
        timestamp: "2025-01-21T16:00:00Z",
        userId: "user5",
        userName: "Tom Richards",
        userRole: "caretaker",
        action: "Recorded disposal",
        section: "disposal",
        newValue: "Cremation",
      },
      {
        id: "audit-018",
        timestamp: "2025-01-23T14:00:00Z",
        userId: "user7",
        userName: "Sarah Mitchell",
        userRole: "manager",
        action: "Requested correction",
        notes: "Additional documentation needed for insurance",
      },
    ],
    attachments: [],
    complianceChecklist: [
      { id: "chk-017", label: "Death reported within 24 hours", required: true, completed: true, completedAt: "2025-01-20T09:00:00Z", completedBy: "Tom Richards" },
      { id: "chk-018", label: "Veterinary confirmation obtained", required: true, completed: true, completedAt: "2025-01-20T10:00:00Z", completedBy: "Dr. James Miller" },
      { id: "chk-019", label: "Disposal completed per regulations", required: true, completed: true, completedAt: "2025-01-21T16:00:00Z", completedBy: "Tom Richards" },
      { id: "chk-020", label: "Documentation archived", required: false, completed: false },
    ],
    nextActionBy: "caretaker",
    nextActionDescription: "Address correction requests",
  },
];

// Helper functions
export function getDeathCaseById(id: string): DeathCase | undefined {
  return mockDeathCases.find((dc) => dc.id === id);
}

export function getDeathCasesByCaseNumber(caseNumber: string): DeathCase | undefined {
  return mockDeathCases.find((dc) => dc.caseNumber === caseNumber);
}

export function getDeathCasesByStatus(status: WorkflowStatus): DeathCase[] {
  return mockDeathCases.filter((dc) => dc.workflowStatus === status);
}

export function getDeathCasesByRole(role: UserRole): DeathCase[] {
  return mockDeathCases.filter((dc) => dc.nextActionBy === role);
}

export function getPendingCasesForRole(role: UserRole): DeathCase[] {
  switch (role) {
    case "caretaker":
      return mockDeathCases.filter(
        (dc) =>
          dc.workflowStatus === "reported" ||
          dc.workflowStatus === "details_pending" ||
          dc.workflowStatus === "disposal_pending" ||
          dc.workflowStatus === "correction_needed"
      );
    case "veterinarian":
      return mockDeathCases.filter((dc) => dc.workflowStatus === "vet_requested");
    case "manager":
      return mockDeathCases.filter((dc) => dc.workflowStatus === "review_pending");
    case "admin":
      return mockDeathCases;
    default:
      return [];
  }
}

// Generate a new case number
export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const existingCases = mockDeathCases.filter((dc) =>
    dc.caseNumber.startsWith(`D-${year}-`)
  );
  const nextNumber = existingCases.length + 1;
  return `D-${year}-${String(nextNumber).padStart(3, "0")}`;
}
