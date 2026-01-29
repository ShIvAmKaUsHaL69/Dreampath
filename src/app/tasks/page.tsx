'use client';

import { AppLayout } from '@/components/layout';
import { TaskList } from '@/components/tasks';
import { useApp } from '@/contexts/AppContext';

export default function TasksPage() {
  const { tasks, toggleTask } = useApp();

  return (
    <AppLayout title="Daily Tasks">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Your Tasks</h2>
          <p className="text-muted-foreground">
            Stay on track with your daily goals and build consistency.
          </p>
        </div>
        <TaskList tasks={tasks} onToggle={toggleTask} />
      </div>
    </AppLayout>
  );
}
