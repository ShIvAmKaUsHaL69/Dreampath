'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/types';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';

interface BadgeGridProps {
  earnedBadges: Badge[];
  allBadges: Badge[];
}

export function BadgeGrid({ earnedBadges, allBadges }: BadgeGridProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {allBadges.map((badge) => {
        const isEarned = earnedIds.has(badge.id);
        const earnedBadge = earnedBadges.find((b) => b.id === badge.id);

        return (
          <Card
            key={badge.id}
            className={cn(
              'relative overflow-hidden transition-all',
              isEarned
                ? 'border-primary/50 bg-primary/5'
                : 'opacity-60 grayscale'
            )}
          >
            <CardHeader className="pb-2 text-center">
              <div
                className={cn(
                  'mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl',
                  isEarned ? 'bg-primary/10' : 'bg-muted'
                )}
              >
                {isEarned ? badge.icon : <Lock className="h-6 w-6 text-muted-foreground" />}
              </div>
              <CardTitle className="text-base mt-2">{badge.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-4">
              <p className="text-sm text-muted-foreground">{badge.description}</p>
              {isEarned && earnedBadge?.unlockedAt && (
                <p className="text-xs text-primary mt-2">
                  Unlocked:{' '}
                  {new Date(earnedBadge.unlockedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              )}
              {!isEarned && (
                <p className="text-xs text-muted-foreground mt-2">
                  Keep going to unlock!
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
