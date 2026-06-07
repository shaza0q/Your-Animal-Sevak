-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'owner', 'manager', 'staff', 'caretaker', 'veterinarian');

-- CreateEnum
CREATE TYPE "FarmStatus" AS ENUM ('active', 'inactive', 'archived');

-- CreateEnum
CREATE TYPE "AnimalType" AS ENUM ('Cow', 'Buffalo', 'Goat', 'Sheep', 'Chicken', 'Duck', 'Rabbit', 'Dog', 'Cat', 'Camel', 'Donkey', 'Horse', 'Pigeon', 'Turkey', 'Other');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "AnimalStatus" AS ENUM ('Active', 'Sold', 'Deceased');

-- CreateEnum
CREATE TYPE "UpdateType" AS ENUM ('Health', 'Weight', 'Vaccination', 'Breeding', 'Sale');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('Healthy', 'Injured', 'Diseased', 'Pregnant', 'Sold', 'Dead');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('Low', 'Moderate', 'High');

-- CreateEnum
CREATE TYPE "AssignmentRole" AS ENUM ('caretaker', 'veterinarian');

-- CreateEnum
CREATE TYPE "AssignmentSource" AS ENUM ('system', 'manual', 'import');

-- CreateEnum
CREATE TYPE "CauseOfDeath" AS ENUM ('natural', 'medical', 'accident', 'infectious', 'non_infectious', 'euthanasia', 'unknown', 'predation', 'dystocia', 'poisoning', 'heat_stress', 'cold_stress');

-- CreateEnum
CREATE TYPE "PlaceOfDeath" AS ENUM ('barn', 'field', 'clinic', 'hospital', 'transport', 'quarantine', 'holding_pen', 'unknown');

-- CreateEnum
CREATE TYPE "DisposalMethod" AS ENUM ('burial', 'cremation', 'rendering', 'composting', 'incineration', 'landfill', 'other');

-- CreateEnum
CREATE TYPE "InsuranceStatus" AS ENUM ('pending', 'approved', 'rejected', 'not_claimed');

-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('draft', 'reported', 'vet_requested', 'vet_confirmed', 'disposal_pending', 'disposal_recorded', 'review_pending', 'correction_needed', 'approved', 'archived');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved', 'requires_correction');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'caretaker',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "capacity" INTEGER,
    "status" "FarmStatus" NOT NULL DEFAULT 'active',
    "animalTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmUser" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "farmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "FarmUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "tagNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "animalType" "AnimalType" NOT NULL,
    "breed" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION,
    "dateOfBirth" TIMESTAMP(3),
    "acquisitionDate" TIMESTAMP(3),
    "status" "AnimalStatus" NOT NULL DEFAULT 'Active',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "farmId" TEXT NOT NULL,
    "motherId" TEXT,
    "fatherId" TEXT,

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalUpdate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION,
    "notes" TEXT,
    "mediaUrl" TEXT,
    "updateType" "UpdateType" NOT NULL,
    "status" "HealthStatus" NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'Low',
    "vaccineName" TEXT,
    "diseaseName" TEXT,
    "expectedDeliveryDate" TIMESTAMP(3),
    "nextVaccineDate" TIMESTAMP(3),
    "price" DOUBLE PRECISION,
    "buyerName" TEXT,
    "buyerEmail" TEXT,
    "buyerContact" TEXT,
    "buyerAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animalId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "maleAnimalId" TEXT,

    CONSTRAINT "AnimalUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalAssignment" (
    "id" TEXT NOT NULL,
    "role" "AssignmentRole",
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "assignmentSource" "AssignmentSource" NOT NULL DEFAULT 'manual',
    "notes" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animalId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "workerId" TEXT,
    "assignedById" TEXT,
    "unassignedById" TEXT,

    CONSTRAINT "AnimalAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "dateSold" TIMESTAMP(3),
    "buyerName" TEXT NOT NULL,
    "buyerContactInfo" TEXT NOT NULL,
    "buyerAddress" TEXT,
    "buyerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animalId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "handledById" TEXT,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreedMaster" (
    "id" TEXT NOT NULL,
    "breedName" TEXT NOT NULL,
    "animalType" TEXT NOT NULL,

    CONSTRAINT "BreedMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiseaseMaster" (
    "id" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "animalType" TEXT NOT NULL,

    CONSTRAINT "DiseaseMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaccineMaster" (
    "id" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "animalType" TEXT NOT NULL,

    CONSTRAINT "VaccineMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeceasedAnimalRecord" (
    "id" TEXT NOT NULL,
    "recordVersion" INTEGER NOT NULL DEFAULT 1,
    "workflowStatus" "WorkflowStatus" NOT NULL DEFAULT 'reported',
    "locationAtDeath" TEXT,
    "ageAtDeath" TEXT,
    "ageInMonths" INTEGER,
    "weightAtDeath" DOUBLE PRECISION,
    "bodyConditionScore" DOUBLE PRECISION,
    "daysSinceDeath" INTEGER,
    "seasonOfDeath" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "snapshotTagNumber" TEXT NOT NULL,
    "snapshotName" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "snapshotBreed" TEXT,
    "snapshotGender" TEXT,
    "snapshotDateOfBirth" TIMESTAMP(3),
    "snapshotPhotoUrl" TEXT,
    "snapshotFarmName" TEXT NOT NULL,
    "snapshotOwnerName" TEXT,
    "snapshotOwnerId" TEXT,
    "snapshotLastKnownWeight" DOUBLE PRECISION,
    "snapshotLastKnownLocation" TEXT,
    "snapshotReproductiveStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "animalId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "DeceasedAnimalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeathEvent" (
    "id" TEXT NOT NULL,
    "dateOfDeath" TIMESTAMP(3) NOT NULL,
    "timeOfDeath" TEXT,
    "causeOfDeath" "CauseOfDeath" NOT NULL,
    "causeDetails" TEXT,
    "placeOfDeath" "PlaceOfDeath" NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "recordId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "confirmedById" TEXT,

    CONSTRAINT "DeathEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostDeathHandling" (
    "id" TEXT NOT NULL,
    "necropsyPerformed" BOOLEAN NOT NULL DEFAULT false,
    "necropsyReportLink" TEXT,
    "necropsyFindings" TEXT,
    "labSamplesTaken" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disposalMethod" "DisposalMethod",
    "disposalDate" TIMESTAMP(3),
    "disposalLocation" TEXT,
    "disposalCompany" TEXT,
    "disposalCost" DOUBLE PRECISION,
    "disposalCertificateId" TEXT,
    "recordId" TEXT NOT NULL,

    CONSTRAINT "PostDeathHandling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalFinancial" (
    "id" TEXT NOT NULL,
    "insuranceClaimId" TEXT,
    "insuranceStatus" "InsuranceStatus" NOT NULL DEFAULT 'pending',
    "estimatedLossValue" DOUBLE PRECISION,
    "marketValueAtDeath" DOUBLE PRECISION,
    "regulatoryReportRequired" BOOLEAN,
    "regulatoryReportSubmitted" BOOLEAN,
    "regulatoryReportId" TEXT,
    "recordId" TEXT NOT NULL,

    CONSTRAINT "LegalFinancial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalContext" (
    "id" TEXT NOT NULL,
    "lastVetVisitDate" TIMESTAMP(3),
    "lastVetVisitReason" TEXT,
    "vaccinationStatus" TEXT,
    "lastVaccinationDate" TIMESTAMP(3),
    "lastProductionValue" DOUBLE PRECISION,
    "lastProductionDate" TIMESTAMP(3),
    "productionUnit" TEXT,
    "activeTreatments" JSONB NOT NULL DEFAULT '[]',
    "activeMedications" JSONB NOT NULL DEFAULT '[]',
    "knownConditions" JSONB NOT NULL DEFAULT '[]',
    "recordId" TEXT NOT NULL,
    "attendingVetId" TEXT,

    CONSTRAINT "MedicalContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditMetadata" (
    "id" TEXT NOT NULL,
    "recordCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'pending',
    "approvalNotes" TEXT,
    "corrections" JSONB NOT NULL DEFAULT '[]',
    "activityLog" JSONB NOT NULL DEFAULT '[]',
    "attachments" JSONB NOT NULL DEFAULT '[]',
    "complianceChecklist" JSONB NOT NULL DEFAULT '[]',
    "recordId" TEXT NOT NULL,
    "recordCreatedById" TEXT,

    CONSTRAINT "AuditMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE INDEX "FarmUser_farmId_idx" ON "FarmUser"("farmId");

-- CreateIndex
CREATE INDEX "FarmUser_userId_idx" ON "FarmUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmUser_farmId_userId_key" ON "FarmUser"("farmId", "userId");

-- CreateIndex
CREATE INDEX "Animal_farmId_idx" ON "Animal"("farmId");

-- CreateIndex
CREATE INDEX "Animal_status_idx" ON "Animal"("status");

-- CreateIndex
CREATE INDEX "Animal_dateOfBirth_idx" ON "Animal"("dateOfBirth");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_farmId_tagNumber_key" ON "Animal"("farmId", "tagNumber");

-- CreateIndex
CREATE INDEX "AnimalUpdate_animalId_date_idx" ON "AnimalUpdate"("animalId", "date" DESC);

-- CreateIndex
CREATE INDEX "AnimalUpdate_animalId_status_idx" ON "AnimalUpdate"("animalId", "status");

-- CreateIndex
CREATE INDEX "AnimalUpdate_status_date_idx" ON "AnimalUpdate"("status", "date" DESC);

-- CreateIndex
CREATE INDEX "AnimalUpdate_vaccineName_idx" ON "AnimalUpdate"("vaccineName");

-- CreateIndex
CREATE INDEX "AnimalUpdate_diseaseName_idx" ON "AnimalUpdate"("diseaseName");

-- CreateIndex
CREATE INDEX "AnimalUpdate_staffId_date_idx" ON "AnimalUpdate"("staffId", "date" DESC);

-- CreateIndex
CREATE INDEX "AnimalAssignment_animalId_unassignedAt_idx" ON "AnimalAssignment"("animalId", "unassignedAt");

-- CreateIndex
CREATE INDEX "AnimalAssignment_workerId_unassignedAt_idx" ON "AnimalAssignment"("workerId", "unassignedAt");

-- CreateIndex
CREATE INDEX "AnimalAssignment_farmId_unassignedAt_idx" ON "AnimalAssignment"("farmId", "unassignedAt");

-- CreateIndex
CREATE INDEX "Sale_dateSold_animalId_idx" ON "Sale"("dateSold" DESC, "animalId");

-- CreateIndex
CREATE INDEX "BreedMaster_animalType_idx" ON "BreedMaster"("animalType");

-- CreateIndex
CREATE UNIQUE INDEX "BreedMaster_animalType_breedName_key" ON "BreedMaster"("animalType", "breedName");

-- CreateIndex
CREATE INDEX "DiseaseMaster_animalType_idx" ON "DiseaseMaster"("animalType");

-- CreateIndex
CREATE UNIQUE INDEX "DiseaseMaster_animalType_diseaseName_key" ON "DiseaseMaster"("animalType", "diseaseName");

-- CreateIndex
CREATE INDEX "VaccineMaster_animalType_idx" ON "VaccineMaster"("animalType");

-- CreateIndex
CREATE UNIQUE INDEX "VaccineMaster_animalType_vaccineName_key" ON "VaccineMaster"("animalType", "vaccineName");

-- CreateIndex
CREATE UNIQUE INDEX "DeceasedAnimalRecord_animalId_key" ON "DeceasedAnimalRecord"("animalId");

-- CreateIndex
CREATE INDEX "DeceasedAnimalRecord_farmId_createdAt_idx" ON "DeceasedAnimalRecord"("farmId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "DeceasedAnimalRecord_snapshotType_idx" ON "DeceasedAnimalRecord"("snapshotType");

-- CreateIndex
CREATE INDEX "DeceasedAnimalRecord_workflowStatus_idx" ON "DeceasedAnimalRecord"("workflowStatus");

-- CreateIndex
CREATE INDEX "DeceasedAnimalRecord_farmId_workflowStatus_idx" ON "DeceasedAnimalRecord"("farmId", "workflowStatus");

-- CreateIndex
CREATE INDEX "DeceasedAnimalRecord_farmId_snapshotType_createdAt_idx" ON "DeceasedAnimalRecord"("farmId", "snapshotType", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "DeathEvent_recordId_key" ON "DeathEvent"("recordId");

-- CreateIndex
CREATE INDEX "DeathEvent_causeOfDeath_idx" ON "DeathEvent"("causeOfDeath");

-- CreateIndex
CREATE INDEX "DeathEvent_dateOfDeath_idx" ON "DeathEvent"("dateOfDeath" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PostDeathHandling_recordId_key" ON "PostDeathHandling"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "LegalFinancial_recordId_key" ON "LegalFinancial"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalContext_recordId_key" ON "MedicalContext"("recordId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditMetadata_recordId_key" ON "AuditMetadata"("recordId");

-- CreateIndex
CREATE INDEX "AuditMetadata_approvalStatus_idx" ON "AuditMetadata"("approvalStatus");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmUser" ADD CONSTRAINT "FarmUser_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmUser" ADD CONSTRAINT "FarmUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmUser" ADD CONSTRAINT "FarmUser_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Animal" ADD CONSTRAINT "Animal_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalUpdate" ADD CONSTRAINT "AnimalUpdate_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalUpdate" ADD CONSTRAINT "AnimalUpdate_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalUpdate" ADD CONSTRAINT "AnimalUpdate_maleAnimalId_fkey" FOREIGN KEY ("maleAnimalId") REFERENCES "Animal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalAssignment" ADD CONSTRAINT "AnimalAssignment_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalAssignment" ADD CONSTRAINT "AnimalAssignment_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalAssignment" ADD CONSTRAINT "AnimalAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalAssignment" ADD CONSTRAINT "AnimalAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalAssignment" ADD CONSTRAINT "AnimalAssignment_unassignedById_fkey" FOREIGN KEY ("unassignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeceasedAnimalRecord" ADD CONSTRAINT "DeceasedAnimalRecord_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeceasedAnimalRecord" ADD CONSTRAINT "DeceasedAnimalRecord_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathEvent" ADD CONSTRAINT "DeathEvent_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "DeceasedAnimalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathEvent" ADD CONSTRAINT "DeathEvent_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeathEvent" ADD CONSTRAINT "DeathEvent_confirmedById_fkey" FOREIGN KEY ("confirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostDeathHandling" ADD CONSTRAINT "PostDeathHandling_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "DeceasedAnimalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalFinancial" ADD CONSTRAINT "LegalFinancial_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "DeceasedAnimalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalContext" ADD CONSTRAINT "MedicalContext_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "DeceasedAnimalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalContext" ADD CONSTRAINT "MedicalContext_attendingVetId_fkey" FOREIGN KEY ("attendingVetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditMetadata" ADD CONSTRAINT "AuditMetadata_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "DeceasedAnimalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditMetadata" ADD CONSTRAINT "AuditMetadata_recordCreatedById_fkey" FOREIGN KEY ("recordCreatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
