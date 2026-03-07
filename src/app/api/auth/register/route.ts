import { NextRequest, NextResponse } from 'next/server';
import { query, insert } from '@/lib/db';
import { hashPassword, signAccessToken, signRefreshToken, JwtPayload } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, grade, stream, goalIntensity, interests, hobbies, skills } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert user
    const userId = await insert(
      'INSERT INTO users (name, email, password_hash, role, grade, stream, goal_intensity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, 'student', grade || null, stream || 'undecided', goalIntensity || 'serious']
    );

    // Insert interests
    if (interests?.length) {
      for (const interest of interests) {
        await insert('INSERT INTO user_interests (user_id, name) VALUES (?, ?)', [userId, interest]);
      }
    }

    // Insert hobbies
    if (hobbies?.length) {
      for (const hobby of hobbies) {
        await insert('INSERT INTO user_hobbies (user_id, name) VALUES (?, ?)', [userId, hobby]);
      }
    }

    // Insert skills
    if (skills?.length) {
      for (const skill of skills) {
        await insert('INSERT INTO user_skills (user_id, name) VALUES (?, ?)', [userId, skill]);
      }
    }

    // Create default notification prefs
    await insert('INSERT INTO user_notification_prefs (user_id) VALUES (?)', [userId]);

    // Generate tokens
    const payload: JwtPayload = { userId, email, role: 'student' };
    const token = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const response = NextResponse.json({
      token,
      refreshToken,
      user: { id: userId, name, email, role: 'student', grade, stream, goalIntensity },
    }, { status: 201 });

    // Set cookie too
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
