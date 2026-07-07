'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; px: number }> = {
  sm: { container: 'w-8 h-8', text: 'text-xs', px: 32 },
  md: { container: 'w-10 h-10', text: 'text-sm', px: 40 },
  lg: { container: 'w-12 h-12', text: 'text-base', px: 48 },
  xl: { container: 'w-16 h-16', text: 'text-lg', px: 64 },
};

const avatarColors = [
  'from-indigo-500 to-violet-500',
  'from-cyan-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-green-500',
  'from-blue-500 to-indigo-500',
  'from-purple-500 to-fuchsia-500',
  'from-teal-500 to-cyan-500',
];

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const { container, text, px } = sizeMap[size];
  const bgGradient = useMemo(() => getColorFromName(name), [name]);
  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        ${container} rounded-full overflow-hidden
        ring-2 ring-white/30 dark:ring-slate-700/50
        flex-shrink-0
        ${className}
      `}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={px}
          height={px}
          className="object-cover w-full h-full"
        />
      ) : (
        <div
          className={`
            w-full h-full flex items-center justify-center
            bg-gradient-to-br ${bgGradient}
            text-white font-bold ${text}
          `}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export { Avatar };
