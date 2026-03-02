'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/types/task';
import { KanbanCard } from './KanbanCard';
import { ColumnHeader } from './ColumnHeader';
import { NewTaskInline } from './NewTaskInline';
import { GENERAL_COLUMN_ID } from '@/types/dnd';

interface KanbanColumnProps {
  columnId: string;
  name: string;
  color: string | null;
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onAddTask: () => void;
}

function SortableCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <KanbanCard
      ref={setNodeRef}
      task={task}
      onClick={onClick}
      isDragging={isDragging}
      style={style}
      dragAttributes={attributes}
      dragListeners={listeners}
    />
  );
}

export function KanbanColumn({
  columnId,
  name,
  color,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const clientId = columnId === GENERAL_COLUMN_ID ? null : columnId;

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: 'column', columnId },
  });

  return (
    <div className="flex h-full w-72 flex-shrink-0 flex-col">
      <ColumnHeader
        name={name}
        color={color}
        taskCount={tasks.length}
        onAddTask={onAddTask}
      />
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 overflow-y-auto rounded-lg p-1 transition-colors ${
          isOver ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
            />
          ))}
        </SortableContext>
        <NewTaskInline clientId={clientId} />
      </div>
    </div>
  );
}
