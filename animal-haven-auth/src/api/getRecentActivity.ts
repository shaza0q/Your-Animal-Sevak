import { api } from "@/lib/api";

export type ActivityType =
  | "health"
  | "weight"
  | "vaccination"
  | "breeding"
  | "sale"
  | "death"
  | "arrival"
  | "recovery";

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
  link: string | null;
}

export const fetchRecentActivity = async (limit = 12): Promise<ActivityEvent[]> => {
  const res = await api.get<{ success: boolean; data: ActivityEvent[] }>(
    `/farms/activity?limit=${limit}`,
  );
  return res.data.data;
};
