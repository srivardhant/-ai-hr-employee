'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status?: string;
  className?: string;
}

type StatusColor = {
  bg: string;
  text: string;
  dot: string;
};

const statusColors: Record<string, StatusColor> = {
  // Green statuses
  ACTIVE:    { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  COMPLETED: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  PAID:      { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  APPROVED:  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  ACCEPTED:  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  HIRED:     { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },

  // Amber statuses
  PENDING:   { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  DRAFT:     { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  ASSIGNED:  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  PROPOSED:  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  SCREENING: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },

  // Red statuses
  REJECTED:   { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  FAILED:     { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  CANCELLED:  { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
  TERMINATED: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },

  // Blue statuses
  IN_PROGRESS: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  RUNNING:     { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  INTERVIEW:   { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  SENT:        { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },

  // Purple statuses
  SCHEDULED:   { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
  SHORTLISTED: { bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500' },
};

const defaultColor: StatusColor = {
  bg: 'bg-slate-100 dark:bg-slate-700',
  text: 'text-slate-700 dark:text-slate-300',
  dot: 'bg-slate-400',
};

export default function StatusBadge({ status = 'PENDING', className = '' }: StatusBadgeProps) {
  const safeStatus = status || 'PENDING';
  const normalized = safeStatus.toUpperCase().replace(/[\s-]+/g, '_');
  const colors = statusColors[normalized] || defaultColor;

  const isAnimated = ['IN_PROGRESS', 'RUNNING', 'INTERVIEW'].includes(normalized);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5
        text-xs font-semibold rounded-full
        ${colors.bg} ${colors.text}
        ${className}
      `}
    >
      <span className="relative flex h-2 w-2">
        {isAnimated && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${colors.dot} opacity-75 animate-ping`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colors.dot}`} />
      </span>
      {safeStatus.replace(/_/g, ' ')}
    </motion.span>
  );
}

export { StatusBadge };

