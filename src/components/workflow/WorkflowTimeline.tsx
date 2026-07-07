'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Circle,
  type LucideIcon,
} from 'lucide-react';

/* ────────────── Types ────────────── */

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  status: StepStatus;
  result?: string;
  duration?: string;
  icon?: LucideIcon;
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStep?: number;
  className?: string;
}

/* ────────────── Status Config ────────────── */

interface StatusConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  lineColor: string;
  pulse: boolean;
}

const statusConfig: Record<'pending' | 'running' | 'completed' | 'failed', StatusConfig> = {
  pending: {
    icon: Circle,
    color: 'text-slate-400 dark:text-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    lineColor: 'bg-slate-200 dark:bg-slate-700',
    pulse: false,
  },
  running: {
    icon: Loader2,
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    lineColor: 'bg-blue-200 dark:bg-blue-800',
    pulse: true,
  },
  completed: {
    icon: CheckCircle,
    color: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    lineColor: 'bg-emerald-300 dark:bg-emerald-700',
    pulse: false,
  },
  failed: {
    icon: XCircle,
    color: 'text-rose-500 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-500/10',
    lineColor: 'bg-rose-300 dark:bg-rose-700',
    pulse: false,
  },
};

/* ────────────── Animation Variants ────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ────────────── Component ────────────── */

export default function WorkflowTimeline({
  steps,
  className = '',
}: WorkflowTimelineProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-0 ${className}`}
    >
      {steps.map((step, idx) => {
        const normalizedStatus = step.status.toLowerCase() as 'pending' | 'running' | 'completed' | 'failed';
        const config = statusConfig[normalizedStatus];
        const StatusIcon = step.icon || config.icon;
        const isLast = idx === steps.length - 1;

        return (
          <motion.div
            key={step.id}
            variants={stepVariants}
            className="relative flex gap-4"
          >
            {/* ─── Timeline Node ─── */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                  ${config.bgColor} border-2
                  ${normalizedStatus === 'completed' ? 'border-emerald-300 dark:border-emerald-600' : ''}
                  ${normalizedStatus === 'running' ? 'border-blue-300 dark:border-blue-600' : ''}
                  ${normalizedStatus === 'failed' ? 'border-rose-300 dark:border-rose-600' : ''}
                  ${normalizedStatus === 'pending' ? 'border-slate-200 dark:border-slate-700' : ''}
                `}
              >
                {config.pulse && (
                  <span className="absolute w-10 h-10 rounded-full bg-blue-400/30 dark:bg-blue-400/20 animate-ping" />
                )}
                <StatusIcon
                  size={18}
                  className={`relative z-10 ${config.color} ${
                    normalizedStatus === 'running' ? 'animate-spin' : ''
                  }`}
                />
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 ${config.lineColor} mt-2 min-h-[24px]`}
                />
              )}
            </div>

            {/* ─── Content ─── */}
            <div className={`pb-8 ${isLast ? 'pb-0' : ''} pt-1.5`}>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {step.name}
              </p>
              {step.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {step.description}
                </p>
              )}
              {step.result && (
                <div className="mt-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
                  <p className="text-xs text-slate-600 dark:text-slate-300">{step.result}</p>
                </div>
              )}
              {step.duration && (
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                  <Clock size={11} />
                  {step.duration}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export { WorkflowTimeline };
