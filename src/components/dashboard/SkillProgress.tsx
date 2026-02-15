'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockAnalytics } from '@/data/mockData';

export function SkillProgress() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAnalytics.skillProgress.map((skill) => (
          <div key={skill.skill} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{skill.skill}</span>
              <span className="text-muted-foreground tabular-nums">{skill.progress}%</span>
            </div>
            <Progress value={skill.progress} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
