export interface AnimalCategory {
  total: number;
  unassigned: number;
  type: string;
}

export interface AnimalOverviewResponse {
  farmId: string;
  categories: AnimalCategory[];
}
