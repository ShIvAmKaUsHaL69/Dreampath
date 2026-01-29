'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockAnalytics } from '@/data/mockData';

export function SkillProgress() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Skill Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockAnalytics.skillProgress.map((skill) => (
          <div key={skill.skill} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{skill.skill}</span>
              <span className="text-muted-foreground">{skill.progress}%</span>
            </div>
            <Progress value={skill.progress} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
