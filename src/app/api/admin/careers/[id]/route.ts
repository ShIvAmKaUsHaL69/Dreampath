import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { update, queryOne } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const body = await req.json();
    const fields = ['title', 'category', 'description', 'daily_life', 'study_duration', 'growth_potential', 'risk_level', 'average_salary', 'lifestyle', 'image', 'competition', 'difficulty'];

    const sets: string[] = [];
    const vals: any[] = [];
    for (const field of fields) {
      const camelCase = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (body[camelCase] !== undefined || body[field] !== undefined) {
        sets.push(`${field} = ?`);
        vals.push(body[camelCase] ?? body[field]);
      }
    }

    // Handle JSON fields
    const jsonFields = { academicPath: 'academic_path', entranceExams: 'entrance_exams', collegeTypes: 'college_types', backupOptions: 'backup_options' };
    for (const [key, col] of Object.entries(jsonFields)) {
      if (body[key] !== undefined) {
        sets.push(`${col} = ?`);
        vals.push(JSON.stringify(body[key]));
      }
    }

    if (sets.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    vals.push(id);
    await update(`UPDATE careers SET ${sets.join(', ')} WHERE id = ?`, vals);

    return NextResponse.json({ message: 'Career updated' });
  } catch (error) {
    console.error('Admin career PUT error:', error);
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

    const affected = await update('DELETE FROM careers WHERE id = ?', [id]);
    if (affected === 0) return NextResponse.json({ error: 'Career not found' }, { status: 404 });

    return NextResponse.json({ message: 'Career deleted' });
  } catch (error) {
    console.error('Admin career DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
