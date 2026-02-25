import { create } from 'zustand';
import type { Project, ProjectCreate, ProjectUpdate, ProjectWithProgress } from '@/types/project';
import { TaskStatus } from '@/types/task';
import { getProjectRepository } from '@/repositories';
import { generateId, nowISO } from '@/lib/utils';
import { useTaskStore } from './taskStore';

interface ProjectState {
  projects: Record<string, Project>;
  isLoaded: boolean;

  hydrate: () => Promise<void>;
  addProject: (input: ProjectCreate) => Promise<Project>;
  updateProject: (input: ProjectUpdate) => Promise<void>;
  deleteProject: (id: string) => Promise<Project | undefined>;
  getProjectWithProgress: (id: string) => ProjectWithProgress | undefined;
  getProjectsByClient: (clientId: string) => Project[];
  getAllProjectsWithProgress: () => ProjectWithProgress[];
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: {},
  isLoaded: false,

  hydrate: async () => {
    const repo = getProjectRepository();
    const all = await repo.getAll();
    const projects: Record<string, Project> = {};
    for (const p of all) projects[p.id] = p;
    set({ projects, isLoaded: true });
  },

  addProject: async (input) => {
    const now = nowISO();
    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description,
      clientIds: input.clientIds,
      createdAt: now,
      completedAt: null,
    };
    const repo = getProjectRepository();
    await repo.create(project);
    set((state) => ({
      projects: { ...state.projects, [project.id]: project },
    }));
    return project;
  },

  updateProject: async (input) => {
    const { id, ...changes } = input;
    const repo = getProjectRepository();
    await repo.update(id, changes);
    set((state) => {
      const existing = state.projects[id];
      if (!existing) return state;
      return {
        projects: { ...state.projects, [id]: { ...existing, ...changes } },
      };
    });
  },

  deleteProject: async (id) => {
    const existing = get().projects[id];
    if (!existing) return undefined;
    const repo = getProjectRepository();
    await repo.delete(id);
    set((state) => {
      const { [id]: _, ...rest } = state.projects;
      return { projects: rest };
    });
    return existing;
  },

  getProjectWithProgress: (id) => {
    const project = get().projects[id];
    if (!project) return undefined;
    const allTasks = Object.values(useTaskStore.getState().tasks);
    const projectTasks = allTasks.filter((t) => t.projectId === id);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === TaskStatus.DONE).length;
    return {
      ...project,
      totalTasks,
      completedTasks,
      progressPercent: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    };
  },

  getProjectsByClient: (clientId) => {
    return Object.values(get().projects).filter((p) => p.clientIds.includes(clientId));
  },

  getAllProjectsWithProgress: () => {
    const projects = Object.values(get().projects);
    const allTasks = Object.values(useTaskStore.getState().tasks);
    return projects.map((project) => {
      const projectTasks = allTasks.filter((t) => t.projectId === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.status === TaskStatus.DONE).length;
      return {
        ...project,
        totalTasks,
        completedTasks,
        progressPercent: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
      };
    });
  },
}));
