'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Career } from '@/types';
import { TrendingUp, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const difficultyColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'very-high': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const growthColors: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-yellow-500',
  high: 'text-green-500',
  'very-high': 'text-emerald-500',
};

interface CareerCardProps {
  career: Career;
  onCompare?: (careerId: string) => void;
  isSelected?: boolean;
}

export function CareerCard({ career, onCompare, isSelected }: CareerCardProps) {
  return (
    <Card className={`group transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <Badge variant="secondary" className="mb-2">
              {career.category}
            </Badge>
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
              {career.title}
            </h3>
          </div>
          <div className={`flex items-center gap-1 ${growthColors[career.growthPotential]}`}>
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium capitalize">{career.growthPotential.replace('-', ' ')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {career.description}
        </p>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{career.studyDuration}</span>
          </div>
          <Badge variant="outline" className={difficultyColors[career.realityCheck.difficulty]}>
            <AlertTriangle className="h-3 w-3 mr-1" />
            {career.realityCheck.difficulty.replace('-', ' ')} difficulty
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {career.skillsRequired.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {career.skillsRequired.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{career.skillsRequired.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/careers/${career.id}`} className="flex-1">
          <Button variant="outline" className="w-full gap-1">
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
        {onCompare && (
          <Button
            variant={isSelected ? 'default' : 'secondary'}
            size="icon"
            onClick={() => onCompare(career.id)}
            title="Add to comparison"
          >
            {isSelected ? '✓' : '+'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
