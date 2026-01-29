'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass, Map, MessageSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';

const actions = [
  {
    href: '/careers',
    label: 'Explore Careers',
    icon: Compass,
    color: 'text-blue-500',
    bg: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900',
  },
  {
    href: '/roadmap',
    label: 'View Roadmap',
    icon: Map,
    color: 'text-green-500',
    bg: 'bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900',
  },
  {
    href: '/ai-assistant',
    label: 'Ask AI Assistant',
    icon: MessageSquare,
    color: 'text-purple-500',
    bg: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900',
  },
  {
    href: '/resources',
    label: 'Study Resources',
    icon: BookOpen,
    color: 'text-orange-500',
    bg: 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-950 dark:hover:bg-orange-900',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button
                variant="ghost"
                className={`h-auto w-full flex-col gap-2 py-4 ${action.bg}`}
              >
                <action.icon className={`h-6 w-6 ${action.color}`} />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
