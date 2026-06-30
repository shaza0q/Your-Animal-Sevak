import { api } from "@/lib/api";

export const addFarm = async (data: {
  name: string;
  location?: string;
  capacity?: string;
  animalTypes: string[];
}) => {
  const response = await api.post("/asset/addFarm", data);
  return response.data;
};
