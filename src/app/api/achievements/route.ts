import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    // All badges
    const allBadges = await query<any[]>('SELECT * FROM badges ORDER BY id');

    // User's unlocked badges
    const userBadges = await query<any[]>(
      'SELECT badge_id, unlocked_at FROM user_badges WHERE user_id = ?',
      [authResult.userId]
    );
    const unlockedMap = new Map(userBadges.map((ub: any) => [ub.badge_id, ub.unlocked_at]));

    return NextResponse.json({
      badges: allBadges.map((b: any) => ({
        id: String(b.id),
        name: b.name,
        description: b.description,
        icon: b.icon,
        unlockedAt: unlockedMap.get(b.id) || null,
      })),
    });
  } catch (error) {
    console.error('Achievements error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
