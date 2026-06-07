import { api } from "@/lib/api";
import { AnimalDetail } from "@/interfaces/animal-detail.interface";

export const getAnimalDetail = async (
  farmId: string,
  animalId: string,
): Promise<AnimalDetail> => {
  const res = await api.get<AnimalDetail>(`/farms/${farmId}/animals/${animalId}`);
  return res.data;
};
