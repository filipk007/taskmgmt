import { db } from './db';
import type { IClientRepository } from '../interfaces';
import type { Client } from '@/types/client';

export class DexieClientRepository implements IClientRepository {
  async getAll(): Promise<Client[]> {
    return db.clients.toArray();
  }

  async getById(id: string): Promise<Client | undefined> {
    return db.clients.get(id);
  }

  async create(client: Client): Promise<Client> {
    await db.clients.add(client);
    return client;
  }

  async update(id: string, changes: Partial<Client>): Promise<void> {
    await db.clients.update(id, changes);
  }

  async delete(id: string): Promise<void> {
    await db.clients.delete(id);
  }

  async bulkCreate(clients: Client[]): Promise<void> {
    await db.clients.bulkAdd(clients);
  }

  async clear(): Promise<void> {
    await db.clients.clear();
  }
}
