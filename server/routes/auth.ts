import { Router } from 'express';
import { registerUser, authenticateUser, handleLogout } from '../controllers/authenticate';
import { validateBody } from '../lib/validate';
import { SignupSchema, SigninSchema } from '../schemas/auth.schemas';

const router = Router();

router.post('/signup', validateBody(SignupSchema), registerUser);
router.post('/signin', validateBody(SigninSchema), authenticateUser);
router.post('/logout', handleLogout);

export default router;
