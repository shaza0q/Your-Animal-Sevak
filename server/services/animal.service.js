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

/**
 * @param {Object} params
 * @param {string} params.animalId
 * @param {number} [params.page=1]
 * @param {number} [params.limit=5]
 *
 * @returns {Promise<import("../types/dtos/animal-history.dto").AnimalHistoryResponseDto>}
 */
async function getAnimalHistory({ animalId, page = 1, limit = 5 }) {
  if (!mongoose.Types.ObjectId.isValid(animalId)) {
    return {
      data: [],
      pagination: { page, limit, total: 0, hasNext: false },
    };
  }

  limit = Math.min(limit, 20);
  const animalObjectId = new mongoose.Types.ObjectId(animalId);
  const skip = (page - 1) * limit;

  /* -------------------- ASSIGNMENT EVENTS -------------------- */
  const assignmentPipeline = [
    {
      $match: {
        animalId: animalObjectId,
        workerId: { $ne: null },
        role: { $ne: null },
      },
    },

    // Subject (assigned person)
    {
      $lookup: {
        from: "newusers",
        localField: "workerId",
        foreignField: "_id",
        as: "workerUser",
      },
    },
    {
      $unwind: {
        path: "$workerUser",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Actor (assigned by)
    {
      $lookup: {
        from: "newusers",
        localField: "assignedBy",
        foreignField: "_id",
        as: "assignedByUser",
      },
    },
    {
      $unwind: {
        path: "$assignedByUser",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Actor (unassigned by)
    {
      $lookup: {
        from: "newusers",
        localField: "unassignedBy",
        foreignField: "_id",
        as: "unassignedByUser",
      },
    },
    {
      $unwind: {
        path: "$unassignedByUser",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        events: [
          {
            _id: "$_id",
            type: "ASSIGNED",
            role: "$role",
            user: {
              _id: "$workerUser._id",
              name: { $ifNull: ["$workerUser.full_name", "Unknown"] },
            },
            createdBy: {
              _id: "$assignedByUser._id",
              name: { $ifNull: ["$assignedByUser.full_name", "Unknown"] },
            },
            at: "$assignedAt",
          },
          {
            _id: {
              $concat: ["UNASSIGNED_", { $toString: "$_id" }],
            },
            type: "UNASSIGNED",
            role: "$role",
            user: {
              _id: "$workerUser._id",
              name: { $ifNull: ["$workerUser.full_name", "Unknown"] },
            },
            createdBy: {
              _id: "$unassignedByUser._id",
              name: { $ifNull: ["$unassignedByUser.full_name", "Unknown"] },
            },
            at: "$unassignedAt",
          },
        ],
      },
    },

    { $unwind: "$events" },
    { $match: { "events.at": { $ne: null } } },
    { $replaceRoot: { newRoot: "$events" } },
  ];

  /* -------------------- ANIMAL CREATED -------------------- */
  const createdPipeline = [
    { $match: { _id: animalObjectId } },
    {
      $project: {
        _id: { $concat: ["CREATED_", { $toString: "$_id" }] },
        type: "CREATED",
        at: "$createdAt",
        createdBy: {
          _id: null,
          name: "System",
        },
        animalId: "$_id",
      },
    },
  ];

  /* -------------------- ANIMAL UPDATES -------------------- */
  const updatePipeline = [
    { $match: { animalId: animalObjectId } },

    {
      $lookup: {
        from: "newusers",
        localField: "staffId",
        foreignField: "_id",
        as: "staffUser",
      },
    },
    {
      $unwind: {
        path: "$staffUser",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $project: {
        _id: "$_id",
        at: "$date",
        createdBy: {
          _id: "$staffUser._id",
          name: { $ifNull: ["$staffUser.full_name", "Unknown"] },
        },
        type: {
          $switch: {
            branches: [
              { case: { $eq: ["$updateType", "Weight"] }, then: "WEIGHT_UPDATED" },
              { case: { $eq: ["$updateType", "Vaccination"] }, then: "VACCINATION_ADDED" },
              { case: { $eq: ["$updateType", "Health"] }, then: "HEALTH_EVENT" },
            ],
            default: "HEALTH_EVENT",
          },
        },
        weight: {
          previous: "$previousWeight",
          current: "$weight",
          unit: "kg",
        },
        health: {
          eventType: "$updateType",
          description: "$notes",
          severity: "$riskLevel",
          diseaseName: "$diseaseName",
          vaccineName: "$vaccineName",
        },
      },
    },
  ];

  /* -------------------- FINAL UNION -------------------- */
  const historyPipeline = [];
  
  // Add assignment pipeline stages
  for (const stage of assignmentPipeline) {
    historyPipeline.push(stage);
  }
  
  // Add union with animals
  historyPipeline.push({
    $unionWith: {
      coll: "animals",
      pipeline: createdPipeline,
    }
  });
  
  // Add union with animalupdates
  historyPipeline.push({
    $unionWith: {
      coll: "animalupdates",
      pipeline: updatePipeline,
    }
  });

  // Add sort
  historyPipeline.push({ $sort: { at: -1 } });

  // Add facet
  historyPipeline.push({
    $facet: {
      data: [{ $skip: skip }, { $limit: limit }],
      totalCount: [{ $count: "count" }],
    }
  });

  // Add final projection
  historyPipeline.push({
    $project: {
      data: 1,
      total: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] },
    }
  });

  // @ts-ignore
  const result = await AnimalAssignment.aggregate(historyPipeline);
  const { data = [], total = 0 } = result[0] || {};

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      hasNext: skip + limit < total,
    },
  };
}


module.exports = { getAnimalsByType, getAnimalDetail, getAnimalHistory };
