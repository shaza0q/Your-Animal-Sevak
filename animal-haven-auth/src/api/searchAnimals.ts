import axios from "axios";
import { API_BASE_URL } from "../../cache";

export const searchAnimals = async (
  query: string,
  filters?: {
    animalType?: string;
    breed?: string;
    gender?: string;
    excludeAnimalIds?: string[];
  }
) => {
  try {
    const params = new URLSearchParams();
    params.append("q", query);
    
    if (filters?.animalType) {
      params.append("animalType", filters.animalType);
    }
    
    if (filters?.breed) {
      params.append("breed", filters.breed);
    }
    
    if (filters?.gender) {
      params.append("gender", filters.gender);
    }
    
    if (filters?.excludeAnimalIds && filters.excludeAnimalIds.length > 0) {
      params.append("excludeAnimalIds", filters.excludeAnimalIds.join(","));
    }

    console.log('------search query', query);
    console.log('------search filters', filters);
      
    const res = await axios.get(
      `${API_BASE_URL}/animal/search?${params.toString()}`,
      { withCredentials: true }
    );
      
    return res.data.data;
  } catch (error) {
    console.log('Error searching animals:', error);
    throw error;
  }
};
