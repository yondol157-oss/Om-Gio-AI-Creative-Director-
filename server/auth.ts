import type { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';
import type { User } from './db.ts';

export interface AuthRequest extends Request {
  user?: User;
}

// Extract authenticated user from request header
export function getAuthenticatedUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-user-id']) {
    token = String(req.headers['x-user-id']).trim();
  }

  if (!token) return null;

  // In our JWT/Token scheme: token can be user.id or a base64 encoded auth token
  if (token.startsWith('om_gio_tok_')) {
    const rawUserId = token.replace('om_gio_tok_', '');
    return db.findUserById(rawUserId) || null;
  }

  // Check direct user ID
  const directUser = db.findUserById(token);
  if (directUser) return directUser;

  // Check by email
  const byEmail = db.findUserByEmail(token);
  if (byEmail) return byEmail;

  return null;
}

// Middleware: Require valid logged-in user
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Sesi login diperlukan untuk mengakses endpoint ini.',
    });
  }

  if (user.role === 'SUSPENDED') {
    return res.status(403).json({
      error: 'SUSPENDED',
      message: 'Akun Anda saat ini ditangguhkan oleh Administrator.',
    });
  }

  req.user = user;
  next();
}

// Middleware: Require PRO or ADMIN membership
export function requirePro(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user || getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Silakan login terlebih dahulu.',
    });
  }

  if (user.role !== 'PRO' && user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'PRO_REQUIRED',
      message: 'Fitur ini membutuhkan akses PRO LIFETIME. Silakan upgrade paket Anda.',
      needs_upgrade: true,
    });
  }

  req.user = user;
  next();
}

// Middleware: Strictly Require ADMIN role
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user || getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Silakan login dengan akun Administrator.',
    });
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Akses ditolak: Hanya Administrator yang berwenang mengakses panel ini.',
    });
  }

  req.user = user;
  next();
}

// Generate token for client
export function createSessionToken(user: User): string {
  return `om_gio_tok_${user.id}`;
}
