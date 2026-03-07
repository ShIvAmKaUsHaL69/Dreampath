import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, signAccessToken, signRefreshToken, JwtPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user
    const user = await queryOne<any>(
      'SELECT id, name, email, password_hash, role, grade, stream, goal_intensity, streak, total_points, is_active FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account has been deactivated' }, { status: 403 });
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate tokens
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const response = NextResponse.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        grade: user.grade,
        stream: user.stream,
        goalIntensity: user.goal_intensity,
        streak: user.streak,
        totalPoints: user.total_points,
      },
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
