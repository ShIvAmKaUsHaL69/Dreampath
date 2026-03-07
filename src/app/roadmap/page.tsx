'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout';
import { RoadmapOverview, RoadmapTimeline } from '@/components/roadmap';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Compass, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Roadmap } from '@/types';

export default function RoadmapPage() {
  const { apiFetch, isAuthenticated } = useApp();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    apiFetch('/api/roadmaps')
      .then(res => { if (res.ok) return res.json(); return null; })
      .then(data => {
        if (data?.roadmaps) setRoadmaps(data.roadmaps);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiFetch, isAuthenticated]);

  if (loading) {
    return (
      <AppLayout title="My Roadmap">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (roadmaps.length === 0) {
    return (
      <AppLayout title="My Roadmap">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <Compass className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Roadmap Yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven&apos;t selected a career path yet. Explore careers and choose your dream goal to get a personalized roadmap.
          </p>
          <Link href="/careers">
            <Button className="gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              Explore Careers
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  const currentRoadmap = roadmaps[0]; // Show the most recent roadmap

  return (
    <AppLayout title="My Roadmap">
      <div className="space-y-6">
        {/* Roadmap header */}
        <div>
          <h2 className="text-xl font-bold tracking-tight">{currentRoadmap.title}</h2>
          {currentRoadmap.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{currentRoadmap.description}</p>
          )}
        </div>

        {/* Progress overview */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-bold tabular-nums">{currentRoadmap.progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${currentRoadmap.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Started: {new Date(currentRoadmap.startDate).toLocaleDateString()}</span>
              <span>Target: {new Date(currentRoadmap.endDate).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        {currentRoadmap.milestones && currentRoadmap.milestones.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Milestones</h3>
            <RoadmapTimeline milestones={currentRoadmap.milestones} />
          </div>
        )}

        {/* Other roadmaps */}
        {roadmaps.length > 1 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Other Career Paths</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {roadmaps.slice(1).map((rm) => (
                <Card key={rm.id} className="cursor-pointer hover:border-primary/30 transition-colors">
                  <CardContent className="pt-4">
                    <h4 className="font-medium">{rm.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{rm.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full" style={{ width: `${rm.progress}%` }} />
                      </div>
                      <span className="text-xs font-medium tabular-nums">{rm.progress}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
