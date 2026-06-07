import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { addFarmData } from '../controllers/assetController';
import { validateBody } from '../lib/validate';
import { AddFarmSchema } from '../schemas/farm.schemas';

const router = Router();

router.post('/addFarm', protect, validateBody(AddFarmSchema), addFarmData);

export default router;
