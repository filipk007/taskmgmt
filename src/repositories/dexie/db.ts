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
  color: string;
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

// v2: Add color field to projects (with migration for existing data)
db.version(2).stores({
  tasks: 'id, clientId, projectId, status, priority, deadline, *tags, orderIndex, createdAt, doneAt',
  projects: 'id, *clientIds, createdAt',
  clients: 'id, name, createdAt',
}).upgrade((tx) => {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#a855f7', '#ef4444'];
  return tx.table('projects').toCollection().modify((project) => {
    if (!project.color) {
      project.color = colors[Math.floor(Math.random() * colors.length)];
    }
  });
});

export { db };
