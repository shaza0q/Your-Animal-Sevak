import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const fetchAnimalAbstractData = async (animalId: string) => {
  try {
    const res = await axios.get(
      `${API_BASE_URL}/animal/abstract/${animalId}`,
      { withCredentials: true }
    );
      
    // console.log('----- fetchAnimalAbstractData success:', res.data);
    return res.data.data;
  } catch (error) {
    console.log('Error fetching animal abstract data:', error);
    throw error;
  }
};
