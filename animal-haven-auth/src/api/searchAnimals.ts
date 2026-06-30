import { api } from "@/lib/api";

export interface AnimalSearchResult {
  id: string;
  tagNumber: string;
  name: string;
  animalType: string;
  breed: string;
  gender: string;
  farmId: string;
  status: string;
  dateOfBirth: string | null;
  weight: number | null;
  photoUrl?: string | null;
  farm?: { name: string };
}

export const searchAnimals = async (
  query: string,
  filters?: {
    farmId?: string;
    animalType?: string;
    breed?: string;
    gender?: string;
    excludeAnimalIds?: string[];
  }
): Promise<AnimalSearchResult[]> => {
  const params = new URLSearchParams();
  params.append("q", query);

  if (filters?.farmId) params.append("farmId", filters.farmId);
  if (filters?.animalType) params.append("animalType", filters.animalType);
  if (filters?.breed) params.append("breed", filters.breed);
  if (filters?.gender) params.append("gender", filters.gender);
  if (filters?.excludeAnimalIds?.length) {
    params.append("excludeAnimalIds", filters.excludeAnimalIds.join(","));
  }

  const res = await api.get(`/animal/search?${params.toString()}`);
  return res.data.data;
};
