import prisma from '../lib/prisma';
import { AnimalStatus, UpdateType, HealthStatus, RiskLevel } from '../generated/prisma';

/**
 * Aggregates the actionable "to-do" items for a farm owner across every farm they
 * actively belong to: upcoming/overdue vaccinations, animals needing attention,
 * and open death-case compliance tasks. Powers the Today / Tasks page.
 */

export interface VaccinationTask {
  animalId: string;
  name: string;
  tagNumber: string;
  animalType: string;
  farmId: string;
  farmName: string;
  vaccineName: string | null;
  dueDate: string;
  overdue: boolean;
}

export interface AttentionTask {
  id: string;
  name: string;
  tagNumber: string;
  animalType: string;
  farmId: string;
  farmName: string;
  latestStatus: string;
  riskLevel: string;
}

export interface DeathCaseTask {
  id: string;
  name: string;
  tagNumber: string;
  farmId: string;
  farmName: string;
  workflowStatus: string;
  createdAt: string;
}

export interface FarmTasks {
  vaccinations: VaccinationTask[];
  attention: AttentionTask[];
  deathCases: DeathCaseTask[];
  counts: { vaccinations: number; attention: number; deathCases: number; total: number };
}

const CLOSED_DEATH_STATUSES = ['approved', 'archived'];

export async function getFarmTasks(userId: string): Promise<FarmTasks> {
  const farmUsers = await prisma.farmUser.findMany({
    where: { userId, isActive: true },
    select: { farmId: true, farm: { select: { name: true } } },
  });

  const empty: FarmTasks = {
    vaccinations: [],
    attention: [],
    deathCases: [],
    counts: { vaccinations: 0, attention: 0, deathCases: 0, total: 0 },
  };

  if (farmUsers.length === 0) return empty;

  const farmIds = farmUsers.map((fu) => fu.farmId);
  const farmNameById = new Map(farmUsers.map((fu) => [fu.farmId, fu.farm.name]));

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [activeAnimals, deathRecords] = await Promise.all([
    // Active animals + their vaccination schedule and latest health status
    prisma.animal.findMany({
      where: { farmId: { in: farmIds }, status: AnimalStatus.Active, isDeleted: false },
      select: {
        id: true,
        name: true,
        tagNumber: true,
        animalType: true,
        farmId: true,
        updates: {
          where: { updateType: { in: [UpdateType.Vaccination, UpdateType.Health] } },
          orderBy: { date: 'desc' },
          select: {
            updateType: true,
            status: true,
            riskLevel: true,
            vaccineName: true,
            nextVaccineDate: true,
            date: true,
          },
        },
      },
    }),

    // Open death-case compliance work
    prisma.deceasedAnimalRecord.findMany({
      where: { farmId: { in: farmIds }, workflowStatus: { notIn: CLOSED_DEATH_STATUSES as any } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        snapshotName: true,
        snapshotTagNumber: true,
        farmId: true,
        workflowStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const vaccinations: VaccinationTask[] = [];
  const attention: AttentionTask[] = [];

  for (const animal of activeAnimals) {
    const farmName = farmNameById.get(animal.farmId) ?? '';

    // ── Vaccination: use the most recent vaccination update's nextVaccineDate as
    //    the animal's current schedule, so re-vaccinated animals don't show stale tasks.
    const latestVaccination = animal.updates.find(
      (u) => u.updateType === UpdateType.Vaccination && u.nextVaccineDate,
    );
    if (latestVaccination?.nextVaccineDate && latestVaccination.nextVaccineDate <= sevenDaysFromNow) {
      vaccinations.push({
        animalId: animal.id,
        name: animal.name,
        tagNumber: animal.tagNumber,
        animalType: animal.animalType,
        farmId: animal.farmId,
        farmName,
        vaccineName: latestVaccination.vaccineName,
        dueDate: latestVaccination.nextVaccineDate.toISOString(),
        overdue: latestVaccination.nextVaccineDate < now,
      });
    }

    // ── Attention: latest health update flags high risk or active illness/injury
    const latestHealth = animal.updates.find((u) => u.updateType === UpdateType.Health);
    const status = latestHealth?.status ?? HealthStatus.Healthy;
    const risk = latestHealth?.riskLevel ?? RiskLevel.Low;
    if (risk === RiskLevel.High || status === HealthStatus.Injured || status === HealthStatus.Diseased) {
      attention.push({
        id: animal.id,
        name: animal.name,
        tagNumber: animal.tagNumber,
        animalType: animal.animalType,
        farmId: animal.farmId,
        farmName,
        latestStatus: status,
        riskLevel: risk,
      });
    }
  }

  // Soonest due first; overdue (past dates) naturally sort to the top
  vaccinations.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const deathCases: DeathCaseTask[] = deathRecords.map((r) => ({
    id: r.id,
    name: r.snapshotName,
    tagNumber: r.snapshotTagNumber,
    farmId: r.farmId,
    farmName: farmNameById.get(r.farmId) ?? '',
    workflowStatus: r.workflowStatus,
    createdAt: r.createdAt.toISOString(),
  }));

  return {
    vaccinations,
    attention,
    deathCases,
    counts: {
      vaccinations: vaccinations.length,
      attention: attention.length,
      deathCases: deathCases.length,
      total: vaccinations.length + attention.length + deathCases.length,
    },
  };
}
