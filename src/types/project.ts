export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;              // Hex color for visual identification
  clientIds: string[];
  createdAt: string;
  completedAt: string | null;
}

export type ProjectCreate = Omit<Project, 'id' | 'color' | 'createdAt' | 'completedAt'> & {
  color?: string;   // Optional — auto-assigned if not provided
};

export type ProjectUpdate = Partial<Omit<Project, 'id' | 'createdAt'>> & {
  id: string;
};

export interface ProjectWithProgress extends Project {
  totalTasks: number;
  completedTasks: number;
  progressPercent: number;
}
