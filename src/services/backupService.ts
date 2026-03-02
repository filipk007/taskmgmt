import type { BackupData } from '@/types/common';
import { getTaskRepository, getProjectRepository, getClientRepository } from '@/repositories';
import { randomProjectColor } from '@/lib/utils';

const BACKUP_VERSION = 1;

export async function exportBackup(): Promise<BackupData> {
  const [tasks, projects, clients] = await Promise.all([
    getTaskRepository().getAll(),
    getProjectRepository().getAll(),
    getClientRepository().getAll(),
  ]);

  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    tasks,
    projects,
    clients,
  };
}

export async function importBackup(data: BackupData): Promise<{
  tasks: number;
  projects: number;
  clients: number;
}> {
  if (!data.version || !data.tasks || !data.projects || !data.clients) {
    throw new Error('Invalid backup file format.');
  }

  const taskRepo = getTaskRepository();
  const projectRepo = getProjectRepository();
  const clientRepo = getClientRepository();

  // Clear existing data
  await Promise.all([taskRepo.clear(), projectRepo.clear(), clientRepo.clear()]);

  // Import new data
  if (data.clients.length > 0) {
    await clientRepo.bulkCreate(data.clients);
  }
  if (data.projects.length > 0) {
    // Ensure all projects have a color (handles old backups)
    const projectsWithColors = data.projects.map((p) => ({
      ...p,
      color: p.color || randomProjectColor(),
    }));
    await projectRepo.bulkCreate(projectsWithColors);
  }
  if (data.tasks.length > 0) {
    await taskRepo.bulkCreate(data.tasks);
  }

  return {
    tasks: data.tasks.length,
    projects: data.projects.length,
    clients: data.clients.length,
  };
}

export function downloadJSON(data: BackupData, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function readJSONFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}
