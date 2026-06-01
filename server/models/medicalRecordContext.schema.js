const mongoose = require("mongoose");

const medicalContextSchema = new mongoose.Schema({
  lastVetVisitDate: Date,
  lastVetVisitReason: String,
  attendingVetId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  activeTreatments: [{
    treatment: String,
    startDate: Date,
    administeringVet: String
  }],

  activeMedications: [{
    name: String,
    dosage: String,
    startDate: Date
  }],

  knownConditions: [{
    name: String,
    diagnosedDate: Date,
    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"]
    }
  }],

  vaccinationStatus: String,
  lastVaccinationDate: Date,

  lastProductionValue: Number,
  lastProductionDate: Date,
  productionUnit: String
}, { _id: false });

module.exports = {
  medicalContextSchema
}