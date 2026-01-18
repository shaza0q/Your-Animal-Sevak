const mongoose = require("mongoose");
const FarmUser = require("../models/farmUser");

async function searchFarmUsers({ farmId, q, roles = [], excludeUserIds = [] }) {
  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(farmId)) {
    return [];
  }

  const farmObjectId = new mongoose.Types.ObjectId(farmId);

  const matchStage = {
    farmId: farmObjectId,
  };

  if (roles.length) {
    matchStage.role = { $in: roles };
  }

  if (excludeUserIds.length) {
    // Filter out invalid ObjectIds
    const validExcludeIds = excludeUserIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    matchStage.userId = {
      $nin: validExcludeIds.map(id => new mongoose.Types.ObjectId(id)),
    };
  }

  return FarmUser.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: "newusers",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    ...(q
      ? [{
          $match: {
            $or: [
              { "user.full_name": { $regex: q, $options: "i" } },
              { "user.email": { $regex: q, $options: "i" } },
            ],
          },
        }]
      : []),

    {
      $project: {
        _id: "$user._id",
        name: "$user.full_name",
        email: "$user.email",
        role: "$role",
      },
    },

    { $limit: 10 },
  ]);
}

module.exports = {
  searchFarmUsers,
};
