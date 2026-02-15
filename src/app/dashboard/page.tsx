'use client';

import { AppLayout } from '@/components/layout';
import { StatsCards, TodayTasks, StreakCalendar, QuickActions, SkillProgress } from '@/components/dashboard';
import { useApp } from '@/contexts/AppContext';

export default function DashboardPage() {
  const { student } = useApp();

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6 ">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Welcome back, {student?.name?.split(' ')[0] || 'Student'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Here&apos;s your progress overview.
          </p>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TodayTasks />
          </div>
          <div className="space-y-6">
            <StreakCalendar />
            <QuickActions />
            <SkillProgress />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
