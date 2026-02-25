'use client';

import { useTaskStore } from '@/stores/taskStore';

interface TaskDependenciesProps {
  dependencyIds: string[];
}

export function TaskDependencies({ dependencyIds }: TaskDependenciesProps) {
  const tasks = useTaskStore((s) => s.tasks);

  if (dependencyIds.length === 0) {
    return <p className="text-sm text-gray-400">No dependencies</p>;
  }

  return (
    <ul className="space-y-1">
      {dependencyIds.map((id) => {
        const task = tasks[id];
        return (
          <li key={id} className="flex items-center gap-2 text-sm text-gray-700">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-1.121a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757" />
            </svg>
            {task ? task.name : `Unknown (${id})`}
          </li>
        );
      })}
    </ul>
  );
}
