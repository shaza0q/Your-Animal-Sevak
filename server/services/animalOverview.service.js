const mongoose = require("mongoose");
const Animal = require("../models/animal");

async function getAnimalOverviewByFarm(farmId) {
  const farmObjectId = new mongoose.Types.ObjectId(farmId);

  const categories = await Animal.aggregate(
    [
      {
        $match: {
          farmId: farmObjectId,
          status: "Active",
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

  return {
    farmId,
    categories,
  };
}

module.exports = {
  getAnimalOverviewByFarm,
};
