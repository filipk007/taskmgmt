'use client';

import { useState, useMemo } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useClientStore } from '@/stores/clientStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Project } from '@/types/project';
import { DEFAULT_PROJECT_COLORS } from '@/lib/constants';
import { randomProjectColor } from '@/lib/utils';

interface ProjectFormProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectForm({ project, onClose }: ProjectFormProps) {
  const addProject = useProjectStore((s) => s.addProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const clientsMap = useClientStore((s) => s.clients);

  const clients = useMemo(
    () => Object.values(clientsMap).sort((a, b) => a.name.localeCompare(b.name)),
    [clientsMap]
  );

  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [color, setColor] = useState(project?.color ?? randomProjectColor());
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(
    project?.clientIds ?? []
  );

  const toggleClient = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId)
        ? prev.filter((id) => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (project) {
      await updateProject({
        id: project.id,
        name: trimmed,
        description: description.trim(),
        color,
        clientIds: selectedClientIds,
      });
    } else {
      await addProject({
        name: trimmed,
        description: description.trim(),
        color,
        clientIds: selectedClientIds,
      });
    }
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {project ? 'Edit Project' : 'New Project'}
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
              autoFocus
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {DEFAULT_PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    color === c
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Clients</label>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Select which clients this project spans.
            </p>
            {clients.length === 0 ? (
              <p className="mt-2 text-sm text-gray-400">
                No clients yet. Create clients in Settings first.
              </p>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {clients.map((client) => {
                  const isSelected = selectedClientIds.includes(client.id);
                  return (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => toggleClient(client.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
                        isSelected
                          ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: client.color }}
                      />
                      {client.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {project ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
