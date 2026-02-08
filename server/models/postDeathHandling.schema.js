const { DISPOSAL_METHOD } = require("@server/common/enums/burialMethod");
const mongoose = require("mongoose");

const postDeathHandlingSchema = new mongoose.Schema({
  necropsyPerformed: { type: Boolean, default: false },
  necropsyReportLink: String,
  necropsyFindings: String,

  labSamplesTaken: [String],

  disposalMethod: {
    type: String,
    enum: DISPOSAL_METHOD
  },

  disposalDate: Date,
  disposalLocation: String,
  disposalCompany: String,
  disposalCost: Number,
  disposalCertificateId: String
}, { _id: false });

module.exports = {
  postDeathHandlingSchema
}
