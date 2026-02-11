'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPDisplayProps {
  xp: number;
  recentGain?: number;
  className?: string;
}

export function XPDisplay({ xp, recentGain = 0, className }: XPDisplayProps) {
  return (
    <div
      className={cn(
        'relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full',
        'bg-amber/15 border border-amber/20',
        'transition-all duration-300 hover:bg-amber/20',
        className
      )}
    >
      <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber text-white">
        <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="currentColor" />
      </div>
      <span className="font-bold text-xs sm:text-sm tabular-nums text-amber">
        {xp.toLocaleString()}
      </span>
      <span className="text-xs text-amber/70 font-medium hidden md:inline">XP</span>

      <AnimatePresence>
        {recentGain > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.5 }}
            animate={{ opacity: 1, y: -24, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -top-1 right-0 flex items-center gap-0.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald text-white text-xs font-bold shadow-lg"
          >
            <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            +{recentGain}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
