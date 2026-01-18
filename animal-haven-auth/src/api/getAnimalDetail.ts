import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const getAnimalDetail = async (farmId: string, animalId: string): Promise<any> => {
    try {
         const res = await axios.get(
            `${API_BASE_URL}/farms/${farmId}/animals/${animalId}`,
            {
                withCredentials: true,
            }
        );

        if (!res.data) {
            throw new Error("Failed to fetch animal detail");
        }

        console.log("---------api getAnimalDetail Animal detail fetch success", res.data);
        return res.data;
    } catch (error: any) {
        const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch animal detail";

        const customError: any = new Error(errorMessage);
        customError.status = error.response?.status;

        throw customError;
    }
};
