import { useQuery } from "@tanstack/react-query";
import { fetchTasks, FarmTasks } from "@/api/getTasks";

export const tasksKey = ["farm-tasks"] as const;

export function useTasks() {
  return useQuery<FarmTasks>({
    queryKey: tasksKey,
    queryFn: fetchTasks,
    staleTime: 60_000,
    retry: 1,
  });
}
