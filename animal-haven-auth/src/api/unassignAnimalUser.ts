import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const unassignAnimalUser = async (
  animalId: string,
  userId: string,
  role: string
) => {
    try{

      console.log("Unassigning animal user:", animalId, userId, role);
        const res = await axios.post(
          `${API_BASE_URL}/animals/${animalId}/assignments/${userId}/unassign`,
          { role }, // Pass role in request body
          { withCredentials: true }
        );
        
        return res.data;
    }
    catch(error){
        console.log("Error unassigning animal user:", error);
        throw error;
    }
};
