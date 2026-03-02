'use client';

import { forwardRef, useMemo } from 'react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { Task } from '@/types/task';
import { useProjectStore } from '@/stores/projectStore';
import { useThemeStore } from '@/stores/themeStore';
import { TaskPriorityBadge } from '@/components/tasks/TaskPriorityBadge';
import { TaskStatusBadge } from '@/components/tasks/TaskStatusBadge';
import { TaskDeadlineIndicator } from '@/components/tasks/TaskDeadlineIndicator';
import { Badge } from '@/components/ui/Badge';
import { PRIORITY_DOT_COLORS } from '@/lib/constants';
import { cn, isOverdue, tintColor } from '@/lib/utils';

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
    const projects = useProjectStore((s) => s.projects);
    const theme = useThemeStore((s) => s.theme);

    const project = task.projectId ? projects[task.projectId] : null;

    const cardBg = useMemo(() => {
      if (!project?.color) return undefined;
      const tint = tintColor(project.color, 0.15);
      return theme === 'dark' ? tint.dark : tint.light;
    }, [project?.color, theme]);

    const cardBorderColor = useMemo(() => {
      if (!project?.color || overdue) return undefined;
      const tint = tintColor(project.color, 0.25);
      return theme === 'dark' ? tint.dark : tint.light;
    }, [project?.color, overdue, theme]);

    const mergedStyle: React.CSSProperties = {
      ...style,
      ...(cardBg ? { backgroundColor: cardBg } : {}),
      ...(cardBorderColor ? { borderColor: cardBorderColor } : {}),
    };

    return (
      <div
        ref={ref}
        style={mergedStyle}
        className={cn(
          'group cursor-pointer rounded-lg border p-3 shadow-sm transition-all hover:shadow-md',
          isDragging ? 'opacity-50 shadow-lg' : '',
          !cardBg && 'bg-white dark:bg-gray-800',
          overdue
            ? 'border-red-200 dark:border-red-800'
            : !cardBorderColor && 'border-gray-200 dark:border-gray-700'
        )}
        onClick={onClick}
        {...dragAttributes}
        {...dragListeners}
        {...props}
      >
        <div className="flex items-start gap-2">
          <div className={cn('mt-1.5 h-2 w-2 flex-shrink-0 rounded-full', PRIORITY_DOT_COLORS[task.priority])} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              <TaskDeadlineIndicator deadline={task.deadline} />
            </div>
            {task.tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            {project && (
              <div className="mt-1.5 flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {project.name}
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
