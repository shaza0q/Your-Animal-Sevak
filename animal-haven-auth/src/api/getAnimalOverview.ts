import axios from "axios";
import { API_BASE_URL } from "../../cache";
import { AnimalOverviewResponse } from "../interface/animal-overview.interface";

export const getAnimalOverview = async (farmId: string): Promise<AnimalOverviewResponse> => {
    try {
         const res = await fetch(
            `${API_BASE_URL}/farms/${farmId}/animals/overview`,
            {
            credentials: "include",
            }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch animal overview");
        }

        return res.json();
    } catch (error: any) {
        const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch farm data";

        const customError: any = new Error(errorMessage);
        customError.status = error.response?.status;

        throw customError;
    }
};
