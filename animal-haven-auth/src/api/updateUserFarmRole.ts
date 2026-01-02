// src/api/updateFarmUserRole.ts
import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const updateFarmUserRole = async (
  farmId: string,
  userId: string,
  role: string
) => {
  try {
    const res = await axios.patch(
      `${API_BASE_URL}/farms/${farmId}/users/${userId}/role`,
      { role },
      { withCredentials: true }
    );

    return res.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update role";

    throw new Error(message);
  }
};
