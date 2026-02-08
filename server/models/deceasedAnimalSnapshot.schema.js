const mongoose = require("mongoose");

const deceasedAnimalSnapshotSchema = new mongoose.Schema({
  tagNumber: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: String,
  gender: String,
  dateOfBirth: Date,
  photoUrl: String,

  farmName: { type: String, required: true },
  ownerName: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "newUser" },

  lastKnownWeight: Number,
  lastKnownLocation: String,
  reproductiveStatus: String
}, { _id: false });

module.exports = { deceasedAnimalSnapshotSchema };