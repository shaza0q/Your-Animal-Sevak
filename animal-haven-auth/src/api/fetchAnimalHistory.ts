import { api } from "@/lib/api";
import { AnimalHistoryEvent } from "@/types/animal-history";

export interface FetchAnimalHistoryResponse {
  data: AnimalHistoryEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function fetchAnimalHistory(
  animalId: string,
  params: { page?: number; limit?: number } = {},
): Promise<FetchAnimalHistoryResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));

  const res = await api.get<FetchAnimalHistoryResponse>(
    `/animal/${animalId}/history?${query.toString()}`,
  );
  return res.data;
}
