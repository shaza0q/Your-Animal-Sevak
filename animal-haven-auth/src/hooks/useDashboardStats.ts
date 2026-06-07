import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, DashboardStats } from "@/api/dashboard";

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
    retry: 1,
  });
}
