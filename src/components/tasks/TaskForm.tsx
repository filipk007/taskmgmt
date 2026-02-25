'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task } from '@/types/task';
import { TaskStatus, TaskPriority } from '@/types/task';
import { useTaskStore } from '@/stores/taskStore';
import { useClientStore } from '@/stores/clientStore';
import { useProjectStore } from '@/stores/projectStore';
import { useAutosave } from '@/hooks/useAutosave';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TaskTagInput } from './TaskTagInput';
import { TaskNotesEditor } from './TaskNotesEditor';
import { TaskLinksList } from './TaskLinksList';
import { TaskDependencies } from './TaskDependencies';
import { STATUS_LABELS } from '@/lib/constants';

interface TaskFormProps {
  task: Task;
}

export function TaskForm({ task }: TaskFormProps) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const clientsMap = useClientStore((s) => s.clients);
  const clients = useMemo(
    () => Object.values(clientsMap).sort((a, b) => a.name.localeCompare(b.name)),
    [clientsMap]
  );
  const projects = useProjectStore((s) => s.projects);

  const [name, setName] = useState(task.name);
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [deadline, setDeadline] = useState(task.deadline ?? '');
  const [clientId, setClientId] = useState(task.clientId ?? '');
  const [projectId, setProjectId] = useState(task.projectId ?? '');
  const [tags, setTags] = useState(task.tags);
  const [notes, setNotes] = useState(task.notes);
  const [links, setLinks] = useState(task.links);

  // Reset form when task changes
  useEffect(() => {
    setName(task.name);
    setStatus(task.status);
    setPriority(task.priority);
    setDeadline(task.deadline ?? '');
    setClientId(task.clientId ?? '');
    setProjectId(task.projectId ?? '');
    setTags(task.tags);
    setNotes(task.notes);
    setLinks(task.links);
  }, [task.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveChanges = useCallback(
    (data: {
      name: string;
      status: TaskStatus;
      priority: TaskPriority;
      deadline: string;
      clientId: string;
      projectId: string;
      tags: string[];
      notes: string;
      links: string[];
    }) => {
      updateTask({
        id: task.id,
        name: data.name,
        status: data.status,
        priority: data.priority,
        deadline: data.deadline || null,
        clientId: data.clientId || null,
        projectId: data.projectId || null,
        tags: data.tags,
        notes: data.notes,
        links: data.links,
      });
    },
    [task.id, updateTask]
  );

  const formData = { name, status, priority, deadline, clientId, projectId, tags, notes, links };
  useAutosave(formData, saveChanges);

  // Available projects for current client
  const availableProjects = Object.values(projects).filter(
    (p) => p.clientIds.length === 0 || (clientId && p.clientIds.includes(clientId))
  );

  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const priorityOptions = [
    { value: TaskPriority.A, label: 'A — Urgent' },
    { value: TaskPriority.B, label: 'B — High' },
    { value: TaskPriority.C, label: 'C — Medium' },
    { value: TaskPriority.D, label: 'D — Low' },
  ];

  const clientOptions = [
    { value: '', label: 'General (no client)' },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ];

  const projectOptions = [
    { value: '', label: 'No project' },
    ...availableProjects.map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border-0 px-0 text-lg font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
          placeholder="Task name"
        />
      </div>

      {/* Status + Priority row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
          <Select
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          />
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Deadline</label>
        <Input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      {/* Client */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
        <Select
          options={clientOptions}
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            // If project doesn't match new client, clear it
            if (projectId) {
              const project = projects[projectId];
              if (project && project.clientIds.length > 0 && !project.clientIds.includes(e.target.value)) {
                setProjectId('');
              }
            }
          }}
        />
      </div>

      {/* Project */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
        <Select
          options={projectOptions}
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Tags</label>
        <TaskTagInput tags={tags} onChange={setTags} />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
        <TaskNotesEditor value={notes} onChange={setNotes} />
      </div>

      {/* Links */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Links</label>
        <TaskLinksList links={links} onChange={setLinks} />
      </div>

      {/* Dependencies (visual only, read-only for now) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Dependencies (visual)</label>
        <TaskDependencies dependencyIds={task.dependencies} />
      </div>
    </div>
  );
}
