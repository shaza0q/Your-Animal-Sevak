import { api } from "@/lib/api";

export interface SellAnimalBody {
  buyerName: string;
  buyerContact?: string;
  salePrice: number;
  dateSold?: string;
  notes?: string;
  buyerEmail?: string;
  buyerAddress?: string;
}

export interface SaleRecord {
  id: string;
  animalId: string;
  farmId: string;
  buyerName: string;
  buyerContactInfo: string;
  buyerEmail: string | null;
  buyerAddress: string | null;
  price: number | null;
  dateSold: string | null;
}

export const sellAnimal = async (
  animalId: string,
  body: SellAnimalBody,
): Promise<{ success: boolean; message: string; data: SaleRecord }> => {
  const res = await api.post(`/animal/${animalId}/sell`, body);
  return res.data;
};
