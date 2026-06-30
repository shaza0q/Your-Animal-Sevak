export interface AnimalLineageNode {
  id: string;
  tagNumber: string;
  animalType: string;
  breed: string;
  gender?: string;
  status: string;
  dateOfBirth?: string | null;
}

export interface AnimalDetail {
  id: string;
  tagNumber: string;
  name: string;
  animalType: string;
  breed: string;
  gender: string;
  generation?: number;
  weight?: number | null;
  photoUrl?: string | null;
  status: string;
  age?: number | null;
  dateOfBirth?: string | null;
  acquisitionDate?: string | null;
  motherId?: string | null;
  fatherId?: string | null;
  farm: {
    id: string;
    name: string;
  };
  mother?: AnimalLineageNode | null;
  father?: AnimalLineageNode | null;
  children?: AnimalLineageNode[];
  caretaker: {
    id: string;
    name: string;
    email: string;
  } | null;
  veterinarian: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export const getCaretakerId = (animal: AnimalDetail): string | undefined =>
  animal.caretaker?.id;

export const getVeterinarianId = (animal: AnimalDetail): string | undefined =>
  animal.veterinarian?.id;

export const getCaretakerName = (animal: AnimalDetail): string | undefined =>
  animal.caretaker?.name;

export const getVeterinarianName = (animal: AnimalDetail): string | undefined =>
  animal.veterinarian?.name;

export const getAnimalType = (animal: AnimalDetail): string => animal.animalType;
