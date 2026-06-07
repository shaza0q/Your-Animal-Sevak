import { Router } from 'express';
import { searchUsers } from '../controllers/farmUser.controller';
import { protect } from '../middlewares/auth';
import { requireFarmAccess } from '../middlewares/farmAuth';

const router = Router();

router.get('/:farmId/users/search', protect, requireFarmAccess, searchUsers);

export default router;
