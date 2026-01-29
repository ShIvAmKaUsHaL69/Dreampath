'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Resource } from '@/types';
import { ExternalLink, Video, FileText, BookOpen, Link } from 'lucide-react';

const typeIcons: Record<string, React.ElementType> = {
  video: Video,
  article: FileText,
  'exam-guide': BookOpen,
  'skill-link': Link,
};

const typeColors: Record<string, string> = {
  video: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  article: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'exam-guide': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'skill-link': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const Icon = typeIcons[resource.type] || Link;

  return (
    <Card className="group hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className={typeColors[resource.type]}>
            <Icon className="h-3 w-3 mr-1" />
            {resource.type.replace('-', ' ')}
          </Badge>
        </div>
        <h3 className="font-semibold group-hover:text-primary transition-colors mt-2">
          {resource.title}
        </h3>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {resource.description}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full gap-2" asChild>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            Open Resource
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
