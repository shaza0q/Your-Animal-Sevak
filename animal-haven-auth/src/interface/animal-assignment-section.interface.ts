import { AnimalDetail } from "@/interfaces/animal-detail.interface";

export interface FarmUser {
  _id: string;
  name: string;
  email: string;
  role: "Caretaker" | "Veterinarian" | "Staff";
  assignedDate?: string;
}

export interface AnimalAssignmentSectionProps {
  animal: AnimalDetail;
  farmId: string;
  userId: string;
}

export interface Assignment {
  _id: string;
  role: "caretaker" | "veterinarian";
  assignedAt: string;
  worker: {
    _id: string;
    name: string;
    email: string;
  };
}
