const mongoose = require("mongoose");

const animalAssignmentSchema = new mongoose.Schema({
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Animal",
    required: true,
  },

  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "newUser",
    default: null,
  },

  role: {
    type: String,
    enum: ['owner', 'staff', 'caretaker', 'veterinarian'],
    default: null,
  },
  
  farmId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Farm", 
    required: true },
  
  assignedAt: { 
    type: Date, 
    default: Date.now,
  },
  // null => active assignment
    // date => assignment ended
    unassignedAt: {
      type: Date,
      default: Date.now, // default = unassigned
    },

    // optional but VERY useful
    assignmentSource: {
      type: String,
      enum: ["system", "manual", "import"],
      default: "system",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // gives createdAt + updatedAt
);

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