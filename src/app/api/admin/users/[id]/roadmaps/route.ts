import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/admin/users/[id]/roadmaps — get all roadmaps for a user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const roadmaps = await query<any[]>(
      `SELECT r.*, c.title as career_title
       FROM roadmaps r
       LEFT JOIN careers c ON r.career_id = c.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    return NextResponse.json({ roadmaps });
  } catch (error) {
    console.error('Admin user roadmaps error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
