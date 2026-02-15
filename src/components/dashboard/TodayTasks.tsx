'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const priorityDot: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-muted-foreground/40',
};

export function TodayTasks() {
  const { tasks, toggleTask } = useApp();

  const todayTasks = tasks.filter(
    t => new Date(t.dueDate).toDateString() === new Date().toDateString()
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">Today&apos;s Tasks</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-1 text-xs cursor-pointer">
            View all <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {todayTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No tasks for today.
          </p>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer',
                task.completed && 'opacity-50'
              )}
              onClick={() => toggleTask(task.id)}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', task.completed && 'line-through text-muted-foreground')}>
                  {task.title}
                </p>
              </div>
              <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', priorityDot[task.priority])} />
              <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                {task.category}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
