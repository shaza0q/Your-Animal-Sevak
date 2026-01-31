const mongoose = require("mongoose");
const { deathEventSchema } = require("./deathEventSchema");
const { postDeathHandlingSchema } = require("./postDeathHandlingSchema");
const { legalFinancialSchema } = require("./legalFinancialSchema");

const deathRecordSchema = new mongoose.Schema({
  event: { type: deathEventSchema, required: true },
  handling: postDeathHandlingSchema,
  legal: legalFinancialSchema,

  tags: [String],
  notes: String
}, { _id: false });

module.exports = mongoose.model("DeathRecord", deathRecordSchema);