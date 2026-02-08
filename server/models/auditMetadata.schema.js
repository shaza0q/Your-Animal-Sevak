const mongoose = require("mongoose");
const { correctionEntrySchema } = require("./correctionEntry.schema");

// Add activity log schema for workflow tracking (NOT corrections)
const activityLogEntrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  action: String, // 'case_created', 'vet_confirmed', 'disposal_recorded', etc.
  section: String, // 'event', 'vet', 'disposal', 'review'
  changes: [{
    field: String,
    from: mongoose.Schema.Types.Mixed,
    to: mongoose.Schema.Types.Mixed,
    note: String
  }],
  comments: String
}, { _id: false });

const auditMetadataSchema = new mongoose.Schema({
  recordCreatedBy: String,
  recordCreatedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recordCreatedAt: { type: Date, default: Date.now },

  corrections: [correctionEntrySchema], // ONLY for manager-requested corrections
  
  activityLog: [activityLogEntrySchema], // NEW: For workflow audit trail

  reviewedBy: String,
  reviewedAt: Date,

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "requires_correction"],
    default: "pending"
  },

  approvalNotes: String,

  attachments: [{
    name: String,
    type: String,
    url: String,
    uploadedAt: Date,
    uploadedBy: String
  }],

  complianceChecklist: [{
    label: String,
    required: Boolean,
    completed: Boolean,
    completedAt: Date,
    completedBy: String,
    notes: String
  }]
}, { _id: false });

// Export the schemas
module.exports = {
  auditMetadataSchema,
  activityLogEntrySchema
};
