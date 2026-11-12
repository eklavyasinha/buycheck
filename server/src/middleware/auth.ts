import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../models/repository.js';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
  isGuest?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'buycheck_super_secret_jwt_key_for_local_dev_2026';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const isGuestHeader = req.headers['x-guest-mode'] === 'true';

    // Allow Guest Demo Mode
    if (isGuestHeader || (!authHeader && req.query.guest === 'true')) {
      req.user = {
        userId: 'guest-demo-user-id',
        email: 'guest@buycheck.local',
        name: 'Guest Explorer',
        isGuest: true,
      };
      return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please sign in or use Guest Demo Mode.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const user = await UserRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found.' });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      isGuest: false,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please sign in again.',
    });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const isGuestHeader = req.headers['x-guest-mode'] === 'true';

  if (isGuestHeader || (!authHeader && req.query.guest === 'true')) {
    req.user = {
      userId: 'guest-demo-user-id',
      email: 'guest@buycheck.local',
      name: 'Guest Explorer',
      isGuest: true,
    };
    return next();
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        name: 'User',
      };
    } catch {
      // Ignore token failure for optional auth
    }
  }

  next();
}
