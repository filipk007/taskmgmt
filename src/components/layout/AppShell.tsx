'use client';

import { useEffect, type ReactNode } from 'react';
import { Sidebar, MobileNav } from './Sidebar';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { useClientStore } from '@/stores/clientStore';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useHydration } from '@/hooks/useHydration';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const hydrated = useHydration();

  useEffect(() => {
    if (hydrated) {
      Promise.all([
        useClientStore.getState().hydrate(),
        useTaskStore.getState().hydrate(),
        useProjectStore.getState().hydrate(),
      ]);
    }
  }, [hydrated]);

  useKeyboardShortcuts();

  const clientsLoaded = useClientStore((s) => s.isLoaded);
  const tasksLoaded = useTaskStore((s) => s.isLoaded);

  if (!hydrated || !clientsLoaded || !tasksLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-gray-50">
      <MobileNav />
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      <CommandPalette />
    </div>
  );
}
