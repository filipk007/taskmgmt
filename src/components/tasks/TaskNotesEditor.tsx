'use client';

interface TaskNotesEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TaskNotesEditor({ value, onChange }: TaskNotesEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add notes (supports markdown)..."
      rows={6}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
    />
  );
}
