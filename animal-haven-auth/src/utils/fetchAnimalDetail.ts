import { getAnimalDetail } from "@/api/getAnimalDetail";

export const fetchAnimalDetail = async (farmId: string, animalId: string) => {
    try {
        const animal = await getAnimalDetail(farmId, animalId);

        console.log("----------------utils Animal detail fetched successfully", animal);
        return animal;
    } catch (err) {
        console.error("Animal detail fetch failed", err);
        throw err;
    }
}