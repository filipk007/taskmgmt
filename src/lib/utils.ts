import { nanoid } from 'nanoid';
import { DEFAULT_PROJECT_COLORS } from './constants';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return nanoid();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function isOverdue(deadline: string | null): boolean {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(deadline) < today;
}

export function isDueToday(deadline: string | null): boolean {
  if (!deadline) return false;
  const today = new Date().toISOString().split('T')[0];
  return deadline === today;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function randomProjectColor(): string {
  return DEFAULT_PROJECT_COLORS[Math.floor(Math.random() * DEFAULT_PROJECT_COLORS.length)];
}

/**
 * Mix a hex color with white (light mode) or a dark base (dark mode) at a given ratio.
 * Returns an rgba string. ratio=0.15 gives a subtle tint.
 */
export function tintColor(hex: string, ratio: number = 0.15): { light: string; dark: string } {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Light mode: mix with white (255,255,255)
  const lr = Math.round(255 + (r - 255) * ratio);
  const lg = Math.round(255 + (g - 255) * ratio);
  const lb = Math.round(255 + (b - 255) * ratio);

  // Dark mode: mix with dark gray (31,41,55) — gray-800
  const dr = Math.round(31 + (r - 31) * ratio);
  const dg = Math.round(41 + (g - 41) * ratio);
  const db = Math.round(55 + (b - 55) * ratio);

  return {
    light: `rgb(${lr}, ${lg}, ${lb})`,
    dark: `rgb(${dr}, ${dg}, ${db})`,
  };
}
