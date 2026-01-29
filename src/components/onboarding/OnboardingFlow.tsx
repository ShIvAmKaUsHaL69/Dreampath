'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';

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
  const { onboardingData, setOnboardingData, setOnboardingComplete, setStudent } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // Create student profile from onboarding data
    setStudent({
      id: '1',
      name: onboardingData.name,
      email: onboardingData.email,
      grade: onboardingData.grade,
      stream: onboardingData.stream,
      goalIntensity: onboardingData.goalIntensity,
      interests: onboardingData.interests,
      hobbies: onboardingData.hobbies,
      skills: onboardingData.skills,
      dreamCareers: [],
      streak: 0,
      totalPoints: 0,
      badges: [],
      createdAt: new Date(),
    });
    setOnboardingComplete(true);
    router.push('/dashboard');
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
    switch (step) {
      case 1:
        return onboardingData.name.length >= 2 && onboardingData.email.includes('@');
      case 2:
        return onboardingData.grade > 0;
      case 3:
        return onboardingData.interests.length >= 3;
      case 4:
        return onboardingData.hobbies.length >= 1 && onboardingData.skills.length >= 1;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
              D
            </div>
            <span className="text-2xl font-bold">DreamPath</span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
          <CardTitle>
            {step === 1 && "Let's get to know you"}
            {step === 2 && 'Tell us about your academics'}
            {step === 3 && 'What subjects interest you?'}
            {step === 4 && 'Your hobbies & skills'}
            {step === 5 && 'How serious are your goals?'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Start by telling us your name and email'}
            {step === 2 && 'Select your current class and academic stream'}
            {step === 3 && 'Select at least 3 subjects that interest you'}
            {step === 4 && 'Help us understand you better'}
            {step === 5 && 'This helps us customize your roadmap'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={onboardingData.name}
                  onChange={(e) =>
                    setOnboardingData({ ...onboardingData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={onboardingData.email}
                  onChange={(e) =>
                    setOnboardingData({ ...onboardingData, email: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {/* Step 2: Academic Info */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Select your class</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[8, 9, 10, 11, 12].map((grade) => (
                    <Button
                      key={grade}
                      variant={onboardingData.grade === grade ? 'default' : 'outline'}
                      onClick={() => setOnboardingData({ ...onboardingData, grade })}
                      className="h-12"
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
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all',
                        onboardingData.stream === option.value
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
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

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="space-y-4">
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

          {/* Step 4: Hobbies & Skills */}
          {step === 4 && (
            <div className="space-y-6">
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

          {/* Step 5: Goal Intensity */}
          {step === 5 && (
            <div className="space-y-4">
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
                      'flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all',
                      onboardingData.goalIntensity === option.value
                        ? 'border-primary bg-primary/5'
                        : 'hover:bg-muted'
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
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!isStepValid()} className="gap-1">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="gap-1">
                <Sparkles className="h-4 w-4" />
                Start My Journey
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
