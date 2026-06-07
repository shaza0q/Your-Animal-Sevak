import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../generated/prisma';

class UnauthorizedAccessException extends Error {
  statusCode = 403;
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'UnauthorizedAccessException';
  }
}

export default function roleMiddleware(allowedRoles: UserRole | UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user?.role) {
        throw new UnauthorizedAccessException('Authentication required');
      }
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (req.user.role === UserRole.admin || roles.includes(req.user.role as UserRole)) {
        return next();
      }
      throw new UnauthorizedAccessException(
        `Role ${req.user.role} cannot access this resource. Required: ${roles.join(', ')}`
      );
    } catch (error) {
      next(error);
    }
  };
}
