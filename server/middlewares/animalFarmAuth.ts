import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import logger from '../utils/logger';
import { UserRole } from '../generated/prisma';

export async function requireAnimalFarmAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { animalId } = req.params;
  const userId = req.user?.id;

  if (!userId) { res.status(401).json({ message: 'Not authenticated' }); return; }

  try {
    const animal = await prisma.animal.findFirst({ where: { id: animalId, isDeleted: false }, select: { farmId: true } });
    if (!animal) { res.status(404).json({ message: 'Animal not found' }); return; }

    const membership = await prisma.farmUser.findFirst({
      where: { farmId: animal.farmId, userId, isActive: true },
    });
    if (!membership) { res.status(403).json({ message: 'You do not have access to this farm' }); return; }

    req.farmRole = membership.role as UserRole;
    (req as any).farmId = animal.farmId;
    next();
  } catch (error) {
    logger.error(`Error checking animal farm access: ${(error as Error).message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
}
