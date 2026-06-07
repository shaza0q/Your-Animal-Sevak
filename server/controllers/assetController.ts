import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const addFarmData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, capacity, animalTypes } = req.body;
    const userId = req.user!.id;

    const farm = await prisma.farm.create({
      data: {
        name,
        location,
        capacity: capacity ? Number(capacity) : null,
        animalTypes: animalTypes ?? [],
        ownerId: userId,
        createdById: userId,
      },
    });

    await prisma.farmUser.create({
      data: {
        farmId: farm.id,
        userId,
        role: 'owner',
        isActive: true,
        createdById: userId,
      },
    });

    res.status(200).json({ message: 'Farm added successfully' });
  } catch (err) {
    console.error('Error in Adding farm ', err);
    res.status(500).json({ message: 'server error' });
  }
};
