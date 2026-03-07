import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const totalUsers = await queryOne<any>('SELECT COUNT(*) as cnt FROM users WHERE role = ?', ['student']);
    const activeUsers = await queryOne<any>('SELECT COUNT(*) as cnt FROM users WHERE role = ? AND is_active = 1', ['student']);
    const totalCareers = await queryOne<any>('SELECT COUNT(*) as cnt FROM careers');
    const totalResources = await queryOne<any>('SELECT COUNT(*) as cnt FROM resources');
    const taskStats = await queryOne<any>('SELECT COUNT(*) as total, SUM(completed) as done FROM tasks');
    const avgStreak = await queryOne<any>('SELECT AVG(streak) as avg_streak FROM users WHERE role = ?', ['student']);

    const popularCareers = await query<any[]>(
      `SELECT c.title, c.category, c.slug, COUNT(r.id) as roadmap_count
       FROM careers c LEFT JOIN roadmaps r ON c.id = r.career_id
       GROUP BY c.id ORDER BY roadmap_count DESC LIMIT 5`
    );

    const recentUsers = await query<any[]>(
      'SELECT id, name, email, grade, stream, streak, created_at FROM users WHERE role = ? ORDER BY created_at DESC LIMIT 10',
      ['student']
    );

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers?.cnt || 0,
        activeUsers: activeUsers?.cnt || 0,
        totalCareers: totalCareers?.cnt || 0,
        totalResources: totalResources?.cnt || 0,
        taskCompletionRate: taskStats?.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0,
        avgStreakDays: Math.round((avgStreak?.avg_streak || 0) * 10) / 10,
      },
      popularCareers,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
