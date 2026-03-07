'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, X, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { apiFetch, isAuthenticated } = useApp();
  const router = useRouter();
  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; created_at: string; read: boolean }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Fetch notifications from user-facing API (with read status)
  useEffect(() => {
    if (!isAuthenticated) return;
    apiFetch('/api/notifications')
      .then(res => { if (res.ok) return res.json(); return null; })
      .then(data => {
        if (data?.notifications) {
          setNotifications(data.notifications);
        }
      })
      .catch(() => {});
  }, [apiFetch, isAuthenticated]);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/careers?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark a single notification as read — persists to DB
  const markRead = async (id: number) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await apiFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ notificationId: id }),
      });
    } catch {}
  };

  // Mark all as read
  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await apiFetch('/api/notifications', {
        method: 'PUT',
        body: JSON.stringify({ markAllRead: true }),
      });
    } catch {}
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-base font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search — Desktop */}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search careers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-52 h-8 pl-8 text-sm"
          />
        </div>

        {/* Search — Mobile toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8 cursor-pointer"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </Button>

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
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="text-xs p-0">Notifications</DropdownMenuLabel>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); markAllRead(); }}
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            {notifications.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet.</div>
            )}
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 p-3 cursor-pointer" onClick={() => !n.read && markRead(n.id)}>
                <div className="flex items-center gap-2">
                  {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  <span className={`text-sm ${n.read ? 'text-muted-foreground' : 'font-medium'}`}>{n.title}</span>
                </div>
                <span className="text-xs text-muted-foreground ml-3.5">{n.message}</span>
                <span className="text-[10px] text-muted-foreground ml-3.5">{timeAgo(n.created_at)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search bar — full width below header */}
      {showSearch && (
        <div className="absolute left-0 right-0 top-14 z-50 border-b bg-card px-4 py-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search careers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="pl-8 h-9 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
