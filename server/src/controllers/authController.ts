import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRepository, ActivityRepository } from '../models/repository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'buycheck_super_secret_jwt_key_for_local_dev_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = RegisterSchema.parse(req.body);

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserRepository.create({
      name,
      email,
      passwordHash,
      preferences: { theme: 'dark', defaultCurrency: 'INR' },
    });

    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    await ActivityRepository.log(newUser._id.toString(), 'ACCOUNT_CREATED', 'Account registered successfully.');

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        preferences: newUser.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password combination.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password combination.',
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    await ActivityRepository.log(user._id.toString(), 'LOGIN', 'Logged into dashboard.');

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const user = await UserRepository.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        isGuest: Boolean(req.user.isGuest),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getGuestDemoSession(_req: Request, res: Response) {
  const token = jwt.sign(
    { userId: 'guest-demo-user-id', email: 'guest@buycheck.local', isGuest: true },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  return res.json({
    success: true,
    token,
    user: {
      id: 'guest-demo-user-id',
      name: 'Guest Explorer',
      email: 'guest@buycheck.local',
      preferences: { theme: 'dark', defaultCurrency: 'INR' },
      isGuest: true,
    },
  });
}
