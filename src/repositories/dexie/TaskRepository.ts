import { db } from './db';
import type { ITaskRepository } from '../interfaces';
import type { Task, TaskStatus } from '@/types/task';

function toDb(task: Partial<Task>): Record<string, unknown> {
  const record: Record<string, unknown> = { ...task };
  if ('clientId' in task) {
    record.clientId = task.clientId ?? '';
  }
  if ('projectId' in task) {
    record.projectId = task.projectId ?? '';
  }
  if ('deadline' in task) {
    record.deadline = task.deadline ?? '';
  }
  if ('doneAt' in task) {
    record.doneAt = task.doneAt ?? '';
  }
  return record;
}

function fromDb(record: Record<string, unknown>): Task {
  return {
    ...record,
    clientId: record.clientId === '' ? null : record.clientId,
    projectId: record.projectId === '' ? null : record.projectId,
    deadline: record.deadline === '' ? null : record.deadline,
    doneAt: record.doneAt === '' ? null : record.doneAt,
  } as Task;
}

export class DexieTaskRepository implements ITaskRepository {
  async getAll(): Promise<Task[]> {
    const records = await db.tasks.toArray();
    return records.map((r) => fromDb(r as unknown as Record<string, unknown>));
  }

  async getById(id: string): Promise<Task | undefined> {
    const record = await db.tasks.get(id);
    return record ? fromDb(record as unknown as Record<string, unknown>) : undefined;
  }

  async getByClientId(clientId: string | null): Promise<Task[]> {
    const key = clientId ?? '';
    const records = await db.tasks.where('clientId').equals(key).toArray();
    return records.map((r) => fromDb(r as unknown as Record<string, unknown>));
  }

  async getByProjectId(projectId: string): Promise<Task[]> {
    const records = await db.tasks.where('projectId').equals(projectId).toArray();
    return records.map((r) => fromDb(r as unknown as Record<string, unknown>));
  }

  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const records = await db.tasks.where('status').equals(status).toArray();
    return records.map((r) => fromDb(r as unknown as Record<string, unknown>));
  }

  async create(task: Task): Promise<Task> {
    await db.tasks.add(toDb(task) as never);
    return task;
  }

  async update(id: string, changes: Partial<Task>): Promise<void> {
    await db.tasks.update(id, toDb(changes) as never);
  }

  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  }

  async bulkUpdate(updates: { id: string; changes: Partial<Task> }[]): Promise<void> {
    await db.transaction('rw', db.tasks, async () => {
      for (const { id, changes } of updates) {
        await db.tasks.update(id, toDb(changes) as never);
      }
    });
  }

  async bulkCreate(tasks: Task[]): Promise<void> {
    await db.tasks.bulkAdd(tasks.map((t) => toDb(t)) as never[]);
  }

  async clear(): Promise<void> {
    await db.tasks.clear();
  }
}
