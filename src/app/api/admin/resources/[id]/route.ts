import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { update } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;
    const { id } = await params;

    const affected = await update('DELETE FROM resources WHERE id = ?', [id]);
    if (affected === 0) return NextResponse.json({ error: 'Resource not found' }, { status: 404 });

    return NextResponse.json({ message: 'Resource deleted' });
  } catch (error) {
    console.error('Admin resource DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
