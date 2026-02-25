export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  DONE = 'done',
}

export enum TaskPriority {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export interface Task {
  id: string;
  name: string;
  clientId: string | null;
  projectId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  tags: string[];
  notes: string;
  links: string[];
  dependencies: string[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  doneAt: string | null;
}

export type TaskCreate = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'doneAt'> & {
  id?: string;
};

export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt'>> & {
  id: string;
};
