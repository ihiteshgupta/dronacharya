'use client';

import { Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelProgressProps {
  level: number;
  currentXP: number;
  requiredXP: number;
  title?: string;
  className?: string;
}

const levelTitles: Record<number, string> = {
  1: 'Novice',
  5: 'Apprentice',
  10: 'Explorer',
  15: 'Adventurer',
  25: 'Practitioner',
  35: 'Specialist',
  50: 'Expert',
  65: 'Virtuoso',
  80: 'Master',
  100: 'Grandmaster',
};

const levelColors: Record<number, string> = {
  1: 'from-slate-400 to-slate-500',
  5: 'from-emerald-400 to-emerald-500',
  10: 'from-blue-400 to-blue-500',
  25: 'from-violet-400 to-violet-500',
  50: 'from-amber-400 to-amber-500',
  75: 'from-rose-400 to-rose-500',
  100: 'from-violet-500 via-cyan-400 to-violet-500',
};

function getTitle(level: number): string {
  const thresholds = Object.keys(levelTitles)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (level >= threshold) {
      return levelTitles[threshold];
    }
  }
  return 'Novice';
}

function getLevelColor(level: number): string {
  const thresholds = Object.keys(levelColors)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (level >= threshold) {
      return levelColors[threshold];
    }
  }
  return levelColors[1];
}

export function LevelProgress({
  level,
  currentXP,
  requiredXP,
  title,
  className,
}: LevelProgressProps) {
  const progress = requiredXP > 0 ? (currentXP / requiredXP) * 100 : 0;
  const displayTitle = title || getTitle(level);
  const colorClass = getLevelColor(level);
  const isHighLevel = level >= 50;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Level Badge and Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div
            className={cn(
              'relative flex items-center justify-center w-12 h-12 rounded-xl',
              'bg-gradient-to-br shadow-lg',
              colorClass,
              isHighLevel && 'animate-level-glow'
            )}
          >
            <span className="text-white font-bold text-lg">{level}</span>
            {isHighLevel && (
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-amber animate-pulse" />
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{displayTitle}</span>
            <span className="text-xs text-muted-foreground">
              Level {level}
            </span>
          </div>
        </div>

        {/* XP Counter */}
        <div className="text-right">
          <span className="text-sm font-bold text-foreground">
            {currentXP.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            {' / '}{requiredXP.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 rounded-full bg-muted overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-foreground/10"
              style={{ left: `${(i + 1) * 10}%` }}
            />
          ))}
        </div>

        {/* Progress fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            'bg-gradient-to-r relative overflow-hidden',
            colorClass
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 animate-shimmer" />
        </div>

        {/* Next level marker */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Star className="w-3 h-3 text-muted-foreground/50" />
        </div>
      </div>

      {/* Progress percentage */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(progress)}% complete</span>
        <span>{(requiredXP - currentXP).toLocaleString()} XP to next level</span>
      </div>
    </div>
  );
}
