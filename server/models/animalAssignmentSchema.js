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
    required: true,
  },
  
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: "Farm", required: true },
  assignedAt: { type: Date, default: Date.now },
  unassignedAt: Date,
});
