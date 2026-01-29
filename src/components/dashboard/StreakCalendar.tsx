'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { streakData } from '@/data/mockData';
import { Flame } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export function StreakCalendar() {
  const { student } = useApp();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Weekly Streak</CardTitle>
        <div className="flex items-center gap-1 text-orange-500">
          <Flame className="h-5 w-5" />
          <span className="font-bold">{student?.streak || 0}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between">
          {streakData.map((day, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  day.completed
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {day.completed ? '✓' : ''}
              </div>
              <span className="text-xs text-muted-foreground">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted" />
            <span className="text-muted-foreground">Missed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
