import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const id = req.user?.id;

  if (!id) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      mobile: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  res.status(201).json(user);
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, farmId } = req.query as { query?: string; farmId?: string };

    if (!query || query.trim().length < 2) {
      res.status(400).json({
        message: 'Search query must be at least 2 characters',
      });
      return;
    }

    const q = query.trim();

    // 1. Find matching users (exclude owner and admin)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } },
        ],
        role: { notIn: ['owner', 'admin'] },
      },
      select: { id: true, fullName: true, email: true, role: true },
      take: 10,
    });

    // 2. Optional: filter out users already assigned to the farm
    let filteredUsers = users;

    if (farmId) {
      const assignedFarmUsers = await prisma.farmUser.findMany({
        where: {
          farmId,
          isActive: true,
          role: { notIn: ['owner', 'admin'] },
        },
        select: { userId: true },
      });

      const assignedUserIds = new Set(assignedFarmUsers.map((u) => u.userId));
      filteredUsers = users.filter((u) => !assignedUserIds.has(u.id));
    }

    res.status(200).json({
      message: 'Users retrieved successfully',
      data: filteredUsers.map((u) => ({
        id: u.id,
        name: u.fullName,
        email: u.email,
        role: u.role,
      })),
    });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
