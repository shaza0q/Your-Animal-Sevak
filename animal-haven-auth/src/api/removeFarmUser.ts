import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const removeFarmUser = async (
  farmId: string,
  userId: string
) => {
  try {
    const res = await axios.delete(
      `${API_BASE_URL}/farms/${farmId}/users/${userId}`,
      { withCredentials: true }
    );

    return res.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to remove user"
    );
  }
};
