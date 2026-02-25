'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';

interface ProjectProgressBarProps {
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
}

export function ProjectProgressBar({
  totalTasks,
  completedTasks,
  progressPercent,
}: ProjectProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {completedTasks}/{totalTasks} tasks
        </span>
        <span>{progressPercent}%</span>
      </div>
      <ProgressBar percent={progressPercent} size="sm" />
    </div>
  );
}
