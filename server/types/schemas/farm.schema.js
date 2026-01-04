/**
 * @typedef {Object} Farm
 * @property {import('mongoose').Types.ObjectId} _id
 * @property {import('mongoose').Types.ObjectId} owner
 * @property {string} name
 * @property {string[]} animalTypes
 * @property {string=} location
 * @property {number=} capacity
 * @property {'active'|'inactive'|'archived'} status
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
