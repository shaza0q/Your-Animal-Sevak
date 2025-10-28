const mongoose = require("mongoose");

const healthSchema = new mongoose.Schema({
  animal: { type: mongoose.Schema.Types.ObjectId, ref: "Animal", required: true },
  vaccinationStatus: { 
    type: String, 
    enum: ["Up to date", "Due", "Not started"], 
    default: "Not started" 
  },
  lastVetCheckupDate: { type: [Date] },
  healthNotes: { type: String },
  pregnancyStatus: { type: String, enum: ["Yes", "No", "N/A"], default: "N/A" },
  numberOfOffspring: { type: Number, default: 0 },
  feedType: { type: String },
  wateringSchedule: { type: String },
  vaccinationCertificate: { type: [String] }, // File URL (PDF or image)
}, { timestamps: true });

module.exports = mongoose.model("Health", healthSchema);
