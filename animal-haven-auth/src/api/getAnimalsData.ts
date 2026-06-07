import { api } from "@/lib/api";

export interface AnimalListItem {
  id: string;
  tagNumber: string;
  name: string;
  animalType: string;
  breed: string;
  gender: string;
  status: "Active" | "Sold" | "Deceased";
  dateOfBirth: string | null;
  weight: number | null;
  isAssigned: boolean;
  updatesCount: number;
  caretaker: { id: string; name: string } | null;
  veterinarian: { id: string; name: string } | null;
}

export interface AnimalsListResponse {
  data: AnimalListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetAnimalsParams {
  farmId: string;
  animalType?: string;
  status?: string;
  gender?: string;
  breed?: string;
  search?: string;
  assigned?: string;
  caretakerName?: string;
  vetName?: string;
  page?: number;
  limit?: number;
}

export const getAnimalsData = async (
  params: GetAnimalsParams,
): Promise<AnimalsListResponse> => {
  const query = new URLSearchParams();

  if (params.animalType) query.append("type", params.animalType);
  if (params.status) query.append("status", params.status);
  if (params.gender) query.append("gender", params.gender);
  if (params.breed) query.append("breed", params.breed);
  if (params.search) query.append("search", params.search);
  if (params.assigned) query.append("assigned", params.assigned);
  if (params.caretakerName) query.append("caretakerName", params.caretakerName);
  if (params.vetName) query.append("vetName", params.vetName);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));

  const res = await api.get<AnimalsListResponse>(
    `/farms/${params.farmId}/animals?${query.toString()}`,
  );
  return res.data;
};
