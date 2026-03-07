import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'dreampath-dev-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dreampath-refresh-secret-change-me';

export interface JwtPayload {
  userId: number;
  email: string;
  role: 'student' | 'superadmin';
}

// ── Password Hashing ─────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── JWT Token Generation ─────────────────────────────────────
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// ── Token Extraction ─────────────────────────────────────────
export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  // Also check cookies
  const cookieToken = req.cookies.get('token')?.value;
  return cookieToken || null;
}

// ── Auth Middleware (for API routes) ──────────────────────────
export async function authenticateRequest(req: NextRequest): Promise<JwtPayload | NextResponse> {
  const token = extractToken(req);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return payload;
}

// ── Role Check ───────────────────────────────────────────────
export function requireSuperAdmin(payload: JwtPayload): NextResponse | null {
  if (payload.role !== 'superadmin') {
    return NextResponse.json({ error: 'Forbidden: superadmin access required' }, { status: 403 });
  }
  return null;
}
