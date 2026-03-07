'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';

export function SkillProgress() {
  const { apiFetch } = useApp();
  const [skills, setSkills] = useState<{ skill: string; progress: number }[]>([]);

  useEffect(() => {
    apiFetch('/api/analytics').then(res => {
      if (res.ok) res.json().then(data => setSkills(data.analytics.skillProgress || []));
    }).catch(() => {});
  }, [apiFetch]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">Complete tasks to see your skill progress.</p>
        )}
        {skills.map((skill) => (
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
