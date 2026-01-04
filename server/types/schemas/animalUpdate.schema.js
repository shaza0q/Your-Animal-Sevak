/**
 * Represents a single update/event logged for an animal.
 * This is an immutable, event-driven record.
 *
 * @typedef {Object} AnimalUpdate
 *
 * @property {import('mongoose').Types.ObjectId} _id
 *
 * @property {import('mongoose').Types.ObjectId} animalId - Reference to Animal
 *
 * @property {Date} date - Date when the update was recorded
 *
 * @property {number | undefined} weight - Recorded weight (Weight updates)
 *
 * @property {string | undefined} notes - Free-form notes
 *
 * @property {string | undefined} mediaUrl - Image/video evidence
 *
 * @property {import('mongoose').Types.ObjectId} staffId - User who logged the update
 *
 * @property {'Health'|'Weight'|'Vaccination'|'Breeding'|'Sale'} updateType
 *
 * @property {'Healthy'|'Injured'|'Diseased'|'Pregnant'|'Sold'|'Dead'} status
 *
 * @property {'Low'|'Moderate'|'High'} riskLevel
 *
 * @property {string | undefined} vaccineName
 * @property {Date | undefined} nextVaccineDate
 *
 * @property {string | undefined} diseaseName
 *
 * @property {import('mongoose').Types.ObjectId | undefined} maleAnimalId
 * @property {Date | undefined} expectedDeliveryDate
 *
 * @property {number | undefined} price
 * @property {string | undefined} buyerName
 * @property {string | undefined} buyerEmail
 * @property {number | undefined} buyerContact
 * @property {string | undefined} buyerAddress
 *
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
