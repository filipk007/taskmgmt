import type { Task } from '@/types/task';
import type { TaskStatus } from '@/types/task';
import type { Project } from '@/types/project';
import type { Client } from '@/types/client';

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | undefined>;
  getByClientId(clientId: string | null): Promise<Task[]>;
  getByProjectId(projectId: string): Promise<Task[]>;
  getByStatus(status: TaskStatus): Promise<Task[]>;
  create(task: Task): Promise<Task>;
  update(id: string, changes: Partial<Task>): Promise<void>;
  delete(id: string): Promise<void>;
  bulkUpdate(updates: { id: string; changes: Partial<Task> }[]): Promise<void>;
  bulkCreate(tasks: Task[]): Promise<void>;
  clear(): Promise<void>;
}

export interface IProjectRepository {
  getAll(): Promise<Project[]>;
  getById(id: string): Promise<Project | undefined>;
  create(project: Project): Promise<Project>;
  update(id: string, changes: Partial<Project>): Promise<void>;
  delete(id: string): Promise<void>;
  bulkCreate(projects: Project[]): Promise<void>;
  clear(): Promise<void>;
}

export interface IClientRepository {
  getAll(): Promise<Client[]>;
  getById(id: string): Promise<Client | undefined>;
  create(client: Client): Promise<Client>;
  update(id: string, changes: Partial<Client>): Promise<void>;
  delete(id: string): Promise<void>;
  bulkCreate(clients: Client[]): Promise<void>;
  clear(): Promise<void>;
}
