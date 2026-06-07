import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import logger from '../utils/logger';
import { UserRole } from '../generated/prisma';

export async function requireFarmAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { farmId } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  logger.info(`Checking access for user ${userId} to farm ${farmId}`);

  const membership = await prisma.farmUser.findFirst({
    where: { farmId, userId, isActive: true },
  });

  if (!membership) {
    res.status(403).json({ message: 'You do not have access to this farm' });
    return;
  }

  req.farmRole = membership.role as UserRole;
  next();
}
