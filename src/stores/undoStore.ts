import { create } from 'zustand';
import type { Task } from '@/types/task';
import type { Project } from '@/types/project';
import type { Client } from '@/types/client';
import { getTaskRepository, getProjectRepository, getClientRepository } from '@/repositories';
import { useTaskStore } from './taskStore';
import { useProjectStore } from './projectStore';
import { useClientStore } from './clientStore';
import { UNDO_TTL_MS } from '@/lib/constants';
import { generateId } from '@/lib/utils';

export type UndoActionType = 'delete_task' | 'archive_task' | 'delete_project' | 'delete_client';

export interface UndoAction {
  id: string;
  type: UndoActionType;
  label: string;
  payload: Task | Project | Client;
  timestamp: number;
  ttl: number;
}

interface UndoState {
  actions: UndoAction[];
  pushUndo: (action: Omit<UndoAction, 'id' | 'timestamp'>) => void;
  executeUndo: (id: string) => Promise<void>;
  removeAction: (id: string) => void;
  clearExpired: () => void;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  actions: [],

  pushUndo: (action) => {
    const entry: UndoAction = {
      ...action,
      id: generateId(),
      timestamp: Date.now(),
    };
    set((state) => ({ actions: [...state.actions, entry] }));

    // Auto-remove after TTL
    setTimeout(() => {
      get().removeAction(entry.id);
    }, action.ttl);
  },

  executeUndo: async (id) => {
    const action = get().actions.find((a) => a.id === id);
    if (!action) return;

    switch (action.type) {
      case 'delete_task': {
        const task = action.payload as Task;
        await getTaskRepository().create(task);
        useTaskStore.setState((state) => ({
          tasks: { ...state.tasks, [task.id]: task },
        }));
        break;
      }
      case 'archive_task': {
        const task = action.payload as Task;
        await getTaskRepository().update(task.id, {
          status: task.status,
          doneAt: task.doneAt,
          updatedAt: task.updatedAt,
        });
        useTaskStore.setState((state) => ({
          tasks: { ...state.tasks, [task.id]: task },
        }));
        break;
      }
      case 'delete_project': {
        const project = action.payload as Project;
        await getProjectRepository().create(project);
        useProjectStore.setState((state) => ({
          projects: { ...state.projects, [project.id]: project },
        }));
        break;
      }
      case 'delete_client': {
        const client = action.payload as Client;
        await getClientRepository().create(client);
        useClientStore.setState((state) => ({
          clients: { ...state.clients, [client.id]: client },
        }));
        break;
      }
    }

    get().removeAction(id);
  },

  removeAction: (id) => {
    set((state) => ({ actions: state.actions.filter((a) => a.id !== id) }));
  },

  clearExpired: () => {
    const now = Date.now();
    set((state) => ({
      actions: state.actions.filter((a) => now - a.timestamp < a.ttl),
    }));
  },
}));
