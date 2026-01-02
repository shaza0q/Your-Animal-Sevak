const mongoose = require('mongoose');

const farmUserSchema = new mongoose.Schema(
  {
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "newUser",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["owner", "staff", "caretaker", "veterinarian"],
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "newUser",
      required: true,
    },

    assignedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

farmUserSchema.index({ farmId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("FarmUser", farmUserSchema)