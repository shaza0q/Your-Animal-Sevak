const mongoose = require("mongoose");
const Animal = require("../models/animal");
const AnimalAssignment = require("../models/animalAssignment");

async function getAnimalsByType({
  farmId,
  type,
  page,
  limit,
  assigned,
  gender,
  breed,
  caretakerName,
  vetName,
  status,
}) {
  
  const farmObjectId = new mongoose.Types.ObjectId(farmId);
  const skip = (page - 1) * limit;

  /* STEP 1: Base match */
  const matchStage = {
    farmId: farmObjectId,
    animalType: type,
    isDeleted: false,
  };

  if (status) {
    matchStage.status = status;
  }

  if (gender) matchStage.gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  if (breed) matchStage.breed = breed;

  /** @type {import('mongoose').PipelineStage[]} */
  const pipeline = [
    { $match: matchStage },

    /* STEP 2: Active assignments */
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
          {
            $lookup: {
              from: "newusers",
              localField: "workerId",
              foreignField: "_id",
              as: "worker",
            },
          },
          {
            $unwind: {
              path: "$worker",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: "activeAssignments",
      },
    },

    /* STEP 3: Derive caretaker & vet */
    {
      $addFields: {
        caretaker: {
          $first: {
            $filter: {
              input: "$activeAssignments",
              as: "a",
              cond: { $eq: ["$$a.role", "caretaker"] },
            },
          },
        },
        veterinarian: {
          $first: {
            $filter: {
              input: "$activeAssignments",
              as: "a",
              cond: { $eq: ["$$a.role", "veterinarian"] },
            },
          },
        },
      },
    },

    /* STEP 4: isAssigned */
    {
      $addFields: {
        isAssigned: {
          $gt: [{ $size: "$activeAssignments" }, 0],
        },
      },
    },
  ];

  /* STEP 5: Assignment-based filters */
  if (assigned === "true" || assigned === "false") {
    /** @type {import('mongoose').PipelineStage} */
    const assignedFilter = {
      $match: {
        isAssigned: assigned === "true",
      },
    };
    pipeline.push(assignedFilter);
  }

  if (caretakerName) {
    /** @type {import('mongoose').PipelineStage} */
    const caretakerFilter = {
      $match: {
        "caretaker.worker.name": {
          $regex: caretakerName,
          $options: "i",
        },
      },
    };
    pipeline.push(caretakerFilter);
  }

  if (vetName) {
    /** @type {import('mongoose').PipelineStage} */
    const vetFilter = {
      $match: {
        "veterinarian.worker.name": {
          $regex: vetName,
          $options: "i",
        },
      },
    };
    pipeline.push(vetFilter);
  }

  /* STEP 6: Shape output and pagination */
  const finalStages = [
    {
      $project: {
        _id: 1,
        id: "$_id",
        tagNumber: 1,
        name: 1,
        breed: 1,
        gender: 1,
        status: 1,
        isAssigned: 1,
        caretaker: {
          _id: "$caretaker.worker._id",
          name: "$caretaker.worker.name",
        },
        veterinarian: {
          _id: "$veterinarian.worker._id",
          name: "$veterinarian.worker.name",
        },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        animals: [{ $skip: skip }, { $limit: limit }],
        meta: [{ $count: "total" }],
      },
    },
    {
      $project: {
        animals: 1,
        meta: {
          page: { $literal: page },
          limit: { $literal: limit },
          total: {
            $ifNull: [{ $arrayElemAt: ["$meta.total", 0] }, 0],
          },
        },
      },
    }
  ];

  const completePipeline = [...pipeline, ...finalStages];

  // @ts-ignore
  const [result] = await Animal.aggregate(completePipeline);
  return result || { animals: [], meta: { page, limit, total: 0 } };
}

async function getAnimalDetail({ farmId, animalId }) {
  const farmObjectId = new mongoose.Types.ObjectId(farmId);
  const animalObjectId = new mongoose.Types.ObjectId(animalId);

  /** @type {import('mongoose').PipelineStage[]} */
  const pipeline = [
    /* STEP 1: Match animal */
    {
      $match: {
        _id: animalObjectId,
        farmId: farmObjectId,
        isDeleted: false,
      },
    },

    /* STEP 2: Active assignments */
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
          {
            $lookup: {
              from: "newusers",
              localField: "workerId",
              foreignField: "_id",
              as: "worker",
            },
          },
          {
            $unwind: {
              path: "$worker",
              preserveNullAndEmptyArrays: true,
            },
          },
        ],
        as: "activeAssignments",
      },
    },

    /* STEP 3: Derive caretaker & veterinarian */
    {
      $addFields: {
        caretaker: {
          $first: {
            $filter: {
              input: "$activeAssignments",
              as: "a",
              cond: { $eq: ["$$a.role", "caretaker"] },
            },
          },
        },
        veterinarian: {
          $first: {
            $filter: {
              input: "$activeAssignments",
              as: "a",
              cond: { $eq: ["$$a.role", "veterinarian"] },
            },
          },
        },
        age: {
          $cond: [
            { $ifNull: ["$dateOfBirth", false] },
            {
              $dateDiff: {
                startDate: "$dateOfBirth",
                endDate: "$$NOW",
                unit: "year"
              }
            },
            null
          ]
        }
      },
    },

    /* STEP 4: Flatten worker data */
    {
      $addFields: {
        caretaker: {
          $cond: [
            { $ifNull: ["$caretaker", false] },
            {
              _id: "$caretaker.worker._id",
              name: "$caretaker.worker.full_name",
              email: "$caretaker.worker.email",
            },
            null
          ]
        },
        veterinarian: {
          $cond: [
            { $ifNull: ["$veterinarian", false] },
            {
              _id: "$veterinarian.worker._id",
              name: "$veterinarian.worker.full_name",
              email: "$veterinarian.worker.email",
            },
            null
          ]
        },
      },
    },

    /* STEP 5: Shape output */
    {
      $project: {
        _id: 1,
        id: "$_id",

        name: 1,
        tagNumber: 1,
        animalType: 1,
        breed: 1,
        gender: 1,
        age: 1,
        weight: 1,
        status: 1,

        farm: {
          _id: "$farmId",
        },

        caretaker: {
          $cond: [
            { $ifNull: ["$caretaker", false] },
            {
              _id: "$caretaker._id",
              name: "$caretaker.name",
              email: "$caretaker.email",
            },
            null
          ]
        },

        veterinarian: {
          $cond: [
            { $ifNull: ["$veterinarian", false] },
            {
              _id: "$veterinarian._id",
              name: "$veterinarian.name",
              email: "$veterinarian.email",
            },
            null
          ]
        },
      },
    },
  ];

  const [animal] = await Animal.aggregate(pipeline);
  return animal || null;
}

async function getAnimalHistory({ animalId, page = 1, limit = 5 }) {
  if (!mongoose.Types.ObjectId.isValid(animalId)) {
    return {
      data: [],
      pagination: { page, limit, total: 0, hasNext: false },
    };
  }

  limit = Math.min(limit, 15);

  const animalObjectId = new mongoose.Types.ObjectId(animalId);
  const skip = (page - 1) * limit;

  const assignmentEventsPipeline = [
    { $match: { animalId: animalObjectId } },

    {
      $lookup: {
        from: "newusers", // ⚠️ verify collection name
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    {
      $project: {
        events: [
          {
            type: "ASSIGNED",
            role: "$role",
            user: { _id: "$user._id", name: "$user.name" },
            at: "$assignedAt",
          },
          {
            type: "UNASSIGNED",
            role: "$role",
            user: { _id: "$user._id", name: "$user.name" },
            at: "$unassignedAt",
          },
        ],
      },
    },

    { $unwind: "$events" },
    { $match: { "events.at": { $ne: null } } },
    { $replaceRoot: { newRoot: "$events" } },
  ];

  const animalCreatedPipeline = [
    { $match: { _id: animalObjectId } },
    {
      $project: {
        type: "CREATED",
        at: "$createdAt",
      },
    },
  ];

  const statusChangePipeline = [
    { $match: { _id: animalObjectId } },

    {
      $unwind: {
        path: "$statusHistory",
        preserveNullAndEmptyArrays: false,
      },
    },

    {
      $project: {
        type: "STATUS_CHANGED",
        status: {
          from: "$statusHistory.from",
          to: "$statusHistory.to",
          reason: "$statusHistory.reason",
        },
        at: "$statusHistory.changedAt",
      },
    },
  ];

  const healthEventsPipeline = [
    {
      $match: {
        animalId: animalObjectId,
        occurredAt: { $ne: null },
      },
    },

    {
      $lookup: {
        from: "newusers", // ⚠️ verify collection name
        localField: "recordedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        type: "HEALTH_EVENT",
        health: {
          eventType: "$type",
          description: "$description",
        },
        user: {
          _id: "$user._id",
          name: "$user.name",
        },
        at: "$occurredAt",
      },
    },
  ];

  /** @type {import('mongoose').PipelineStage[]} */
  const historyPipeline = [
    ...assignmentEventsPipeline,

    { 
      $unionWith: { 
        coll: "animals", 
        pipeline: animalCreatedPipeline 
      } 
    },
    { 
      $unionWith: { 
        coll: "animals", 
        pipeline: statusChangePipeline 
      } 
    },

    {
      $unionWith: {
        coll: "animalhealthevents",
        pipeline: healthEventsPipeline,
      },
    },

    { $sort: { at: -1 } },

    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },

    {
      $project: {
        data: 1,
        total: {
          $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
        },
      },
    },
  ];

  const result = await AnimalAssignment.aggregate(historyPipeline);
  const { data, total } = result[0] || { data: [], total: 0 };

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      hasNext: page * limit < total,
    },
  };
}


module.exports = { getAnimalsByType, getAnimalDetail, getAnimalHistory };
