import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { getAssignments, assignUser, unassignUser } from '../controllers/animalAssignment.controller';
import { requireAnimalFarmAccess } from '../middlewares/animalFarmAuth';
import { validateBody } from '../lib/validate';
import { AssignAnimalUserSchema, UnassignAnimalUserSchema } from '../schemas/animal.schemas';

const router = Router();

// View active assignments
router.get('/:animalId/assignments', protect, requireAnimalFarmAccess, getAssignments);

// Assign caretaker / vet
router.post(
  '/:animalId/assignments',
  protect,
  requireAnimalFarmAccess,
  validateBody(AssignAnimalUserSchema),
  assignUser,
);

// Unassign
router.post(
  '/:animalId/assignments/:assignedUserId/unassign',
  protect,
  requireAnimalFarmAccess,
  validateBody(UnassignAnimalUserSchema),
  unassignUser,
);

export default router;
