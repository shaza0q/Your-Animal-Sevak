import jwt from 'jsonwebtoken';
import { UserRole } from '../generated/prisma';

interface TokenPayload {
  id: string;
  role: UserRole;
}

export function generateToken(user: { id: string; role: UserRole }): string {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );
}

export function validateToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}
