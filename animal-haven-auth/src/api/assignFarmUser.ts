import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const assignFarmUser = async (
  farmId: string,
  userId: string,
  role: "Staff" | "Caretaker" | "Veterinarian"
) => {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/farms/${farmId}/users`,
      { userId, role },
      { withCredentials: true }
    );

    return res.data.data; // return created FarmUser
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to assign user"
    );
  }
};
