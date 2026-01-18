import { getFarmData } from "@/api/getFarmData";

export const fetchFarm = async (farmId: string) => {
    try {
      const farm = await getFarmData(farmId);
      return farm;
    } catch (err) {
      console.error("Farm fetch failed", err);
      throw err;
    }
};