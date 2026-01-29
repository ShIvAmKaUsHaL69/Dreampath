'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
    {
      title: 'Current Streak',
      value: `${student?.streak || 0} days`,
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      description: 'Keep it up!',
    },
    {
      title: 'Tasks Today',
      value: `${completedToday}/${totalToday}`,
      icon: Target,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      description: `${totalToday - completedToday} remaining`,
    },
    {
      title: 'Weekly Consistency',
      value: `${mockAnalytics.weeklyConsistency}%`,
      icon: TrendingUp,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: 'Great progress!',
    },
    {
      title: 'Roadmap Progress',
      value: `${currentRoadmap?.progress || 0}%`,
      icon: Clock,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      description: 'On track',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
