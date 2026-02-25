import type { Task } from '@/types/task';
import type { Client } from '@/types/client';
import type { Project } from '@/types/project';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/constants';

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTasksToCSV(
  tasks: Task[],
  clients: Record<string, Client>,
  projects: Record<string, Project>
): string {
  const headers = [
    'Name',
    'Status',
    'Priority',
    'Client',
    'Project',
    'Deadline',
    'Tags',
    'Notes',
    'Created',
    'Completed',
  ];

  const rows = tasks.map((task) => [
    escapeCSV(task.name),
    STATUS_LABELS[task.status],
    PRIORITY_LABELS[task.priority],
    task.clientId ? escapeCSV(clients[task.clientId]?.name ?? '') : '',
    task.projectId ? escapeCSV(projects[task.projectId]?.name ?? '') : '',
    task.deadline ?? '',
    escapeCSV(task.tags.join(', ')),
    escapeCSV(task.notes),
    task.createdAt.split('T')[0],
    task.doneAt ? task.doneAt.split('T')[0] : '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
