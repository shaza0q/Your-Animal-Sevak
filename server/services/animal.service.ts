import prisma from '../lib/prisma';
import { AnimalType, AnimalStatus, Gender, UpdateType, HealthStatus } from '../generated/prisma';
import { paginated, paginationMeta, PaginatedResponse } from '../lib/pagination';

interface SearchAnimalArgs {
  farmId: string;
  q?: string;
  animalType?: string;
  breed?: string;
  gender?: string;
  excludeAnimalIds?: string[];
}

interface GetAnimalsByTypeArgs {
  farmId: string;
  type?: string;    // optional — omit to list all types
  page: number;
  limit: number;
  assigned?: string;
  gender?: string;
  breed?: string;
  caretakerName?: string;
  vetName?: string;
  status?: string;
  search?: string;  // partial tagNumber match
}

interface GetAnimalHistoryArgs {
  animalId: string;
  page?: number;
  limit?: number;
}

interface HistoryEvent {
  id: string;
  type: string;
  role?: string | null;
  at: Date | null;
  user?: { id: string | null; name: string } | null;
  createdBy?: { id: string | null; name: string } | null;
  weight?: { current: number | null; unit: string };
  health?: {
    eventType: string | null;
    description: string | null;
    severity: string | null;
    diseaseName: string | null;
    vaccineName: string | null;
  };
}

function normalizeAnimalType(type: string): AnimalType {
  return (type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()) as AnimalType;
}

function normalizeGender(gender: string): string {
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

export async function searchAnimal({
  farmId,
  q,
  animalType,
  breed,
  gender,
  excludeAnimalIds = [],
}: SearchAnimalArgs) {
  const where: any = {
    farmId,
    isDeleted: false,
  };

  if (animalType) {
    where.animalType = normalizeAnimalType(animalType);
  }

  if (breed) {
    where.breed = breed;
  }

  if (gender) {
    where.gender = normalizeGender(gender);
  }

  if (excludeAnimalIds.length) {
    where.id = { notIn: excludeAnimalIds };
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { tagNumber: { contains: q, mode: 'insensitive' } },
      { breed: { contains: q, mode: 'insensitive' } },
    ];
  }

  return prisma.animal.findMany({
    where,
    take: 20,
    select: {
      id: true,
      tagNumber: true,
      name: true,
      animalType: true,
      breed: true,
      gender: true,
      farmId: true,
      status: true,
      dateOfBirth: true,
      weight: true,
    },
  });
}

export async function getAnimalsByType({
  farmId,
  type,
  page,
  limit,
  assigned,
  gender,
  breed,
  caretakerName,
  vetName,
  status,
  search,
}: GetAnimalsByTypeArgs) {
  const skip = (page - 1) * limit;

  const where: any = {
    farmId,
    isDeleted: false,
    // Only apply type filter when a type is provided
    ...(type && { animalType: normalizeAnimalType(type) }),
    ...(status && { status: (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) as AnimalStatus }),
    ...(gender && { gender: normalizeGender(gender) }),
    ...(breed && { breed: { contains: breed, mode: 'insensitive' } }),
    ...(search && { tagNumber: { contains: search, mode: 'insensitive' } }),
  };

  if (caretakerName) {
    where.assignments = {
      ...where.assignments,
      some: {
        role: 'caretaker',
        unassignedAt: null,
        worker: { fullName: { contains: caretakerName, mode: 'insensitive' } },
      },
    };
  }

  if (vetName) {
    where.assignments = {
      ...where.assignments,
      some: {
        role: 'veterinarian',
        unassignedAt: null,
        worker: { fullName: { contains: vetName, mode: 'insensitive' } },
      },
    };
  }

  if (assigned === 'true') {
    where.assignments = { some: { unassignedAt: null } };
  } else if (assigned === 'false') {
    where.assignments = { none: { unassignedAt: null } };
  }

  const [animals, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          where: { unassignedAt: null },
          include: { worker: { select: { id: true, fullName: true } } },
        },
        _count: { select: { updates: true } },
      },
    }),
    prisma.animal.count({ where }),
  ]);

  const shaped = animals.map((animal) => {
    const caretakerAssignment = animal.assignments.find((a) => a.role === 'caretaker');
    const vetAssignment = animal.assignments.find((a) => a.role === 'veterinarian');

    return {
      id: animal.id,
      tagNumber: animal.tagNumber,
      name: animal.name,
      animalType: animal.animalType,
      breed: animal.breed,
      gender: animal.gender,
      status: animal.status,
      dateOfBirth: animal.dateOfBirth?.toISOString() ?? null,
      weight: animal.weight,
      isAssigned: animal.assignments.length > 0,
      updatesCount: animal._count.updates,
      caretaker: caretakerAssignment?.worker
        ? { id: caretakerAssignment.worker.id, name: caretakerAssignment.worker.fullName }
        : null,
      veterinarian: vetAssignment?.worker
        ? { id: vetAssignment.worker.id, name: vetAssignment.worker.fullName }
        : null,
    };
  });

  return paginated(shaped, page, limit, total);
}

export async function getAnimalDetail({
  farmId,
  animalId,
}: {
  farmId: string;
  animalId: string;
}) {
  const animal = await prisma.animal.findFirst({
    where: { id: animalId, farmId, isDeleted: false },
    include: {
      farm: { select: { id: true, name: true } },
      assignments: {
        where: { unassignedAt: null },
        include: { worker: { select: { id: true, fullName: true, email: true } } },
      },
      mother: {
        select: { id: true, tagNumber: true, animalType: true, breed: true, status: true },
      },
      father: {
        select: { id: true, tagNumber: true, animalType: true, breed: true, status: true },
      },
      offspringViaMother: {
        where: { isDeleted: false },
        select: { id: true, tagNumber: true, animalType: true, breed: true, gender: true, status: true, dateOfBirth: true },
      },
      offspringViaFather: {
        where: { isDeleted: false },
        select: { id: true, tagNumber: true, animalType: true, breed: true, gender: true, status: true, dateOfBirth: true },
      },
    },
  });

  if (!animal) return null;

  let age: number | null = null;
  if (animal.dateOfBirth) {
    const now = new Date();
    const dob = new Date(animal.dateOfBirth);
    age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  }

  const caretakerAssignment = animal.assignments.find((a) => a.role === 'caretaker');
  const vetAssignment = animal.assignments.find((a) => a.role === 'veterinarian');

  // Deduplicate children (an animal could appear in both offspring arrays)
  const childrenMap = new Map<
    string,
    {
      id: string;
      tagNumber: string;
      animalType: AnimalType;
      breed: string;
      gender: Gender;
      status: AnimalStatus;
      dateOfBirth: string | null;
    }
  >();
  for (const c of [...animal.offspringViaMother, ...animal.offspringViaFather]) {
    if (!childrenMap.has(c.id)) {
      childrenMap.set(c.id, {
        id: c.id,
        tagNumber: c.tagNumber,
        animalType: c.animalType,
        breed: c.breed,
        gender: c.gender,
        status: c.status,
        dateOfBirth: c.dateOfBirth?.toISOString() ?? null,
      });
    }
  }

  return {
    id: animal.id,
    name: animal.name,
    tagNumber: animal.tagNumber,
    animalType: animal.animalType,
    breed: animal.breed,
    gender: animal.gender,
    generation: animal.generation,
    age,
    weight: animal.weight,
    dateOfBirth: animal.dateOfBirth?.toISOString() ?? null,
    acquisitionDate: animal.acquisitionDate?.toISOString() ?? null,
    motherId: animal.motherId,
    fatherId: animal.fatherId,
    status: animal.status,
    farm: { id: animal.farmId, name: animal.farm.name },
    mother: animal.mother ?? null,
    father: animal.father ?? null,
    children: Array.from(childrenMap.values()),
    caretaker: caretakerAssignment?.worker
      ? {
          id: caretakerAssignment.worker.id,
          name: caretakerAssignment.worker.fullName,
          email: caretakerAssignment.worker.email,
        }
      : null,
    veterinarian: vetAssignment?.worker
      ? {
          id: vetAssignment.worker.id,
          name: vetAssignment.worker.fullName,
          email: vetAssignment.worker.email,
        }
      : null,
  };
}

export async function getAnimalHistory({
  animalId,
  page = 1,
  limit = 5,
}: GetAnimalHistoryArgs) {
  limit = Math.min(limit, 20);
  const skip = (page - 1) * limit;

  const [assignments, animal, updates] = await Promise.all([
    prisma.animalAssignment.findMany({
      where: { animalId, workerId: { not: null }, role: { not: null } },
      include: {
        worker: { select: { id: true, fullName: true } },
        assignedBy: { select: { id: true, fullName: true } },
        unassignedBy: { select: { id: true, fullName: true } },
      },
    }),
    prisma.animal.findFirst({ where: { id: animalId, isDeleted: false }, select: { id: true, createdAt: true } }),
    prisma.animalUpdate.findMany({
      where: { animalId },
      include: { staff: { select: { id: true, fullName: true } } },
    }),
  ]);

  const events: HistoryEvent[] = [];

  for (const a of assignments) {
    events.push({
      id: a.id,
      type: 'ASSIGNED',
      role: a.role,
      at: a.assignedAt,
      user: a.worker ? { id: a.worker.id, name: a.worker.fullName } : null,
      createdBy: a.assignedBy ? { id: a.assignedBy.id, name: a.assignedBy.fullName } : null,
    });
    if (a.unassignedAt) {
      events.push({
        id: `UNASSIGNED_${a.id}`,
        type: 'UNASSIGNED',
        role: a.role,
        at: a.unassignedAt,
        user: a.worker ? { id: a.worker.id, name: a.worker.fullName } : null,
        createdBy: a.unassignedBy
          ? { id: a.unassignedBy.id, name: a.unassignedBy.fullName }
          : null,
      });
    }
  }

  if (animal) {
    events.push({
      id: `CREATED_${animal.id}`,
      type: 'CREATED',
      at: animal.createdAt,
      user: null,
      createdBy: { id: null, name: 'System' },
    });
  }

  for (const u of updates) {
    const type =
      u.updateType === 'Weight'
        ? 'WEIGHT_UPDATED'
        : u.updateType === 'Vaccination'
        ? 'VACCINATION_ADDED'
        : 'HEALTH_EVENT';
    events.push({
      id: u.id,
      type,
      at: u.date,
      createdBy: u.staff ? { id: u.staff.id, name: u.staff.fullName } : null,
      weight: { current: u.weight, unit: 'kg' },
      health: {
        eventType: u.updateType,
        description: u.notes,
        severity: u.riskLevel,
        diseaseName: u.diseaseName,
        vaccineName: u.vaccineName,
      },
    });
  }

  events.sort((a, b) => (b.at?.getTime() ?? 0) - (a.at?.getTime() ?? 0));
  const total = events.length;
  const pageData = events.slice(skip, skip + limit);

  return {
    data: pageData,
    pagination: paginationMeta(page, limit, total),
  };
}

export async function getAnimalAbstractData(animalId: string) {
  return prisma.animal.findFirst({ where: { id: animalId, isDeleted: false } });
}

// ─── Sale ─────────────────────────────────────────────────────────────────────

export interface SellAnimalData {
  buyerName: string;
  buyerContact?: string;
  salePrice: number;
  dateSold?: string;
  notes?: string;
  buyerEmail?: string;
  buyerAddress?: string;
}

export async function sellAnimal(
  animalId: string,
  staffId: string,
  data: SellAnimalData,
) {
  return prisma.$transaction(async (tx) => {
    // 1. Verify the animal exists and is eligible for sale
    const animal = await tx.animal.findFirst({
      where: { id: animalId, isDeleted: false },
    });

    if (!animal) throw new Error('Animal not found');
    if (animal.status === AnimalStatus.Sold) {
      throw new Error('This animal is already marked as Sold');
    }
    if (animal.status === AnimalStatus.Deceased) {
      throw new Error('This animal is deceased and cannot be sold');
    }
    if (animal.status !== AnimalStatus.Active) {
      throw new Error('Only Active animals can be sold');
    }

    const soldDate = data.dateSold ? new Date(data.dateSold) : new Date();

    // 2. Create Sale record (buyer details + price)
    const sale = await tx.sale.create({
      data: {
        animalId,
        farmId: animal.farmId,
        buyerName: data.buyerName,
        buyerContactInfo: data.buyerContact ?? '',
        buyerEmail: data.buyerEmail || null,
        buyerAddress: data.buyerAddress || null,
        price: data.salePrice,
        dateSold: soldDate,
        handledById: staffId,
      },
    });

    // 3. Create AnimalUpdate event so it appears in the history timeline
    await tx.animalUpdate.create({
      data: {
        animalId,
        staffId,
        updateType: UpdateType.Sale,
        status: HealthStatus.Sold,
        date: soldDate,
        price: data.salePrice,
        buyerName: data.buyerName,
        buyerContact: data.buyerContact || null,
        buyerEmail: data.buyerEmail || null,
        buyerAddress: data.buyerAddress || null,
        notes: data.notes || null,
      },
    });

    // 4. Mark animal as Sold
    await tx.animal.update({
      where: { id: animalId },
      data: { status: AnimalStatus.Sold },
    });

    return sale;
  });
}
