import type { Task } from '@/types/task';
import { TaskPriority, TaskStatus } from '@/types/task';
import type { SortConfig } from '@/types/common';

const PRIORITY_ORDER: Record<string, number> = {
  [TaskPriority.A]: 0,
  [TaskPriority.B]: 1,
  [TaskPriority.C]: 2,
  [TaskPriority.D]: 3,
};

const STATUS_ORDER: Record<string, number> = {
  [TaskStatus.IN_PROGRESS]: 0,
  [TaskStatus.TODO]: 1,
  [TaskStatus.WAITING]: 2,
  [TaskStatus.DONE]: 3,
};

export function sortTasks(tasks: Task[], config: SortConfig): Task[] {
  const sorted = [...tasks];
  const dir = config.direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    switch (config.field) {
      case 'priority':
        return dir * (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      case 'deadline': {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return dir * a.deadline.localeCompare(b.deadline);
      }
      case 'status':
        return dir * (STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
      case 'createdAt':
        return dir * a.createdAt.localeCompare(b.createdAt);
      case 'name':
        return dir * a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return sorted;
}
