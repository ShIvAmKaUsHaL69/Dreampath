'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Career } from '@/types';
import { X, Check, AlertTriangle } from 'lucide-react';

interface CareerComparisonProps {
  careers: Career[];
  onRemove: (careerId: string) => void;
  onClear: () => void;
}

const levelColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  'very-high': 'bg-red-100 text-red-700',
};

export function CareerComparison({ careers, onRemove, onClear }: CareerComparisonProps) {
  if (careers.length === 0) return null;

  const comparisonFields = [
    { label: 'Category', getValue: (c: Career) => c.category },
    { label: 'Study Duration', getValue: (c: Career) => c.studyDuration },
    { label: 'Average Salary', getValue: (c: Career) => c.averageSalary },
    {
      label: 'Growth Potential',
      getValue: (c: Career) => (
        <Badge className={levelColors[c.growthPotential]}>
          {c.growthPotential.replace('-', ' ')}
        </Badge>
      ),
    },
    {
      label: 'Risk Level',
      getValue: (c: Career) => (
        <Badge className={levelColors[c.riskLevel]}>{c.riskLevel}</Badge>
      ),
    },
    {
      label: 'Competition',
      getValue: (c: Career) => (
        <Badge className={levelColors[c.realityCheck.competition]}>
          {c.realityCheck.competition.replace('-', ' ')}
        </Badge>
      ),
    },
    {
      label: 'Difficulty',
      getValue: (c: Career) => (
        <Badge className={levelColors[c.realityCheck.difficulty]}>
          {c.realityCheck.difficulty.replace('-', ' ')}
        </Badge>
      ),
    },
    { label: 'Lifestyle', getValue: (c: Career) => c.lifestyle },
    {
      label: 'Key Skills',
      getValue: (c: Career) => (
        <div className="flex flex-wrap gap-1">
          {c.skillsRequired.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      label: 'Entrance Exams',
      getValue: (c: Career) => (
        <div className="flex flex-wrap gap-1">
          {c.entranceExams.slice(0, 3).map((exam) => (
            <Badge key={exam} variant="outline" className="text-xs">
              {exam}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Compare Careers
          <Badge variant="secondary">{careers.length} selected</Badge>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 min-w-[150px]"></th>
                {careers.map((career) => (
                  <th key={career.id} className="text-left p-2 min-w-[200px]">
                    <div className="flex items-start justify-between">
                      <span className="font-semibold">{career.title}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onRemove(career.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field, index) => (
                <tr key={field.label} className={index % 2 === 0 ? 'bg-muted/30' : ''}>
                  <td className="p-2 font-medium text-muted-foreground">
                    {field.label}
                  </td>
                  {careers.map((career) => (
                    <td key={career.id} className="p-2">
                      {field.getValue(career)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
