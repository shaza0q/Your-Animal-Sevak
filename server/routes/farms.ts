import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { getFarmUsers, assignFarmUser, removeFarmUser, getFarmData, getAllFarmData } from '../controllers/farmController';
import { requireFarmAccess } from '../middlewares/farmAuth';
import { searchUsers } from '../controllers/farmUser.controller';
import { validateBody } from '../lib/validate';
import { AssignFarmUserSchema } from '../schemas/farm.schemas';

/* eslint-disable @typescript-eslint/no-var-requires */
const { getAnimalOverview, listAnimalsByType, getAnimalDetailController, getDashboardStatsController, getFarmTasksController, getRecentActivityController } = require('../controllers/animalController');
/* eslint-enable @typescript-eslint/no-var-requires */

const router = Router();

// Static routes must come BEFORE /:farmId to prevent Express treating the
// literal path segment as a param value.
router.get('/dashboard', protect, getDashboardStatsController);

router.get('/tasks', protect, getFarmTasksController);

router.get('/activity', protect, getRecentActivityController);

router.get('/:farmId/users', protect, requireFarmAccess, getFarmUsers);

router.post('/:farmId/users', protect, requireFarmAccess, validateBody(AssignFarmUserSchema), assignFarmUser);

router.delete('/:farmId/users/:userId', protect, requireFarmAccess, removeFarmUser);

router.get('/getAllFarms', protect, getAllFarmData);

router.get('/:farmId', protect, requireFarmAccess, getFarmData);

router.get('/:farmId/animals/overview', protect, requireFarmAccess, getAnimalOverview);

router.get('/:farmId/animals', protect, requireFarmAccess, listAnimalsByType);

router.get('/:farmId/animals/:animalId', protect, requireFarmAccess, getAnimalDetailController);

router.get('/:farmId/users/search', protect, requireFarmAccess, searchUsers);

export default router;
