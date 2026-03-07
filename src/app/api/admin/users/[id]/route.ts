import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { queryOne, update, query } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const user = await queryOne<any>('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const interests = await query<any[]>('SELECT name FROM user_interests WHERE user_id = ?', [id]);
    const hobbies = await query<any[]>('SELECT name FROM user_hobbies WHERE user_id = ?', [id]);
    const skills = await query<any[]>('SELECT name FROM user_skills WHERE user_id = ?', [id]);

    return NextResponse.json({
      user: {
        ...user,
        password_hash: undefined,
        interests: interests.map((i: any) => i.name),
        hobbies: hobbies.map((h: any) => h.name),
        skills: skills.map((s: any) => s.name),
      },
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const body = await req.json();
    const { is_active, role } = body;

    const sets: string[] = [];
    const vals: any[] = [];
    if (is_active !== undefined) { sets.push('is_active = ?'); vals.push(is_active ? 1 : 0); }
    if (role) { sets.push('role = ?'); vals.push(role); }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    vals.push(id);
    await update(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
    return NextResponse.json({ message: 'User updated' });
  } catch (error) {
    console.error('Admin user PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    await update('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    return NextResponse.json({ message: 'User deactivated' });
  } catch (error) {
    console.error('Admin user DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
