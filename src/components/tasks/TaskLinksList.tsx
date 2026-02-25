'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface TaskLinksListProps {
  links: string[];
  onChange: (links: string[]) => void;
}

export function TaskLinksList({ links, onChange }: TaskLinksListProps) {
  const [input, setInput] = useState('');

  const addLink = () => {
    const trimmed = input.trim();
    if (trimmed && !links.includes(trimmed)) {
      onChange([...links, trimmed]);
    }
    setInput('');
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div>
      {links.length > 0 && (
        <ul className="mb-2 space-y-1">
          {links.map((link, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-indigo-600 hover:text-indigo-800"
              >
                {link}
              </a>
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addLink();
            }
          }}
          placeholder="https://..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <Button type="button" variant="secondary" size="sm" onClick={addLink} disabled={!input.trim()}>
          Add
        </Button>
      </div>
    </div>
  );
}
