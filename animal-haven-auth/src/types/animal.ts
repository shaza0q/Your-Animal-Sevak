export interface Animal {
  id: string;
  name: string;
  type: string;
  breed: string;
  gender: "male" | "female";
  age: string;
  status: "healthy" | "injured" | "diseased" | "pregnant" | "vaccined" | "sold" | "deceased";
  tagNumber: string;
  weight?: string;
  lastCheckup?: string;
  farmId: string;
  farmName?: string;
  caretaker?: { id: string; name: string } | null;
  veterinarian?: { id: string; name: string } | null;
}

export interface AnimalUpdate {
  id: string;
  animalId: string;
  type: "health" | "weight" | "vaccination" | "breeding" | "sale";
  status?: string;
  notes: string;
  updatedBy: string;
  updatedByName: string;
  date: string;
}

export interface AnimalCategory {
  type: string;
  icon: string;
  total: number;
  unassigned: number;
}

export interface FarmUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "staff" | "caretaker" | "veterinarian";
}
