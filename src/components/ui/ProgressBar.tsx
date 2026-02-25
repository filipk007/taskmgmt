'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percent: number;
  className?: string;
  size?: 'sm' | 'md';
}

export function ProgressBar({ percent, className, size = 'md' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className={cn(
        'w-full rounded-full bg-gray-200',
        size === 'sm' ? 'h-1.5' : 'h-2',
        className
      )}
    >
      <div
        className={cn(
          'rounded-full transition-all duration-300',
          size === 'sm' ? 'h-1.5' : 'h-2',
          clamped === 100 ? 'bg-green-500' : 'bg-indigo-500'
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
