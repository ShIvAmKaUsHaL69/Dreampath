import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { queryOne, update, query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const prefs = await queryOne<any>(
      'SELECT * FROM user_notification_prefs WHERE user_id = ?',
      [authResult.userId]
    );

    return NextResponse.json({
      notifications: prefs ? {
        dailyReminders: !!prefs.daily_reminders,
        missedTaskAlerts: !!prefs.missed_task_alerts,
        motivationNudges: !!prefs.motivation_nudges,
        examCountdown: !!prefs.exam_countdown,
      } : { dailyReminders: true, missedTaskAlerts: true, motivationNudges: true, examCountdown: true },
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { name, email, notifications } = body;

    // Update profile
    if (name || email) {
      const sets: string[] = [];
      const vals: any[] = [];
      if (name) { sets.push('name = ?'); vals.push(name); }
      if (email) { sets.push('email = ?'); vals.push(email); }
      vals.push(authResult.userId);
      await update(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);
    }

    // Update notification prefs
    if (notifications) {
      await update(
        `UPDATE user_notification_prefs SET daily_reminders=?, missed_task_alerts=?, motivation_nudges=?, exam_countdown=? WHERE user_id=?`,
        [
          notifications.dailyReminders ? 1 : 0,
          notifications.missedTaskAlerts ? 1 : 0,
          notifications.motivationNudges ? 1 : 0,
          notifications.examCountdown ? 1 : 0,
          authResult.userId,
        ]
      );
    }

    return NextResponse.json({ message: 'Settings updated' });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
