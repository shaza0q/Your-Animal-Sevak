import { z } from 'zod';
import { UserRole } from '../common/enums';

export const SignupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(1, 'Mobile number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole, { message: 'Invalid role' }),
});

export const SigninSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignupBody = z.infer<typeof SignupSchema>;
export type SigninBody = z.infer<typeof SigninSchema>;
