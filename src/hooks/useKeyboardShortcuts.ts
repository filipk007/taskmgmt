'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/stores/uiStore';

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || (el as HTMLElement).isContentEditable;
}

export function useKeyboardShortcuts() {
  const closeTaskDrawer = useUiStore((s) => s.closeTaskDrawer);
  const isDrawerOpen = useUiStore((s) => s.isDrawerOpen);
  const toggleCommandPalette = useUiStore((s) => s.toggleCommandPalette);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd/Ctrl + K → command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      // Skip shortcuts when typing in inputs
      if (isInputFocused()) return;

      // N → focus new task input (click the first "Add task" button)
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        // Find the first "Add task" button in the kanban
        const addButton = document.querySelector('[aria-label="Add task"]') as HTMLButtonElement;
        if (addButton) addButton.click();
        return;
      }

      // Escape → close drawer
      if (e.key === 'Escape') {
        if (isDrawerOpen) {
          closeTaskDrawer();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeTaskDrawer, isDrawerOpen, toggleCommandPalette]);
}
