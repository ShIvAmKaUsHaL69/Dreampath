import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { parsePaginationParams } from '@/lib/pagination';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const { page, limit, offset } = parsePaginationParams(searchParams);

    let where = "role = 'student'";
    const params: any[] = [];
    if (search) {
      where += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const users = await query<any[]>(
      `SELECT id, name, email, grade, stream, goal_intensity, streak, total_points, is_active, created_at
       FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const total = await queryOne<any>(`SELECT COUNT(*) as cnt FROM users WHERE ${where}`, params);

    return NextResponse.json({ users, total: total?.cnt || 0, page, limit });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
