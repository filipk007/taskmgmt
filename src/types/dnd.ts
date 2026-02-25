export type DndItemType = 'task';

export interface DndTaskData {
  type: DndItemType;
  taskId: string;
  sourceClientId: string | null;
}

export type ColumnId = string;

export const GENERAL_COLUMN_ID = '__general__';
