'use client';

import { AppLayout } from '@/components/layout';
import { BadgeGrid } from '@/components/achievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { allBadges } from '@/data/mockData';
import { Trophy, Flame, Star } from 'lucide-react';

export default function AchievementsPage() {
  const { student } = useApp();

  return (
    <AppLayout title="Achievements">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Your Achievements</h2>
          <p className="text-muted-foreground">
            Track your milestones and unlock badges as you progress.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Badges Earned
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student?.badges.length || 0}/{allBadges.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student?.streak || 0} days</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Points
              </CardTitle>
              <Star className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student?.totalPoints.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Badges</h3>
          <BadgeGrid
            earnedBadges={student?.badges || []}
            allBadges={allBadges}
          />
        </div>
      </div>
    </AppLayout>
  );
}
