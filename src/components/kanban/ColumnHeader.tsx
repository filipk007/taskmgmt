'use client';

interface ColumnHeaderProps {
  name: string;
  color: string | null;
  taskCount: number;
  onAddTask: () => void;
}

export function ColumnHeader({ name, color, taskCount, onAddTask }: ColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1 pb-3">
      <div className="flex items-center gap-2">
        {color && (
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
        )}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
        <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
          {taskCount}
        </span>
      </div>
      <button
        onClick={onAddTask}
        className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        aria-label="Add task"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}
