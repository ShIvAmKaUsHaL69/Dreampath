'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function StreakCalendar() {
  const { student, tasks } = useApp();

  // Generate streak data from recent tasks 
  const today = new Date();
  const streakDays = dayLabels.map((day, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toDateString();
    const completed = tasks.some(
      t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === dayStr
    );
    return { day, completed };
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Streak</CardTitle>
        <div className="flex items-center gap-1 text-sm font-bold text-foreground">
          <Flame className="h-4 w-4 text-orange-500" />
          {student?.streak || 0}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {streakDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  'h-8 w-8 rounded-full grid place-items-center text-xs font-semibold transition-colors',
                  day.completed
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {day.completed ? '✓' : ''}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{day.day}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
