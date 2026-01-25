/**
 * @typedef {"CREATED" |
 *           "ASSIGNED" |
 *           "UNASSIGNED" |
 *           "STATUS_CHANGED" |
 *           "HEALTH_EVENT"} AnimalHistoryEventType
 */

/**
 * @typedef {"caretaker" | "veterinarian"} AnimalAssignmentRole
 */

/**
 * @typedef {Object} HistoryUserDto
 * @property {string} _id
 * @property {string} name
 */

/**
 * @typedef {Object} StatusChangeDto
 * @property {string} from
 * @property {string} to
 * @property {string} [reason]
 */

/**
 * @typedef {Object} HealthEventDto
 * @property {string} eventType
 * @property {string} description
 */

/**
 * @typedef {Object} AnimalHistoryEventDto
 * @property {AnimalHistoryEventType} type
 * @property {Date} at
 *
 * @property {AnimalAssignmentRole} [role]
 * @property {HistoryUserDto} [user]
 * @property {StatusChangeDto} [status]
 * @property {HealthEventDto} [health]
 */

/**
 * @typedef {Object} PaginationDto
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {boolean} hasNext
 */

/**
 * @typedef {Object} AnimalHistoryResponseDto
 * @property {AnimalHistoryEventDto[]} data
 * @property {PaginationDto} pagination
 */

module.exports = {};
