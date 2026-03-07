import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken, signRefreshToken, JwtPayload } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    // Verify user still exists and is active
    const user = await queryOne<any>('SELECT id, email, role, is_active FROM users WHERE id = ?', [payload.userId]);
    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'User not found or deactivated' }, { status: 401 });
    }

    const newPayload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const newToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    const response = NextResponse.json({ token: newToken, refreshToken: newRefreshToken });

    response.cookies.set('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
