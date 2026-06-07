import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { parsePage, paginated } from '../lib/pagination';

export const getFarmUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;
    const { page, limit, skip } = parsePage(req.query as Record<string, string>);

    const where = { farmId, isActive: true };
    const [farmUsers, total] = await Promise.all([
      prisma.farmUser.findMany({
        where,
        include: { user: true },
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.farmUser.count({ where }),
    ]);

    const data = farmUsers.map((fu) => ({
      id: fu.user.id,
      name: fu.user.fullName,
      email: fu.user.email,
      role: fu.role,
      assignedDate: fu.assignedAt,
    }));

    res.status(200).json({
      message: 'Farm users retrieved successfully',
      ...paginated(data, page, limit, total),
    });
  } catch (err) {
    console.error('Error fetching farm users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const assignFarmUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;
    const { userId } = req.body as { userId: string; role: string };
    const requesterId = req.user?.id;

    if (!requesterId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // 1. Ensure farm exists
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm) {
      res.status(404).json({ message: 'Farm not found' });
      return;
    }

    // 3. Ensure requester is OWNER
    const requesterMembership = await prisma.farmUser.findFirst({
      where: { farmId, userId: requesterId, role: 'owner', isActive: true },
    });

    if (!requesterMembership) {
      res.status(403).json({ message: 'Only farm owners can assign users' });
      return;
    }

    // 4. Ensure target user exists
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Use user's original role from their profile
    const userOriginalRole = targetUser.role;

    // 5. Check existing assignment
    const existingAssignment = await prisma.farmUser.findFirst({
      where: { farmId, userId },
    });

    if (existingAssignment) {
      if (existingAssignment.isActive) {
        res.status(409).json({ message: 'User is already assigned to this farm' });
        return;
      }

      // Reactivate
      const updated = await prisma.farmUser.update({
        where: { id: existingAssignment.id },
        data: { isActive: true, role: userOriginalRole },
        include: { user: true },
      });

      res.status(200).json({
        message: 'User reactivated and assigned to farm successfully',
        data: {
          id: updated.user.id,
          name: updated.user.fullName,
          email: updated.user.email,
          role: updated.role,
          assignedDate: updated.updatedAt,
        },
      });
      return;
    }

    // 6. Create new mapping
    const farmUser = await prisma.farmUser.create({
      data: {
        farmId,
        userId,
        role: userOriginalRole,
        createdById: requesterId,
      },
      include: { user: true },
    });

    res.status(201).json({
      message: 'User assigned to farm successfully',
      data: {
        id: farmUser.user.id,
        name: farmUser.user.fullName,
        email: farmUser.user.email,
        role: farmUser.role,
        assignedDate: farmUser.assignedAt,
      },
    });
  } catch (err) {
    console.error('Error assigning farm user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFarmUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId, userId } = req.params;
    const requesterId = req.user?.id;

    if (!requesterId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    // 1. Ensure requester is OWNER
    const requesterMembership = await prisma.farmUser.findFirst({
      where: { farmId, userId: requesterId, role: 'owner', isActive: true },
    });

    if (!requesterMembership) {
      res.status(403).json({ message: 'Only farm owners can remove users' });
      return;
    }

    // 2. Prevent owner from removing themselves
    if (requesterId === userId) {
      res.status(400).json({ message: 'Owner cannot remove themselves from the farm' });
      return;
    }

    // 3. Find target membership (cannot remove owner or admin)
    const targetMembership = await prisma.farmUser.findFirst({
      where: {
        farmId,
        userId,
        isActive: true,
        role: { notIn: ['owner', 'admin'] },
      },
    });

    if (!targetMembership) {
      res.status(404).json({ message: 'User is not assigned to this farm' });
      return;
    }

    // 4. Soft delete
    await prisma.farmUser.update({
      where: { id: targetMembership.id },
      data: { isActive: false },
    });

    res.status(200).json({ message: 'User removed from farm successfully' });
  } catch (err) {
    console.error('Error removing farm user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFarmData = async (req: Request, res: Response): Promise<void> => {
  const farm = await prisma.farm.findUnique({ where: { id: req.params.farmId } });

  if (!farm) {
    res.status(404).json({ message: 'Farm not found' });
    return;
  }

  res.json({
    message: 'Farm fetched successfully',
    data: {
      id: farm.id,
      name: farm.name,
      location: farm.location,
      animalTypes: farm.animalTypes,
      capacity: farm.capacity,
    },
  });
};

export const getAllFarmData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { page, limit, skip } = parsePage(req.query as Record<string, string>);
    const where = { ownerId: userId };
    const [farmData, total] = await Promise.all([
      prisma.farm.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.farm.count({ where }),
    ]);

    res.status(200).json({
      message: 'Got the farm data',
      ...paginated(farmData, page, limit, total),
    });
  } catch (err) {
    console.error('Error fetching all farm data:', err);
    res.status(500).json({ message: 'Unable to fetch farm data' });
  }
};
