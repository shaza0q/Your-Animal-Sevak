const mongoose = require("mongoose");

const animalUpdateSchema = new mongoose.Schema({
    animalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Animal",
    },
    
    date: {
        type: Date,
        default: Date.now,
    },

    weight: { type: Number },

    notes: { type: String },

    mediaUrl: { type: String },

    staffId: { 
        type: ObjectId, 
        ref: 'newUser',
        required: true,
    },

    status: {
        type: String,
        enum: ['Healthy', "Injured", "Diseased", "Pregnant", "Vaccined", "Sold", "FeedUpdate"],
        default: "Healthy"
    },

    vaccineName: {
        type: String,
    },

    diseaseName: {
        type: String,
    },

}, { timestamps: true })


animalUpdateSchema.index({ animalId: 1, date: -1 }); // fast lookup for updates per animal (recent first)
animalUpdateSchema.index({ animalId: 1, status: 1 }); // for filtering by status within animal
animalUpdateSchema.index({ status: 1, date: -1 }); // for dashboards (e.g. "recent diseased animals")
animalUpdateSchema.index({ vaccineName: 1 }); // for vaccine reports
animalUpdateSchema.index({ diseaseName: 1 }); // for disease trend reports
animalUpdateSchema.index({ feedType: 1 }); // for feed insights
animalUpdateSchema.index({ staffId: 1, date: -1 }); // for tracking staff activities


module.exports = mongoose.model('AnimalUpdate', animalUpdateSchema)