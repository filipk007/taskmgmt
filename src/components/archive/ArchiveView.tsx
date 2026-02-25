'use client';

import { useState, useMemo, useCallback } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useClientStore } from '@/stores/clientStore';
import { useProjectStore } from '@/stores/projectStore';
import { useUndoStore } from '@/stores/undoStore';
import { useToast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  PRIORITY_DOT_COLORS,
  UNDO_TTL_MS,
} from '@/lib/constants';
import { TaskStatus, TaskPriority } from '@/types/task';
import { exportTasksToCSV, downloadCSV } from '@/services/csvService';
import type { Task } from '@/types/task';

type SortField = 'name' | 'priority' | 'doneAt' | 'client';
type SortDirection = 'asc' | 'desc';

export function ArchiveView() {
  const tasksMap = useTaskStore((s) => s.tasks);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const restoreTask = useTaskStore((s) => s.restoreTask);
  const clientsMap = useClientStore((s) => s.clients);
  const projectsMap = useProjectStore((s) => s.projects);
  const pushUndo = useUndoStore((s) => s.pushUndo);
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [filterClientId, setFilterClientId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<TaskPriority | null>(null);
  const [sortField, setSortField] = useState<SortField>('doneAt');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const clients = useMemo(
    () => Object.values(clientsMap).sort((a, b) => a.name.localeCompare(b.name)),
    [clientsMap]
  );

  // All done tasks
  const doneTasks = useMemo(() => {
    return Object.values(tasksMap).filter((t) => t.status === TaskStatus.DONE);
  }, [tasksMap]);

  // Filtered + sorted
  const filteredTasks = useMemo(() => {
    let list = doneTasks;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.notes.toLowerCase().includes(q)
      );
    }

    if (filterClientId === '__none__') {
      list = list.filter((t) => t.clientId === null);
    } else if (filterClientId) {
      list = list.filter((t) => t.clientId === filterClientId);
    }

    if (filterPriority) {
      list = list.filter((t) => t.priority === filterPriority);
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'priority':
          cmp = a.priority.localeCompare(b.priority);
          break;
        case 'doneAt':
          cmp = (a.doneAt ?? '').localeCompare(b.doneAt ?? '');
          break;
        case 'client': {
          const aName = a.clientId ? clientsMap[a.clientId]?.name ?? '' : '';
          const bName = b.clientId ? clientsMap[b.clientId]?.name ?? '' : '';
          cmp = aName.localeCompare(bName);
          break;
        }
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [doneTasks, search, filterClientId, filterPriority, sortField, sortDir, clientsMap]);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
    },
    [sortField]
  );

  const handleRestore = async (task: Task) => {
    await restoreTask(task.id);
    showToast({ message: `Restored "${task.name}" to To Do.`, duration: 3000 });
  };

  const handleDelete = async (id: string) => {
    const deleted = await deleteTask(id);
    if (deleted) {
      pushUndo({
        type: 'delete_task',
        label: `Deleted "${deleted.name}"`,
        payload: deleted,
        ttl: UNDO_TTL_MS,
      });
      showToast({ message: `Deleted "${deleted.name}".`, duration: UNDO_TTL_MS });
    }
  };

  const handleExportCSV = () => {
    const csv = exportTasksToCSV(filteredTasks, clientsMap, projectsMap);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `archive-${date}.csv`);
    showToast({ message: `Exported ${filteredTasks.length} tasks to CSV.`, duration: 3000 });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">&uarr;&darr;</span>;
    return <span className="text-indigo-600 ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>;
  };

  const deleteConfirmTask = deleteConfirmId ? tasksMap[deleteConfirmId] : null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Archive</h1>
          <p className="text-sm text-gray-500">
            {doneTasks.length} completed task{doneTasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleExportCSV}
          disabled={filteredTasks.length === 0}
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Client filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterClientId(null)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              filterClientId === null
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterClientId(filterClientId === '__none__' ? null : '__none__')}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              filterClientId === '__none__'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            General
          </button>
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterClientId(filterClientId === c.id ? null : c.id)}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                filterClientId === c.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
        </div>

        {/* Priority filter */}
        <select
          value={filterPriority ?? ''}
          onChange={(e) => setFilterPriority((e.target.value || null) as TaskPriority | null)}
          className="rounded-md border border-gray-300 px-2.5 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All priorities</option>
          {Object.values(TaskPriority).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filteredTasks.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={doneTasks.length === 0 ? 'No completed tasks' : 'No matching tasks'}
            description={
              doneTasks.length === 0
                ? 'Tasks marked as Done will appear here.'
                : 'Try adjusting your search or filters.'
            }
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th
                  className="cursor-pointer px-3 py-2 hover:text-gray-700"
                  onClick={() => handleSort('name')}
                >
                  Task <SortIcon field="name" />
                </th>
                <th
                  className="cursor-pointer px-3 py-2 hover:text-gray-700"
                  onClick={() => handleSort('client')}
                >
                  Client <SortIcon field="client" />
                </th>
                <th
                  className="cursor-pointer px-3 py-2 hover:text-gray-700"
                  onClick={() => handleSort('priority')}
                >
                  Priority <SortIcon field="priority" />
                </th>
                <th
                  className="cursor-pointer px-3 py-2 hover:text-gray-700"
                  onClick={() => handleSort('doneAt')}
                >
                  Completed <SortIcon field="doneAt" />
                </th>
                <th className="px-3 py-2">Tags</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTasks.map((task) => {
                const client = task.clientId ? clientsMap[task.clientId] : null;
                const project = task.projectId ? projectsMap[task.projectId] : null;
                return (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${PRIORITY_DOT_COLORS[task.priority]}`} />
                        <div>
                          <p className="font-medium text-gray-900">{task.name}</p>
                          {project && (
                            <p className="text-xs text-gray-400">{project.name}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {client ? (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: client.color }}
                          />
                          {client.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">General</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge className={PRIORITY_COLORS[task.priority]}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">
                      {task.doneAt ? new Date(task.doneAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {task.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 3 && (
                          <span className="text-[10px] text-gray-400">
                            +{task.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleRestore(task)}
                          className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Restore to To Do"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(task.id)}
                          className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete permanently"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirmTask && (
        <ConfirmDialog
          isOpen
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => handleDelete(deleteConfirmTask.id)}
          title="Delete Task"
          message={`Permanently delete "${deleteConfirmTask.name}"? This cannot be undone (except via the undo toast).`}
          confirmLabel="Delete"
        />
      )}
    </div>
  );
}
