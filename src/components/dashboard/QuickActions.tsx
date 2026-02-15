'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Map, MessageSquare, BookOpen, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const actions = [
  { href: '/careers', label: 'Explore Careers', icon: Compass },
  { href: '/roadmap', label: 'View Roadmap', icon: Map },
  { href: '/ai-assistant', label: 'Ask AI', icon: MessageSquare },
  { href: '/resources', label: 'Resources', icon: BookOpen },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <action.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{action.label}</span>
            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
