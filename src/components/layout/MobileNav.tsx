'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Compass, Map, CheckSquare, MessageSquare } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/careers', label: 'Careers', icon: Compass },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/ai-assistant', label: 'AI', icon: MessageSquare },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t bg-card/95 backdrop-blur-sm md:hidden">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
