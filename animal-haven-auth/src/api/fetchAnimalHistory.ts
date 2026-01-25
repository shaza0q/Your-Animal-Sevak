import { AnimalHistoryEvent } from "@/types/animal-history";
import axios from "axios";
import { API_BASE_URL } from "../../cache";

interface FetchAnimalHistoryResponse {
  data: AnimalHistoryEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export async function fetchAnimalHistory(
  animalId: string,
  params: { page?: number; limit?: number } = {},
): Promise<FetchAnimalHistoryResponse> {
  try {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));

    const res =  await axios.get<FetchAnimalHistoryResponse>(
      `${API_BASE_URL}/animal/${animalId}/history?${searchParams.toString()}`,
      { withCredentials: true }
    );

    if (!res.data) {
      throw new Error("Failed to fetch animal history");
    }

    console.log("------------animal history api", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching animal history:", error);
    throw error;
  }
}
