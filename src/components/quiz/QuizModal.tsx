'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import {
  CheckCircle, XCircle, Trophy, RotateCcw, ArrowRight, X, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizModalProps {
  milestoneItemId: number;
  roadmapId: string;
  onClose: () => void;
  onComplete: (passed: boolean) => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
}

export function QuizModal({ milestoneItemId, roadmapId, onClose, onComplete }: QuizModalProps) {
  const { apiFetch } = useApp();
  const [loading, setLoading] = useState(true);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [passingScore, setPassingScore] = useState(50);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number; correct: number; total: number; passed: boolean;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(`/api/quiz/${milestoneItemId}`);
        if (res.ok) {
          const data = await res.json();
          setMilestoneTitle(data.milestone.title);
          setPassingScore(data.milestone.passing_score);
          setQuestions(data.questions);
        }
      } finally { setLoading(false); }
    })();
  }, [apiFetch, milestoneItemId]);

  const selectOption = (optionIndex: number) => {
    if (result) return;
    setAnswers({ ...answers, [String(questions[current].id)]: optionIndex });
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/quiz/attempt', {
        method: 'POST',
        body: JSON.stringify({ milestoneItemId, roadmapId, answers }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        onComplete(data.passed);
      }
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4"><CardContent className="py-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Card className="w-full max-w-lg mx-4">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No questions available for this quiz yet.</p>
            <Button onClick={onClose} className="mt-4 cursor-pointer">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = questions[current];
  const answered = answers[String(q?.id)] !== undefined;
  const allAnswered = Object.keys(answers).length === questions.length;
  const progressPct = ((current + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{milestoneTitle}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Pass: {passingScore}% • {questions.length} question{questions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer"><X className="h-4 w-4" /></Button>
          </div>
          {!result && (
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Question {current + 1} of {questions.length}</span>
                <span>{Object.keys(answers).length} answered</span>
              </div>
              <Progress value={progressPct} className="h-1.5" />
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {/* Result Screen */}
          {result ? (
            <div className="text-center space-y-6 py-4">
              <div className={cn(
                'mx-auto flex h-20 w-20 items-center justify-center rounded-full',
                result.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              )}>
                {result.passed
                  ? <Trophy className="h-10 w-10 text-green-600" />
                  : <XCircle className="h-10 w-10 text-red-600" />}
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  {result.passed ? 'Congratulations!' : 'Keep Trying!'}
                </h3>
                <p className="text-muted-foreground mt-1">
                  {result.passed
                    ? 'You passed the quiz! Next tasks are now unlocked.'
                    : `You need ${passingScore}% to pass. Try again!`}
                </p>
              </div>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{result.score}%</p>
                  <p className="text-xs text-muted-foreground">Your Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{result.correct}/{result.total}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
              </div>
              <Badge variant={result.passed ? 'default' : 'destructive'} className="text-sm px-4 py-1">
                {result.passed ? 'PASSED' : 'FAILED'}
              </Badge>
              <div className="flex gap-3 justify-center pt-2">
                {!result.passed && (
                  <Button variant="outline" onClick={() => { setResult(null); setAnswers({}); setCurrent(0); }} className="gap-2 cursor-pointer">
                    <RotateCcw className="h-4 w-4" /> Retry
                  </Button>
                )}
                <Button onClick={onClose} className="gap-2 cursor-pointer">
                  {result.passed ? <><ArrowRight className="h-4 w-4" /> Continue</> : 'Close'}
                </Button>
              </div>
            </div>
          ) : (
            /* Question Screen */
            <div className="space-y-6">
              <h3 className="text-lg font-semibold leading-snug">{q.question}</h3>
              <div className="grid gap-3">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => selectOption(i)}
                    className={cn(
                      'flex items-center gap-3 w-full text-left rounded-lg border p-4 transition-all cursor-pointer hover:border-primary/50',
                      answers[String(q.id)] === i
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border'
                    )}
                  >
                    <span className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
                      answers[String(q.id)] === i
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm">{opt}</span>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline" size="sm"
                  disabled={current === 0}
                  onClick={() => setCurrent(current - 1)}
                  className="cursor-pointer"
                >Previous</Button>
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={cn(
                        'h-2.5 w-2.5 rounded-full cursor-pointer transition-colors',
                        i === current ? 'bg-primary' : answers[String(questions[i].id)] !== undefined ? 'bg-primary/40' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                {current < questions.length - 1 ? (
                  <Button size="sm" disabled={!answered} onClick={() => setCurrent(current + 1)} className="cursor-pointer">
                    Next
                  </Button>
                ) : (
                  <Button size="sm" disabled={!allAnswered || submitting} onClick={submit} className="cursor-pointer gap-2">
                    {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                    Submit
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
