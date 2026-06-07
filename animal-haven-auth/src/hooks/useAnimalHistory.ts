import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAnimalHistory } from "@/api/fetchAnimalHistory";

export const animalHistoryKey = (animalId: string, page: number, limit: number) =>
  ["animal-history", animalId, page, limit] as const;

export function useAnimalHistory(
  animalId: string | undefined,
  params: { page?: number; limit?: number } = {},
) {
  const { page = 1, limit = 5 } = params;

  return useQuery({
    queryKey: animalHistoryKey(animalId ?? "", page, limit),
    queryFn: () => fetchAnimalHistory(animalId!, { page, limit }),
    enabled: !!animalId,
    staleTime: 30_000,
  });
}

export function useInvalidateAnimalHistory() {
  const queryClient = useQueryClient();
  return (animalId: string) =>
    queryClient.invalidateQueries({ queryKey: ["animal-history", animalId] });
}
