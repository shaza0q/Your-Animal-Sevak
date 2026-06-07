/**
 * Seeds breed, vaccine, and disease master data from the JSON files at the repo root.
 *
 * Run:  cd server && npx ts-node seed/seedMasterData.ts
 *
 * Safe to re-run — uses upsert so duplicate entries are skipped.
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import prisma from '../lib/prisma';

const ROOT = path.resolve(__dirname, '../../');

async function seedBreeds() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'breedAnimal.json'), 'utf-8')) as
    { type: string; breeds: string[] }[];

  const rows = raw.flatMap(({ type, breeds }) =>
    breeds.map((breedName) => ({ animalType: type, breedName }))
  );

  let inserted = 0;
  for (const row of rows) {
    await prisma.breedMaster.upsert({
      where: { animalType_breedName: row },
      create: row,
      update: {},
    });
    inserted++;
  }
  console.log(`  breeds: ${inserted} upserted`);
}

async function seedVaccines() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'vaccineAnimal.json'), 'utf-8')) as
    { animalType: string; vaccines: string[] }[];

  const rows = raw.flatMap(({ animalType, vaccines }) =>
    vaccines.map((vaccineName) => ({ animalType, vaccineName }))
  );

  let inserted = 0;
  for (const row of rows) {
    await prisma.vaccineMaster.upsert({
      where: { animalType_vaccineName: row },
      create: row,
      update: {},
    });
    inserted++;
  }
  console.log(`  vaccines: ${inserted} upserted`);
}

async function seedDiseases() {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'diseaseAnimal.json'), 'utf-8')) as
    { animalType: string; diseaseName: string[] }[];

  const rows = raw.flatMap(({ animalType, diseaseName }) =>
    diseaseName.map((name) => ({ animalType, diseaseName: name }))
  );

  let inserted = 0;
  for (const row of rows) {
    await prisma.diseaseMaster.upsert({
      where: { animalType_diseaseName: row },
      create: row,
      update: {},
    });
    inserted++;
  }
  console.log(`  diseases: ${inserted} upserted`);
}

export async function run() {
  console.log('\nSeeding master data…');
  await seedBreeds();
  await seedVaccines();
  await seedDiseases();
}
