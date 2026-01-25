const mongoose = require("mongoose");
const AnimalAssignment = require("../models/animalAssignment");
const FarmUsers = require("../models/farmUser");

const now = () => new Date();

/**
 * Get active assignments for an animal
 */
async function getActiveAssignments(animalId) {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(animalId)) {
    return [];
  }

  const animalObjectId = new mongoose.Types.ObjectId(animalId);

  return AnimalAssignment.aggregate([
    {
      $match: {
        animalId: animalObjectId,
        unassignedAt: null,
      },
    },
    {
      $lookup: {
        from: "newusers",
        localField: "workerId",
        foreignField: "_id",
        as: "worker",
      },
    },
    { $unwind: "$worker" },
    {
      $lookup: {
        from: "newusers",
        localField: "assignedBy",
        foreignField: "_id",
        as: "assignedByUser",
      },
    },
    {
      $lookup: {
        from: "newusers",
        localField: "unassignedBy",
        foreignField: "_id",
        as: "unassignedByUser",
      },
    },
    {
      $project: {
        _id: 1,
        role: 1,
        assignedAt: 1,
        assignedBy: 1,
        unassignedBy: 1,
        worker: {
          _id: "$worker._id",
          name: "$worker.full_name",
          email: "$worker.email",
        },
        assignedByUser: {
          $arrayElemAt: ["$assignedByUser", 0]
        },
        unassignedByUser: {
          $arrayElemAt: ["$unassignedByUser", 0]
        },
      },
    },
    {
      $addFields: {
        assignedByUser: {
          $cond: [
            "$assignedByUser",
            {
              _id: "$assignedByUser._id",
              name: "$assignedByUser.full_name",
              email: "$assignedByUser.email",
            },
            null
          ]
        },
        unassignedByUser: {
          $cond: [
            "$unassignedByUser",
            {
              _id: "$unassignedByUser._id",
              name: "$unassignedByUser.full_name",
              email: "$unassignedByUser.email",
            },
            null
          ]
        }
      }
    }
  ]);
}

/**
 * Assign caretaker or veterinarian to animal
 * - Closes existing active assignment of same role
 * - Creates new assignment
 */
async function assignUserToAnimal({ animalId, workerId, role, assignedBy }) {
  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(animalId) || !mongoose.Types.ObjectId.isValid(workerId)) {
    throw new Error('Invalid animalId or workerId');
  }

  const animalObjectId = new mongoose.Types.ObjectId(animalId);
  const workerObjectId = new mongoose.Types.ObjectId(workerId);

  // Get the animal to find its farmId
  const Animal = require('../models/animal');
  const animal = await Animal.findById(animalId);
  if (!animal) {
    throw new Error('Animal not found');
  }

  // Close existing assignment of same role
  await AnimalAssignment.updateMany(
    {
      animalId: animalObjectId,
      role,
      unassignedAt: null,
    },
    {
      $set: { unassignedAt: now() },
    }
  );

  // Create new assignment with assignedBy tracking
  return AnimalAssignment.create({
    animalId: animalObjectId,
    workerId: workerObjectId,
    role,
    farmId: animal.farmId, // Add farmId from animal
    assignedAt: now(),
    unassignedAt: null,
    assignedBy: assignedBy || null, // Track who made the assignment
  });
}

/**
 * Unassign a specific assignment (soft close) using domain identity
 */
async function unassignAnimalUser({animalId, userId, role, unassignedBy }) {
  // Validate ObjectIds
  if (!mongoose.Types.ObjectId.isValid(animalId) || 
      !mongoose.Types.ObjectId.isValid(userId)) {
    return null;
  }

  const animalObjectId = new mongoose.Types.ObjectId(animalId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  console.log('----------unassigning:', { animalId, userId, role, unassignedBy });

  const result = await AnimalAssignment.findOneAndUpdate(
    {
      animalId: animalObjectId,
      workerId: userObjectId,
      role: role,
      unassignedAt: null, // Only active assignments
    },
    {
      $set: { 
        unassignedAt: now(),
        unassignedBy: unassignedBy || null // Track who made the unassignment
      },
    },
    { new: true }
  );

  console.log('-------unassign result:', result);
  return result;
}

module.exports = {
  getActiveAssignments,
  assignUserToAnimal,
  unassignAnimalUser,
};
