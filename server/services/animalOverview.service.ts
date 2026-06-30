import prisma from '../lib/prisma';
import { AnimalStatus, UpdateType, HealthStatus, RiskLevel } from '../generated/prisma';

export async function getAnimalOverviewByFarm(farmId: string, state: string) {
  const status = (state.charAt(0).toUpperCase() + state.slice(1).toLowerCase()) as AnimalStatus;

  const animals = await prisma.animal.findMany({
    where: { farmId, status, isDeleted: false },
    include: { assignments: { where: { unassignedAt: null } } },
  });

  const grouped: Record<string, { type: string; total: number; unassigned: number }> = {};
  for (const animal of animals) {
    const type = animal.animalType;
    if (!grouped[type]) grouped[type] = { type, total: 0, unassigned: 0 };
    grouped[type].total++;
    if (animal.assignments.length === 0) grouped[type].unassigned++;
  }

  return { farmId, categories: Object.values(grouped) };
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  healthSummary: {
    healthy: number;
    underTreatment: number;
    critical: number;
  };
  animalsNeedingAttention: Array<{
    id: string;
    name: string;
    tagNumber: string;
    animalType: string;
    farmId: string;
    farmName: string;
    photoUrl: string | null;
    latestStatus: string;
    riskLevel: string;
  }>;
  deathCases: {
    openCases: number;
    pendingReview: number;
    total: number;
    complianceRate: number;
  };
  addedLast30Days: number;
  farmStats: Array<{
    farmId: string;
    farmName: string;
    location: string | null;
    animalTypes: string[];
    totalActiveAnimals: number;
    vaccinationsDue7Days: number;
    healthScore: number;
    status: string;
  }>;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const farmUsers = await prisma.farmUser.findMany({
    where: { userId, isActive: true },
    include: { farm: true },
  });

  const farmIds = farmUsers.map((fu) => fu.farmId);

  if (farmIds.length === 0) {
    return {
      healthSummary: { healthy: 0, underTreatment: 0, critical: 0 },
      animalsNeedingAttention: [],
      deathCases: { openCases: 0, pendingReview: 0, total: 0, complianceRate: 100 },
      addedLast30Days: 0,
      farmStats: [],
    };
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // ── Fetch active animals with their latest health update ──────────────────
  const [animals, deathCaseRows, addedLast30Days, vaccinationResults] = await Promise.all([
    prisma.animal.findMany({
      where: { farmId: { in: farmIds }, status: AnimalStatus.Active, isDeleted: false },
      include: {
        updates: {
          where: { updateType: UpdateType.Health },
          orderBy: { date: 'desc' },
          take: 1,
          select: { status: true, riskLevel: true },
        },
        farm: { select: { name: true } },
      },
    }),

    prisma.deceasedAnimalRecord.groupBy({
      by: ['workflowStatus'],
      where: { farmId: { in: farmIds } },
      _count: { id: true },
    }),

    prisma.animal.count({
      where: { farmId: { in: farmIds }, createdAt: { gte: thirtyDaysAgo }, isDeleted: false },
    }),

    // Count upcoming vaccinations per farm
    Promise.all(
      farmIds.map((farmId) =>
        prisma.animalUpdate
          .count({
            where: {
              animal: { farmId, isDeleted: false },
              updateType: UpdateType.Vaccination,
              nextVaccineDate: { gte: now, lte: sevenDaysFromNow },
            },
          })
          .then((count) => [farmId, count] as [string, number]),
      ),
    ),
  ]);

  const vaccinationsByFarm = new Map(vaccinationResults);

  // ── Health summary + attention list ──────────────────────────────────────
  let healthy = 0;
  let underTreatment = 0;
  let critical = 0;
  const attentionList: DashboardStats['animalsNeedingAttention'] = [];

  // Group animals by farm for later use in farmStats
  const animalsByFarm = new Map<string, typeof animals>();
  for (const animal of animals) {
    if (!animalsByFarm.has(animal.farmId)) animalsByFarm.set(animal.farmId, []);
    animalsByFarm.get(animal.farmId)!.push(animal);
  }

  for (const animal of animals) {
    const update = animal.updates[0];
    const status = update?.status ?? HealthStatus.Healthy;
    const risk = update?.riskLevel ?? RiskLevel.Low;

    if (risk === RiskLevel.High) {
      critical++;
      attentionList.push({
        id: animal.id,
        name: animal.name,
        tagNumber: animal.tagNumber,
        animalType: animal.animalType,
        farmId: animal.farmId,
        farmName: animal.farm.name,
        photoUrl: animal.photoUrl,
        latestStatus: status,
        riskLevel: risk,
      });
    } else if (status === HealthStatus.Injured || status === HealthStatus.Diseased) {
      underTreatment++;
      attentionList.push({
        id: animal.id,
        name: animal.name,
        tagNumber: animal.tagNumber,
        animalType: animal.animalType,
        farmId: animal.farmId,
        farmName: animal.farm.name,
        photoUrl: animal.photoUrl,
        latestStatus: status,
        riskLevel: risk,
      });
    } else {
      // Healthy or Pregnant
      healthy++;
    }
  }

  // ── Death case stats ──────────────────────────────────────────────────────
  const CLOSED = new Set(['approved', 'archived']);
  let openCases = 0;
  let pendingReview = 0;
  let total = 0;
  let closedCases = 0;

  for (const row of deathCaseRows) {
    const count = row._count.id;
    total += count;
    if (CLOSED.has(row.workflowStatus)) {
      closedCases += count;
    } else {
      openCases += count;
      if (row.workflowStatus === 'review_pending') pendingReview = count;
    }
  }

  const complianceRate = total > 0 ? Math.round((closedCases / total) * 100) : 100;

  // ── Per-farm stats ────────────────────────────────────────────────────────
  const farmStats = farmUsers.map((fu) => {
    const farmAnimals = animalsByFarm.get(fu.farmId) ?? [];
    const totalActiveAnimals = farmAnimals.length;

    let healthyCount = 0;
    for (const animal of farmAnimals) {
      const update = animal.updates[0];
      const status = update?.status ?? HealthStatus.Healthy;
      const risk = update?.riskLevel ?? RiskLevel.Low;
      if (risk !== RiskLevel.High && (status === HealthStatus.Healthy || status === HealthStatus.Pregnant)) {
        healthyCount++;
      }
    }

    const healthScore =
      totalActiveAnimals > 0 ? Math.round((healthyCount / totalActiveAnimals) * 100) : 100;

    return {
      farmId: fu.farmId,
      farmName: fu.farm.name,
      location: fu.farm.location,
      animalTypes: fu.farm.animalTypes,
      totalActiveAnimals,
      vaccinationsDue7Days: vaccinationsByFarm.get(fu.farmId) ?? 0,
      healthScore,
      status: fu.farm.status,
    };
  });

  return {
    healthSummary: { healthy, underTreatment, critical },
    animalsNeedingAttention: attentionList.slice(0, 10),
    deathCases: { openCases, pendingReview, total, complianceRate },
    addedLast30Days,
    farmStats,
  };
}
