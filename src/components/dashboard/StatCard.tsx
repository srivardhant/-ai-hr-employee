'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  changeType?: 'positive' | 'negative';
  icon: LucideIcon;
  color?: string;
  prefix?: string;
  suffix?: string;
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return count;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = 'positive',
  icon: Icon,
  color = 'from-indigo-600 to-violet-600',
  prefix = '',
  suffix = '',
}: StatCardProps) {
  const animatedValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.35, ease: 'easeOut' as const }}
      className="
        bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl
        rounded-2xl shadow-lg p-6
        border border-white/20 dark:border-slate-700/50
        cursor-default
      "
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {prefix}
            {animatedValue.toLocaleString()}
            {suffix}
          </p>
          {change !== undefined && (
            <div
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                changeType === 'positive'
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                  : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
              }`}
            >
              {changeType === 'positive' ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {changeType === 'positive' ? '+' : ''}
              {change}%
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}
        >
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export { StatCard };

