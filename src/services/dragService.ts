import type { Task } from '@/types/task';
import type { Project } from '@/types/project';
import { getOrderIndexBetween } from '@/lib/orderIndex';

export interface DragMoveResult {
  newClientId: string | null;
  newOrderIndex: number;
  shouldUnassignProject: boolean;
  projectName?: string;
}

export function computeDragMove(
  task: Task,
  targetColumnClientId: string | null,
  targetTasks: Task[],
  overTaskId: string | null,
  projects: Record<string, Project>
): DragMoveResult {
  // Compute new order index
  let newOrderIndex: number;

  if (overTaskId) {
    const overIndex = targetTasks.findIndex((t) => t.id === overTaskId);
    if (overIndex === -1) {
      // Drop at end
      const last = targetTasks[targetTasks.length - 1];
      newOrderIndex = last ? last.orderIndex + 1000 : 1000;
    } else {
      const above = overIndex > 0 ? targetTasks[overIndex - 1].orderIndex : null;
      const below = targetTasks[overIndex].orderIndex;
      newOrderIndex = getOrderIndexBetween(above, below);
    }
  } else {
    // Drop on empty column or at end
    const last = targetTasks[targetTasks.length - 1];
    newOrderIndex = last ? last.orderIndex + 1000 : 1000;
  }

  // Check if project should be unassigned
  let shouldUnassignProject = false;
  let projectName: string | undefined;

  if (task.projectId && task.clientId !== targetColumnClientId) {
    const project = projects[task.projectId];
    if (project) {
      if (targetColumnClientId === null) {
        // Moving to General — check if project allows no-client tasks
        // For now, unassign if moving to General
        shouldUnassignProject = !project.clientIds.includes('');
        // Actually, if project has clientIds, General is not in them
        shouldUnassignProject = project.clientIds.length > 0;
      } else {
        shouldUnassignProject = !project.clientIds.includes(targetColumnClientId);
      }
      if (shouldUnassignProject) {
        projectName = project.name;
      }
    }
  }

  return {
    newClientId: targetColumnClientId,
    newOrderIndex,
    shouldUnassignProject,
    projectName,
  };
}
