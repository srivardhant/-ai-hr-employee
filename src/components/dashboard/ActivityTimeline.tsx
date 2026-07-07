'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  FileText,
  Star,
  Calendar,
  DollarSign,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';

/* ────────────── Types ────────────── */

export interface Activity {
  id: string;
  title: string;
  description?: string;
  time: string;
  type: 'recruitment' | 'document' | 'performance' | 'meeting' | 'payroll' | 'general';
  icon?: LucideIcon;
}

interface ActivityTimelineProps {
  activities: Activity[];
  className?: string;
}

/* ────────────── Icon Map ────────────── */

const iconMap: Record<Activity['type'], { icon: LucideIcon; color: string }> = {
  recruitment: { icon: UserPlus, color: 'from-indigo-500 to-violet-500' },
  document: { icon: FileText, color: 'from-cyan-500 to-teal-500' },
  performance: { icon: Star, color: 'from-amber-500 to-orange-500' },
  meeting: { icon: Calendar, color: 'from-blue-500 to-indigo-500' },
  payroll: { icon: DollarSign, color: 'from-emerald-500 to-green-500' },
  general: { icon: CheckCircle, color: 'from-slate-400 to-slate-500' },
};

/* ────────────── Container Variants ────────────── */

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

/* ────────────── Component ────────────── */

export default function ActivityTimeline({
  activities,
  className = '',
}: ActivityTimelineProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`space-y-0 ${className}`}
    >
      {activities.map((activity, idx) => {
        const config = iconMap[activity.type] || iconMap.general;
        const Icon = activity.icon || config.icon;
        const isLast = idx === activities.length - 1;

        return (
          <motion.div
            key={activity.id}
            variants={itemVariants}
            className="relative flex gap-4 group"
          >
            {/* Vertical Line + Dot */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 rounded-xl bg-gradient-to-br ${config.color}
                  flex items-center justify-center flex-shrink-0
                  shadow-md group-hover:shadow-lg transition-shadow duration-200
                `}
              >
                <Icon size={16} className="text-white" />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-2 mb-0" />
              )}
            </div>

            {/* Content */}
            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {activity.title}
              </p>
              {activity.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activity.description}
                </p>
              )}
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-1 block">
                {activity.time}
              </span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export { ActivityTimeline };
