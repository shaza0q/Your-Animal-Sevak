import prisma from '../lib/prisma';
import { UpdateType, HealthStatus } from '../generated/prisma';

/**
 * Builds a personalised, farm-wide activity feed across every farm the user
 * actively belongs to: who did what, to which animal, and when. Powers the
 * dashboard "Recent Activity" timeline.
 */

export type ActivityType =
  | 'health'
  | 'weight'
  | 'vaccination'
  | 'breeding'
  | 'sale'
  | 'death'
  // Milestone / celebration events
  | 'arrival'
  | 'recovery';

/** Milestone events are celebratory and have no human actor. */
export const MILESTONE_TYPES: ActivityType[] = ['arrival', 'recovery'];

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  at: string;
  actorName: string;
  summary: string;
  detail: string | null;
  animal: {
    id: string;
    name: string;
    tagNumber: string;
    farmId: string;
    photoUrl: string | null;
  } | null;
  farmName: string;
  /** Relative path to navigate to when the event is clicked. */
  link: string | null;
}

const UPDATE_TYPE_META: Record<
  string,
  { type: ActivityType; verb: string }
> = {
  [UpdateType.Health]: { type: 'health', verb: 'logged a health check for' },
  [UpdateType.Weight]: { type: 'weight', verb: 'recorded a weight for' },
  [UpdateType.Vaccination]: { type: 'vaccination', verb: 'recorded a vaccination for' },
  [UpdateType.Breeding]: { type: 'breeding', verb: 'logged a breeding event for' },
  [UpdateType.Sale]: { type: 'sale', verb: 'sold' },
};

export async function getRecentActivity(
  userId: string,
  limit = 12,
): Promise<ActivityEvent[]> {
  const farmUsers = await prisma.farmUser.findMany({
    where: { userId, isActive: true },
    select: { farmId: true },
  });

  if (farmUsers.length === 0) return [];

  const farmIds = farmUsers.map((fu) => fu.farmId);

  // Milestone window — arrivals/recoveries only count as "recent" within 30 days
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const animalSelect = {
    id: true,
    name: true,
    tagNumber: true,
    farmId: true,
    photoUrl: true,
    farm: { select: { name: true } },
  } as const;

  const [updates, deaths, arrivals, healthHistory] = await Promise.all([
    prisma.animalUpdate.findMany({
      where: { animal: { farmId: { in: farmIds }, isDeleted: false } },
      orderBy: { date: 'desc' },
      take: limit,
      select: {
        id: true,
        date: true,
        updateType: true,
        status: true,
        weight: true,
        vaccineName: true,
        diseaseName: true,
        price: true,
        buyerName: true,
        staff: { select: { fullName: true } },
        animal: { select: { ...animalSelect, createdAt: true } },
      },
    }),

    prisma.deceasedAnimalRecord.findMany({
      where: { farmId: { in: farmIds } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        snapshotName: true,
        snapshotTagNumber: true,
        snapshotPhotoUrl: true,
        animalId: true,
        farmId: true,
        farm: { select: { name: true } },
      },
    }),

    // Arrivals — animals registered within the milestone window
    prisma.animal.findMany({
      where: { farmId: { in: farmIds }, isDeleted: false, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { ...animalSelect, breed: true, animalType: true, createdAt: true },
    }),

    // Recent Health updates (for recovery detection) — grouped per animal below
    prisma.animalUpdate.findMany({
      where: {
        updateType: UpdateType.Health,
        date: { gte: since },
        animal: { farmId: { in: farmIds }, isDeleted: false },
      },
      orderBy: [{ animalId: 'asc' }, { date: 'desc' }],
      select: {
        id: true,
        date: true,
        status: true,
        animalId: true,
        animal: { select: animalSelect },
      },
    }),
  ]);

  // ── Detect recoveries: latest Health status is Healthy, immediately preceded
  //    by an Injured/Diseased status. Anchored at the recovery update's date.
  const recoveryUpdateIds = new Set<string>();
  const recoveryEvents: ActivityEvent[] = [];
  const seenAnimal = new Set<string>();
  for (let i = 0; i < healthHistory.length; i++) {
    const u = healthHistory[i];
    if (seenAnimal.has(u.animalId)) continue; // only inspect the latest per animal
    seenAnimal.add(u.animalId);
    if (u.status !== HealthStatus.Healthy) continue;
    const prev = healthHistory[i + 1];
    if (
      prev &&
      prev.animalId === u.animalId &&
      (prev.status === HealthStatus.Injured || prev.status === HealthStatus.Diseased)
    ) {
      recoveryUpdateIds.add(u.id);
      const animalName = u.animal?.name || `#${u.animal?.tagNumber ?? ''}`;
      recoveryEvents.push({
        id: `recovery-${u.id}`,
        type: 'recovery',
        at: u.date.toISOString(),
        actorName: 'System',
        summary: `${animalName} recovered`,
        detail: 'back to healthy',
        animal: u.animal
          ? { id: u.animal.id, name: u.animal.name, tagNumber: u.animal.tagNumber, farmId: u.animal.farmId, photoUrl: u.animal.photoUrl }
          : null,
        farmName: u.animal?.farm.name ?? '',
        link: u.animal ? `/farms/${u.animal.farmId}/animals/${u.animal.id}` : null,
      });
    }
  }

  const events: ActivityEvent[] = [...recoveryEvents];

  // ── Arrivals
  for (const a of arrivals) {
    const animalName = a.name || `#${a.tagNumber}`;
    events.push({
      id: `arrival-${a.id}`,
      type: 'arrival',
      at: a.createdAt.toISOString(),
      actorName: 'System',
      summary: `${animalName} joined the herd`,
      detail: a.breed || a.animalType,
      animal: { id: a.id, name: a.name, tagNumber: a.tagNumber, farmId: a.farmId, photoUrl: a.photoUrl },
      farmName: a.farm.name,
      link: `/farms/${a.farmId}/animals/${a.id}`,
    });
  }

  for (const u of updates) {
    // Skip the auto-created initial Health update (the "arrival" event covers it)
    if (
      u.updateType === UpdateType.Health &&
      u.animal &&
      Math.abs(u.date.getTime() - u.animal.createdAt.getTime()) < 10_000
    ) {
      continue;
    }
    // Recoveries are shown as their own celebratory event, not a plain health log
    if (recoveryUpdateIds.has(u.id)) continue;

    const meta = UPDATE_TYPE_META[u.updateType] ?? {
      type: 'health' as ActivityType,
      verb: 'updated',
    };
    const actorName = u.staff?.fullName ?? 'Someone';
    const animalName = u.animal?.name || `#${u.animal?.tagNumber ?? ''}`;

    let detail: string | null = null;
    if (u.updateType === UpdateType.Weight && u.weight != null) {
      detail = `${u.weight} kg`;
    } else if (u.updateType === UpdateType.Vaccination && u.vaccineName) {
      detail = u.vaccineName;
    } else if (u.updateType === UpdateType.Health) {
      detail = u.diseaseName ?? u.status;
    } else if (u.updateType === UpdateType.Sale) {
      detail = u.buyerName ? `to ${u.buyerName}` : u.price != null ? `₹${u.price}` : null;
    }

    events.push({
      id: u.id,
      type: meta.type,
      at: u.date.toISOString(),
      actorName,
      summary: `${actorName} ${meta.verb} ${animalName}`,
      detail,
      animal: u.animal
        ? {
            id: u.animal.id,
            name: u.animal.name,
            tagNumber: u.animal.tagNumber,
            farmId: u.animal.farmId,
            photoUrl: u.animal.photoUrl,
          }
        : null,
      farmName: u.animal?.farm.name ?? '',
      link: u.animal ? `/farms/${u.animal.farmId}/animals/${u.animal.id}` : null,
    });
  }

  for (const d of deaths) {
    const animalName = d.snapshotName || `#${d.snapshotTagNumber}`;
    events.push({
      id: `death-${d.id}`,
      type: 'death',
      at: d.createdAt.toISOString(),
      actorName: 'System',
      summary: `Death reported for ${animalName}`,
      detail: null,
      animal: {
        id: d.animalId,
        name: d.snapshotName,
        tagNumber: d.snapshotTagNumber,
        farmId: d.farmId,
        photoUrl: d.snapshotPhotoUrl,
      },
      farmName: d.farm.name,
      link: `/compliance/death-cases/${d.id}`,
    });
  }

  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return events.slice(0, limit);
}
