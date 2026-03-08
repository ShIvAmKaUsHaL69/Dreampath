'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Milestone, Task } from '@/types';
import { cn } from '@/lib/utils';
import { Calendar, CheckCircle2, Circle, Clock, Lock, Award } from 'lucide-react';
import { QuizModal } from '@/components/quiz/QuizModal';

interface RoadmapTimelineProps {
  milestones: Milestone[];
  roadmapId?: string;
  quizAttempts?: Record<string, { passed: boolean; score: number }>;
  milestoneItemIds?: Record<string, number>; // milestone id → career_roadmap_item id
  onTaskToggle?: (milestoneId: string, taskId: string) => void;
  onQuizComplete?: () => void;
}

const categoryColors: Record<string, string> = {
  study: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  skill: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  research: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'self-improvement': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

export function RoadmapTimeline({
  milestones, roadmapId, quizAttempts = {}, milestoneItemIds = {},
  onTaskToggle, onQuizComplete,
}: RoadmapTimelineProps) {
  const [quizFor, setQuizFor] = useState<number | null>(null);

  // Determine which milestones are "quiz gates" and if they're passed
  // Tasks after a failed/unattempted quiz milestone are locked
  let locked = false;

  return (
    <div className="space-y-6">
      {quizFor && roadmapId && (
        <QuizModal
          milestoneItemId={quizFor}
          roadmapId={roadmapId}
          onClose={() => setQuizFor(null)}
          onComplete={(passed) => {
            if (passed && onQuizComplete) onQuizComplete();
            setQuizFor(null);
          }}
        />
      )}

      {milestones.map((milestone, index) => {
        const completedTasks = milestone.tasks.filter((t) => t.completed).length;
        const progress = milestone.tasks.length > 0
          ? (completedTasks / milestone.tasks.length) * 100
          : 0;
        const isCompleted = milestone.completed || progress === 100;
        const itemId = milestoneItemIds[milestone.id];
        const quizStatus = itemId ? quizAttempts[String(itemId)] : undefined;
        const hasQuiz = !!itemId;
        const quizPassed = quizStatus?.passed || false;
        const isLocked = locked;

        // After rendering this milestone, check if next items should be locked
        // If this milestone has a quiz and it's not passed, lock everything after
        if (hasQuiz && !quizPassed && !isCompleted) {
          locked = true;
        }

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

            <Card className={cn(
              isCompleted && 'border-primary/50 bg-primary/5',
              isLocked && 'opacity-60'
            )}>
              <CardHeader className="flex flex-row items-start gap-3 sm:gap-4 pb-2">
                {/* Timeline Node */}
                <div
                  className={cn(
                    'flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full',
                    isLocked ? 'bg-muted' :
                    isCompleted
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {isLocked ? (
                    <Lock className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
                  ) : (
                    <Circle className="h-5 w-5 sm:h-6 sm:w-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg">{milestone.title}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0">
                      {hasQuiz && (
                        quizPassed ? (
                          <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Quiz Passed</Badge>
                        ) : quizStatus ? (
                          <Badge variant="destructive" className="gap-1">Quiz Failed ({quizStatus.score}%)</Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1"><Award className="h-3 w-3" /> Quiz Available</Badge>
                        )
                      )}
                      <Badge
                        variant={isCompleted ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {completedTasks}/{milestone.tasks.length} tasks
                      </Badge>
                    </div>
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

                  {/* Quiz Button */}
                  {hasQuiz && !quizPassed && !isLocked && (
                    <Button
                      size="sm" variant={quizStatus ? 'outline' : 'default'}
                      className="mt-3 gap-2 cursor-pointer"
                      onClick={() => setQuizFor(itemId!)}
                    >
                      <Award className="h-4 w-4" />
                      {quizStatus ? 'Retry Quiz' : 'Take Quiz'}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pl-[3.25rem] sm:pl-20">
                <div className="space-y-2">
                  {milestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        'flex items-start gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3',
                        task.completed && 'bg-muted/50 opacity-70',
                        isLocked && 'cursor-not-allowed'
                      )}
                    >
                      <Checkbox
                        checked={task.completed}
                        disabled={isLocked}
                        onCheckedChange={() =>
                          !isLocked && onTaskToggle?.(milestone.id, task.id)
                        }
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'font-medium',
                            task.completed && 'line-through',
                            isLocked && 'text-muted-foreground'
                          )}
                        >
                          {task.title}
                          {isLocked && <Lock className="inline h-3 w-3 ml-2 text-muted-foreground" />}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {task.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn('shrink-0 text-xs hidden sm:inline-flex', categoryColors[task.category])}
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
