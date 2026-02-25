'use client';

import { isOverdue, isDueToday, formatDateShort } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaskDeadlineIndicatorProps {
  deadline: string | null;
}

export function TaskDeadlineIndicator({ deadline }: TaskDeadlineIndicatorProps) {
  if (!deadline) return null;

  const overdue = isOverdue(deadline);
  const dueToday = isDueToday(deadline);

  return (
    <span
      className={cn(
        'text-xs',
        overdue && 'font-medium text-red-600',
        dueToday && !overdue && 'font-medium text-amber-600',
        !overdue && !dueToday && 'text-gray-500'
      )}
    >
      {formatDateShort(deadline)}
    </span>
  );
}
