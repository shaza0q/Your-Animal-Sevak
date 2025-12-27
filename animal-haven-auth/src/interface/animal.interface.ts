// interfaces/animal.interface.ts
import { AnimalType } from '@/enums/animal-type.enum';
import { AnimalStatus } from '@/enums/animal-status.enum';
import { AnimalLifecycleStatus } from '@/enums/animal-lifecycle-status.enum';

export interface Animal {
  id: string;

  // Identification
  tagNumber: string;
  name: string;

  // Ownership
  farmId: string;

  // Classification
  animalType: AnimalType;
  breed: string;
  gender: 'Male' | 'Female';

  // Lineage
  motherId?: string;
  fatherId?: string;
  generation?: number;

  // Dates
  dateOfBirth?: string;      // ISO
  acquisitionDate?: string; // ISO

  // Snapshot (derived)
  currentStatus: AnimalStatus;
  currentWeight?: number;

  // Lifecycle
  lifecycleStatus: AnimalLifecycleStatus;

  // Metadata
  createdAt: string;
  updatedAt: string;
}
