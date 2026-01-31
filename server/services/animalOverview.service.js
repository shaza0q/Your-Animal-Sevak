const mongoose = require("mongoose");
const Animal = require("../models/animal");

async function getAnimalOverviewByFarm(farmId, state) {
  const farmObjectId = new mongoose.Types.ObjectId(farmId);

  // First, let's check what animals exist for this farm
  const allAnimals = await Animal.find({ farmId: farmObjectId, isDeleted: false });
  console.log('----------Backend: All animals for farm:', allAnimals.length, allAnimals.map(a => ({ _id: a._id, animalType: a.animalType, status: a.status })));

  // Normalize state to match database format (capitalize first letter)
  const normalizedState = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
  console.log('----------Backend: Normalized state:', normalizedState);

  const categories = await Animal.aggregate(
    [
      {
        $match: {
          farmId: farmObjectId,
          status: normalizedState, // Use normalized state
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "animalassignments",
          let: { animalId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$animalId", "$$animalId"] },
                    { $eq: ["$unassignedAt", null] },
                  ],
                },
              },
            },
          ],
          as: "activeAssignments",
        },
      },
      {
        $addFields: {
          isUnassigned: {
            $eq: [{ $size: "$activeAssignments" }, 0],
          },
        },
      },
      {
        $group: {
          _id: "$animalType",
          total: { $sum: 1 },
          unassigned: {
            $sum: { $cond: ["$isUnassigned", 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: "$_id",
          total: 1,
          unassigned: 1,
        },
      },
    ],
    { allowDiskUse: true }
  );

  console.log('----------Backend: Aggregated categories:', categories);

  const result = {
    farmId,
    categories,
  };
  
  console.log('----------Backend: Final result:', result);
  return result;
}

module.exports = {
  getAnimalOverviewByFarm

};
