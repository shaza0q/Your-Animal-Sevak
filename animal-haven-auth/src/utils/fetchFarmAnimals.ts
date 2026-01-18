import { getAnimalsData } from "@/api/getAnimalsData";
import { AnimalType } from "@/enums/animal-type.enum";

export const fetchFarmAnimals = async (
    farmId: string,
    animalType: AnimalType,
    page?: number,
    limit?: number,
    assigned?: boolean,
    gender?: string,
    breed?: string,
    caretakerName?: string,
    vetName?: string,
) => {
    try {
      const farm = await getAnimalsData({
        farmId, 
        animalType, 
        page, 
        limit,
        assigned,
        gender,
        breed,
        caretakerName,
        vetName
      });
      
      return farm;
    } catch (err) {
      console.error("Farm animal fetch failed", err);
      throw err;
    }
};