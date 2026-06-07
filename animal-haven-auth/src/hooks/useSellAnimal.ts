import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { sellAnimal, SellAnimalBody } from "@/api/sale";
import { animalDetailKey } from "@/hooks/useAnimalDetail";
import { getErrorMessage } from "@/lib/errorUtils";

export function useSellAnimal(farmId: string, animalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SellAnimalBody) => sellAnimal(animalId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animalDetailKey(farmId, animalId) });
      queryClient.invalidateQueries({ queryKey: ["animals", farmId] });
      queryClient.invalidateQueries({ queryKey: ["animal-history", animalId] });
    },
    onError: (error) => {
      toast.error("Failed to record sale", {
        description: getErrorMessage(error),
      });
    },
  });
}
