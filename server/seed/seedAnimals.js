const mongoose = require("mongoose");
const Animal = require('../models/animal')
const AnimalAssignment = require("../models/animalAssignment");

const FARM_ID = new mongoose.Types.ObjectId("6958075f21f294db2214fba0");

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/animal-management-system");

  console.log("Connected to DB");

  const animalsData = [
    {
      tagNumber: "COW-001",
      name: "Ganga",
      animalType: "Cow",
      breed: "Gir",
      gender: "Female",
      weight: 420,
    },
    {
      tagNumber: "COW-002",
      name: "Yamuna",
      animalType: "Cow",
      breed: "Sahiwal",
      gender: "Female",
      weight: 400,
    },
    {
      tagNumber: "COW-003",
      name: "Krishna",
      animalType: "Cow",
      breed: "Hariana",
      gender: "Male",
      weight: 450,
    },
    {
      tagNumber: "COW-004",
      name: "Radha",
      animalType: "Cow",
      breed: "Gir",
      gender: "Female",
      weight: 410,
    },
    {
      tagNumber: "GOAT-001",
      name: "Chikki",
      animalType: "Goat",
      breed: "Boer",
      gender: "Female",
      weight: 35,
    },
    {
      tagNumber: "GOAT-002",
      name: "Moti",
      animalType: "Goat",
      breed: "Jamunapari",
      gender: "Male",
      weight: 40,
    },
    {
      tagNumber: "BUF-001",
      name: "Kali",
      animalType: "Buffalo",
      breed: "Murrah",
      gender: "Female",
      weight: 520,
    },
    {
      tagNumber: "SHEEP-001",
      name: "Snow",
      animalType: "Sheep",
      breed: "Merino",
      gender: "Female",
      weight: 55,
    },
  ];

  for (const data of animalsData) {
    const animal = await Animal.create({
      ...data,
      farmId: FARM_ID,
      status: "Active",
      acquisitionDate: new Date(),
    });

    await AnimalAssignment.create({
      animalId: animal._id,
      farmId: FARM_ID,
      workerId: null,
      role: null,
      unassignedAt: new Date(), // explicitly unassigned
      assignmentSource: "system",
      notes: "Initial system entry",
    });

    console.log(`Created animal ${animal.tagNumber}`);
  }

  console.log("Seeding complete");
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
