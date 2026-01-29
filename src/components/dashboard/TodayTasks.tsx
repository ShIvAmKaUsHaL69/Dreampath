'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const categoryColors: Record<string, string> = {
  study: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  skill: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  research: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'self-improvement': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

const priorityColors: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-gray-400',
};

export function TodayTasks() {
  const { tasks, toggleTask } = useApp();
  
  const todayTasks = tasks.filter(
    t => new Date(t.dueDate).toDateString() === new Date().toDateString()
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Today&apos;s Tasks</CardTitle>
        <Link href="/tasks">
          <Button variant="ghost" size="sm" className="gap-1">
            View all
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayTasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No tasks for today. Enjoy your day!
          </p>
        ) : (
          todayTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border-l-4 bg-muted/30 p-3',
                priorityColors[task.priority],
                task.completed && 'opacity-60'
              )}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'font-medium',
                    task.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {task.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {task.description}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn('shrink-0', categoryColors[task.category])}
              >
                {task.category}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
