import type { TaskStatus, TaskPriority, Task } from './task';
import type { Project } from './project';
import type { Client } from './client';

export type SortField = 'deadline' | 'priority' | 'status' | 'createdAt' | 'name';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  search: string;
  statuses: TaskStatus[];
  priorities: TaskPriority[];
  clientIds: string[];
  projectId: string | null;
  tags: string[];
  hasDeadline: boolean | null;
  isOverdue: boolean | null;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  tasks: Task[];
  projects: Project[];
  clients: Client[];
}
