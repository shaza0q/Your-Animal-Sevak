import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../lib/prisma';
import { generateToken } from './generateToken';
import { UserRole } from '../generated/prisma';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

const hashResetToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

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

/**
 * Step 1 of password reset. Always responds with the same generic message so the
 * endpoint can't be used to discover which emails have accounts. When the email
 * does belong to a user, a single-use token (hashed at rest) is generated with a
 * 1-hour expiry. With no email provider wired up, the token is returned in the
 * response only outside production so the flow remains usable for demos.
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };
  const genericMessage =
    'If an account exists for that email, password reset instructions have been sent.';

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(200).json({ message: genericMessage });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hashResetToken(rawToken),
        resetTokenExpiry: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    // TODO: send `rawToken` via email once an email provider is configured.
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd) {
      console.info(`[forgot-password] reset token for ${email}: ${rawToken}`);
    }

    res.status(200).json({
      message: genericMessage,
      // Surfaced only in non-production so the reset flow is testable without email.
      ...(isProd ? {} : { devToken: rawToken }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}

/**
 * Step 2 of password reset. Validates the single-use token against its stored hash
 * and expiry, then sets the new password and clears the token so it can't be reused.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { email, token, password } = req.body as {
    email: string;
    token: string;
    password: string;
  };

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (
      !user ||
      !user.resetTokenHash ||
      !user.resetTokenExpiry ||
      user.resetTokenExpiry < new Date() ||
      user.resetTokenHash !== hashResetToken(token)
    ) {
      res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetTokenHash: null,
        resetTokenExpiry: null,
      },
    });

    res.status(200).json({ message: 'Password has been reset. You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'An internal server error occurred' });
  }
}
