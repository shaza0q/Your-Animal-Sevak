import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const searchUsers = async ({
  query,
  farmId,
}: {
  query: string;
  farmId: string;
}) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/search`,
      {
        params: { query, farmId },
        withCredentials: true,
      }
    );

    return response.data.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to search users";

    throw new Error(message);
  }
};
