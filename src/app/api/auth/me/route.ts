import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { queryOne, query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const user = await queryOne<any>(
      'SELECT id, name, email, role, grade, stream, goal_intensity, streak, total_points, is_active, created_at FROM users WHERE id = ?',
      [authResult.userId]
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch interests, hobbies, skills
    const interests = await query<any[]>('SELECT name FROM user_interests WHERE user_id = ?', [user.id]);
    const hobbies = await query<any[]>('SELECT name FROM user_hobbies WHERE user_id = ?', [user.id]);
    const skills = await query<any[]>('SELECT name FROM user_skills WHERE user_id = ?', [user.id]);
    const badges = await query<any[]>(
      `SELECT b.id, b.name, b.description, b.icon, ub.unlocked_at 
       FROM user_badges ub JOIN badges b ON ub.badge_id = b.id 
       WHERE ub.user_id = ?`,
      [user.id]
    );

    return NextResponse.json({
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
        interests: interests.map((r: any) => r.name),
        hobbies: hobbies.map((r: any) => r.name),
        skills: skills.map((r: any) => r.name),
        badges,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
