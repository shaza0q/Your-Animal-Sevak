import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const getFarmUsers = async (farmId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/farms/${farmId}/users`,
      { withCredentials: true }
    );

    return response.data.data; // return only users array
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to fetch farm users";

    const customError: any = new Error(errorMessage);
    customError.status = error.response?.status;

    throw customError;
  }
};
