export interface Project {
  id: string;
  name: string;
  description: string;
  clientIds: string[];
  createdAt: string;
  completedAt: string | null;
}

export type ProjectCreate = Omit<Project, 'id' | 'createdAt' | 'completedAt'>;

export type ProjectUpdate = Partial<Omit<Project, 'id' | 'createdAt'>> & {
  id: string;
};

export interface ProjectWithProgress extends Project {
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
}
