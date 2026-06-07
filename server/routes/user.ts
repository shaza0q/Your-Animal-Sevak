import { Router } from 'express';
import { protect } from '../middlewares/auth';
import { getUserById, searchUsers } from '../controllers/userController';

const router = Router();

router.post('/getUserData', protect, getUserById);
router.get('/search', protect, searchUsers);

export default router;
