// ====================
// MAIN SCHEMA
// ====================
const mongoose = require("mongoose");
const { deceasedAnimalSnapshotSchema } = require("./deceasedAnimalSnapshotSchema");
const { deathRecordSchema } = require("./deathRecordWrapper");
const { medicalContextSchema } = require("./medicalRecordContextSchema");
const { auditMetadataSchema } = require("./auditMetadataSchema");
const { DECEASED_WORKFLOW_STATUS } = require("@server/common/enums/workflowDeceasedAnimal");

const deceasedAnimalRecordSchema = new mongoose.Schema({
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal",
    required: true,
    index: true
  },

  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
    index: true
  },

  // ✅ Optimistic Locking
  recordVersion: { type: Number, default: 1, index: true },

  snapshot: {
    type: deceasedAnimalSnapshotSchema,
    required: true
  },

  locationAtDeath: String,
  ageAtDeath: String,
  ageInMonths: Number,
  weightAtDeath: Number,
  bodyConditionScore: Number,

  deathRecord: {
    type: deathRecordSchema,
    required: true
  },

  // In your DeceasedAnimalRecord schema, add:
  workflowStatus: {
    type: String,
    enum: DECEASED_WORKFLOW_STATUS,
    default: 'reported'
  },

  medicalContext: medicalContextSchema,

  auditMetadata: {
    type: auditMetadataSchema,
    required: true
  },

  daysSinceDeath: Number,
  seasonOfDeath: String,

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }    
});

// ====================
// VIRTUALS (UI Convenience)
// ====================
/**
 * @typedef {Object} DeceasedAnimalSnapshot
 * @property {string} name
 * @property {string} tagNumber
 * @property {string} type
 * @property {string} breed
 * @property {string} farmName
 */

/**
 * @typedef {Object} DeathEvent
 * @property {string} causeOfDeath
 * @property {Date} dateOfDeath
 */

/**
 * @typedef {Object} DeathHandling
 * @property {boolean} necropsyPerformed
 */

/**
 * @typedef {Object} DeathRecord
 * @property {DeathEvent} event
 * @property {DeathHandling} handling
 */

/**
 * @typedef {Object} DisplayFields
 * @property {string} name
 * @property {string} tagNumber
 * @property {string} type
 * @property {string} breed
 * @property {string} causeOfDeath
 * @property {Date} dateOfDeath
 * @property {string} ageAtDeath
 * @property {string} locationAtDeath
 * @property {boolean} necropsyPerformed
 * @property {string} farmName
 */

/** @type {DisplayFields} */
deceasedAnimalRecordSchema.virtual("displayFields").get(function() {
  return {
    name: this.snapshot.name,
    tagNumber: this.snapshot.tagNumber,
    type: this.snapshot.type,
    breed: this.snapshot.breed,
    causeOfDeath: this.deathRecord?.event?.causeOfDeath,
    dateOfDeath: this.deathRecord?.event?.dateOfDeath,
    ageAtDeath: this.ageAtDeath,
    locationAtDeath: this.locationAtDeath,
    necropsyPerformed: this.deathRecord?.handling?.necropsyPerformed || false,
    farmName: this.snapshot.farmName
  };
});

// ====================
// PRE-SAVE HOOKS
// ====================
deceasedAnimalRecordSchema.pre("save", function(next) {
  // Calculate derived fields at write-time only
  if (this.deathRecord?.event?.dateOfDeath) {
    // Days since death (only if not already set)
    if (!this.daysSinceDeath) {
      const deathDate = this.deathRecord.event.dateOfDeath;
      const days = Math.floor((new Date() - deathDate) / (1000 * 60 * 60 * 24));
      this.daysSinceDeath = days;
    }
    
    // Season of death (only if not already set)
    if (!this.seasonOfDeath) {
      const month = new Date(this.deathRecord.event.dateOfDeath).getMonth();
      this.seasonOfDeath = getSeasonFromMonth(month);
    }
  }
  
  next();
});

function getSeasonFromMonth(month) {
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

// ====================
// VALIDATION HOOKS (Business Rules)
// ====================
deceasedAnimalRecordSchema.pre("validate", function(next) {
  // Rule 1: Disposal method requires disposal date
  if (this.deathRecord?.handling?.disposalMethod && !this.deathRecord.handling.disposalDate) {
    return next(new Error("Disposal date is required when disposal method is specified"));
  }
  
  // Rule 2: Necropsy performed requires findings or report
  if (this.deathRecord?.handling?.necropsyPerformed === true) {
    const hasFindings = this.deathRecord.handling.necropsyFindings || 
                       this.deathRecord.handling.necropsyReportLink;
    if (!hasFindings) {
      return next(new Error("Necropsy findings or report link is required when necropsy is performed"));
    }
  }
  
  next();
});

// ====================
// UPDATE GUARDS (Immutable by Design)
// ====================
deceasedAnimalRecordSchema.pre("findOneAndUpdate", function(next) {
  const operation = this.getUpdate();
  const allowedPaths = [
    "auditMetadata.corrections",
    "auditMetadata.approvalStatus",
    "auditMetadata.reviewedBy",
    "auditMetadata.reviewedAt",
    "auditMetadata.complianceChecklist",
    "recordVersion"
  ];
  
  // Check if update touches anything outside allowed paths
  if (operation.$set) {
    const updatePaths = Object.keys(operation.$set);
    const hasIllegalUpdate = updatePaths.some(path => 
      !allowedPaths.some(allowed => path.startsWith(allowed))
    );
    
    if (hasIllegalUpdate) {
      return next(new Error(
        "Direct updates to deceased records are not allowed. " +
        "Use correction workflow for: auditMetadata.corrections, approvalStatus, reviewedBy/At, complianceChecklist"
      ));
    }
  }
  
  next();
});

// ====================
// INDEXES (Query Performance)
// ====================
// Unique constraint: One death record per animal
deceasedAnimalRecordSchema.index({ animalId: 1 }, { unique: true });

// Primary query patterns
deceasedAnimalRecordSchema.index({ farmId: 1, "deathRecord.event.dateOfDeath": -1 });
deceasedAnimalRecordSchema.index({ "snapshot.type": 1 });
deceasedAnimalRecordSchema.index({ "deathRecord.event.causeOfDeath": 1 });
deceasedAnimalRecordSchema.index({ "deathRecord.handling.necropsyPerformed": 1 });

// Compound indexes for common queries
deceasedAnimalRecordSchema.index({ 
  farmId: 1, 
  "deathRecord.event.dateOfDeath": -1,
  "snapshot.type": 1 
});

deceasedAnimalRecordSchema.index({ 
  farmId: 1, 
  ageInMonths: 1 
});

deceasedAnimalRecordSchema.index({ 
  farmId: 1, 
  "auditMetadata.approvalStatus": 1 
});

// ====================
// STATIC METHODS (Business Logic)
// ====================
deceasedAnimalRecordSchema.statics.findForTable = function(filters = {}) {
  const {
    farmId,
    startDate,
    endDate,
    causeOfDeath,
    type,
    limit = 50,
    skip = 0
  } = filters;
  
  const match = {};
  if (farmId) match.farmId = new mongoose.Types.ObjectId(farmId);
  if (startDate || endDate) {
    match["deathRecord.event.dateOfDeath"] = {};
    if (startDate) match["deathRecord.event.dateOfDeath"].$gte = new Date(startDate);
    if (endDate) match["deathRecord.event.dateOfDeath"].$lte = new Date(endDate);
  }
  if (causeOfDeath) match["deathRecord.event.causeOfDeath"] = causeOfDeath;
  if (type) match["snapshot.type"] = type;
  
  return this.aggregate([
    { $match: match },
    { $sort: { "deathRecord.event.dateOfDeath": -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        animalId: 1,
        farmId: 1,
        tagNumber: "$snapshot.tagNumber",
        name: "$snapshot.name",
        type: "$snapshot.type",
        breed: "$snapshot.breed",
        dateOfDeath: "$deathRecord.event.dateOfDeath",
        causeOfDeath: "$deathRecord.event.causeOfDeath",
        placeOfDeath: "$deathRecord.event.placeOfDeath",
        ageAtDeath: 1,
        locationAtDeath: 1,
        necropsyPerformed: "$deathRecord.handling.necropsyPerformed",
        disposalMethod: "$deathRecord.handling.disposalMethod",
        farmName: "$snapshot.farmName",
        reportedById: "$deathRecord.event.reportedById",
        createdAt: 1,
        daysSinceDeath: 1
      }
    }
  ]);
};

deceasedAnimalRecordSchema.statics.getMortalityStats = function(farmId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        farmId: new mongoose.Types.ObjectId(farmId),
        "deathRecord.event.dateOfDeath": {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: {
          type: "$snapshot.type",
          cause: "$deathRecord.event.causeOfDeath",
          month: { $month: "$deathRecord.event.dateOfDeath" }
        },
        count: { $sum: 1 },
        avgAge: { $avg: "$ageInMonths" }
      }
    }
  ]);
};

// ====================
// EXPORT
// ====================
module.exports = mongoose.model(
  "DeceasedAnimalRecord",
  deceasedAnimalRecordSchema
);
