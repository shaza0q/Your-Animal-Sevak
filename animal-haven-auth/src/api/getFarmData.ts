import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const getFarmData = async (farmId: string): Promise<FarmSummaryDto> => {
    try {
        const res = await axios.get(
            `${API_BASE_URL}/farms/${farmId}`,
            { withCredentials: true }
        );

        return res.data.data;
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
