import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const userId = authResult.userId;

    // Task completion rate
    const taskStats = await queryOne<any>(
      'SELECT COUNT(*) as total, SUM(completed) as done FROM tasks WHERE user_id = ?',
      [userId]
    );
    const taskCompletionRate = taskStats?.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

    // Weekly consistency (last 7 days streaks)
    const streaks = await query<any[]>(
      'SELECT date, completed FROM streaks WHERE user_id = ? ORDER BY date DESC LIMIT 7',
      [userId]
    );
    const weeklyConsistency = streaks.length > 0
      ? Math.round((streaks.filter((s: any) => s.completed).length / 7) * 100)
      : 0;

    // Skill progress from tasks
    const skillProgress = await query<any[]>(
      `SELECT category as skill, 
              COUNT(*) as total,
              SUM(completed) as done
       FROM tasks WHERE user_id = ? GROUP BY category`,
      [userId]
    );

    // Strong/weak areas
    const areas = skillProgress.map((s: any) => ({
      skill: s.skill,
      progress: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0,
    }));
    const strongAreas = areas.filter(a => a.progress >= 60).map(a => a.skill);
    const weakAreas = areas.filter(a => a.progress < 40).map(a => a.skill);

    return NextResponse.json({
      analytics: {
        weeklyConsistency,
        taskCompletionRate,
        strongAreas,
        weakAreas,
        improvements: [],
        skillProgress: areas,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
