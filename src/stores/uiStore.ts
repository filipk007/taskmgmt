import { create } from 'zustand';
import type { SortConfig } from '@/types/common';

interface UiState {
  activeTaskId: string | null;
  isDrawerOpen: boolean;
  openTaskDrawer: (taskId: string) => void;
  closeTaskDrawer: () => void;

  draggingTaskId: string | null;
  setDraggingTaskId: (id: string | null) => void;

  kanbanSort: SortConfig;
  setKanbanSort: (config: SortConfig) => void;

  isCommandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  closeCommandPalette: () => void;

  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeTaskId: null,
  isDrawerOpen: false,
  openTaskDrawer: (taskId) => set({ activeTaskId: taskId, isDrawerOpen: true }),
  closeTaskDrawer: () => set({ activeTaskId: null, isDrawerOpen: false }),

  draggingTaskId: null,
  setDraggingTaskId: (id) => set({ draggingTaskId: id }),

  kanbanSort: { field: 'priority', direction: 'asc' },
  setKanbanSort: (config) => set({ kanbanSort: config }),

  isCommandPaletteOpen: false,
  toggleCommandPalette: () => set((s) => ({ isCommandPaletteOpen: !s.isCommandPaletteOpen })),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),

  isSidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
}));
