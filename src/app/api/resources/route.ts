import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const careerId = searchParams.get('careerId') || '';

    let where = '1=1';
    const params: any[] = [];

    if (type) { where += ' AND r.type = ?'; params.push(type); }
    if (careerId) {
      where += ' AND c.slug = ?';
      params.push(careerId);
    }

    const resources = await query<any[]>(
      `SELECT r.*, c.slug as career_slug FROM resources r LEFT JOIN careers c ON r.career_id = c.id WHERE ${where} ORDER BY r.created_at DESC`,
      params
    );

    return NextResponse.json({
      resources: resources.map((r: any) => ({
        id: String(r.id),
        title: r.title,
        type: r.type,
        url: r.url,
        description: r.description,
        careerId: r.career_slug || null,
        thumbnail: r.thumbnail,
      })),
    });
  } catch (error) {
    console.error('Resources GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
