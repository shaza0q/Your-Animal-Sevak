/**
 * Represents an Animal document stored in MongoDB.
 *
 * @typedef {Object} Animal
 * @property {import('mongoose').Types.ObjectId} _id
 *
 * @property {string} tagNumber - Unique identifier/tag for the animal
 * @property {string} name - Given name of the animal
 *
 * @property {import('mongoose').Types.ObjectId} farmId - Reference to Farm
 *
 * @property {'Cow'|'Buffalo'|'Goat'|'Sheep'|'Chicken'|'Duck'|'Rabbit'|'Dog'|'Cat'|'Camel'|'Donkey'|'Horse'|'Pigeon'|'Turkey'|'other'} animalType
 *
 * @property {string} breed
 *
 * @property {'Male'|'Female'} gender
 *
 * @property {import('mongoose').Types.ObjectId | undefined} motherId
 * @property {import('mongoose').Types.ObjectId | undefined} fatherId
 *
 * @property {number} generation
 * @property {number | undefined} weight
 *
 * @property {Date | undefined} dateOfBirth
 * @property {Date | undefined} acquisitionDate
 *
 * @property {'Active'|'Sold'|'Deceased'} status
 *
 * @property {import('mongoose').Types.ObjectId[]} caretakers - Users assigned to this animal
 *
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {}
