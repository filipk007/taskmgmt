'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useClientStore } from '@/stores/clientStore';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/constants';
import type { Task } from '@/types/task';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: 'task' | 'project' | 'client' | 'nav';
  action: () => void;
}

function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < lowerText.length && qi < lowerQuery.length; ti++) {
    if (lowerText[ti] === lowerQuery[qi]) qi++;
  }
  return qi === lowerQuery.length;
}

export function CommandPalette() {
  const isOpen = useUiStore((s) => s.isCommandPaletteOpen);
  const closeCommandPalette = useUiStore((s) => s.closeCommandPalette);
  const openTaskDrawer = useUiStore((s) => s.openTaskDrawer);
  const tasksMap = useTaskStore((s) => s.tasks);
  const projectsMap = useProjectStore((s) => s.projects);
  const clientsMap = useClientStore((s) => s.clients);
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build items
  const allItems = useMemo((): CommandItem[] => {
    const items: CommandItem[] = [];

    // Navigation
    items.push(
      { id: 'nav-kanban', label: 'Go to Kanban', icon: 'nav', action: () => router.push('/kanban') },
      { id: 'nav-projects', label: 'Go to Projects', icon: 'nav', action: () => router.push('/projects') },
      { id: 'nav-archive', label: 'Go to Archive', icon: 'nav', action: () => router.push('/archive') },
      { id: 'nav-settings', label: 'Go to Settings', icon: 'nav', action: () => router.push('/settings') }
    );

    // Tasks
    for (const task of Object.values(tasksMap)) {
      const client = task.clientId ? clientsMap[task.clientId] : null;
      items.push({
        id: `task-${task.id}`,
        label: task.name,
        description: `${STATUS_LABELS[task.status]} · ${PRIORITY_LABELS[task.priority]}${client ? ` · ${client.name}` : ''}`,
        icon: 'task',
        action: () => {
          openTaskDrawer(task.id);
          router.push('/kanban');
        },
      });
    }

    // Projects
    for (const project of Object.values(projectsMap)) {
      items.push({
        id: `project-${project.id}`,
        label: project.name,
        description: project.description || 'Project',
        icon: 'project',
        action: () => router.push('/projects'),
      });
    }

    // Clients
    for (const client of Object.values(clientsMap)) {
      items.push({
        id: `client-${client.id}`,
        label: client.name,
        description: 'Client',
        icon: 'client',
        action: () => router.push('/settings'),
      });
    }

    return items;
  }, [tasksMap, projectsMap, clientsMap, router, openTaskDrawer]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 20);
    return allItems.filter(
      (item) =>
        fuzzyMatch(item.label, query) ||
        (item.description && fuzzyMatch(item.description, query))
    ).slice(0, 20);
  }, [allItems, query]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keep selected item in view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selectedEl = list.children[selectedIndex] as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const executeItem = useCallback(
    (item: CommandItem) => {
      closeCommandPalette();
      item.action();
    },
    [closeCommandPalette]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredItems.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredItems[selectedIndex]) {
            executeItem(filteredItems[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeCommandPalette();
          break;
      }
    },
    [filteredItems, selectedIndex, executeItem, closeCommandPalette]
  );

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const iconMap = {
    task: (
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    project: (
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    client: (
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    nav: (
      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={closeCommandPalette}
      />

      {/* Palette */}
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-gray-200 px-4">
          <svg
            className="h-5 w-5 text-gray-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks, projects, navigate..."
            className="flex-1 border-0 px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto py-1">
          {filteredItems.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">
              No results found.
            </p>
          ) : (
            filteredItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === selectedIndex ? 'bg-indigo-50' : 'hover:bg-gray-50'
                }`}
              >
                {iconMap[item.icon]}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      i === selectedIndex
                        ? 'text-indigo-900 font-medium'
                        : 'text-gray-900'
                    }`}
                  >
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  )}
                </div>
                {i === selectedIndex && (
                  <kbd className="hidden sm:inline-flex items-center rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] text-gray-400">
                    &crarr;
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-[10px] text-gray-400">
          <span><kbd className="font-medium">&uarr;&darr;</kbd> navigate</span>
          <span><kbd className="font-medium">&crarr;</kbd> select</span>
          <span><kbd className="font-medium">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
