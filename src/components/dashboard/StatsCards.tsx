'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Flame, Target, TrendingUp, Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { mockAnalytics } from '@/data/mockData';

export function StatsCards() {
  const { student, tasks, currentRoadmap } = useApp();

  const completedToday = tasks.filter(
    t => t.completed && t.completedAt &&
      new Date(t.completedAt).toDateString() === new Date().toDateString()
  ).length;

  const totalToday = tasks.filter(
    t => new Date(t.dueDate).toDateString() === new Date().toDateString()
  ).length;

  const stats = [
    { label: 'Streak', value: `${student?.streak || 0}d`, icon: Flame },
    { label: 'Tasks today', value: `${completedToday}/${totalToday}`, icon: Target },
    { label: 'Weekly consistency', value: `${mockAnalytics.weeklyConsistency}%`, icon: TrendingUp },
    { label: 'Roadmap', value: `${currentRoadmap?.progress || 0}%`, icon: Clock },
  ];

  return (
    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold tracking-tight">{s.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
