// interfaces/create-animal-update.interface.ts
import { AnimalUpdateType } from '@/enums/animal-update-type.enum';
import { AnimalStatus } from '@/enums/animal-status.enum';

export interface CreateAnimalUpdatePayload {
  animalId: string;
  date: string;

  updateType: AnimalUpdateType;

  // Status only allowed for some update types
  status?: AnimalStatus;

  weight?: number;
  diseaseName?: string;
  riskLevel?: string;
  vaccineName?: string;
  nextVaccineDate?: string;
  maleAnimalId?: string;
  expectedDeliveryDate?: string;

  price?: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerContact?: string;
  buyerAddress?: string;

  notes?: string;
  mediaFile?: File;
}
