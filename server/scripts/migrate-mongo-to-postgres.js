'use strict';

/**
 * One-time migration: MongoDB → PostgreSQL
 *
 * Prerequisites:
 *   1. MongoDB running with the old data  (MONGO_URL in .env)
 *   2. PostgreSQL running and migrated    (DATABASE_URL in .env, run: npx prisma migrate dev)
 *
 * Usage:
 *   node server/scripts/migrate-mongo-to-postgres.js
 *
 * Options (env vars):
 *   CLEAR_POSTGRES=true   Truncate all Postgres tables before migrating (safe for re-runs)
 *   MONGO_URL=...         Override the MongoDB connection string
 *   DATABASE_URL=...      Override the Postgres connection string
 *
 * The script uses the MongoDB _id string as the Prisma row id, so re-running
 * with CLEAR_POSTGRES=true is fully idempotent.
 */

require('dotenv/config');
const mongoose = require('mongoose');
const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();
const CLEAR = process.env.CLEAR_POSTGRES === 'true';

const stats = { inserted: 0, skipped: 0 };
const errors = [];

// ─── helpers ──────────────────────────────────────────────────────────────────

function id(doc) {
  return doc._id.toString();
}

function ref(oid) {
  return oid ? oid.toString() : null;
}

// Mongoose uses "other" (lowercase), Prisma enum uses "Other"
function normalizeAnimalType(t) {
  if (!t) return 'Other';
  return t === 'other' ? 'Other' : t;
}

async function tryInsert(label, fn) {
  try {
    await fn();
    stats.inserted++;
  } catch (err) {
    stats.skipped++;
    errors.push({ label, message: err.message });
  }
}

// ─── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection.db;
  console.log('  connected:', process.env.MONGO_URL);

  console.log('Connecting to PostgreSQL…');
  await prisma.$connect();
  console.log('  connected');

  if (CLEAR) {
    console.log('\nClearing PostgreSQL tables (CLEAR_POSTGRES=true)…');
    // Delete in reverse FK dependency order
    await prisma.auditMetadata.deleteMany({});
    await prisma.medicalContext.deleteMany({});
    await prisma.legalFinancial.deleteMany({});
    await prisma.postDeathHandling.deleteMany({});
    await prisma.deathEvent.deleteMany({});
    await prisma.deceasedAnimalRecord.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.animalAssignment.deleteMany({});
    await prisma.animalUpdate.deleteMany({});
    await prisma.animal.deleteMany({});
    await prisma.farmUser.deleteMany({});
    await prisma.farm.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.breedMaster.deleteMany({});
    await prisma.diseaseMaster.deleteMany({});
    await prisma.vaccineMaster.deleteMany({});
    console.log('  done\n');
  }

  // ── 1. Users ──────────────────────────────────────────────────────────────
  console.log('[1/10] Migrating users…');
  const users = await db.collection('users').find({}).toArray();
  for (const u of users) {
    await tryInsert(`user:${id(u)}`, () =>
      prisma.user.create({
        data: {
          id: id(u),
          fullName: u.full_name || u.fullName || 'Unknown',
          email: u.email,
          mobile: u.mobile?.toString() ?? '',
          password: u.password,
          role: u.role ?? 'caretaker',
          isActive: u.isActive ?? true,
          createdAt: u.createdAt ?? new Date(),
          updatedAt: u.updatedAt ?? new Date(),
        },
      })
    );
  }
  console.log(`  ${users.length} records`);

  // ── 2. Farms ──────────────────────────────────────────────────────────────
  console.log('[2/10] Migrating farms…');
  const farms = await db.collection('farms').find({}).toArray();
  for (const f of farms) {
    await tryInsert(`farm:${id(f)}`, () =>
      prisma.farm.create({
        data: {
          id: id(f),
          name: f.name,
          location: f.location ?? null,
          capacity: f.capacity ?? null,
          status: f.status ?? 'active',
          animalTypes: f.animalTypes ?? [],
          ownerId: ref(f.owner),
          createdById: ref(f.createdBy),
          createdAt: f.createdAt ?? new Date(),
          updatedAt: f.updatedAt ?? new Date(),
        },
      })
    );
  }
  console.log(`  ${farms.length} records`);

  // ── 3. FarmUsers ──────────────────────────────────────────────────────────
  console.log('[3/10] Migrating farm memberships…');
  const farmUsers = await db.collection('farmusers').find({}).toArray();
  for (const fu of farmUsers) {
    await tryInsert(`farmUser:${id(fu)}`, () =>
      prisma.farmUser.create({
        data: {
          id: id(fu),
          farmId: ref(fu.farmId),
          userId: ref(fu.userId),
          role: fu.role,
          createdById: ref(fu.createdBy),
          isActive: fu.isActive ?? true,
          assignedAt: fu.assignedAt ?? fu.createdAt ?? new Date(),
          createdAt: fu.createdAt ?? new Date(),
          updatedAt: fu.updatedAt ?? new Date(),
        },
      })
    );
  }
  console.log(`  ${farmUsers.length} records`);

  // ── 4. Master data ────────────────────────────────────────────────────────
  console.log('[4/10] Migrating master data…');

  const breeds = await db.collection('breedmasters').find({}).toArray();
  for (const b of breeds) {
    await tryInsert(`breed:${id(b)}`, () =>
      prisma.breedMaster.create({
        data: { id: id(b), breedName: b.breedName, animalType: b.animalType },
      })
    );
  }

  const diseases = await db.collection('diseasemasters').find({}).toArray();
  for (const d of diseases) {
    await tryInsert(`disease:${id(d)}`, () =>
      prisma.diseaseMaster.create({
        data: { id: id(d), diseaseName: d.diseaseName, animalType: d.animalType },
      })
    );
  }

  const vaccines = await db.collection('vaccinemasters').find({}).toArray();
  for (const v of vaccines) {
    await tryInsert(`vaccine:${id(v)}`, () =>
      prisma.vaccineMaster.create({
        data: { id: id(v), vaccineName: v.vaccineName, animalType: v.animalType },
      })
    );
  }
  console.log(`  ${breeds.length} breeds, ${diseases.length} diseases, ${vaccines.length} vaccines`);

  // ── 5. Animals (pass 1 — no lineage) ──────────────────────────────────────
  console.log('[5/10] Migrating animals (pass 1 — structure)…');
  const animals = await db.collection('animals').find({}).toArray();
  for (const a of animals) {
    await tryInsert(`animal:${id(a)}`, () =>
      prisma.animal.create({
        data: {
          id: id(a),
          tagNumber: a.tagNumber,
          name: a.name,
          farmId: ref(a.farmId),
          animalType: normalizeAnimalType(a.animalType),
          breed: a.breed,
          gender: a.gender,
          generation: a.generation ?? 1,
          weight: a.weight ?? null,
          dateOfBirth: a.dateOfBirth ?? null,
          acquisitionDate: a.acquisitionDate ?? null,
          status: a.status ?? 'Active',
          isDeleted: a.isDeleted ?? false,
          createdAt: a.createdAt ?? new Date(),
          updatedAt: a.updatedAt ?? new Date(),
        },
      })
    );
  }
  console.log(`  ${animals.length} records`);

  // ── 5b. Animals (pass 2 — lineage) ────────────────────────────────────────
  console.log('[5b]  Wiring lineage (mother/father)…');
  let lineageCount = 0;
  for (const a of animals) {
    if (!a.motherId && !a.fatherId) continue;
    try {
      await prisma.animal.update({
        where: { id: id(a) },
        data: { motherId: ref(a.motherId), fatherId: ref(a.fatherId) },
      });
      lineageCount++;
    } catch (err) {
      errors.push({ label: `lineage:${id(a)}`, message: err.message });
      stats.skipped++;
    }
  }
  console.log(`  ${lineageCount} links set`);

  // ── 6. AnimalUpdates ──────────────────────────────────────────────────────
  console.log('[6/10] Migrating animal updates…');
  const updates = await db.collection('animalupdates').find({}).toArray();
  for (const u of updates) {
    await tryInsert(`animalUpdate:${id(u)}`, () =>
      prisma.animalUpdate.create({
        data: {
          id: id(u),
          animalId: ref(u.animalId),
          staffId: ref(u.staffId),
          date: u.date ?? u.createdAt ?? new Date(),
          weight: u.weight ?? null,
          notes: u.notes ?? null,
          mediaUrl: u.mediaUrl ?? null,
          updateType: u.updateType,
          status: u.status,
          riskLevel: u.riskLevel ?? 'Low',
          vaccineName: u.vaccineName ?? null,
          diseaseName: u.diseaseName ?? null,
          maleAnimalId: ref(u.maleAnimalId),
          expectedDeliveryDate: u.expectedDeliveryDate ?? null,
          nextVaccineDate: u.nextVaccineDate ?? null,
          price: u.price ?? null,
          buyerName: u.buyerName ?? null,
          buyerEmail: u.buyerEmail ?? null,
          // buyerContact was Number in Mongoose — cast to String
          buyerContact: u.buyerContact != null ? u.buyerContact.toString() : null,
          buyerAddress: u.buyerAddress ?? null,
          createdAt: u.createdAt ?? new Date(),
          updatedAt: u.updatedAt ?? new Date(),
        },
      })
    );
  }
  console.log(`  ${updates.length} records`);

  // ── 7. AnimalAssignments ──────────────────────────────────────────────────
  console.log('[7/10] Migrating animal assignments…');
  const assignments = await db.collection('animalassignments').find({}).toArray();
  for (const a of assignments) {
    await tryInsert(`assignment:${id(a)}`, () =>
      prisma.animalAssignment.create({
        data: {
          id: id(a),
          animalId: ref(a.animalId),
          farmId: ref(a.farmId),
          workerId: ref(a.workerId),
          assignedById: ref(a.assignedBy),
          unassignedById: ref(a.unassignedBy),
          role: a.role ?? null,
          assignedAt: a.assignedAt ?? a.createdAt ?? new Date(),
          unassignedAt: a.unassignedAt ?? null,
          assignmentSource: a.assignmentSource ?? 'manual',
          notes: a.notes ?? '',
          createdAt: a.createdAt ?? new Date(),
          updatedAt: a.updatedAt ?? new Date(),
        },
      })
    );
  }
  console.log(`  ${assignments.length} records`);

  // ── 8. Sales ──────────────────────────────────────────────────────────────
  console.log('[8/10] Migrating sales…');
  const sales = await db.collection('sales').find({}).toArray();
  for (const s of sales) {
    await tryInsert(`sale:${id(s)}`, () =>
      prisma.sale.create({
        data: {
          id: id(s),
          animalId: ref(s.animalId),
          farmId: ref(s.farmId),
          handledById: ref(s.handledBy),
          price: s.price ?? null,
          dateSold: s.dateSold ?? null,
          buyerName: s.buyerName,
          // buyerContactInfo was Number in Mongoose — cast to String
          buyerContactInfo: s.buyerContactInfo != null ? s.buyerContactInfo.toString() : '',
          buyerAddress: s.buyerAddress ?? null,
          buyerEmail: s.buyerEmail ?? null,
          createdAt: s.createdAt ?? new Date(),
          updatedAt: s.updatedAt ?? new Date(),
        },
      })
    );
  }
  console.log(`  ${sales.length} records`);

  // ── 9 & 10. Deceased Animal Records + child tables ────────────────────────
  console.log('[9/10] Migrating deceased animal records…');
  const records = await db.collection('deceasedanimalrecords').find({}).toArray();

  for (const r of records) {
    const snap     = r.snapshot ?? {};
    const event    = r.deathRecord?.event ?? {};
    const handling = r.deathRecord?.handling ?? {};
    const legal    = r.deathRecord?.legal ?? {};
    const medical  = r.medicalContext ?? {};
    const audit    = r.auditMetadata ?? {};
    const rid      = id(r);

    // Main record
    await tryInsert(`deathRecord:${rid}`, () =>
      prisma.deceasedAnimalRecord.create({
        data: {
          id: rid,
          animalId: ref(r.animalId),
          farmId: ref(r.farmId),
          recordVersion: r.recordVersion ?? 1,
          workflowStatus: r.workflowStatus ?? 'reported',
          locationAtDeath: r.locationAtDeath ?? null,
          ageAtDeath: r.ageAtDeath ?? null,
          ageInMonths: r.ageInMonths ?? null,
          weightAtDeath: r.weightAtDeath ?? null,
          bodyConditionScore: r.bodyConditionScore ?? null,
          daysSinceDeath: r.daysSinceDeath ?? null,
          seasonOfDeath: r.seasonOfDeath ?? null,
          tags: r.deathRecord?.tags ?? [],
          notes: r.deathRecord?.notes ?? null,
          snapshotTagNumber:          snap.tagNumber ?? '',
          snapshotName:               snap.name ?? '',
          snapshotType:               snap.type ?? '',
          snapshotBreed:              snap.breed ?? null,
          snapshotGender:             snap.gender ?? null,
          snapshotDateOfBirth:        snap.dateOfBirth ?? null,
          snapshotPhotoUrl:           snap.photoUrl ?? null,
          snapshotFarmName:           snap.farmName ?? '',
          snapshotOwnerName:          snap.ownerName ?? null,
          snapshotOwnerId:            ref(snap.ownerId),
          snapshotLastKnownWeight:    snap.lastKnownWeight ?? null,
          snapshotLastKnownLocation:  snap.lastKnownLocation ?? null,
          snapshotReproductiveStatus: snap.reproductiveStatus ?? null,
          createdAt: r.createdAt ?? new Date(),
          updatedAt: r.updatedAt ?? new Date(),
        },
      })
    );

    // DeathEvent — only if the event section exists
    if (event.dateOfDeath && event.causeOfDeath && event.placeOfDeath) {
      await tryInsert(`deathEvent:${rid}`, () =>
        prisma.deathEvent.create({
          data: {
            id: `${rid}-event`,
            recordId: rid,
            dateOfDeath: event.dateOfDeath,
            timeOfDeath: event.timeOfDeath ?? null,
            causeOfDeath: event.causeOfDeath,
            causeDetails: event.causeDetails ?? null,
            placeOfDeath: event.placeOfDeath,
            reportedById: ref(event.reportedById),
            confirmedById: ref(event.confirmedById),
            confirmedAt: event.confirmedAt ?? null,
          },
        })
      );
    }

    // PostDeathHandling
    if (Object.keys(handling).length > 0) {
      await tryInsert(`handling:${rid}`, () =>
        prisma.postDeathHandling.create({
          data: {
            id: `${rid}-handling`,
            recordId: rid,
            necropsyPerformed: handling.necropsyPerformed ?? false,
            necropsyReportLink: handling.necropsyReportLink ?? null,
            necropsyFindings: handling.necropsyFindings ?? null,
            labSamplesTaken: handling.labSamplesTaken ?? [],
            disposalMethod: handling.disposalMethod ?? null,
            disposalDate: handling.disposalDate ?? null,
            disposalLocation: handling.disposalLocation ?? null,
            disposalCompany: handling.disposalCompany ?? null,
            disposalCost: handling.disposalCost ?? null,
            disposalCertificateId: handling.disposalCertificateId ?? null,
          },
        })
      );
    }

    // LegalFinancial
    if (Object.keys(legal).length > 0) {
      await tryInsert(`legal:${rid}`, () =>
        prisma.legalFinancial.create({
          data: {
            id: `${rid}-legal`,
            recordId: rid,
            insuranceClaimId: legal.insuranceClaimId ?? null,
            insuranceStatus: legal.insuranceStatus ?? 'pending',
            estimatedLossValue: legal.estimatedLossValue ?? null,
            marketValueAtDeath: legal.marketValueAtDeath ?? null,
            regulatoryReportRequired: legal.regulatoryReportRequired ?? null,
            regulatoryReportSubmitted: legal.regulatoryReportSubmitted ?? null,
            regulatoryReportId: legal.regulatoryReportId ?? null,
          },
        })
      );
    }

    // MedicalContext
    if (Object.keys(medical).length > 0) {
      await tryInsert(`medical:${rid}`, () =>
        prisma.medicalContext.create({
          data: {
            id: `${rid}-medical`,
            recordId: rid,
            attendingVetId: ref(medical.attendingVetId),
            lastVetVisitDate: medical.lastVetVisitDate ?? null,
            lastVetVisitReason: medical.lastVetVisitReason ?? null,
            vaccinationStatus: medical.vaccinationStatus ?? null,
            lastVaccinationDate: medical.lastVaccinationDate ?? null,
            lastProductionValue: medical.lastProductionValue ?? null,
            lastProductionDate: medical.lastProductionDate ?? null,
            productionUnit: medical.productionUnit ?? null,
            activeTreatments: medical.activeTreatments ?? [],
            activeMedications: medical.activeMedications ?? [],
            knownConditions: medical.knownConditions ?? [],
          },
        })
      );
    }

    // AuditMetadata
    if (Object.keys(audit).length > 0) {
      await tryInsert(`audit:${rid}`, () =>
        prisma.auditMetadata.create({
          data: {
            id: `${rid}-audit`,
            recordId: rid,
            recordCreatedById: ref(audit.recordCreatedById),
            recordCreatedAt: audit.recordCreatedAt ?? r.createdAt ?? new Date(),
            reviewedBy: audit.reviewedBy ?? null,
            reviewedAt: audit.reviewedAt ?? null,
            approvalStatus: audit.approvalStatus ?? 'pending',
            approvalNotes: audit.approvalNotes ?? null,
            corrections: audit.corrections ?? [],
            activityLog: audit.activityLog ?? [],
            attachments: audit.attachments ?? [],
            complianceChecklist: audit.complianceChecklist ?? [],
          },
        })
      );
    }
  }
  console.log(`  ${records.length} records (+ up to 5 child rows each)`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log(`Migration complete`);
  console.log(`  Inserted : ${stats.inserted}`);
  console.log(`  Skipped  : ${stats.skipped}`);
  if (errors.length > 0) {
    console.log(`\n${errors.length} error(s) (first 20 shown):`);
    errors.slice(0, 20).forEach(e => console.log(`  [${e.label}] ${e.message}`));
    if (errors.length > 20) console.log(`  … and ${errors.length - 20} more`);
  } else {
    console.log('  Errors   : none');
  }
  console.log('══════════════════════════════════════');
}

main()
  .catch(err => { console.error('Fatal:', err); process.exit(1); })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
    await prisma.$disconnect().catch(() => {});
  });
