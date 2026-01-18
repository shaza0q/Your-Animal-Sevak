import { AnimalType } from "@/enums/animal-type.enum";

export interface AnimalDetail {
  _id: string;
  id: string;
  tagNumber: string;
  name: string;
  animalType: AnimalType;
  breed: string;
  gender: string;
  weight?: number;
  status: string;
  age?: number | null;
  dateOfBirth?: string | null;
  farm: {
    _id: string;
  };
  caretaker: {
    _id: string;
    name: string;
    email: string;
  } | null;
  veterinarian: {
    _id: string;
    name: string;
    email: string;
  } | null;
}

// Helper functions to compute derived properties
export const getCaretakerId = (animal: AnimalDetail): string | undefined => {
  return animal.caretaker?._id;
};

export const getVeterinarianId = (animal: AnimalDetail): string | undefined => {
  return animal.veterinarian?._id;
};

export const getCaretakerName = (animal: AnimalDetail): string | undefined => {
  return animal.caretaker?.name;
};

export const getVeterinarianName = (animal: AnimalDetail): string | undefined => {
  return animal.veterinarian?.name;
};

export const getAnimalType = (animal: AnimalDetail): string => {
  return animal.animalType;
};
