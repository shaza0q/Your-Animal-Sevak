import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../generated/prisma';

interface JwtPayload {
  id: string;
  role: UserRole;
}

export function protect(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.jwt as string | undefined;

  if (!token) {
    res.status(401).json({ message: 'Not authorised, invalid or null token' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
}
