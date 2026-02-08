const mongoose = require("mongoose");
const { deathEventSchema } = require("./deathEvent.schema");
const { postDeathHandlingSchema } = require("./postDeathHandling.schema");
const { legalFinancialSchema } = require("./legalFinancial.schema");

const deathRecordSchema = new mongoose.Schema({
  event: { type: deathEventSchema, required: true },
  handling: postDeathHandlingSchema,
  legal: legalFinancialSchema,

  tags: [String],
  notes: String
}, { _id: false });

module.exports = {
  deathRecordSchema
}