import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { getHealthData } from '../controllers/statController';

const router = Router();

router.post('/getHealthData', protect, getHealthData);

export default router;
