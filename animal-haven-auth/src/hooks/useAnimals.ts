import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getAnimalsData, AnimalsListResponse, GetAnimalsParams } from "@/api/getAnimalsData";

export type AnimalsFilters = Omit<GetAnimalsParams, "farmId" | "page" | "limit">;

export const animalsQueryKey = (
  farmId: string,
  filters: AnimalsFilters,
  page: number,
  limit: number,
) => ["animals", farmId, filters, page, limit] as const;

export function useAnimals(
  farmId: string | undefined,
  filters: AnimalsFilters = {},
  page = 1,
  limit = 12,
) {
  return useQuery<AnimalsListResponse>({
    queryKey: animalsQueryKey(farmId ?? "", filters, page, limit),
    queryFn: () =>
      getAnimalsData({ farmId: farmId!, ...filters, page, limit }),
    enabled: !!farmId,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
