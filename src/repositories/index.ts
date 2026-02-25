import type { ITaskRepository, IProjectRepository, IClientRepository } from './interfaces';
import { DexieTaskRepository } from './dexie/TaskRepository';
import { DexieProjectRepository } from './dexie/ProjectRepository';
import { DexieClientRepository } from './dexie/ClientRepository';

let taskRepo: ITaskRepository | null = null;
let projectRepo: IProjectRepository | null = null;
let clientRepo: IClientRepository | null = null;

export function getTaskRepository(): ITaskRepository {
  if (!taskRepo) taskRepo = new DexieTaskRepository();
  return taskRepo;
}

export function getProjectRepository(): IProjectRepository {
  if (!projectRepo) projectRepo = new DexieProjectRepository();
  return projectRepo;
}

export function getClientRepository(): IClientRepository {
  if (!clientRepo) clientRepo = new DexieClientRepository();
  return clientRepo;
}
