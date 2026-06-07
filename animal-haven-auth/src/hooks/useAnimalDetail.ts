import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAnimalDetail } from "@/api/getAnimalDetail";
import { AnimalDetail } from "@/interfaces/animal-detail.interface";

export const animalDetailKey = (farmId: string, animalId: string) =>
  ["animal-detail", farmId, animalId] as const;

export function useAnimalDetail(
  farmId: string | undefined,
  animalId: string | undefined,
) {
  return useQuery<AnimalDetail>({
    queryKey: animalDetailKey(farmId ?? "", animalId ?? ""),
    queryFn: () => getAnimalDetail(farmId!, animalId!),
    enabled: !!farmId && !!animalId,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useInvalidateAnimalDetail() {
  const queryClient = useQueryClient();
  return (farmId: string, animalId: string) =>
    queryClient.invalidateQueries({ queryKey: animalDetailKey(farmId, animalId) });
}
