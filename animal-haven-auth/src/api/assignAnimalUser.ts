import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const assignAnimalUser = async (
  animalId: string,
  workerId: string,
  role: "caretaker" | "veterinarian"
) => {
    try{
        const res = await axios.post(
          `${API_BASE_URL}/animals/${animalId}/assignments`,
          { workerId, role },
          { withCredentials: true }
        );

        return res.data;
    }
    catch(error){
        console.error("Error assigning animal user:", error);
        throw error;
    }
};
