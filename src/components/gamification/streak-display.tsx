'use client';

import { Flame, Snowflake } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  freezesAvailable?: number;
  className?: string;
}

export function StreakDisplay({
  streak,
  freezesAvailable = 0,
  className,
}: StreakDisplayProps) {
  const isOnFire = streak >= 7;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full cursor-help',
              'bg-rose/15 border border-rose/20',
              'transition-all duration-300 hover:bg-rose/20',
              isOnFire && 'animate-level-glow',
              className
            )}
          >
            <div className={cn(
              'flex items-center justify-center',
              isOnFire && 'animate-streak-fire'
            )}>
              <Flame
                className={cn(
                  'h-3.5 w-3.5 sm:h-4 sm:w-4 text-rose',
                  isOnFire && 'drop-shadow-[0_0_8px_var(--rose)]'
                )}
                fill={isOnFire ? 'currentColor' : 'none'}
              />
            </div>
            <span className="font-bold text-xs sm:text-sm tabular-nums text-rose">
              {streak}
            </span>
            <span className="text-xs text-rose/70 font-medium hidden md:inline">
              day{streak !== 1 ? 's' : ''}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-3 max-w-[250px]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-rose shrink-0" fill="currentColor" />
              <span className="font-bold text-sm sm:text-base">{streak} day streak!</span>
            </div>
            {isOnFire && (
              <p className="text-xs text-emerald font-medium">
                You&apos;re on fire! Keep it up!
              </p>
            )}
            {freezesAvailable > 0 && (
              <div className="flex items-center gap-1.5 pt-1 border-t">
                <Snowflake className="h-4 w-4 text-cyan shrink-0" />
                <span className="text-xs text-muted-foreground">
                  {freezesAvailable} streak freeze{freezesAvailable !== 1 ? 's' : ''} available
                </span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
