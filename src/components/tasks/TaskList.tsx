'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const categoryColors: Record<string, string> = {
  study: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  skill: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  research: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'self-improvement': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
};

const priorityColors: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-gray-400',
};

const priorityDots: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-gray-400',
};

export function TaskList({ tasks, onToggle }: TaskListProps) {
  const [filter, setFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const today = new Date().toDateString();
  const tomorrow = new Date(Date.now() + 86400000).toDateString();

  const filteredTasks = tasks.filter((task) => {
    if (categoryFilter !== 'all' && task.category !== categoryFilter) {
      return false;
    }
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  const todayTasks = filteredTasks.filter(
    (t) => new Date(t.dueDate).toDateString() === today
  );
  const tomorrowTasks = filteredTasks.filter(
    (t) => new Date(t.dueDate).toDateString() === tomorrow
  );
  const upcomingTasks = filteredTasks.filter(
    (t) =>
      new Date(t.dueDate).toDateString() !== today &&
      new Date(t.dueDate).toDateString() !== tomorrow
  );

  const TaskItem = ({ task }: { task: Task }) => (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border-l-4 bg-card p-4 shadow-sm transition-all hover:shadow-md',
        priorityColors[task.priority],
        task.completed && 'opacity-60'
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-1"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              className={cn(
                'font-medium',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {task.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-2 rounded-full', priorityDots[task.priority])} />
            <Badge
              variant="secondary"
              className={cn('shrink-0', categoryColors[task.category])}
            >
              {task.category}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {new Date(task.dueDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setCategoryFilter('all')}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('study')}>
                Study
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('skill')}>
                Skill
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('research')}>
                Research
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCategoryFilter('self-improvement')}>
                Self-Improvement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Today's Tasks */}
      {todayTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Today
              <Badge variant="secondary">{todayTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tomorrow's Tasks */}
      {tomorrowTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              Tomorrow
              <Badge variant="secondary">{tomorrowTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tomorrowTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Upcoming
              <Badge variant="secondary">{upcomingTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </CardContent>
        </Card>
      )}

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
