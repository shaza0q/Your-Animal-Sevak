const mongoose = require("mongoose");
const { correctionEntrySchema } = require("./correctionEntrySchema");

const auditMetadataSchema = new mongoose.Schema({
  recordCreatedBy: String,
  recordCreatedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  recordCreatedAt: { type: Date, default: Date.now },

  corrections: [correctionEntrySchema],

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

module.exports = mongoose.model("AuditMetadata", auditMetadataSchema);
