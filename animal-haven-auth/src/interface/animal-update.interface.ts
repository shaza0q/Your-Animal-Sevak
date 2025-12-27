// interfaces/animal-update.interface.ts
import { AnimalStatus } from '@/enums/animal-status.enum';
import { AnimalUpdateType } from '@/enums/animal-update-type.enum';
import { RiskLevel } from '@/enums/risk-level.enum';

export interface AnimalUpdate {
  id: string;

  animalId: string;
  date: string; // ISO

  updateType: AnimalUpdateType;
  status: AnimalStatus;

  // Health
  diseaseName?: string;
  riskLevel?: RiskLevel;

  // Weight
  weight?: number;

  // Vaccination
  vaccineName?: string;
  nextVaccineDate?: string;

  // Breeding
  maleAnimalId?: string;
  expectedDeliveryDate?: string;

  // Sale
  price?: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerContact?: string;
  buyerAddress?: string;

  // Common
  notes?: string;
  mediaUrl?: string;

  updatedBy: string;

  createdAt: string;
  updatedAt: string;
}
