'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useApp } from '@/contexts/AppContext';
import {
  Home, Compass, Map, CheckSquare, BarChart3,
  MessageSquare, BookOpen, Users, Trophy,
  Settings, Moon, Sun, LogOut, Flame,
} from 'lucide-react';

const mainNav = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/careers', label: 'Careers', icon: Compass },
  { href: '/roadmap', label: 'Roadmap', icon: Map },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/progress', label: 'Progress', icon: BarChart3 },
  { href: '/ai-assistant', label: 'AI Assistant', icon: MessageSquare },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
];

export function Sidebar() {
  const pathname = usePathname();
  const { student, theme, toggleTheme, logout } = useApp();

  return (
    <div className="flex h-full w-60 flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-5 border-b">
        <span className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-xs font-extrabold">D</span>
        <span className="text-base font-bold tracking-tight">DreamRoute</span>
      </div>

      {/* User */}
      <div className="px-5 py-4 border-b">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-muted text-foreground grid place-items-center text-sm font-bold">
            {student?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{student?.name || 'Student'}</p>
            <p className="text-xs text-muted-foreground">Class {student?.grade || '10'}</p>
          </div>
        </div>
        {(student?.streak ?? 0) > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-medium text-muted-foreground">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            {student?.streak} day streak
          </div>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3 px-3">
        <nav className="space-y-0.5">
          {mainNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-2.5 h-9 text-sm font-medium cursor-pointer',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom */}
      <div className="border-t px-3 py-3 space-y-0.5">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2.5 h-9 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </Button>
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-2.5 h-9 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
        <Button variant="ghost" onClick={() => logout()} className="w-full justify-start gap-2.5 h-9 text-sm font-medium text-destructive hover:text-destructive cursor-pointer">
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
        <div className="flex gap-3 px-3 pt-2 text-[11px] text-muted-foreground">
          <a href="#privacy" className="hover:text-foreground transition-colors cursor-pointer">Privacy</a>
          <span className="opacity-30">·</span>
          <a href="#terms" className="hover:text-foreground transition-colors cursor-pointer">Terms</a>
        </div>
      </div>
    </div>
  );
}
