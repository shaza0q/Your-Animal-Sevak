/**
 * Represents a Farm ↔ User assignment document.
 *
 * @typedef {Object} FarmUser
 * @property {import('mongoose').Types.ObjectId} _id
 * @property {import('mongoose').Types.ObjectId} farmId
 * @property {import('mongoose').Types.ObjectId} userId
 * @property {'owner'|'staff'|'caretaker'|'veterinarian'} role
 * @property {import('mongoose').Types.ObjectId} createdBy
 * @property {Date} assignedAt
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
