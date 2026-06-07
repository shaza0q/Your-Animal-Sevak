/**
 * Master seed runner — runs all seed scripts in order.
 * Usage:  cd server && npm run seed
 */

import 'dotenv/config';
import prisma from '../lib/prisma';
import { run as seedMaster } from './seedMasterData';
import { run as seedUsers } from './seedUsers';

async function main() {
  await seedMaster();
  await seedUsers();

  console.log('\nAll seeds complete.');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
