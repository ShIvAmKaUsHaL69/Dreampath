'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const notifications = [
  { id: 1, title: 'Complete your daily tasks', time: '2h ago', read: false },
  { id: 2, title: 'New career added: AI Engineer', time: '1d ago', read: false },
  { id: 3, title: 'You achieved a 7-day streak!', time: '2d ago', read: true },
  { id: 4, title: 'Check out new study resources', time: '3d ago', read: true },
];

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-base font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="w-52 h-8 pl-8 text-sm"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 cursor-pointer">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel className="text-xs">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 p-3 cursor-pointer">
                <div className="flex items-center gap-2">
                  {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  <span className={`text-sm ${n.read ? 'text-muted-foreground' : 'font-medium'}`}>{n.title}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-3.5">{n.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-xs text-primary font-medium cursor-pointer">
              View all
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
