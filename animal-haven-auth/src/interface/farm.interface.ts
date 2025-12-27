// interfaces/farm.interface.ts
export interface Farm {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  animalTypes: string[];

  ownerId: string;

  createdAt: string;
  updatedAt: string;
}
