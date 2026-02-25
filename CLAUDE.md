# CLAUDE.md - TaskMgmt Kanban App

## Project Overview
Local-first Kanban task management app for a single-user lead generation agency.
Columns = clients. One "General" column for non-client tasks. Tasks have internal
status, priority, deadlines. Drag-and-drop between client columns.

## Tech Stack
- Next.js 15 (App Router) with TypeScript
- TailwindCSS v4 for styling
- Zustand for state management (separate stores per domain)
- dnd-kit for drag-and-drop (@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities)
- Dexie v4 for IndexedDB (local-first persistence)
- nanoid for ID generation

## Architecture
Layered: Components → Stores → Services → Repositories → Dexie

- Repository pattern: all DB access through interfaces in src/repositories/interfaces.ts
- Zustand stores hold runtime state, hydrate from repositories on app load
- All components are client-side ("use client") since this is local-first
- Business logic lives in src/services/, not in components or stores

## Directory Structure
- src/app/ — Next.js App Router pages (kanban, projects, archive, settings)
- src/components/ — React components organized by feature
- src/stores/ — Zustand stores (taskStore, projectStore, clientStore, uiStore, undoStore)
- src/repositories/ — Data access layer (interfaces.ts + dexie/ implementations)
- src/services/ — Business logic (dragService, taskService, backupService, csvService)
- src/hooks/ — Custom React hooks
- src/types/ — TypeScript interfaces and enums
- src/lib/ — Utilities, constants, helpers

## Key Patterns
- Tasks with null clientId appear in the "General" column
- GENERAL_COLUMN_ID = '__general__' constant for column identification
- Dragging a task to a new client auto-unassigns projectId if project doesn't include that client
- Fractional indexing for orderIndex (see src/lib/orderIndex.ts)
- Dexie stores null clientId as empty string internally; repository maps back to null
- Autosave in task drawer uses 300ms debounce
- Undo toast appears after delete/archive with 5-second TTL

## Commands
- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint

## Conventions
- nanoid for generating IDs (via generateId() in src/lib/utils.ts)
- Dates stored as ISO 8601 strings
- Components use named exports
- One component per file
- Zustand stores use the create function with TypeScript interfaces
- Repository methods are async and return Promises
- Use cn() from src/lib/utils.ts for conditional class names

## Common Tasks
- Adding a new field to Task: update types/task.ts → update Dexie schema version in
  repositories/dexie/db.ts → update repository → update store → update TaskForm
- Adding a new view: create src/app/{view}/page.tsx → add sidebar link → create components
- Swapping storage: implement new class for ITaskRepository etc. → update factory in
  src/repositories/index.ts
