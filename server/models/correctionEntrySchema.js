const mongoose = require("mongoose");

const correctionEntrySchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  reason: String,

  changes: [{
    field: String,
    from: mongoose.Schema.Types.Mixed,
    to: mongoose.Schema.Types.Mixed,
    note: String
  }],

  correctionApprovedBy: String,
  correctionApprovedAt: Date
}, { _id: false });
