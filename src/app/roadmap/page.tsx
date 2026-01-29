'use client';

import { AppLayout } from '@/components/layout';
import { RoadmapOverview, RoadmapTimeline } from '@/components/roadmap';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Plus, Compass } from 'lucide-react';
import Link from 'next/link';

export default function RoadmapPage() {
  const { currentRoadmap } = useApp();

  if (!currentRoadmap) {
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
            <Button className="gap-2">
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
        <RoadmapOverview roadmap={currentRoadmap} />
        <div>
          <h3 className="text-xl font-semibold mb-4">Milestones</h3>
          <RoadmapTimeline milestones={currentRoadmap.milestones} />
        </div>
      </div>
    </AppLayout>
  );
}
