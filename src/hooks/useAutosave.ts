'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AUTOSAVE_DEBOUNCE_MS } from '@/lib/constants';

export function useAutosave<T>(
  value: T,
  save: (value: T) => void | Promise<void>,
  delay: number = AUTOSAVE_DEBOUNCE_MS
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(save);
  const initialRef = useRef(true);

  // Keep save function reference up to date
  saveRef.current = save;

  useEffect(() => {
    // Skip initial render
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      saveRef.current(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    saveRef.current(value);
  }, [value]);

  return { flush };
}
