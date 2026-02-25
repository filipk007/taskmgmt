'use client';

import { useUiStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { useUndoStore } from '@/stores/undoStore';
import { useToast } from '@/components/ui/ToastProvider';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { TaskForm } from './TaskForm';
import { UNDO_TTL_MS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export function TaskDrawer() {
  const activeTaskId = useUiStore((s) => s.activeTaskId);
  const isDrawerOpen = useUiStore((s) => s.isDrawerOpen);
  const closeTaskDrawer = useUiStore((s) => s.closeTaskDrawer);
  const tasks = useTaskStore((s) => s.tasks);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const archiveTask = useTaskStore((s) => s.archiveTask);
  const pushUndo = useUndoStore((s) => s.pushUndo);
  const executeUndo = useUndoStore((s) => s.executeUndo);
  const { showToast } = useToast();

  const task = activeTaskId ? tasks[activeTaskId] : undefined;

  const handleDelete = async () => {
    if (!task) return;
    const deleted = await deleteTask(task.id);
    if (deleted) {
      closeTaskDrawer();
      const undoId = `undo-${deleted.id}`;
      pushUndo({
        type: 'delete_task',
        label: `Deleted "${deleted.name}"`,
        payload: deleted,
        ttl: UNDO_TTL_MS,
      });
      showToast({
        message: `Task deleted`,
        action: {
          label: 'Undo',
          onClick: () => {
            const undoAction = useUndoStore.getState().actions.find(
              (a) => a.payload && (a.payload as { id: string }).id === deleted.id
            );
            if (undoAction) executeUndo(undoAction.id);
          },
        },
        duration: UNDO_TTL_MS,
      });
    }
  };

  const handleArchive = async () => {
    if (!task) return;
    const original = await archiveTask(task.id);
    if (original) {
      closeTaskDrawer();
      pushUndo({
        type: 'archive_task',
        label: `Archived "${original.name}"`,
        payload: original,
        ttl: UNDO_TTL_MS,
      });
      showToast({
        message: `Task marked as done`,
        action: {
          label: 'Undo',
          onClick: () => {
            const undoAction = useUndoStore.getState().actions.find(
              (a) => a.payload && (a.payload as { id: string }).id === original.id
            );
            if (undoAction) executeUndo(undoAction.id);
          },
        },
        duration: UNDO_TTL_MS,
      });
    }
  };

  return (
    <Drawer isOpen={isDrawerOpen} onClose={closeTaskDrawer}>
      {task ? (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="text-xs text-gray-500">
              Created {formatDate(task.createdAt)}
            </div>
            <button
              onClick={closeTaskDrawer}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <TaskForm task={task} />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="secondary" size="sm" onClick={handleArchive}>
              Mark Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-gray-500">
          No task selected
        </div>
      )}
    </Drawer>
  );
}
