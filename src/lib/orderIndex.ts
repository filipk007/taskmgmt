import { ORDER_INDEX_GAP } from './constants';

export function getOrderIndexBetween(
  above: number | null,
  below: number | null
): number {
  if (above === null && below === null) {
    return ORDER_INDEX_GAP;
  }
  if (above === null) {
    return below! - ORDER_INDEX_GAP;
  }
  if (below === null) {
    return above + ORDER_INDEX_GAP;
  }
  return (above + below) / 2;
}

export function getOrderIndexAtEnd(tasks: { orderIndex: number }[]): number {
  if (tasks.length === 0) return ORDER_INDEX_GAP;
  const max = Math.max(...tasks.map((t) => t.orderIndex));
  return max + ORDER_INDEX_GAP;
}

export function getOrderIndexAtStart(tasks: { orderIndex: number }[]): number {
  if (tasks.length === 0) return ORDER_INDEX_GAP;
  const min = Math.min(...tasks.map((t) => t.orderIndex));
  return min - ORDER_INDEX_GAP;
}

export function needsRebalance(tasks: { orderIndex: number }[]): boolean {
  if (tasks.length < 2) return false;
  const sorted = [...tasks].sort((a, b) => a.orderIndex - b.orderIndex);
  for (let i = 1; i < sorted.length; i++) {
    if (Math.abs(sorted[i].orderIndex - sorted[i - 1].orderIndex) < 0.001) {
      return true;
    }
  }
  return false;
}

export function rebalanceOrderIndices<T extends { orderIndex: number }>(
  tasks: T[]
): T[] {
  const sorted = [...tasks].sort((a, b) => a.orderIndex - b.orderIndex);
  return sorted.map((task, index) => ({
    ...task,
    orderIndex: (index + 1) * ORDER_INDEX_GAP,
  }));
}
