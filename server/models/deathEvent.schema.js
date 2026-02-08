const { CAUSE_OF_DEATH } = require("@server/common/enums/causeOfDeath");
const { PLACE_OF_DEATH } = require("@server/common/enums/placeOfDeath");
const mongoose = require("mongoose");

const deathEventSchema = new mongoose.Schema({
  dateOfDeath: { type: Date, required: true },
  timeOfDeath: String,

  causeOfDeath: {
    type: String,
    enum: CAUSE_OF_DEATH,
    required: true
  },

  causeDetails: String,

  placeOfDeath: {
    type: String,
    enum: PLACE_OF_DEATH,
    required: true
  },

  reportedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  confirmedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  confirmedAt: Date
}, { _id: false });

module.exports = {
  deathEventSchema
}