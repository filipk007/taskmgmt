'use client';

import { useState, useMemo } from 'react';
import { useClientStore } from '@/stores/clientStore';
import { useTaskStore } from '@/stores/taskStore';
import { useToast } from '@/components/ui/ToastProvider';
import { useUndoStore } from '@/stores/undoStore';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ClientForm } from './ClientForm';
import { UNDO_TTL_MS } from '@/lib/constants';
import type { Client } from '@/types/client';

export function ClientManager() {
  const clientsMap = useClientStore((s) => s.clients);
  const clients = useMemo(
    () => Object.values(clientsMap).sort((a, b) => a.name.localeCompare(b.name)),
    [clientsMap]
  );
  const deleteClient = useClientStore((s) => s.deleteClient);
  const updateTask = useTaskStore((s) => s.updateTask);
  const tasks = useTaskStore((s) => s.tasks);
  const pushUndo = useUndoStore((s) => s.pushUndo);
  const { showToast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const handleDelete = async () => {
    if (!deletingClient) return;
    const clientId = deletingClient.id;

    // Move tasks to General
    const clientTasks = Object.values(tasks).filter((t) => t.clientId === clientId);
    for (const task of clientTasks) {
      await updateTask({ id: task.id, clientId: null, projectId: null });
    }

    const deleted = await deleteClient(clientId);
    if (deleted) {
      pushUndo({
        type: 'delete_client',
        label: `Deleted "${deleted.name}"`,
        payload: deleted,
        ttl: UNDO_TTL_MS,
      });
      showToast({
        message: `Deleted "${deleted.name}". Tasks moved to General.`,
        duration: UNDO_TTL_MS,
      });
    }
    setDeletingClient(null);
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Clients</h2>
        <Button
          size="sm"
          onClick={() => {
            setEditingClient(null);
            setShowForm(true);
          }}
        >
          Add Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          No clients yet. Add one to create Kanban columns.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700 rounded-lg border border-gray-200 dark:border-gray-700">
          {clients.map((client) => (
            <li key={client.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: client.color }}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingClient(client);
                    setShowForm(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeletingClient(client)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <ClientForm
          client={editingClient}
          onClose={() => {
            setShowForm(false);
            setEditingClient(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Are you sure you want to delete "${deletingClient?.name}"? All tasks for this client will be moved to General.`}
        confirmLabel="Delete"
      />
    </section>
  );
}
