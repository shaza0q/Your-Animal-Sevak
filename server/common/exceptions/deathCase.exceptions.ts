export class DeathCaseNotFoundException extends Error {
  statusCode = 404;
  constructor(id: string) {
    super(`Death case with ID ${id} not found`);
    this.name = 'DeathCaseNotFoundException';
  }
}

export class InvalidWorkflowTransitionException extends Error {
  statusCode = 400;
  constructor(currentStatus: string, attemptedStatus: string) {
    super(`Cannot transition from ${currentStatus} to ${attemptedStatus}`);
    this.name = 'InvalidWorkflowTransitionException';
  }
}

export class UnauthorizedWorkflowActionException extends Error {
  statusCode = 403;
  constructor(role: string, action: string) {
    super(`Role ${role} is not authorized to perform ${action}`);
    this.name = 'UnauthorizedWorkflowActionException';
  }
}

export class ImmutableRecordException extends Error {
  statusCode = 400;
  constructor(caseId: string) {
    super(`Death case ${caseId} is approved and cannot be modified`);
    this.name = 'ImmutableRecordException';
  }
}

export class InvalidSectionException extends Error {
  statusCode = 400;
  constructor(section: string, reason: string) {
    super(`Invalid ${section} section: ${reason}`);
    this.name = 'InvalidSectionException';
  }
}
