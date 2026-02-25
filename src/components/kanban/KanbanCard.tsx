'use client';

import { forwardRef } from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { Task } from '@/types/task';
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { TaskDeadlineIndicator } from '@/components/tasks/TaskDeadlineIndicator';
import { Badge } from '@/components/ui/Badge';
import { PRIORITY_DOT_COLORS } from '@/lib/constants';
import { cn, isOverdue } from '@/lib/utils';

interface KanbanCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
}

export const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ task, onClick, isDragging, style, dragAttributes, dragListeners, ...props }, ref) => {
    const overdue = isOverdue(task.deadline);

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          'group cursor-pointer rounded-lg border bg-white p-3 shadow-sm transition-all hover:shadow-md',
          isDragging ? 'opacity-50 shadow-lg' : '',
          overdue ? 'border-red-200' : 'border-gray-200'
        )}
        onClick={onClick}
        {...dragAttributes}
        {...dragListeners}
        {...props}
      >
        <div className="flex items-start gap-2">
          <div className={cn('mt-1.5 h-2 w-2 flex-shrink-0 rounded-full', PRIORITY_DOT_COLORS[task.priority])} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{task.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              <TaskDeadlineIndicator deadline={task.deadline} />
            </div>
            {task.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} className="bg-gray-100 text-gray-600">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge className="bg-gray-100 text-gray-600">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            {task.projectId && (
              <div className="mt-1.5">
                <span className="text-xs text-indigo-600">
                  <svg className="inline h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75" />
                  </svg>
                  Project
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

KanbanCard.displayName = 'KanbanCard';
