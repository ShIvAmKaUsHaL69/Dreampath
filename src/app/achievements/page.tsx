'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { BadgeGrid } from '@/components/achievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { Badge as BadgeType } from '@/types';
import { Trophy, Flame, Star, Loader2 } from 'lucide-react';

export default function AchievementsPage() {
  const { student, apiFetch } = useApp();
  const [badges, setBadges] = useState<(BadgeType & { unlockedAt: Date | null })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/achievements')
      .then(res => res.json())
      .then(data => setBadges(data.badges || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiFetch]);

  const earnedCount = badges.filter(b => b.unlockedAt).length;

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
                {earnedCount}/{badges.length}
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
                {student?.totalPoints?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Badges</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <BadgeGrid
              earnedBadges={student?.badges || []}
              allBadges={badges}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
}
