import { db } from './db';
import type { IProjectRepository } from '../interfaces';
import type { Project } from '@/types/project';

function toDb(project: Partial<Project>): Record<string, unknown> {
  const record: Record<string, unknown> = { ...project };
  if ('completedAt' in project) {
    record.completedAt = project.completedAt ?? '';
  }
  return record;
}

function fromDb(record: Record<string, unknown>): Project {
  return {
    ...record,
    completedAt: record.completedAt === '' ? null : record.completedAt,
  } as Project;
}

export class DexieProjectRepository implements IProjectRepository {
  async getAll(): Promise<Project[]> {
    const records = await db.projects.toArray();
    return records.map((r) => fromDb(r as unknown as Record<string, unknown>));
  }

  async getById(id: string): Promise<Project | undefined> {
    const record = await db.projects.get(id);
    return record ? fromDb(record as unknown as Record<string, unknown>) : undefined;
  }

  async create(project: Project): Promise<Project> {
    await db.projects.add(toDb(project) as never);
    return project;
  }

  async update(id: string, changes: Partial<Project>): Promise<void> {
    await db.projects.update(id, toDb(changes) as never);
  }

  async delete(id: string): Promise<void> {
    await db.projects.delete(id);
  }

  async bulkCreate(projects: Project[]): Promise<void> {
    await db.projects.bulkAdd(projects.map((p) => toDb(p) as never));
  }

  async clear(): Promise<void> {
    await db.projects.clear();
  }
}
