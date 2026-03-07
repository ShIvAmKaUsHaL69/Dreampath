import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireSuperAdmin } from '@/lib/auth';
import { query, insert, update, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;
    const forbidden = requireSuperAdmin(authResult);
    if (forbidden) return forbidden;

    const notifications = await query<any[]>(
      `SELECT n.*, u.name as sent_by_name FROM notifications n JOIN users u ON n.sent_by = u.id ORDER BY n.created_at DESC LIMIT 50`
    );

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Notifications GET error:', error);
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
    const { title, message, target, userIds } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    const isAll = target === 'all';
    let sentCount = 0;

    // Get FCM tokens
    let tokens: any[];
    if (isAll) {
      tokens = await query<any[]>('SELECT DISTINCT token FROM fcm_tokens');
    } else if (userIds?.length) {
      const placeholders = userIds.map(() => '?').join(',');
      tokens = await query<any[]>(
        `SELECT DISTINCT token FROM fcm_tokens WHERE user_id IN (${placeholders})`,
        userIds
      );
    } else {
      tokens = [];
    }

    // Try to send via Firebase if configured
    try {
      if (tokens.length > 0 && process.env.FIREBASE_PROJECT_ID) {
        const { getFirebaseAdmin } = await import('@/lib/firebase-admin');
        const admin = getFirebaseAdmin();
        if (admin) {
          const tokenList = tokens.map((t: any) => t.token);
          // Send in batches of 500 (FCM limit)
          for (let i = 0; i < tokenList.length; i += 500) {
            const batch = tokenList.slice(i, i + 500);
            try {
              const result = await admin.messaging().sendEachForMulticast({
                tokens: batch,
                notification: { title, body: message },
              });
              sentCount += result.successCount;
            } catch (fcmErr) {
              console.error('FCM batch error:', fcmErr);
            }
          }
        }
      }
    } catch (fbError) {
      console.error('Firebase not configured:', fbError);
      // Continue without sending — just log the notification
    }

    // Log notification
    const notifId = await insert(
      'INSERT INTO notifications (sent_by, title, body, target, target_ids, sent_count) VALUES (?,?,?,?,?,?)',
      [authResult.userId, title, message, isAll ? 'all' : 'selected', isAll ? null : JSON.stringify(userIds), sentCount]
    );

    return NextResponse.json({
      id: notifId,
      sentCount,
      message: sentCount > 0 ? `Notification sent to ${sentCount} devices` : 'Notification logged (no FCM tokens found or Firebase not configured)',
    }, { status: 201 });
  } catch (error) {
    console.error('Notification POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
