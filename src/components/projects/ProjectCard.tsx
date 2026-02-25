'use client';

import { useMemo } from 'react';
import { useClientStore } from '@/stores/clientStore';
import { ProjectProgressBar } from './ProjectProgressBar';
import { Badge } from '@/components/ui/Badge';
import type { ProjectWithProgress } from '@/types/project';

interface ProjectCardProps {
  project: ProjectWithProgress;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const clientsMap = useClientStore((s) => s.clients);

  const projectClients = useMemo(
    () => project.clientIds.map((id) => clientsMap[id]).filter(Boolean),
    [project.clientIds, clientsMap]
  );

  const isCompleted = project.completedAt !== null;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
          {project.name}
        </h3>
        {isCompleted && (
          <Badge className="bg-green-100 text-green-700 shrink-0">Completed</Badge>
        )}
      </div>

      {project.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{project.description}</p>
      )}

      {projectClients.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {projectClients.map((client) => (
            <span
              key={client.id}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: client.color }}
              />
              {client.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3">
        <ProjectProgressBar
          totalTasks={project.totalTasks}
          completedTasks={project.completedTasks}
          progressPercent={project.progressPercent}
        />
      </div>
    </button>
  );
}
