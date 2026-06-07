import { api } from "@/lib/api";

export interface DashboardHealthSummary {
  healthy: number;
  underTreatment: number;
  critical: number;
}

export interface DashboardAnimalAlert {
  id: string;
  name: string;
  tagNumber: string;
  animalType: string;
  farmId: string;
  farmName: string;
  latestStatus: string;
  riskLevel: string;
}

export interface DashboardDeathCases {
  openCases: number;
  pendingReview: number;
  total: number;
  complianceRate: number;
}

export interface DashboardFarmStat {
  farmId: string;
  farmName: string;
  location: string | null;
  animalTypes: string[];
  totalActiveAnimals: number;
  vaccinationsDue7Days: number;
  healthScore: number;
  status: string;
}

export interface DashboardStats {
  healthSummary: DashboardHealthSummary;
  animalsNeedingAttention: DashboardAnimalAlert[];
  deathCases: DashboardDeathCases;
  addedLast30Days: number;
  farmStats: DashboardFarmStat[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await api.get<{ success: boolean; data: DashboardStats }>("/farms/dashboard");
  return res.data.data;
}
