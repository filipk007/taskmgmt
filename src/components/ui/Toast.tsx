'use client';

import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ToastProps {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss: () => void;
}

export function Toast({ message, action, onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg',
        'animate-in slide-in-from-bottom-5 fade-in duration-300'
      )}
    >
      <span className="flex-1">{message}</span>
      {action && (
        <Button
          variant="ghost"
          size="sm"
          className="text-indigo-300 hover:text-indigo-200 hover:bg-gray-800"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-white"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
