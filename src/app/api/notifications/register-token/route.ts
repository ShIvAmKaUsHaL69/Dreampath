import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { insert, queryOne, update } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { token, device } = body;
    if (!token) return NextResponse.json({ error: 'Token is required' }, { status: 400 });

    // Upsert FCM token
    const existing = await queryOne<any>('SELECT id FROM fcm_tokens WHERE token = ?', [token]);
    if (existing) {
      await update('UPDATE fcm_tokens SET user_id = ?, device = ? WHERE id = ?', [authResult.userId, device || null, existing.id]);
    } else {
      await insert('INSERT INTO fcm_tokens (user_id, token, device) VALUES (?, ?, ?)', [authResult.userId, token, device || null]);
    }

    return NextResponse.json({ message: 'FCM token registered' });
  } catch (error) {
    console.error('FCM register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
