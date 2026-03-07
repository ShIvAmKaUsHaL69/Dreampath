import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query, insert, update } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const resources = await query<any[]>(
      'SELECT r.*, c.title as career_title FROM resources r LEFT JOIN careers c ON r.career_id = c.id ORDER BY r.created_at DESC'
    );
    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Admin resources error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const body = await req.json();
    const { title, type, url, description, careerId, thumbnail } = body;
    if (!title || !type || !url) return NextResponse.json({ error: 'Title, type, and URL are required' }, { status: 400 });

    const id = await insert(
      'INSERT INTO resources (title, type, url, description, career_id, thumbnail) VALUES (?,?,?,?,?,?)',
      [title, type, url, description || null, careerId || null, thumbnail || null]
    );

    return NextResponse.json({ id, message: 'Resource created' }, { status: 201 });
  } catch (error) {
    console.error('Admin resource POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
