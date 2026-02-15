'use client';

import { AppLayout } from '@/components/layout';
import { TaskList } from '@/components/tasks';
import { useApp } from '@/contexts/AppContext';

export default function TasksPage() {
  const { tasks, toggleTask } = useApp();

  return (
    <AppLayout title="Tasks">
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Your Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Stay on track with your daily goals.
          </p>
        </div>
        <TaskList tasks={tasks} onToggle={toggleTask} />
      </div>
    </AppLayout>
  );
}
