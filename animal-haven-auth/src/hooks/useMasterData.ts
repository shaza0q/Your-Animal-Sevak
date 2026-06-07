import { useQuery } from "@tanstack/react-query";
import { fetchVaccines, fetchDiseases, VaccineMaster, DiseaseMaster } from "@/api/animalUpdate";

export function useMasterData() {
  const vaccinesQuery = useQuery<VaccineMaster[]>({
    queryKey: ["master", "vaccines"],
    queryFn: fetchVaccines,
    staleTime: Infinity,
  });

  const diseasesQuery = useQuery<DiseaseMaster[]>({
    queryKey: ["master", "diseases"],
    queryFn: fetchDiseases,
    staleTime: Infinity,
  });

  return {
    vaccines: vaccinesQuery.data ?? [],
    diseases: diseasesQuery.data ?? [],
    isLoading: vaccinesQuery.isLoading || diseasesQuery.isLoading,
  };
}
