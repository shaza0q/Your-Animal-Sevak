/**
 * Seeds one user per role plus a demo farm owned by the owner user.
 * All passwords are:  Password@123
 *
 * Users created:
 *   admin@sevak.dev      role: admin
 *   owner@sevak.dev      role: owner
 *   manager@sevak.dev    role: manager
 *   staff@sevak.dev      role: staff
 *   caretaker@sevak.dev  role: caretaker
 *   vet@sevak.dev        role: veterinarian
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { UserRole } from '../generated/prisma';

const DEFAULT_PASSWORD = 'Password@123';

const USERS: { fullName: string; email: string; mobile: string; role: UserRole }[] = [
  { fullName: 'Admin User',      email: 'admin@sevak.dev',     mobile: '9000000001', role: UserRole.admin },
  { fullName: 'Farm Owner',      email: 'owner@sevak.dev',     mobile: '9000000002', role: UserRole.owner },
  { fullName: 'Farm Manager',    email: 'manager@sevak.dev',   mobile: '9000000003', role: UserRole.manager },
  { fullName: 'Staff Member',    email: 'staff@sevak.dev',     mobile: '9000000004', role: UserRole.staff },
  { fullName: 'Caretaker',       email: 'caretaker@sevak.dev', mobile: '9000000005', role: UserRole.caretaker },
  { fullName: 'Dr. Veterinary',  email: 'vet@sevak.dev',       mobile: '9000000006', role: UserRole.veterinarian },
];

async function seedUsers() {
  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const created: Record<string, string> = {}; // role → id

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: { ...u, password: hashed },
      update: { fullName: u.fullName, mobile: u.mobile, role: u.role },
    });
    created[u.role] = user.id;
    console.log(`  [${u.role.padEnd(12)}] ${u.email}`);
  }

  return created;
}

async function seedDemoFarm(ownerId: string, createdByIds: Record<string, string>) {
  const farm = await prisma.farm.upsert({
    where: { id: 'demo-farm-seed' },
    create: {
      id: 'demo-farm-seed',
      name: 'Sevak Demo Farm',
      location: 'Pune, Maharashtra',
      capacity: 200,
      animalTypes: ['Cow', 'Buffalo', 'Goat', 'Sheep'],
      ownerId,
      createdById: ownerId,
    },
    update: { name: 'Sevak Demo Farm' },
  });

  // Add all users as farm members
  const memberships: { userId: string; role: UserRole }[] = [
    { userId: createdByIds[UserRole.owner],       role: UserRole.owner },
    { userId: createdByIds[UserRole.manager],     role: UserRole.manager },
    { userId: createdByIds[UserRole.staff],       role: UserRole.staff },
    { userId: createdByIds[UserRole.caretaker],   role: UserRole.caretaker },
    { userId: createdByIds[UserRole.veterinarian],role: UserRole.veterinarian },
  ];

  for (const m of memberships) {
    await prisma.farmUser.upsert({
      where: { farmId_userId: { farmId: farm.id, userId: m.userId } },
      create: { farmId: farm.id, userId: m.userId, role: m.role, createdById: ownerId },
      update: { role: m.role, isActive: true },
    });
  }

  console.log(`  demo farm: "${farm.name}" (id: ${farm.id})`);
  console.log(`  farm members: ${memberships.length} users assigned`);
}

export async function run() {
  console.log('\nSeeding users…');
  const ids = await seedUsers();

  console.log('\nSeeding demo farm…');
  await seedDemoFarm(ids[UserRole.owner], ids);
}
