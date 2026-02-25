'use client';

import { useState, useMemo } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useTaskStore } from '@/stores/taskStore';
import { useClientStore } from '@/stores/clientStore';
import { TaskStatus } from '@/types/task';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { ProjectDetailPanel } from './ProjectDetailPanel';
import type { Project, ProjectWithProgress } from '@/types/project';

export function ProjectsList() {
  const projectsMap = useProjectStore((s) => s.projects);
  const tasksMap = useTaskStore((s) => s.tasks);
  const clientsMap = useClientStore((s) => s.clients);

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [filterClientId, setFilterClientId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const clients = useMemo(
    () => Object.values(clientsMap).sort((a, b) => a.name.localeCompare(b.name)),
    [clientsMap]
  );

  const projectsWithProgress: ProjectWithProgress[] = useMemo(() => {
    const projects = Object.values(projectsMap);
    const allTasks = Object.values(tasksMap);
    return projects.map((project) => {
      const projectTasks = allTasks.filter((t) => t.projectId === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(
        (t) => t.status === TaskStatus.DONE
      ).length;
      return {
        ...project,
        totalTasks,
        completedTasks,
        progressPercent:
          totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
      };
    });
  }, [projectsMap, tasksMap]);

  const filteredProjects = useMemo(() => {
    let list = projectsWithProgress;

    // Filter by client
    if (filterClientId) {
      list = list.filter((p) => p.clientIds.includes(filterClientId));
    }

    // Filter completed
    if (!showCompleted) {
      list = list.filter((p) => p.completedAt === null);
    }

    // Sort: active first, then by name
    return list.sort((a, b) => {
      if (a.completedAt && !b.completedAt) return 1;
      if (!a.completedAt && b.completedAt) return -1;
      return a.name.localeCompare(b.name);
    });
  }, [projectsWithProgress, filterClientId, showCompleted]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projectsWithProgress.find((p) => p.id === selectedProjectId) ?? null;
  }, [selectedProjectId, projectsWithProgress]);

  const handleEdit = () => {
    if (selectedProject) {
      setEditingProject(selectedProject);
      setShowForm(true);
      setSelectedProjectId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
        <Button
          size="sm"
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
        >
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex items-center gap-3 flex-wrap">
        {/* Client filter chips */}
        <button
          onClick={() => setFilterClientId(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            filterClientId === null
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {clients.map((client) => (
          <button
            key={client.id}
            onClick={() =>
              setFilterClientId(filterClientId === client.id ? null : client.id)
            }
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterClientId === client.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: client.color }}
            />
            {client.name}
          </button>
        ))}
        <span className="mx-1 h-4 w-px bg-gray-200" />
        <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Show completed
        </label>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title={
            Object.keys(projectsMap).length === 0
              ? 'No projects yet'
              : 'No matching projects'
          }
          description={
            Object.keys(projectsMap).length === 0
              ? 'Create a project to group tasks across clients.'
              : 'Try adjusting filters or showing completed projects.'
          }
          action={
            Object.keys(projectsMap).length === 0 ? (
              <Button
                size="sm"
                onClick={() => {
                  setEditingProject(null);
                  setShowForm(true);
                }}
              >
                Create Project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelectedProjectId(project.id)}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onClose={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      {/* Detail Panel */}
      <ProjectDetailPanel
        project={selectedProject}
        onClose={() => setSelectedProjectId(null)}
        onEdit={handleEdit}
      />
    </div>
  );
}
