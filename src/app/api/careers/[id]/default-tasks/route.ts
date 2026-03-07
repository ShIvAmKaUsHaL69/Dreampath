import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/careers/[id]/default-tasks — public endpoint for predefined tasks
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const tasks = await query<any[]>(
      'SELECT title, description, category, priority FROM career_default_tasks WHERE career_id = ? ORDER BY sort_order',
      [id]
    );

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Career default tasks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
