'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout';
import { RoadmapTimeline } from '@/components/roadmap';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Compass, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Roadmap } from '@/types';
import { cn } from '@/lib/utils';

export default function RoadmapPage() {
  const { apiFetch, isAuthenticated } = useApp();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, { passed: boolean; score: number }>>({});
  const [milestoneItemIds, setMilestoneItemIds] = useState<Record<string, number>>({});

  const fetchRoadmaps = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiFetch('/api/roadmaps');
      if (res.ok) {
        const data = await res.json();
        if (data?.roadmaps) setRoadmaps(data.roadmaps);
      }
    } catch {}
    finally { setLoading(false); }
  }, [apiFetch, isAuthenticated]);

  useEffect(() => { fetchRoadmaps(); }, [fetchRoadmaps]);

  // Fetch quiz attempts and milestone item IDs for the selected roadmap
  const currentRoadmap = roadmaps[selectedIndex];

  useEffect(() => {
    if (!currentRoadmap || !isAuthenticated) return;
    // Fetch quiz attempts
    (async () => {
      try {
        const res = await apiFetch(`/api/quiz/attempt?roadmapId=${currentRoadmap.id}`);
        if (res.ok) {
          const data = await res.json();
          const attemptsMap: Record<string, { passed: boolean; score: number }> = {};
          for (const a of (data.attempts || [])) {
            const key = String(a.item_id);
            // Keep best attempt
            if (!attemptsMap[key] || (a.passed && !attemptsMap[key].passed) || a.score > attemptsMap[key].score) {
              attemptsMap[key] = { passed: !!a.passed, score: a.score };
            }
          }
          setQuizAttempts(attemptsMap);
        }
      } catch {}
    })();

    // Build milestoneItemIds from the milestones' itemId field (no extra fetch needed)
    const mapping: Record<string, number> = {};
    for (const m of (currentRoadmap.milestones || [])) {
      if ((m as any).itemId) {
        mapping[m.id] = (m as any).itemId;
      }
    }
    setMilestoneItemIds(mapping);
  }, [apiFetch, currentRoadmap, isAuthenticated]);

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

  return (
    <AppLayout title="My Roadmap">
      <div className="space-y-6">
        {/* Career Selector — show all roadmaps as selectable cards */}
        {roadmaps.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {roadmaps.map((rm, i) => (
              <button
                key={rm.id}
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  'flex-shrink-0 rounded-lg border px-4 py-2.5 text-left transition-all cursor-pointer min-w-[180px]',
                  i === selectedIndex
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-border hover:border-primary/30'
                )}
              >
                <p className="font-medium text-sm truncate">{rm.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${rm.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium tabular-nums shrink-0">{rm.progress}%</span>
                </div>
              </button>
            ))}
          </div>
        )}

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
            <RoadmapTimeline
              milestones={currentRoadmap.milestones}
              roadmapId={currentRoadmap.id}
              quizAttempts={quizAttempts}
              milestoneItemIds={milestoneItemIds}
              onTaskToggle={async (_milestoneId, taskId) => {
                const task = currentRoadmap.milestones
                  .flatMap(m => m.tasks)
                  .find(t => t.id === taskId);
                if (!task) return;
                try {
                  const res = await apiFetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ completed: !task.completed }),
                  });
                  if (!res.ok) {
                    const err = await res.json();
                    alert(err.error || 'Failed to update task');
                    return;
                  }
                  fetchRoadmaps();
                } catch {}
              }}
              onQuizComplete={() => fetchRoadmaps()}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
