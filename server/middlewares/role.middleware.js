// Import the existing exception (it should already have statusCode)
const { UnauthorizedWorkflowActionException } = require('../common/exceptions/deathCase.exceptions');

// Create a simple HTTP-level access exception (separate from workflow)
class UnauthorizedAccessException extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'UnauthorizedAccessException';
    this.statusCode = 403;
  }
}

/**
 * Role-based access control middleware
 * Usage: roleMiddleware(['admin', 'manager']) or roleMiddleware('admin')
 */
function roleMiddleware(allowedRoles) {
  return function(req, res, next) {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.role) {
        throw new UnauthorizedAccessException('Authentication required');
      }

      const userRole = req.user.role;
      
      // Convert single role to array for consistency
      const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      // ADMIN BYPASS: Admin has global access
      if (userRole === 'admin') {
        return next();
      }
      
      // Check if user has required role
      if (!rolesArray.includes(userRole)) {
        throw new UnauthorizedAccessException(
          `Role ${userRole} cannot access this resource. Required: ${rolesArray.join(', ')}`
        );
      }
      
      // Role check passed
      next();
    } catch (error) {
      // Pass error to error handler
      next(error);
    }
  };
}

module.exports = roleMiddleware;