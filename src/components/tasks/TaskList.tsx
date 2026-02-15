'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { Calendar, Filter, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskListProps {
  tasks: Task[];
  onToggle: (taskId: string) => void;
}

const priorityDot: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-muted-foreground/40',
};

export function TaskList({ tasks, onToggle }: TaskListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const today = new Date().toDateString();
  const tomorrow = new Date(Date.now() + 86400000).toDateString();

  const filteredTasks = tasks.filter((task) => {
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const todayTasks = filteredTasks.filter((t) => new Date(t.dueDate).toDateString() === today);
  const tomorrowTasks = filteredTasks.filter((t) => new Date(t.dueDate).toDateString() === tomorrow);
  const upcomingTasks = filteredTasks.filter(
    (t) => new Date(t.dueDate).toDateString() !== today && new Date(t.dueDate).toDateString() !== tomorrow
  );

  const TaskItem = ({ task }: { task: Task }) => (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer',
        task.completed && 'opacity-50'
      )}
      onClick={() => onToggle(task.id)}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="cursor-pointer shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', task.completed && 'line-through text-muted-foreground')}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] text-muted-foreground hidden sm:inline-flex items-center gap-1">
          <Calendar className="h-2.5 w-2.5" />
          {new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <div className={cn('h-1.5 w-1.5 rounded-full', priorityDot[task.priority])} />
        <Badge variant="secondary" className="text-[10px] font-medium">
          {task.category}
        </Badge>
      </div>
    </div>
  );

  const TaskSection = ({ label, count, tasks: sectionTasks }: { label: string; count: number; tasks: Task[] }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">{label}</CardTitle>
        <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {sectionTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs cursor-pointer">All</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs cursor-pointer">Pending</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs cursor-pointer">Done</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs cursor-pointer">
                <Filter className="h-3 w-3" />
                {categoryFilter === 'all' ? 'Category' : categoryFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['all', 'study', 'skill', 'research', 'self-improvement'].map((cat) => (
                <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)} className="cursor-pointer capitalize">
                  {cat === 'all' ? 'All Categories' : cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="gap-1.5 h-8 text-xs cursor-pointer">
            <Plus className="h-3 w-3" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Sections */}
      {todayTasks.length > 0 && (
        <TaskSection label="Today" count={todayTasks.length} tasks={todayTasks} />
      )}
      {tomorrowTasks.length > 0 && (
        <TaskSection label="Tomorrow" count={tomorrowTasks.length} tasks={tomorrowTasks} />
      )}
      {upcomingTasks.length > 0 && (
        <TaskSection label="Upcoming" count={upcomingTasks.length} tasks={upcomingTasks} />
      )}

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No tasks found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
