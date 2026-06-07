import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { generateToken } from './generateToken';
import { UserRole } from '../generated/prisma';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 86400000, // 1 day
};

export async function registerUser(req: Request, res: Response): Promise<void> {
  const { fullName, email, mobile, password, role } = req.body as {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
    role: UserRole;
  };

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        mobile,
        password: hashedPassword,
        role,
      },
    });

    const token = generateToken({ id: user.id, role: user.role });

    res.cookie('jwt', token, cookieOptions);
    res.status(201).json({ fullName: user.fullName, role: user.role });
  } catch (error) {
    console.error('Registration error: ', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}

export async function authenticateUser(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(409).json({ message: 'User with this email does not exist' });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken({ id: user.id, role: user.role });

    res.cookie('jwt', token, cookieOptions);
    res.status(201).json({ fullName: user.fullName, role: user.role });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}

export function handleLogout(_req: Request, res: Response): void {
  res.clearCookie('jwt');
  res.json({ status: true });
}
