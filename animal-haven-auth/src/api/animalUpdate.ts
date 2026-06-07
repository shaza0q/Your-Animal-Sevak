import { api } from "@/lib/api";

// ─── Master data ──────────────────────────────────────────────────────────────

export interface VaccineMaster {
  id: string;
  vaccineName: string;
  animalType: string;
}

export interface DiseaseMaster {
  id: string;
  diseaseName: string;
  animalType: string;
}

export const fetchVaccines = async (): Promise<VaccineMaster[]> => {
  const res = await api.get<VaccineMaster[]>("/master/getVaccineData");
  return res.data;
};

export const fetchDiseases = async (): Promise<DiseaseMaster[]> => {
  const res = await api.get<DiseaseMaster[]>("/master/getDiseaseData");
  return res.data;
};

// ─── Create update ────────────────────────────────────────────────────────────

export type UpdateEventType = "Health" | "Weight" | "Vaccination" | "Breeding" | "Sale";
export type HealthStatusValue = "Healthy" | "Injured" | "Diseased" | "Pregnant" | "Dead";
export type RiskLevelValue = "Low" | "Moderate" | "High";

export interface CreateAnimalUpdateBody {
  animalId: string;
  updateType: UpdateEventType;
  date?: string;
  // Health
  status?: HealthStatusValue;
  riskLevel?: RiskLevelValue;
  diseaseName?: string;
  // Weight
  weight?: number;
  // Vaccination
  vaccineName?: string;
  nextVaccineDate?: string;
  // Breeding
  maleAnimalId?: string;
  expectedDeliveryDate?: string;
  // Shared
  notes?: string;
  // Sale
  price?: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerContact?: string;
  buyerAddress?: string;
}

export const createAnimalUpdate = async (
  body: CreateAnimalUpdateBody,
): Promise<{ message: string; data: unknown }> => {
  const res = await api.post("/animal/updateAnimalData", body);
  return res.data;
};

// ─── Search animals (for breeding partner lookup) ─────────────────────────────

export const searchAnimalByTag = async (
  tag: string,
  farmId: string,
): Promise<{ id: string; tagNumber: string; name: string } | null> => {
  if (!tag.trim()) return null;
  const res = await api.get<{ data: Array<{ id: string; tagNumber: string; name: string }> }>(
    `/animal/search?q=${encodeURIComponent(tag)}&farmId=${farmId}`,
  );
  return res.data.data?.[0] ?? null;
};
