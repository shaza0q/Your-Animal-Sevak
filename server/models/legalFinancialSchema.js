const { INSURANCE_STATUS } = require("@server/common/enums/insuranceStatus");
const mongoose = require("mongoose");

const legalFinancialSchema = new mongoose.Schema({
  insuranceClaimId: String,

  insuranceStatus: {
    type: String,
    enum: INSURANCE_STATUS,
    default: "pending"
  },

  estimatedLossValue: Number,
  marketValueAtDeath: Number,

  regulatoryReportRequired: Boolean,
  regulatoryReportSubmitted: Boolean,
  regulatoryReportId: String
}, { _id: false });
