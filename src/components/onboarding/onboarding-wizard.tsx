'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useOnboardingStore, type OnboardingData } from '@/stores/onboarding-store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Code,
  Brain,
  Zap,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  Clock,
  Rocket,
  GraduationCap,
  Flame,
  CheckCircle,
} from 'lucide-react';

const DOMAINS = [
  {
    id: 'python',
    name: 'Python',
    description: 'Learn programming fundamentals with Python',
    icon: Code,
    color: 'from-emerald-500 to-cyan-500',
  },
  {
    id: 'data-science',
    name: 'Data Science',
    description: 'Master data analysis and visualization',
    icon: Brain,
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'machine-learning',
    name: 'AI & Machine Learning',
    description: 'Build intelligent systems and models',
    icon: Zap,
    color: 'from-amber-500 to-rose-500',
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'New to programming',
    icon: Sparkles,
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Some programming experience',
    icon: Target,
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Experienced developer',
    icon: Rocket,
  },
];

const LEARNING_PACES = [
  {
    id: 'relaxed',
    name: 'Relaxed',
    description: '15-20 min/day',
    dailyGoal: 15,
    icon: Clock,
  },
  {
    id: 'steady',
    name: 'Steady',
    description: '30-45 min/day',
    dailyGoal: 30,
    icon: Target,
  },
  {
    id: 'intensive',
    name: 'Intensive',
    description: '60+ min/day',
    dailyGoal: 60,
    icon: Flame,
  },
];

interface OnboardingWizardProps {
  open: boolean;
  onComplete?: () => void;
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const { currentStep, data, nextStep, prevStep, updateData, completeOnboarding } =
    useOnboardingStore();

  const handleComplete = () => {
    completeOnboarding();
    onComplete?.();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true; // Welcome step always allows proceeding
      case 1:
        return data.domains.length > 0;
      case 2:
        return data.experienceLevel !== null;
      case 3:
        return data.learningPace !== null;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <DomainsStep data={data} updateData={updateData} />;
      case 2:
        return <ExperienceStep data={data} updateData={updateData} />;
      case 3:
        return <PaceStep data={data} updateData={updateData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-xl overflow-hidden"
        showCloseButton={false}
      >
        {/* Progress indicator */}
        <div className="flex gap-1 mb-2">
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                step <= currentStep ? 'gradient-brand' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={cn(currentStep === 0 && 'invisible')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="gradient-brand text-white"
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canProceed()}
              className="gradient-brand text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Start Learning
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WelcomeStep() {
  return (
    <div className="text-center py-4">
      <div className="mb-6 flex justify-center">
        <div className="relative w-20 h-20">
          <Image
            src="/brand/logo.svg"
            alt="Dronacharya"
            fill
            className="object-contain"
          />
        </div>
      </div>
      <DialogHeader>
        <DialogTitle className="text-2xl">
          Welcome to <span className="gradient-text">Dronacharya</span>
        </DialogTitle>
        <DialogDescription className="text-base mt-2">
          Your AI guru for mastering programming, data science, and machine learning.
          Let&apos;s personalize your learning journey.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="p-3">
          <GraduationCap className="h-8 w-8 mx-auto text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Personalized Learning</p>
        </div>
        <div className="p-3">
          <Brain className="h-8 w-8 mx-auto text-amber-500 mb-2" />
          <p className="text-sm text-muted-foreground">AI-Powered Tutoring</p>
        </div>
        <div className="p-3">
          <Target className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
          <p className="text-sm text-muted-foreground">Track Progress</p>
        </div>
      </div>
    </div>
  );
}

interface StepProps {
  data: OnboardingData;
  updateData: (partial: Partial<OnboardingData>) => void;
}

function DomainsStep({ data, updateData }: StepProps) {
  const toggleDomain = (domainId: string) => {
    const newDomains = data.domains.includes(domainId)
      ? data.domains.filter((d) => d !== domainId)
      : [...data.domains, domainId];
    updateData({ domains: newDomains });
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>What do you want to learn?</DialogTitle>
        <DialogDescription>
          Select one or more domains to focus on. You can always change this later.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-3">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isSelected = data.domains.includes(domain.id);

          return (
            <Card
              key={domain.id}
              className={cn(
                'p-4 cursor-pointer transition-all border-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-muted-foreground/20'
              )}
              onClick={() => toggleDomain(domain.id)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'p-2.5 rounded-xl bg-gradient-to-br text-white',
                    domain.color
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{domain.name}</h3>
                  <p className="text-sm text-muted-foreground">{domain.description}</p>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceStep({ data, updateData }: StepProps) {
  return (
    <div>
      <DialogHeader>
        <DialogTitle>What&apos;s your experience level?</DialogTitle>
        <DialogDescription>
          This helps us tailor the content to your skill level.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-3">
        {EXPERIENCE_LEVELS.map((level) => {
          const Icon = level.icon;
          const isSelected = data.experienceLevel === level.id;

          return (
            <Card
              key={level.id}
              className={cn(
                'p-4 cursor-pointer transition-all border-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-muted-foreground/20'
              )}
              onClick={() =>
                updateData({ experienceLevel: level.id as OnboardingData['experienceLevel'] })
              }
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{level.name}</h3>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PaceStep({ data, updateData }: StepProps) {
  return (
    <div>
      <DialogHeader>
        <DialogTitle>Set your learning pace</DialogTitle>
        <DialogDescription>
          How much time can you dedicate to learning each day?
        </DialogDescription>
      </DialogHeader>

      <div className="mt-4 space-y-3">
        {LEARNING_PACES.map((pace) => {
          const Icon = pace.icon;
          const isSelected = data.learningPace === pace.id;

          return (
            <Card
              key={pace.id}
              className={cn(
                'p-4 cursor-pointer transition-all border-2',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-muted-foreground/20'
              )}
              onClick={() =>
                updateData({
                  learningPace: pace.id as OnboardingData['learningPace'],
                  dailyGoal: pace.dailyGoal,
                })
              }
            >
              <div className="flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-muted">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{pace.name}</h3>
                  <p className="text-sm text-muted-foreground">{pace.description}</p>
                </div>
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  )}
                >
                  {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
