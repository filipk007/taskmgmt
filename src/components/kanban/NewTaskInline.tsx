'use client';

import { useState, useRef } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { TaskStatus, TaskPriority } from '@/types/task';

interface NewTaskInlineProps {
  clientId: string | null;
}

export function NewTaskInline({ clientId }: NewTaskInlineProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const addTask = useTaskStore((s) => s.addTask);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setIsEditing(false);
      return;
    }
    await addTask({
      name: trimmed,
      clientId,
      projectId: null,
      status: TaskStatus.TODO,
      priority: TaskPriority.D,
      deadline: null,
      tags: [],
      notes: '',
      links: [],
      dependencies: [],
      orderIndex: 0, // Will be computed by addTask
    });
    setName('');
    inputRef.current?.focus();
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => {
          setIsEditing(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add task
      </button>
    );
  }

  return (
    <div className="px-1">
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setName('');
            setIsEditing(false);
          }
        }}
        onBlur={handleSubmit}
        placeholder="Task name..."
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        autoFocus
      />
    </div>
  );
}
