const { CAUSE_OF_DEATH } = require('../enums/causeOfDeath');
const { DISPOSAL_METHOD } = require('../enums/burialMethod');
const { DECEASED_WORKFLOW_STATUS } = require('../enums/workflowDeceasedAnimal');
const { USER_ROLES } = require('../enums/userRoles');

// Canonical workflow definition - used by both FE and BE
const DEATH_CASE_WORKFLOW = {
  // Valid status transitions
  VALID_TRANSITIONS: {
    [DECEASED_WORKFLOW_STATUS.DRAFT]: [DECEASED_WORKFLOW_STATUS.REPORTED],
    [DECEASED_WORKFLOW_STATUS.REPORTED]: [DECEASED_WORKFLOW_STATUS.VET_REQUESTED, DECEASED_WORKFLOW_STATUS.DISPOSAL_PENDING],
    [DECEASED_WORKFLOW_STATUS.VET_REQUESTED]: [DECEASED_WORKFLOW_STATUS.VET_CONFIRMED],
    [DECEASED_WORKFLOW_STATUS.VET_CONFIRMED]: [DECEASED_WORKFLOW_STATUS.DISPOSAL_PENDING],
    [DECEASED_WORKFLOW_STATUS.DISPOSAL_PENDING]: [DECEASED_WORKFLOW_STATUS.DISPOSAL_RECORDED],
    [DECEASED_WORKFLOW_STATUS.DISPOSAL_RECORDED]: [DECEASED_WORKFLOW_STATUS.REVIEW_PENDING],
    [DECEASED_WORKFLOW_STATUS.REVIEW_PENDING]: [DECEASED_WORKFLOW_STATUS.APPROVED, DECEASED_WORKFLOW_STATUS.CORRECTION_NEEDED],
    [DECEASED_WORKFLOW_STATUS.CORRECTION_NEEDED]: [DECEASED_WORKFLOW_STATUS.DISPOSAL_PENDING, DECEASED_WORKFLOW_STATUS.REPORTED, DECEASED_WORKFLOW_STATUS.REVIEW_PENDING],
    [DECEASED_WORKFLOW_STATUS.APPROVED]: [DECEASED_WORKFLOW_STATUS.ARCHIVED],
    [DECEASED_WORKFLOW_STATUS.ARCHIVED]: [],
  },

  // Role-based permissions per status
  STATUS_PERMISSIONS: {
    [DECEASED_WORKFLOW_STATUS.DRAFT]: {
      roles: [USER_ROLES.CARETAKER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
      actions: ['update_event'],
    },
    [DECEASED_WORKFLOW_STATUS.REPORTED]: {
      roles: [USER_ROLES.CARETAKER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
      actions: ['update_event', 'request_vet'],
    },
    [DECEASED_WORKFLOW_STATUS.VET_REQUESTED]: {
      roles: [USER_ROLES.VETERINARIAN, USER_ROLES.ADMIN],
      actions: ['confirm_vet'],
    },
    [DECEASED_WORKFLOW_STATUS.VET_CONFIRMED]: {
      roles: [USER_ROLES.CARETAKER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
      actions: ['record_disposal'],
    },
    [DECEASED_WORKFLOW_STATUS.DISPOSAL_PENDING]: {
      roles: [USER_ROLES.CARETAKER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
      actions: ['record_disposal'],
    },
    [DECEASED_WORKFLOW_STATUS.DISPOSAL_RECORDED]: {
      roles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN],
      actions: ['review'],
    },
    [DECEASED_WORKFLOW_STATUS.REVIEW_PENDING]: {
      roles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN],
      actions: ['review'],
    },
    [DECEASED_WORKFLOW_STATUS.CORRECTION_NEEDED]: {
      roles: [USER_ROLES.CARETAKER, USER_ROLES.MANAGER, USER_ROLES.ADMIN],
      actions: ['update_event', 'record_disposal'],
    },
    [DECEASED_WORKFLOW_STATUS.APPROVED]: {
      roles: [USER_ROLES.MANAGER, USER_ROLES.ADMIN],
      actions: ['archive'],
    },
    [DECEASED_WORKFLOW_STATUS.ARCHIVED]: {
      roles: [USER_ROLES.ADMIN],
      actions: ['read'],
    },
  },

  // Required fields per section
  REQUIRED_FIELDS: {
    event: ['dateOfDeath', 'causeOfDeath', 'placeOfDeath'],
    vet: ['confirmedCauseOfDeath', 'vetName'],
    disposal: ['disposalMethod', 'disposalDate'],
  },

  // Auto-transition rules (what happens after certain actions)
  AUTO_TRANSITIONS: {
    [DECEASED_WORKFLOW_STATUS.VET_CONFIRMED]: DECEASED_WORKFLOW_STATUS.DISPOSAL_PENDING,
    [DECEASED_WORKFLOW_STATUS.DISPOSAL_RECORDED]: DECEASED_WORKFLOW_STATUS.REVIEW_PENDING,
  },

  // Default values
  DEFAULTS: {
    causeOfDeath: CAUSE_OF_DEATH.UNKNOWN,
    tags: ['investigation_pending'],
  },
};

// Helper functions
const WorkflowHelper = {
  // Validate if transition is allowed
  canTransition(fromStatus, toStatus) {
    const allowed = DEATH_CASE_WORKFLOW.VALID_TRANSITIONS[fromStatus];
    return allowed && allowed.includes(toStatus);
  },

  // Check if user can perform action in current status
  canPerformAction(status, action, userRole) {
    const permissions = DEATH_CASE_WORKFLOW.STATUS_PERMISSIONS[status];
    if (!permissions) return false;
    
    return permissions.roles.includes(userRole) && 
           permissions.actions.includes(action);
  },

  // Get next status after auto-transition
  getAutoTransition(status) {
    return DEATH_CASE_WORKFLOW.AUTO_TRANSITIONS[status];
  },

  // Validate cause of death against enum
  isValidCauseOfDeath(cause) {
    return Object.values(CAUSE_OF_DEATH).includes(cause);
  },

  // Validate disposal method against enum
  isValidDisposalMethod(method) {
    return Object.values(DISPOSAL_METHOD).includes(method);
  },

  // Get required fields for a section
  getRequiredFields(section) {
    return DEATH_CASE_WORKFLOW.REQUIRED_FIELDS[section] || [];
  },
};

module.exports = {
  DEATH_CASE_WORKFLOW,
  WorkflowHelper,
};