'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Roadmap } from '@/types';
import { Calendar, Target, Clock, TrendingUp } from 'lucide-react';

interface RoadmapOverviewProps {
  roadmap: Roadmap;
}

export function RoadmapOverview({ roadmap }: RoadmapOverviewProps) {
  const totalTasks = roadmap.milestones.reduce(
    (acc, m) => acc + m.tasks.length,
    0
  );
  const completedTasks = roadmap.milestones.reduce(
    (acc, m) => acc + m.tasks.filter((t) => t.completed).length,
    0
  );
  const completedMilestones = roadmap.milestones.filter((m) => m.completed).length;

  const daysRemaining = Math.ceil(
    (new Date(roadmap.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="secondary" className="mb-2">
              Active Roadmap
            </Badge>
            <CardTitle className="text-xl">{roadmap.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {roadmap.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm font-bold">{roadmap.progress}%</span>
          </div>
          <Progress value={roadmap.progress} className="h-3" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="text-xs">Milestones</span>
            </div>
            <p className="text-lg font-semibold">
              {completedMilestones}/{roadmap.milestones.length}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Tasks Done</span>
            </div>
            <p className="text-lg font-semibold">
              {completedTasks}/{totalTasks}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Days Left</span>
            </div>
            <p className="text-lg font-semibold">{daysRemaining}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">End Date</span>
            </div>
            <p className="text-lg font-semibold">
              {new Date(roadmap.endDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
