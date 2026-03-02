'use client';

import { useRef, useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useClientStore } from '@/stores/clientStore';
import { useToast } from '@/components/ui/ToastProvider';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  exportBackup,
  importBackup,
  downloadJSON,
  readJSONFile,
} from '@/services/backupService';

export function BackupRestore() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [importing, setImporting] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const hydrateTask = useTaskStore((s) => s.hydrate);
  const hydrateProject = useProjectStore((s) => s.hydrate);
  const hydrateClient = useClientStore((s) => s.hydrate);

  const handleExport = async () => {
    try {
      const data = await exportBackup();
      const date = new Date().toISOString().split('T')[0];
      downloadJSON(data, `taskmgmt-backup-${date}.json`);
      showToast({
        message: `Exported ${data.tasks.length} tasks, ${data.projects.length} projects, ${data.clients.length} clients.`,
        duration: 4000,
      });
    } catch {
      showToast({ message: 'Export failed.', duration: 3000 });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setConfirmImport(true);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!pendingFile) return;
    setImporting(true);
    try {
      const data = await readJSONFile(pendingFile);
      const counts = await importBackup(data);

      // Re-hydrate all stores
      await Promise.all([hydrateTask(), hydrateProject(), hydrateClient()]);

      showToast({
        message: `Imported ${counts.tasks} tasks, ${counts.projects} projects, ${counts.clients} clients.`,
        duration: 4000,
      });
    } catch (err) {
      showToast({
        message: err instanceof Error ? err.message : 'Import failed.',
        duration: 4000,
      });
    } finally {
      setImporting(false);
      setPendingFile(null);
    }
  };

  return (
    <section>
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Data Backup</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Export all data as JSON or restore from a previous backup.
      </p>

      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <svg
            className="mr-1.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export Backup
        </Button>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={importing}
        >
          <svg
            className="mr-1.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          {importing ? 'Importing...' : 'Import Backup'}
        </Button>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmImport}
        onClose={() => {
          setConfirmImport(false);
          setPendingFile(null);
        }}
        onConfirm={handleImport}
        title="Import Backup"
        message="This will replace ALL existing data (tasks, projects, clients) with the backup file contents. This cannot be undone. Are you sure?"
        confirmLabel="Import & Replace"
        variant="danger"
      />
    </section>
  );
}
