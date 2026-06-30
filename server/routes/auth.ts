import { Router } from 'express';
import {
  registerUser,
  authenticateUser,
  handleLogout,
  forgotPassword,
  resetPassword,
} from '../controllers/authenticate';
import { validateBody } from '../lib/validate';
import {
  SignupSchema,
  SigninSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../schemas/auth.schemas';

const router = Router();

router.post('/signup', validateBody(SignupSchema), registerUser);
router.post('/signin', validateBody(SigninSchema), authenticateUser);
router.post('/logout', handleLogout);
router.post('/forgot-password', validateBody(ForgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(ResetPasswordSchema), resetPassword);

export default router;
