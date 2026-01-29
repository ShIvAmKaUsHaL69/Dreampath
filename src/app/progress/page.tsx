'use client';

import { AppLayout } from '@/components/layout';
import { AnalyticsCharts } from '@/components/progress';

export default function ProgressPage() {
  return (
    <AppLayout title="Progress & Analytics">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Your Progress</h2>
          <p className="text-muted-foreground">
            Track your performance and identify areas for improvement.
          </p>
        </div>
        <AnalyticsCharts />
      </div>
    </AppLayout>
  );
}
