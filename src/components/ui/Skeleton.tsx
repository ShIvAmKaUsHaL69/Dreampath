'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'rounded-lg bg-muted animate-shimmer',
                className
            )}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-9 w-full rounded-lg mt-2" />
        </div>
    );
}
