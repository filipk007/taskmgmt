'use client';

import { useUiStore } from '@/stores/uiStore';
import type { SortField, SortDirection } from '@/types/common';

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'deadline', label: 'Due Date' },
  { value: 'status', label: 'Status' },
  { value: 'createdAt', label: 'Created' },
  { value: 'name', label: 'Name' },
];

export function SortControls() {
  const kanbanSort = useUiStore((s) => s.kanbanSort);
  const setKanbanSort = useUiStore((s) => s.setKanbanSort);

  const toggleDirection = () => {
    const newDir: SortDirection = kanbanSort.direction === 'asc' ? 'desc' : 'asc';
    setKanbanSort({ ...kanbanSort, direction: newDir });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400">Sort:</span>
      <select
        value={kanbanSort.field}
        onChange={(e) =>
          setKanbanSort({ field: e.target.value as SortField, direction: kanbanSort.direction })
        }
        className="rounded border border-gray-300 dark:border-gray-600 px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:border-indigo-500 focus:outline-none"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={toggleDirection}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-400"
        title={kanbanSort.direction === 'asc' ? 'Ascending' : 'Descending'}
      >
        {kanbanSort.direction === 'asc' ? (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>
    </div>
  );
}
