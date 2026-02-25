import Dexie, { type EntityTable } from 'dexie';

// Internal DB types: clientId uses '' instead of null for indexing
interface DbTask {
  id: string;
  name: string;
  clientId: string;
  projectId: string;
  status: string;
  priority: string;
  deadline: string;
  tags: string[];
  notes: string;
  links: string[];
  dependencies: string[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  doneAt: string;
}

interface DbProject {
  id: string;
  name: string;
  description: string;
  clientIds: string[];
  createdAt: string;
  completedAt: string;
}

interface DbClient {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const db = new Dexie('TaskMgmtDB') as Dexie & {
  tasks: EntityTable<DbTask, 'id'>;
  projects: EntityTable<DbProject, 'id'>;
  clients: EntityTable<DbClient, 'id'>;
};

db.version(1).stores({
  tasks: 'id, clientId, projectId, status, priority, deadline, *tags, orderIndex, createdAt, doneAt',
  projects: 'id, *clientIds, createdAt',
  clients: 'id, name, createdAt',
});

export { db };
