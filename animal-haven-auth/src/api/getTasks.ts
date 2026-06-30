import { api } from "@/lib/api";

export interface VaccinationTask {
  animalId: string;
  name: string;
  tagNumber: string;
  animalType: string;
  farmId: string;
  farmName: string;
  vaccineName: string | null;
  dueDate: string;
  overdue: boolean;
}

export interface AttentionTask {
  id: string;
  name: string;
  tagNumber: string;
  animalType: string;
  farmId: string;
  farmName: string;
  latestStatus: string;
  riskLevel: string;
}

export interface DeathCaseTask {
  id: string;
  name: string;
  tagNumber: string;
  farmId: string;
  farmName: string;
  workflowStatus: string;
  createdAt: string;
}

export interface FarmTasks {
  vaccinations: VaccinationTask[];
  attention: AttentionTask[];
  deathCases: DeathCaseTask[];
  counts: { vaccinations: number; attention: number; deathCases: number; total: number };
}

export const fetchTasks = async (): Promise<FarmTasks> => {
  const res = await api.get<{ success: boolean; data: FarmTasks }>("/farms/tasks");
  return res.data.data;
};
