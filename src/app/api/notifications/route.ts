import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { query, insert, queryOne } from '@/lib/db';

// GET /api/notifications — get notifications for the current user
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    // Get notifications targeted at 'all' or this specific user
    // Also join with notification_reads to know read status
    const notifications = await query<any[]>(
      `SELECT n.id, n.title, n.body as message, n.created_at,
              CASE WHEN nr.id IS NOT NULL THEN 1 ELSE 0 END as is_read
       FROM notifications n
       LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
       WHERE n.target = 'all'
          OR (n.target = 'selected' AND n.target_ids LIKE CONCAT('%', ?, '%'))
       ORDER BY n.created_at DESC
       LIMIT 20`,
      [authResult.userId, authResult.userId]
    );

    return NextResponse.json({
      notifications: notifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        created_at: n.created_at,
        read: !!n.is_read,
      })),
    });
  } catch (error) {
    console.error('User notifications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications — mark a notification as read
export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      // Mark all unread notifications as read for this user
      const unread = await query<any[]>(
        `SELECT n.id FROM notifications n
         LEFT JOIN notification_reads nr ON nr.notification_id = n.id AND nr.user_id = ?
         WHERE nr.id IS NULL
           AND (n.target = 'all' OR (n.target = 'selected' AND n.target_ids LIKE CONCAT('%', ?, '%')))`,
        [authResult.userId, authResult.userId]
      );
      for (const n of unread) {
        try {
          await insert(
            'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
            [n.id, authResult.userId]
          );
        } catch {}
      }
      return NextResponse.json({ message: 'All marked as read' });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'notificationId required' }, { status: 400 });
    }

    // Mark single notification as read
    try {
      await insert(
        'INSERT IGNORE INTO notification_reads (notification_id, user_id) VALUES (?, ?)',
        [notificationId, authResult.userId]
      );
    } catch {}

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('User notifications PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
