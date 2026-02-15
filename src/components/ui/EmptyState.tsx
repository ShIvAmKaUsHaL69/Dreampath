'use client';

import { ReactNode } from 'react';
import { Button } from './button';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in-up">
            {icon && (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary text-3xl">
                    {icon}
                </div>
            )}
            <h3 className="text-title mb-2">{title}</h3>
            <p className="text-body text-muted-foreground max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="gap-2">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
