class DeathCaseNotFoundException extends Error {
  constructor(id) {
    super(`Death case with ID ${id} not found`);
    this.name = 'DeathCaseNotFoundException';
    this.statusCode = 404; // ✅ ADD THIS
  }
}

class InvalidWorkflowTransitionException extends Error {
  constructor(currentStatus, attemptedStatus) {
    super(`Cannot transition from ${currentStatus} to ${attemptedStatus}`);
    this.name = 'InvalidWorkflowTransitionException';
    this.statusCode = 400; // ✅ ADD THIS
  }
}

class UnauthorizedWorkflowActionException extends Error {
  constructor(role, action) {
    super(`Role ${role} is not authorized to perform ${action}`);
    this.name = 'UnauthorizedWorkflowActionException';
    this.statusCode = 403; // ✅ ADD THIS (CRITICAL)
  }
}

class ImmutableRecordException extends Error {
  constructor(caseId) {
    super(`Death case ${caseId} is approved and cannot be modified`);
    this.name = 'ImmutableRecordException';
    this.statusCode = 400; // ✅ ADD THIS
  }
}

class InvalidSectionException extends Error {
  constructor(section, reason) {
    super(`Invalid ${section} section: ${reason}`);
    this.name = 'InvalidSectionException';
    this.statusCode = 400; // ✅ ADD THIS
  }
}

module.exports = {
  DeathCaseNotFoundException,
  InvalidWorkflowTransitionException,
  UnauthorizedWorkflowActionException,
  ImmutableRecordException,
  InvalidSectionException,
};