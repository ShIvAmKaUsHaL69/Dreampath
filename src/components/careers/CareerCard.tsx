'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Career } from '@/types';
import { TrendingUp, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface CareerCardProps {
  career: Career;
  onCompare?: (careerId: string) => void;
  isSelected?: boolean;
  index?: number;
}

export function CareerCard({ career, onCompare, isSelected }: CareerCardProps) {
  return (
    <Card
      className={`
        group transition-colors duration-200 cursor-pointer
        hover:border-primary/30
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Badge variant="secondary" className="text-[10px] font-medium mb-2">
              {career.category}
            </Badge>
            <h3 className="text-base font-semibold tracking-tight group-hover:text-primary transition-colors">
              {career.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <TrendingUp className="h-3 w-3" />
            <span className="capitalize">{career.growthPotential.replace('-', ' ')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {career.description}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {career.studyDuration}
          </span>
          <span className="capitalize">{career.realityCheck.difficulty.replace('-', ' ')}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {career.skillsRequired.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="outline" className="text-[10px] font-normal">
              {skill}
            </Badge>
          ))}
          {career.skillsRequired.length > 3 && (
            <Badge variant="outline" className="text-[10px] font-normal">
              +{career.skillsRequired.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/careers/${career.id}`} className="flex-1">
          <Button variant="ghost" className="w-full gap-1 text-sm font-medium cursor-pointer group/btn">
            Details
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </Link>
        {onCompare && (
          <Button
            variant={isSelected ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCompare(career.id)}
            className="cursor-pointer text-xs"
          >
            {isSelected ? '✓ Compare' : 'Compare'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
