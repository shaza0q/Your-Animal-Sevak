import { Animal, AnimalUpdate, FarmUser } from "@/types/animal";

export const mockAnimals: Animal[] = [
  {
    id: "animal1",
    name: "Bessie",
    type: "Cow",
    breed: "Holstein",
    gender: "female",
    age: "3 years",
    status: "healthy",
    tagNumber: "SV-001",
    weight: "650 kg",
    lastCheckup: "2025-10-15",
    farmId: "farm1",
    farmName: "Sunshine Valley Farm",
    caretakerId: "user2",
    caretakerName: "John Smith"
  },
  {
    id: "animal2",
    name: "Daisy",
    type: "Cow",
    breed: "Jersey",
    gender: "female",
    age: "2 years",
    status: "pregnant",
    tagNumber: "SV-002",
    weight: "480 kg",
    lastCheckup: "2025-10-20",
    farmId: "farm1",
    farmName: "Sunshine Valley Farm"
  },
  {
    id: "animal3",
    name: "Max",
    type: "Bull",
    breed: "Angus",
    gender: "male",
    age: "4 years",
    status: "healthy",
    tagNumber: "SV-003",
    weight: "900 kg",
    lastCheckup: "2025-10-10",
    farmId: "farm1",
    farmName: "Sunshine Valley Farm",
    caretakerId: "user2",
    caretakerName: "John Smith",
    veterinarianId: "user4",
    veterinarianName: "Dr. Sarah Wilson"
  },
  {
    id: "animal4",
    name: "Rosie",
    type: "Cow",
    breed: "Holstein",
    gender: "female",
    age: "5 years",
    status: "vaccined",
    tagNumber: "SV-004",
    weight: "700 kg",
    lastCheckup: "2025-10-25",
    farmId: "farm1",
    farmName: "Sunshine Valley Farm",
    caretakerId: "user3",
    caretakerName: "Emma Johnson"
  },
  {
    id: "animal5",
    name: "Billy",
    type: "Goat",
    breed: "Boer",
    gender: "male",
    age: "1 year",
    status: "healthy",
    tagNumber: "SV-005",
    weight: "45 kg",
    lastCheckup: "2025-10-22",
    farmId: "farm1",
    farmName: "Sunshine Valley Farm"
  },
  {
    id: "animal6",
    name: "Nanny",
    type: "Goat",
    breed: "Nubian",
    gender: "female",
    age: "2 years",
    status: "pregnant",
    tagNumber: "SV-006",
    weight: "55 kg",
    lastCheckup: "2025-10-20",
    farmId: "farm1",
    farmName: "Sunshine Valley Farm",
    caretakerId: "user2",
    caretakerName: "John Smith"
  },
  {
    id: "animal7",
    name: "Woolly",
    type: "Sheep",
    breed: "Merino",
    gender: "female",
    age: "3 years",
    status: "healthy",
    tagNumber: "SV-007",
    weight: "70 kg",
    lastCheckup: "2025-10-18",
    farmId: "farm1",
    farmName: "Sunshine Valley Farm"
  },
  {
    id: "animal8",
    name: "Luna",
    type: "Cow",
    breed: "Holstein",
    gender: "female",
    age: "5 years",
    status: "vaccined",
    tagNumber: "GM-001",
    weight: "720 kg",
    lastCheckup: "2025-10-18",
    farmId: "farm2",
    farmName: "Green Meadows Farm",
    caretakerId: "user5",
    caretakerName: "Mike Brown"
  },
  {
    id: "animal9",
    name: "Charlie",
    type: "Calf",
    breed: "Jersey",
    gender: "male",
    age: "6 months",
    status: "healthy",
    tagNumber: "GM-002",
    weight: "180 kg",
    lastCheckup: "2025-10-23",
    farmId: "farm2",
    farmName: "Green Meadows Farm"
  }
];

export const mockAnimalUpdates: AnimalUpdate[] = [
  {
    id: "update1",
    animalId: "animal1",
    type: "health",
    status: "healthy",
    notes: "Regular health checkup completed. All vitals normal.",
    updatedBy: "user4",
    updatedByName: "Dr. Sarah Wilson",
    date: "2025-10-15"
  },
  {
    id: "update2",
    animalId: "animal1",
    type: "weight",
    notes: "Weight recorded at 650 kg. Healthy weight for age.",
    updatedBy: "user2",
    updatedByName: "John Smith",
    date: "2025-10-10"
  },
  {
    id: "update3",
    animalId: "animal1",
    type: "vaccination",
    notes: "Annual vaccination administered - FMD vaccine.",
    updatedBy: "user4",
    updatedByName: "Dr. Sarah Wilson",
    date: "2025-09-20"
  },
  {
    id: "update4",
    animalId: "animal2",
    type: "breeding",
    status: "pregnant",
    notes: "Confirmed pregnant. Expected delivery in 6 months.",
    updatedBy: "user4",
    updatedByName: "Dr. Sarah Wilson",
    date: "2025-10-20"
  }
];

export const mockFarmUsers: Record<string, FarmUser[]> = {
  farm1: [
    { id: "user1", name: "Farm Owner", email: "owner@farm.com", role: "owner" },
    { id: "user2", name: "John Smith", email: "john@farm.com", role: "caretaker" },
    { id: "user3", name: "Emma Johnson", email: "emma@farm.com", role: "caretaker" },
    { id: "user4", name: "Dr. Sarah Wilson", email: "sarah@vet.com", role: "veterinarian" }
  ],
  farm2: [
    { id: "user1", name: "Farm Owner", email: "owner@farm.com", role: "owner" },
    { id: "user5", name: "Mike Brown", email: "mike@farm.com", role: "caretaker" }
  ]
};

export const mockFarms: Record<string, { id: string; name: string }> = {
  farm1: { id: "farm1", name: "Sunshine Valley Farm" },
  farm2: { id: "farm2", name: "Green Meadows Farm" }
};

export const getAnimalsByFarm = (farmId: string): Animal[] => {
  return mockAnimals.filter(a => a.farmId === farmId);
};

export const getAnimalsByType = (farmId: string, type: string): Animal[] => {
  return mockAnimals.filter(a => a.farmId === farmId && a.type.toLowerCase() === type.toLowerCase());
};

export const getAnimalById = (animalId: string): Animal | undefined => {
  return mockAnimals.find(a => a.id === animalId);
};

export const getAnimalUpdates = (animalId: string): AnimalUpdate[] => {
  return mockAnimalUpdates.filter(u => u.animalId === animalId);
};

export const getFarmUsers = (farmId: string): FarmUser[] => {
  return mockFarmUsers[farmId] || [];
};

export const getAnimalCategories = (farmId: string): { type: string; total: number; unassigned: number }[] => {
  const animals = getAnimalsByFarm(farmId);
  const categories: Record<string, { total: number; unassigned: number }> = {};
  
  animals.forEach(animal => {
    if (!categories[animal.type]) {
      categories[animal.type] = { total: 0, unassigned: 0 };
    }
    categories[animal.type].total++;
    if (!animal.caretakerId) {
      categories[animal.type].unassigned++;
    }
  });
  
  return Object.entries(categories).map(([type, data]) => ({
    type,
    ...data
  }));
};
