'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Career } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/components/ui/Toaster';
import { useRouter } from 'next/navigation';
import {
  Briefcase, GraduationCap, BookOpen, Building2, AlertTriangle,
  TrendingUp, Clock, DollarSign, Heart, Target, ArrowLeft, Plus, Loader2, Check,
} from 'lucide-react';
import Link from 'next/link';

const levelColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  'very-high': 'bg-red-100 text-red-700',
};

// Predefined starter tasks for each career category
function generateStarterTasks(career: Career): { title: string; description: string; category: string; priority: string }[] {
  const tasks = [
    {
      title: `Research about ${career.title}`,
      description: `Learn about what a ${career.title} does daily, career growth, and salary prospects.`,
      category: 'research',
      priority: 'high',
    },
    {
      title: `Understand academic path for ${career.title}`,
      description: `Study the required degrees, entrance exams (${career.entranceExams.slice(0, 2).join(', ')}), and college options.`,
      category: 'study',
      priority: 'high',
    },
    {
      title: `Assess your skills for ${career.title}`,
      description: `Review the skills needed: ${career.skillsRequired.slice(0, 3).join(', ')}. Identify gaps.`,
      category: 'self-improvement',
      priority: 'medium',
    },
    {
      title: `Create a study plan for entrance exams`,
      description: `Plan your preparation schedule for ${career.entranceExams.join(', ')}.`,
      category: 'study',
      priority: 'high',
    },
    {
      title: `Talk to a ${career.title} professional`,
      description: `Find and connect with someone working as a ${career.title} to learn from their experience.`,
      category: 'research',
      priority: 'medium',
    },
    {
      title: `Practice ${career.skillsRequired[0] || 'core skills'}`,
      description: `Start building the most important skill: ${career.skillsRequired[0] || 'problem solving'}.`,
      category: 'skill',
      priority: 'medium',
    },
  ];
  return tasks;
}

interface CareerDetailProps {
  career: Career;
}

export function CareerDetail({ career }: CareerDetailProps) {
  const { apiFetch, fetchTasks } = useApp();
  const { showToast } = useToast();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToGoals = async () => {
    if (adding || added) return;
    setAdding(true);
    try {
      // 1. Create roadmap
      const today = new Date();
      const endDate = new Date(today);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const roadmapRes = await apiFetch('/api/roadmaps', {
        method: 'POST',
        body: JSON.stringify({
          careerId: career.id,
          title: `${career.title} Career Path`,
          description: `Roadmap to become a ${career.title}`,
          startDate: today.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          milestones: [
            { title: 'Research & Exploration', description: 'Understand the career path', dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] },
            { title: 'Skill Assessment', description: 'Identify and start building required skills', dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] },
            { title: 'Exam Preparation', description: 'Begin entrance exam preparation', dueDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0] },
          ],
        }),
      });

      if (!roadmapRes.ok) {
        const err = await roadmapRes.json();
        throw new Error(err.error || 'Failed to create roadmap');
      }

      // 2. Fetch admin-defined predefined tasks, fallback to auto-generated
      let starterTasks: { title: string; description: string; category: string; priority: string }[] = [];
      try {
        const dtRes = await apiFetch(`/api/careers/${career.id}/default-tasks`);
        if (dtRes.ok) {
          const dtData = await dtRes.json();
          if (dtData.tasks?.length > 0) {
            starterTasks = dtData.tasks.map((t: any) => ({ title: t.title, description: t.description || '', category: t.category, priority: t.priority }));
          }
        }
      } catch {}
      if (starterTasks.length === 0) {
        starterTasks = generateStarterTasks(career);
      }
      for (const task of starterTasks) {
        const dueDate = new Date(Date.now() + Math.floor(Math.random() * 7 + 1) * 86400000);
        await apiFetch('/api/tasks', {
          method: 'POST',
          body: JSON.stringify({
            ...task,
            dueDate: dueDate.toISOString().split('T')[0],
          }),
        });
      }

      // 3. Refresh tasks in context
      if (fetchTasks) await fetchTasks();

      setAdded(true);
      showToast(`${career.title} added to your goals! ${starterTasks.length} starter tasks created.`, 'success');

      // Navigate to roadmap after a short delay
      setTimeout(() => router.push('/roadmap'), 1500);
    } catch (error: any) {
      showToast(error.message || 'Failed to add career to goals', 'error');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/careers">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 gap-1 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Careers
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {career.category}
            </Badge>
            <h1 className="text-3xl font-bold">{career.title}</h1>
          </div>
          <p className="mt-2 text-muted-foreground max-w-2xl">{career.description}</p>
        </div>
        <Button
          className="gap-2 cursor-pointer"
          onClick={handleAddToGoals}
          disabled={adding || added}
        >
          {adding ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
          ) : added ? (
            <><Check className="h-4 w-4" /> Added to Goals</>
          ) : (
            <><Plus className="h-4 w-4" /> Add to My Goals</>
          )}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Duration</span>
            </div>
            <p className="font-semibold">{career.studyDuration}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Salary Range</span>
            </div>
            <p className="font-semibold">{career.averageSalary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Growth</span>
            </div>
            <Badge className={levelColors[career.growthPotential]}>
              {career.growthPotential.replace('-', ' ')}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">Risk Level</span>
            </div>
            <Badge className={levelColors[career.riskLevel]}>
              {career.riskLevel}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Info */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic Path</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="reality">Reality Check</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Daily Life of a {career.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{career.dailyLife}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Lifestyle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{career.lifestyle}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {career.academicPath.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Entrance Exams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {career.entranceExams.map((exam) => (
                    <Badge key={exam} variant="outline">
                      {exam}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  College Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {career.collegeTypes.map((college) => (
                    <Badge key={college} variant="secondary">
                      {college}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Required Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {career.skillsRequired.map((skill) => (
                  <div
                    key={skill}
                    className="flex items-center gap-2 rounded-lg border p-3"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reality" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Competition Level</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${levelColors[career.realityCheck.competition]} text-base py-1 px-3`}>
                  {career.realityCheck.competition.replace('-', ' ')}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  This indicates how competitive the field is for job placements and career advancement.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Difficulty Level</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${levelColors[career.realityCheck.difficulty]} text-base py-1 px-3`}>
                  {career.realityCheck.difficulty.replace('-', ' ')}
                </Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  This reflects the academic and professional challenges you may face.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Backup Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                If this career path doesn&apos;t work out, consider these alternatives:
              </p>
              <div className="flex flex-wrap gap-2">
                {career.realityCheck.backupOptions.map((option) => (
                  <Badge key={option} variant="outline" className="text-base py-1">
                    {option}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
