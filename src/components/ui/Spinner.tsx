'use client';

import React from 'react';
import { motion } from 'framer-motion';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerColor = 'indigo' | 'white' | 'slate' | 'cyan';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
};

const colorMap: Record<SpinnerColor, string> = {
  indigo: 'border-indigo-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  slate: 'border-slate-400 border-t-transparent',
  cyan: 'border-cyan-500 border-t-transparent',
};

export default function Spinner({
  size = 'md',
  color = 'indigo',
  className = '',
}: SpinnerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, rotate: 360 }}
      transition={{
        opacity: { duration: 0.2 },
        rotate: { duration: 0.8, repeat: Infinity, ease: 'linear' },
      }}
      className={`
        ${sizeMap[size]}
        border-2 rounded-full
        ${colorMap[color]}
        ${className}
      `}
    />
  );
}

export { Spinner };
