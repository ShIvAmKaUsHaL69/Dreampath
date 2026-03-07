'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home, Compass, Map, CheckSquare, MessageSquare,
  BookOpen, Users, Trophy, Settings, BarChart3, MoreHorizontal, X,
} from 'lucide-react';

const primaryNav = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/careers', label: 'Careers', icon: Compass },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/ai-assistant', label: 'AI', icon: MessageSquare },
];

const moreNav = [
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  // Close more menu on navigation
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setShowMore(false)}>
          <div
            className="absolute bottom-14 left-0 right-0 bg-card border-t rounded-t-2xl p-4 pb-2 animate-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">More</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowMore(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreNav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs cursor-pointer transition-colors',
                      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t bg-card/95 backdrop-blur-sm md:hidden">
        {primaryNav.map((item) => {
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
        <button
          onClick={() => setShowMore(!showMore)}
          className={cn(
            'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors',
            showMore || moreNav.some(n => pathname === n.href) ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          <MoreHorizontal className={cn('h-5 w-5', showMore && 'stroke-[2.5]')} />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </>
  );
}

