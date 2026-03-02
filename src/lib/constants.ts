import { TaskStatus, TaskPriority } from '@/types/task';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.WAITING]: 'Waiting',
  [TaskStatus.DONE]: 'Done',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-700',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700',
  [TaskStatus.WAITING]: 'bg-amber-100 text-amber-700',
  [TaskStatus.DONE]: 'bg-green-100 text-green-700',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.A]: 'A — Urgent',
  [TaskPriority.B]: 'B — High',
  [TaskPriority.C]: 'C — Medium',
  [TaskPriority.D]: 'D — Low',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.A]: 'bg-red-100 text-red-700',
  [TaskPriority.B]: 'bg-orange-100 text-orange-700',
  [TaskPriority.C]: 'bg-blue-100 text-blue-700',
  [TaskPriority.D]: 'bg-gray-100 text-gray-500',
};

export const PRIORITY_DOT_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.A]: 'bg-red-500',
  [TaskPriority.B]: 'bg-orange-500',
  [TaskPriority.C]: 'bg-blue-500',
  [TaskPriority.D]: 'bg-gray-400',
};

export const DEFAULT_CLIENT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
];

export const DEFAULT_PROJECT_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f43f5e', // rose
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ef4444', // red
];

export const AUTOSAVE_DEBOUNCE_MS = 300;
export const UNDO_TTL_MS = 5000;
export const DRAG_ACTIVATION_DISTANCE = 8;
export const ORDER_INDEX_GAP = 1000;
