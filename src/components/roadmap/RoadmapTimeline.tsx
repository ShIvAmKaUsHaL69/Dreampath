'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Milestone, Task } from '@/types';
import { cn } from '@/lib/utils';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';

interface RoadmapTimelineProps {
  milestones: Milestone[];
  onTaskToggle?: (milestoneId: string, taskId: string) => void;
}

const categoryColors: Record<string, string> = {
  study: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  skill: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  research: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'self-improvement': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

export function RoadmapTimeline({ milestones, onTaskToggle }: RoadmapTimelineProps) {
  return (
    <div className="space-y-6">
      {milestones.map((milestone, index) => {
        const completedTasks = milestone.tasks.filter((t) => t.completed).length;
        const progress = milestone.tasks.length > 0 
          ? (completedTasks / milestone.tasks.length) * 100 
          : 0;
        const isCompleted = milestone.completed || progress === 100;

        return (
          <div key={milestone.id} className="relative">
            {/* Timeline Line */}
            {index < milestones.length - 1 && (
              <div
                className={cn(
                  'absolute left-6 top-14 h-[calc(100%-2rem)] w-0.5',
                  isCompleted ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            <Card className={cn(isCompleted && 'border-primary/50 bg-primary/5')}>
              <CardHeader className="flex flex-row items-start gap-4 pb-2">
                {/* Timeline Node */}
                <div
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Circle className="h-6 w-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {milestone.description}
                      </p>
                    </div>
                    <Badge
                      variant={isCompleted ? 'default' : 'secondary'}
                      className="shrink-0"
                    >
                      {completedTasks}/{milestone.tasks.length} tasks
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Due: {new Date(milestone.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pl-20">
                <div className="space-y-2">
                  {milestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-3',
                        task.completed && 'bg-muted/50 opacity-70'
                      )}
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() =>
                          onTaskToggle?.(milestone.id, task.id)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-medium',
                            task.completed && 'line-through'
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
