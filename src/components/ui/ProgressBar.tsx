'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  color?: 'auto' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan';
}

function getAutoColor(percent: number): string {
  if (percent < 30) return 'from-rose-500 to-pink-500';
  if (percent < 60) return 'from-amber-500 to-orange-500';
  return 'from-emerald-500 to-teal-500';
}

const colorMap: Record<string, string> = {
  indigo: 'from-indigo-500 to-violet-500',
  emerald: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-500 to-orange-500',
  rose: 'from-rose-500 to-pink-500',
  cyan: 'from-cyan-500 to-teal-500',
};

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  className = '',
  color = 'auto',
}: ProgressBarProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const gradient = color === 'auto' ? getAutoColor(percent) : colorMap[color];

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' as const, delay: 0.2 }}
          className={`h-full bg-gradient-to-r ${gradient} rounded-full shadow-sm`}
        />
      </div>
    </div>
  );
}

export { ProgressBar };
