'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, ArrowRight, Check, Sparkles,
  Compass, Map, Brain, ChevronRight
} from 'lucide-react';

const introScreens = [
  {
    lucideIcon: Sparkles,
    title: 'Welcome to DreamRoute',
    description: 'Your AI-powered career guide. Explore careers, build personalized roadmaps, and achieve your dreams — step by step.',
  },
  {
    lucideIcon: Compass,
    title: 'Explore Career Paths',
    description: 'Browse 100+ careers with real insights — salary, difficulty, entrance exams, and daily life info to help you decide.',
  },
  {
    lucideIcon: Map,
    title: 'Get Your Personalized Roadmap',
    description: 'Answer a few questions and we\'ll create a custom plan matching your interests, skills, and academic background.',
  },
];

const interestOptions = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Economics', 'Accountancy', 'Business Studies', 'History', 'Geography',
  'Political Science', 'Psychology', 'Sociology', 'Literature', 'Languages',
  'Art & Design', 'Music', 'Sports', 'Technology', 'Environment',
];

const hobbyOptions = [
  'Reading', 'Writing', 'Coding', 'Gaming', 'Sports',
  'Music', 'Dancing', 'Painting', 'Photography', 'Cooking',
  'Traveling', 'Volunteering', 'Debating', 'Public Speaking', 'Crafts',
];

const skillOptions = [
  'Problem Solving', 'Communication', 'Leadership', 'Creativity',
  'Analytical Thinking', 'Teamwork', 'Time Management', 'Research',
  'Writing', 'Presentation', 'Technical Skills', 'Organizational Skills',
];

export function OnboardingFlow() {
  const router = useRouter();
  const { onboardingData, setOnboardingData, setOnboardingComplete, setStudent, setIsAuthenticated } = useApp();
  const [step, setStep] = useState(0); // 0-2 = intro screens, 3-6 = data collection
  const totalSteps = 7; // 3 intro + 4 data collection
  const introStepCount = 3;

  const progress = (step / (totalSteps - 1)) * 100;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSkipIntro = () => {
    setStep(introStepCount);
  };

  const handleComplete = async () => {
    try {
      // User already registered via signup — update their profile with onboarding data
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const userData = savedUser ? JSON.parse(savedUser) : {};

      // Update profile with onboarding data
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: onboardingData.name || userData.name,
          email: onboardingData.email || userData.email,
          password: userData.password || 'temp-already-registered',
          grade: onboardingData.grade,
          stream: onboardingData.stream,
          goalIntensity: onboardingData.goalIntensity,
          interests: onboardingData.interests,
          hobbies: onboardingData.hobbies,
          skills: onboardingData.skills,
        }),
      });

      // Update local state
      const updatedUser = {
        ...userData,
        name: onboardingData.name || userData.name,
        grade: onboardingData.grade,
        stream: onboardingData.stream,
        goalIntensity: onboardingData.goalIntensity,
        interests: onboardingData.interests,
        hobbies: onboardingData.hobbies,
        skills: onboardingData.skills,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setStudent({
        id: String(updatedUser.id || '1'),
        name: updatedUser.name,
        email: updatedUser.email,
        grade: updatedUser.grade,
        stream: updatedUser.stream,
        goalIntensity: updatedUser.goalIntensity,
        interests: updatedUser.interests || [],
        hobbies: updatedUser.hobbies || [],
        skills: updatedUser.skills || [],
        dreamCareers: [],
        streak: 0,
        totalPoints: 0,
        badges: [],
        createdAt: new Date(),
      });
      setOnboardingComplete(true);
      setIsAuthenticated(true);
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding save error:', err);
      // Still redirect even on error
      setOnboardingComplete(true);
      router.push('/dashboard');
    }
  };

  const toggleArrayItem = (
    array: string[],
    item: string,
    field: 'interests' | 'hobbies' | 'skills'
  ) => {
    const newArray = array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
    setOnboardingData({ ...onboardingData, [field]: newArray });
  };

  const isStepValid = () => {
    if (step < introStepCount) return true; // intro steps always valid
    const dataStep = step - introStepCount + 1;
    switch (dataStep) {
      case 1:
        return onboardingData.grade > 0;
      case 2:
        return onboardingData.interests.length >= 3;
      case 3:
        return onboardingData.hobbies.length >= 1 && onboardingData.skills.length >= 1;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const isIntroScreen = step < introStepCount;
  const dataStep = step - introStepCount + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25">
              D
            </div>
            <span className="text-2xl font-bold">DreamRoute</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />

          {/* Intro screen titles */}
          {isIntroScreen && (
            <>
              <CardTitle className="animate-fade-in-up">{introScreens[step].title}</CardTitle>
              <CardDescription className="animate-fade-in-up stagger-1">
                {introScreens[step].description}
              </CardDescription>
            </>
          )}

          {/* Data collection titles */}
          {!isIntroScreen && (
            <>
              <CardTitle>
                {dataStep === 1 && 'Tell us about your academics'}
                {dataStep === 2 && 'What subjects interest you?'}
                {dataStep === 3 && 'Your hobbies & skills'}
                {dataStep === 4 && 'How serious are your goals?'}
              </CardTitle>
              <CardDescription>
                {dataStep === 1 && 'Select your current class and academic stream'}
                {dataStep === 2 && 'Select at least 3 subjects that interest you'}
                {dataStep === 3 && 'Help us understand you better'}
                {dataStep === 4 && 'This helps us customize your roadmap'}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Intro Screens  — Issue 11 */}
          {isIntroScreen && (() => {
            const IconComponent = introScreens[step].lucideIcon;
            return (
              <div className="flex flex-col items-center py-8" key={step}>
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
                  <IconComponent className="h-10 w-10 text-primary" />
                </div>

                {/* Dots indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {introScreens.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        i === step ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Step 1: Academic Info */}
          {!isIntroScreen && dataStep === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-3">
                <Label>Select your class</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[8, 9, 10, 11, 12].map((grade) => (
                    <Button
                      key={grade}
                      variant={onboardingData.grade === grade ? 'default' : 'outline'}
                      onClick={() => setOnboardingData({ ...onboardingData, grade })}
                      className="h-12 transition-smooth"
                    >
                      Class {grade}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Academic Stream Interest</Label>
                <RadioGroup
                  value={onboardingData.stream}
                  onValueChange={(value: 'science' | 'commerce' | 'arts' | 'undecided') =>
                    setOnboardingData({ ...onboardingData, stream: value })
                  }
                  className="grid grid-cols-2 gap-3"
                >
                  {[
                    { value: 'science', label: 'Science', desc: 'PCM/PCB' },
                    { value: 'commerce', label: 'Commerce', desc: 'Business & Finance' },
                    { value: 'arts', label: 'Arts', desc: 'Humanities' },
                    { value: 'undecided', label: 'Undecided', desc: "Not sure yet" },
                  ].map((option) => (
                    <Label
                      key={option.value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-smooth',
                        onboardingData.stream === option.value
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'hover:bg-muted hover:border-muted-foreground/20'
                      )}
                    >
                      <RadioGroupItem value={option.value} />
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-muted-foreground">{option.desc}</p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {!isIntroScreen && dataStep === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <p className="text-sm text-muted-foreground">
                Selected: {onboardingData.interests.length} / 3 minimum
              </p>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <Button
                    key={interest}
                    variant={
                      onboardingData.interests.includes(interest) ? 'default' : 'outline'
                    }
                    size="sm"
                    className="transition-smooth"
                    onClick={() =>
                      toggleArrayItem(onboardingData.interests, interest, 'interests')
                    }
                  >
                    {interest}
                    {onboardingData.interests.includes(interest) && (
                      <Check className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Hobbies & Skills */}
          {!isIntroScreen && dataStep === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="space-y-3">
                <Label>Hobbies (select at least 1)</Label>
                <div className="flex flex-wrap gap-2">
                  {hobbyOptions.map((hobby) => (
                    <Button
                      key={hobby}
                      variant={
                        onboardingData.hobbies.includes(hobby) ? 'default' : 'outline'
                      }
                      size="sm"
                      className="transition-smooth"
                      onClick={() =>
                        toggleArrayItem(onboardingData.hobbies, hobby, 'hobbies')
                      }
                    >
                      {hobby}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <Label>Skills (select at least 1)</Label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Button
                      key={skill}
                      variant={
                        onboardingData.skills.includes(skill) ? 'default' : 'outline'
                      }
                      size="sm"
                      className="transition-smooth"
                      onClick={() =>
                        toggleArrayItem(onboardingData.skills, skill, 'skills')
                      }
                    >
                      {skill}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Goal Intensity */}
          {!isIntroScreen && dataStep === 4 && (
            <div className="space-y-4 animate-fade-in-up">
              <RadioGroup
                value={onboardingData.goalIntensity}
                onValueChange={(value: 'casual' | 'serious' | 'highly-focused') =>
                  setOnboardingData({ ...onboardingData, goalIntensity: value })
                }
                className="space-y-3"
              >
                {[
                  {
                    value: 'casual',
                    label: 'Casual Explorer',
                    desc: 'I want to explore options at my own pace',
                    icon: '🌱',
                  },
                  {
                    value: 'serious',
                    label: 'Serious Planner',
                    desc: 'I want structured guidance with regular tasks',
                    icon: '🎯',
                  },
                  {
                    value: 'highly-focused',
                    label: 'Highly Focused',
                    desc: 'I have clear goals and want intensive planning',
                    icon: '🚀',
                  },
                ].map((option) => (
                  <Label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-smooth',
                      onboardingData.goalIntensity === option.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'hover:bg-muted hover:border-muted-foreground/20'
                    )}
                  >
                    <RadioGroupItem value={option.value} />
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {isIntroScreen && step === 0 ? (
              <div />
            ) : (
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-1 transition-smooth"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}

            <div className="flex items-center gap-2">
              {isIntroScreen && (
                <Button variant="ghost" onClick={handleSkipIntro} className="text-muted-foreground">
                  Skip
                </Button>
              )}
              {step < totalSteps - 1 ? (
                <Button onClick={handleNext} disabled={!isStepValid()} className="gap-1 transition-smooth">
                  {isIntroScreen ? 'Next' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleComplete} className="gap-1 shadow-lg shadow-primary/25">
                  <Sparkles className="h-4 w-4" />
                  Start My Journey
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
