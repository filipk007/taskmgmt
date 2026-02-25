'use client';

import { Badge } from '@/components/ui/Badge';
import { PRIORITY_COLORS } from '@/lib/constants';
import type { TaskPriority } from '@/types/task';

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  return (
    <Badge className={PRIORITY_COLORS[priority]}>
      {priority}
    </Badge>
  );
}
