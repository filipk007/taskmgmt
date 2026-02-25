'use client';

import { useMemo, useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { useClientStore } from '@/stores/clientStore';
import { useUndoStore } from '@/stores/undoStore';
import { useToast } from '@/components/ui/ToastProvider';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProjectProgressBar } from './ProjectProgressBar';
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS, PRIORITY_LABELS, UNDO_TTL_MS } from '@/lib/constants';
import { TaskStatus } from '@/types/task';
import type { ProjectWithProgress } from '@/types/project';

interface ProjectDetailPanelProps {
  project: ProjectWithProgress | null;
  onClose: () => void;
  onEdit: () => void;
}

export function ProjectDetailPanel({ project, onClose, onEdit }: ProjectDetailPanelProps) {
  const tasksMap = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const clientsMap = useClientStore((s) => s.clients);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const pushUndo = useUndoStore((s) => s.pushUndo);
  const { showToast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const projectTasks = useMemo(() => {
    if (!project) return [];
    return Object.values(tasksMap)
      .filter((t) => t.projectId === project.id)
      .sort((a, b) => {
        // Sort: non-done first, then by priority
        if (a.status === TaskStatus.DONE && b.status !== TaskStatus.DONE) return 1;
        if (a.status !== TaskStatus.DONE && b.status === TaskStatus.DONE) return -1;
        return a.priority.localeCompare(b.priority);
      });
  }, [project, tasksMap]);

  const projectClients = useMemo(() => {
    if (!project) return [];
    return project.clientIds.map((id) => clientsMap[id]).filter(Boolean);
  }, [project, clientsMap]);

  if (!project) return null;

  const isCompleted = project.completedAt !== null;

  const handleToggleComplete = async () => {
    await updateProject({
      id: project.id,
      completedAt: isCompleted ? null : new Date().toISOString(),
    });
  };

  const handleDelete = async () => {
    // Unassign tasks from this project
    for (const task of projectTasks) {
      await updateTask({ id: task.id, projectId: null });
    }
    const deleted = await deleteProject(project.id);
    if (deleted) {
      pushUndo({
        type: 'delete_project',
        label: `Deleted "${deleted.name}"`,
        payload: deleted,
        ttl: UNDO_TTL_MS,
      });
      showToast({
        message: `Deleted "${deleted.name}". Tasks unassigned.`,
        duration: UNDO_TTL_MS,
      });
    }
    onClose();
  };

  return (
    <>
      <Drawer isOpen={!!project} onClose={onClose}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {project.name}
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {/* Status + Progress */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                {isCompleted ? (
                  <Badge className="bg-green-100 text-green-700">Completed</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                )}
              </div>
              <ProjectProgressBar
                totalTasks={project.totalTasks}
                completedTasks={project.completedTasks}
                progressPercent={project.progressPercent}
              />
            </div>

            {/* Description */}
            {project.description && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Description
                </h4>
                <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            )}

            {/* Clients */}
            {projectClients.length > 0 && (
              <div>
                <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Clients
                </h4>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {projectClients.map((client) => (
                    <span
                      key={client.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      {client.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Tasks ({projectTasks.length})
              </h4>
              {projectTasks.length === 0 ? (
                <p className="mt-2 text-sm text-gray-400">
                  No tasks assigned to this project yet.
                </p>
              ) : (
                <ul className="mt-2 divide-y divide-gray-100">
                  {projectTasks.map((task) => {
                    const client = task.clientId ? clientsMap[task.clientId] : null;
                    return (
                      <li
                        key={task.id}
                        className="flex items-center gap-2 py-2"
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                            PRIORITY_COLORS[task.priority].split(' ')[0]
                          }`}
                        />
                        <span
                          className={`text-sm flex-1 ${
                            task.status === TaskStatus.DONE
                              ? 'text-gray-400 line-through'
                              : 'text-gray-800'
                          }`}
                        >
                          {task.name}
                        </span>
                        <Badge className={STATUS_COLORS[task.status] + ' text-[10px]'}>
                          {STATUS_LABELS[task.status]}
                        </Badge>
                        {client && (
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: client.color }}
                            title={client.name}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 px-6 py-3 flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleComplete}
            >
              {isCompleted ? 'Reopen' : 'Mark Complete'}
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Drawer>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? Tasks will be unassigned from the project but not deleted.`}
        confirmLabel="Delete"
      />
    </>
  );
}
