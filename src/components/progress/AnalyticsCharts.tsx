'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { mockAnalytics } from '@/data/mockData';
import { TrendingUp, TrendingDown, Target, Brain, Lightbulb } from 'lucide-react';

export function AnalyticsCharts() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Weekly Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              {mockAnalytics.weeklyConsistency}%
            </div>
            <Progress value={mockAnalytics.weeklyConsistency} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              You&apos;re doing great! Keep up the consistency.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              {mockAnalytics.taskCompletionRate}%
            </div>
            <Progress value={mockAnalytics.taskCompletionRate} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              You&apos;ve completed most of your assigned tasks.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Skill Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Skill Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAnalytics.skillProgress.map((skill) => (
              <div key={skill.skill} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{skill.skill}</span>
                  <span className="text-muted-foreground">{skill.progress}%</span>
                </div>
                <div className="relative">
                  <Progress value={skill.progress} className="h-3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strong & Weak Areas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockAnalytics.strongAreas.map((area) => (
                <Badge key={area} className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {area}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              These are areas where you&apos;re performing well. Keep building on them!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-500" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {mockAnalytics.weakAreas.map((area) => (
                <Badge key={area} className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  {area}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Focus more on these areas to strengthen your profile.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {mockAnalytics.improvements.map((improvement, index) => (
              <li key={index} className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {index + 1}
                </div>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
