import { useQuery } from "@tanstack/react-query";
import { fetchRecentActivity, ActivityEvent } from "@/api/getRecentActivity";

export const recentActivityKey = ["recent-activity"] as const;

export function useRecentActivity(limit = 12) {
  return useQuery<ActivityEvent[]>({
    queryKey: [...recentActivityKey, limit],
    queryFn: () => fetchRecentActivity(limit),
    staleTime: 60_000,
    retry: 1,
  });
}
