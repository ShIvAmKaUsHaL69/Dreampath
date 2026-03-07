'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { TrendingUp, TrendingDown, Target, Brain, Lightbulb } from 'lucide-react';

interface AnalyticsData {
  weeklyConsistency: number;
  taskCompletionRate: number;
  skillProgress: { skill: string; progress: number }[];
  strongAreas: string[];
  weakAreas: string[];
  improvements: string[];
}

export function AnalyticsCharts() {
  const { apiFetch } = useApp();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    weeklyConsistency: 0,
    taskCompletionRate: 0,
    skillProgress: [],
    strongAreas: [],
    weakAreas: [],
    improvements: [],
  });

  useEffect(() => {
    apiFetch('/api/analytics').then(res => {
      if (res.ok) res.json().then(data => setAnalytics(data.analytics));
    }).catch(() => {});
  }, [apiFetch]);

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
              {analytics.weeklyConsistency}%
            </div>
            <Progress value={analytics.weeklyConsistency} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {analytics.weeklyConsistency >= 70 ? "You're doing great! Keep up the consistency." : "Try to be more consistent with your daily tasks."}
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
              {analytics.taskCompletionRate}%
            </div>
            <Progress value={analytics.taskCompletionRate} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {analytics.taskCompletionRate >= 60 ? "You've completed most of your assigned tasks." : "Keep working on completing your tasks!"}
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
            {analytics.skillProgress.length === 0 && (
              <p className="text-sm text-muted-foreground">Complete tasks to build your skill progress.</p>
            )}
            {analytics.skillProgress.map((skill) => (
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
              {analytics.strongAreas.length === 0 && (
                <p className="text-sm text-muted-foreground">Complete more tasks to discover your strengths.</p>
              )}
              {analytics.strongAreas.map((area) => (
                <Badge key={area} className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {area}
                </Badge>
              ))}
            </div>
            {analytics.strongAreas.length > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                These are areas where you&apos;re performing well. Keep building on them!
              </p>
            )}
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
              {analytics.weakAreas.length === 0 && (
                <p className="text-sm text-muted-foreground">No weak areas identified yet.</p>
              )}
              {analytics.weakAreas.map((area) => (
                <Badge key={area} className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  {area}
                </Badge>
              ))}
            </div>
            {analytics.weakAreas.length > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                Focus more on these areas to strengthen your profile.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      {analytics.improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analytics.improvements.map((improvement, index) => (
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
      )}
    </div>
  );
}
