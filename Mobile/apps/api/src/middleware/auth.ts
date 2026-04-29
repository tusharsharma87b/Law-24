import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/auth.js';

export type AuthRequest = Request & { user?: { id: string; role: 'USER' | 'LAWYER' | 'ADMIN' } };

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  try {
    const payload = verifyAccessToken(auth.slice(7));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export function requireRole(roles: Array<'USER' | 'LAWYER' | 'ADMIN'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}
