const mongoose = require("mongoose");

const animalAssignmentSchema = new mongoose.Schema({
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal",
    required: true,
  },

  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  role: {
    type: String,
    enum: ['caretaker', 'veterinarian'],
    default: null,
  },

  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true,
  },

  assignedAt: {
    type: Date,
    default: Date.now,
  },

  unassignedAt: {
    type: Date,
    default: null, // ✅ IMPORTANT: null = active
  },

  // 👇 WHO performed the action
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  unassignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  assignmentSource: {
    type: String,
    enum: ["system", "manual", "import"],
    default: "manual",
  },

  notes: {
    type: String,
    default: "",
  },
}, { timestamps: true });

/* Indexes */
animalAssignmentSchema.index({ animalId: 1, unassignedAt: 1 });
animalAssignmentSchema.index({ workerId: 1, unassignedAt: 1 });
animalAssignmentSchema.index({ farmId: 1, unassignedAt: 1 });
animalAssignmentSchema.index(
  { animalId: 1, workerId: 1 },
  {
    unique: true,
    partialFilterExpression: { unassignedAt: null }
  }
);

module.exports = mongoose.model("AnimalAssignment", animalAssignmentSchema);