import { Request, Response } from 'express';
import {
  getActiveAssignments,
  assignUserToAnimal,
  unassignAnimalUser,
} from '../services/animalAssignment.service';

/**
 * GET /animals/:animalId/assignments
 */
export async function getAssignments(req: Request, res: Response): Promise<void> {
  const { animalId } = req.params;

  try {
    const assignments = await getActiveAssignments(animalId);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching animal assignments:', error);
    res.json([]);
  }
}

/**
 * POST /animals/:animalId/assignments
 */
export async function assignUser(req: Request, res: Response): Promise<void> {
  try {
    const { animalId } = req.params;
    const { workerId, role } = req.body as { workerId: string; role: string };
    const assignedBy = req.user!.id;

    await assignUserToAnimal({ animalId, workerId, role, assignedBy });

    res.status(201).json({ message: 'Assignment successful' });
  } catch (error) {
    console.error('Error assigning user to animal:', error);
    throw error;
  }
}

/**
 * POST /animals/:animalId/assignments/:assignedUserId/unassign
 */
export async function unassignUser(req: Request, res: Response): Promise<void> {
  const { animalId, assignedUserId } = req.params;
  const { role } = req.body as { role: string };
  const unassignedBy = req.user!.id;

  const result = await unassignAnimalUser({
    animalId,
    userId: assignedUserId,
    role,
    unassignedBy,
  });

  if (!result) {
    res.status(404).json({ message: 'Active assignment not found' });
    return;
  }

  res.json({ message: 'Assignment removed' });
}
