import prisma from '../lib/prisma';
import { AssignmentRole } from '../generated/prisma';

interface AssignArgs {
  animalId: string;
  workerId: string;
  role: string;
  assignedBy?: string | null;
}

interface UnassignArgs {
  animalId: string;
  userId: string;
  role: string;
  unassignedBy?: string | null;
}

export async function getActiveAssignments(animalId: string) {
  const assignments = await prisma.animalAssignment.findMany({
    where: { animalId, unassignedAt: null },
    include: {
      worker: { select: { id: true, fullName: true, email: true } },
      assignedBy: { select: { id: true, fullName: true } },
      unassignedBy: { select: { id: true, fullName: true } },
    },
  });
  return assignments.map((a) => ({
    id: a.id,
    role: a.role,
    assignedAt: a.assignedAt,
    worker: a.worker ? { id: a.worker.id, name: a.worker.fullName, email: a.worker.email } : null,
    assignedByUser: a.assignedBy ? { id: a.assignedBy.id, name: a.assignedBy.fullName } : null,
    unassignedByUser: a.unassignedBy
      ? { id: a.unassignedBy.id, name: a.unassignedBy.fullName }
      : null,
  }));
}

export async function assignUserToAnimal({ animalId, workerId, role, assignedBy }: AssignArgs) {
  const animal = await prisma.animal.findFirst({
    where: { id: animalId, isDeleted: false },
    select: { farmId: true },
  });
  if (!animal) throw new Error('Animal not found');

  // Close existing assignment of same role
  await prisma.animalAssignment.updateMany({
    where: { animalId, role: role as AssignmentRole, unassignedAt: null },
    data: { unassignedAt: new Date() },
  });

  return prisma.animalAssignment.create({
    data: {
      animalId,
      workerId,
      role: role as AssignmentRole,
      farmId: animal.farmId,
      assignedById: assignedBy ?? null,
    },
  });
}

export async function unassignAnimalUser({
  animalId,
  userId,
  role,
  unassignedBy,
}: UnassignArgs) {
  const existing = await prisma.animalAssignment.findFirst({
    where: { animalId, workerId: userId, role: role as AssignmentRole, unassignedAt: null },
  });
  if (!existing) return null;

  return prisma.animalAssignment.update({
    where: { id: existing.id },
    data: { unassignedAt: new Date(), unassignedById: unassignedBy ?? null },
  });
}
