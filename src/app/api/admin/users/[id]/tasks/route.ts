import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

// GET /api/admin/users/[id]/tasks — get all tasks for a user
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const tasks = await query<any[]>(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date DESC',
      [id]
    );

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Admin user tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
