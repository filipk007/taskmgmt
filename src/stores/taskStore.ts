import { create } from 'zustand';
import type { Task, TaskCreate, TaskUpdate } from '@/types/task';
import { TaskStatus } from '@/types/task';
import { getTaskRepository } from '@/repositories';
import { generateId, nowISO } from '@/lib/utils';
import { getOrderIndexAtEnd } from '@/lib/orderIndex';

interface TaskState {
  tasks: Record<string, Task>;
  isLoaded: boolean;

  hydrate: () => Promise<void>;
  addTask: (input: TaskCreate) => Promise<Task>;
  updateTask: (input: TaskUpdate) => Promise<void>;
  deleteTask: (id: string) => Promise<Task | undefined>;
  moveTask: (id: string, newClientId: string | null, newOrderIndex: number) => Promise<void>;
  reorderTask: (id: string, newOrderIndex: number) => Promise<void>;
  archiveTask: (id: string) => Promise<Task | undefined>;
  restoreTask: (id: string) => Promise<void>;
  bulkUpdateOrder: (updates: { id: string; orderIndex: number }[]) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: {},
  isLoaded: false,

  hydrate: async () => {
    const repo = getTaskRepository();
    const all = await repo.getAll();
    const tasks: Record<string, Task> = {};
    for (const t of all) tasks[t.id] = t;
    set({ tasks, isLoaded: true });
  },

  addTask: async (input) => {
    const now = nowISO();
    const currentTasks = Object.values(get().tasks).filter(
      (t) => t.clientId === input.clientId && t.status !== TaskStatus.DONE
    );
    const task: Task = {
      id: input.id ?? generateId(),
      name: input.name,
      clientId: input.clientId,
      projectId: input.projectId,
      status: input.status,
      priority: input.priority,
      deadline: input.deadline,
      tags: input.tags,
      notes: input.notes,
      links: input.links,
      dependencies: input.dependencies,
      orderIndex: input.orderIndex ?? getOrderIndexAtEnd(currentTasks),
      createdAt: now,
      updatedAt: now,
      doneAt: null,
    };
    const repo = getTaskRepository();
    await repo.create(task);
    set((state) => ({
      tasks: { ...state.tasks, [task.id]: task },
    }));
    return task;
  },

  updateTask: async (input) => {
    const { id, ...changes } = input;
    const now = nowISO();
    const updatedChanges: Partial<Task> = { ...changes, updatedAt: now };

    if (changes.status === TaskStatus.DONE) {
      const existing = get().tasks[id];
      if (existing && existing.status !== TaskStatus.DONE) {
        updatedChanges.doneAt = now;
      }
    }
    if (changes.status && changes.status !== TaskStatus.DONE) {
      const existing = get().tasks[id];
      if (existing && existing.status === TaskStatus.DONE) {
        updatedChanges.doneAt = null;
      }
    }

    const repo = getTaskRepository();
    await repo.update(id, updatedChanges);
    set((state) => {
      const existing = state.tasks[id];
      if (!existing) return state;
      return {
        tasks: { ...state.tasks, [id]: { ...existing, ...updatedChanges } },
      };
    });
  },

  deleteTask: async (id) => {
    const existing = get().tasks[id];
    if (!existing) return undefined;
    const repo = getTaskRepository();
    await repo.delete(id);
    set((state) => {
      const { [id]: _, ...rest } = state.tasks;
      return { tasks: rest };
    });
    return existing;
  },

  moveTask: async (id, newClientId, newOrderIndex) => {
    const now = nowISO();
    const changes: Partial<Task> = {
      clientId: newClientId,
      orderIndex: newOrderIndex,
      updatedAt: now,
    };
    const repo = getTaskRepository();
    await repo.update(id, changes);
    set((state) => {
      const existing = state.tasks[id];
      if (!existing) return state;
      return {
        tasks: { ...state.tasks, [id]: { ...existing, ...changes } },
      };
    });
  },

  reorderTask: async (id, newOrderIndex) => {
    const now = nowISO();
    const changes: Partial<Task> = { orderIndex: newOrderIndex, updatedAt: now };
    const repo = getTaskRepository();
    await repo.update(id, changes);
    set((state) => {
      const existing = state.tasks[id];
      if (!existing) return state;
      return {
        tasks: { ...state.tasks, [id]: { ...existing, ...changes } },
      };
    });
  },

  archiveTask: async (id) => {
    const existing = get().tasks[id];
    if (!existing) return undefined;
    const now = nowISO();
    const changes: Partial<Task> = {
      status: TaskStatus.DONE,
      doneAt: now,
      updatedAt: now,
    };
    const repo = getTaskRepository();
    await repo.update(id, changes);
    set((state) => {
      const task = state.tasks[id];
      if (!task) return state;
      return {
        tasks: { ...state.tasks, [id]: { ...task, ...changes } },
      };
    });
    return existing;
  },

  restoreTask: async (id) => {
    const now = nowISO();
    const changes: Partial<Task> = {
      status: TaskStatus.TODO,
      doneAt: null,
      updatedAt: now,
    };
    const repo = getTaskRepository();
    await repo.update(id, changes);
    set((state) => {
      const existing = state.tasks[id];
      if (!existing) return state;
      return {
        tasks: { ...state.tasks, [id]: { ...existing, ...changes } },
      };
    });
  },

  bulkUpdateOrder: async (updates) => {
    const now = nowISO();
    const repo = getTaskRepository();
    await repo.bulkUpdate(
      updates.map(({ id, orderIndex }) => ({ id, changes: { orderIndex, updatedAt: now } }))
    );
    set((state) => {
      const tasks = { ...state.tasks };
      for (const { id, orderIndex } of updates) {
        const existing = tasks[id];
        if (existing) {
          tasks[id] = { ...existing, orderIndex, updatedAt: now };
        }
      }
      return { tasks };
    });
  },
}));
