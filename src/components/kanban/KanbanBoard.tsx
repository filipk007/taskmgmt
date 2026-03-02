'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useClientStore } from '@/stores/clientStore';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useUiStore } from '@/stores/uiStore';
import { useToast } from '@/components/ui/ToastProvider';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { SortControls } from './SortControls';
import { TaskDrawer } from '@/components/tasks/TaskDrawer';
import { sortTasks } from '@/hooks/useTaskFilters';
import { computeDragMove } from '@/services/dragService';
import { getOrderIndexBetween } from '@/lib/orderIndex';
import { GENERAL_COLUMN_ID } from '@/types/dnd';
import { TaskStatus } from '@/types/task';
import { DRAG_ACTIVATION_DISTANCE } from '@/lib/constants';
import type { Task } from '@/types/task';

export function KanbanBoard() {
  const clientsMap = useClientStore((s) => s.clients);
  const tasksMap = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const reorderTask = useTaskStore((s) => s.reorderTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const projects = useProjectStore((s) => s.projects);
  const kanbanSort = useUiStore((s) => s.kanbanSort);
  const openTaskDrawer = useUiStore((s) => s.openTaskDrawer);
  const { showToast } = useToast();

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Derive ordered clients from the map
  const orderedClients = useMemo(() => {
    return Object.values(clientsMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [clientsMap]);

  // Derive active tasks indexed by clientId
  const tasksByClient = useMemo(() => {
    const allTasks = Object.values(tasksMap).filter((t) => t.status !== TaskStatus.DONE);
    const map = new Map<string, Task[]>();
    map.set(GENERAL_COLUMN_ID, []);
    for (const client of orderedClients) {
      map.set(client.id, []);
    }
    for (const task of allTasks) {
      const key = task.clientId ?? GENERAL_COLUMN_ID;
      const list = map.get(key);
      if (list) {
        list.push(task);
      } else {
        // Client was deleted, move to general
        map.get(GENERAL_COLUMN_ID)!.push(task);
      }
    }
    // Sort each column by orderIndex
    for (const [key, tasks] of map) {
      map.set(key, tasks.sort((a, b) => a.orderIndex - b.orderIndex));
    }
    return map;
  }, [tasksMap, orderedClients]);

  // Build columns: General + clients
  const columns = useMemo(() => {
    const generalTasks = sortTasks(tasksByClient.get(GENERAL_COLUMN_ID) ?? [], kanbanSort);
    const cols = [
      {
        id: GENERAL_COLUMN_ID,
        name: 'General',
        color: null as string | null,
        tasks: generalTasks,
      },
    ];
    for (const client of orderedClients) {
      const clientTasks = sortTasks(tasksByClient.get(client.id) ?? [], kanbanSort);
      cols.push({
        id: client.id,
        name: client.name,
        color: client.color,
        tasks: clientTasks,
      });
    }
    return cols;
  }, [orderedClients, tasksByClient, kanbanSort]);

  const getColumnClientId = useCallback(
    (columnId: string): string | null => {
      return columnId === GENERAL_COLUMN_ID ? null : columnId;
    },
    []
  );

  const findColumnForTask = useCallback(
    (taskId: string): string | undefined => {
      for (const col of columns) {
        if (col.tasks.some((t) => t.id === taskId)) {
          return col.id;
        }
      }
      return undefined;
    },
    [columns]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasksMap[event.active.id as string];
      if (task) setActiveTask(task);
    },
    [tasksMap]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !activeTask) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const activeCol = findColumnForTask(activeId);
      let overCol: string | undefined;

      if (columns.some((c) => c.id === overId)) {
        overCol = overId;
      } else {
        overCol = findColumnForTask(overId);
      }

      if (!activeCol || !overCol || activeCol === overCol) return;

      const targetClientId = getColumnClientId(overCol);
      const targetTasks = columns.find((c) => c.id === overCol)?.tasks ?? [];
      const result = computeDragMove(activeTask, targetClientId, targetTasks, overId === overCol ? null : overId, projects);

      moveTask(activeId, result.newClientId, result.newOrderIndex);

      if (result.shouldUnassignProject) {
        updateTask({ id: activeId, projectId: null });
        showToast({
          message: result.projectName
            ? `Removed from project "${result.projectName}"`
            : 'Removed from project',
          duration: 3000,
        });
      }
    },
    [activeTask, columns, findColumnForTask, getColumnClientId, moveTask, updateTask, projects, showToast]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTask(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId === overId) return;

      const activeCol = findColumnForTask(activeId);
      const overCol = columns.some((c) => c.id === overId) ? overId : findColumnForTask(overId);

      if (activeCol && overCol && activeCol === overCol) {
        const colTasks = columns.find((c) => c.id === activeCol)?.tasks ?? [];
        const overTask = colTasks.find((t) => t.id === overId);
        if (overTask) {
          const overIndex = colTasks.indexOf(overTask);
          const above = overIndex > 0 ? colTasks[overIndex - 1].orderIndex : null;
          const below = overTask.orderIndex;
          reorderTask(activeId, getOrderIndexBetween(above, below));
        }
      }
    },
    [columns, findColumnForTask, reorderTask]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-3">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Kanban Board</h1>
        <SortControls />
      </div>
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                columnId={col.id}
                name={col.name}
                color={col.color}
                tasks={col.tasks}
                onTaskClick={openTaskDrawer}
                onAddTask={() => {}}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <KanbanCard task={activeTask} onClick={() => {}} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      </div>
      <TaskDrawer />
    </div>
  );
}
