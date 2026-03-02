'use client';

import { SidebarLink } from './SidebarLink';
import { ThemeToggle } from './ThemeToggle';

const KanbanIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const ProjectsIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const SettingsIcon = () => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function Sidebar() {
  return (
    <aside className="hidden md:flex h-full w-56 shrink-0 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex h-14 items-center px-4">
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">TaskMgmt</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        <SidebarLink href="/kanban" icon={<KanbanIcon />} label="Kanban" />
        <SidebarLink href="/projects" icon={<ProjectsIcon />} label="Projects" />
        <SidebarLink href="/archive" icon={<ArchiveIcon />} label="Archive" />
      </nav>
      <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2 space-y-1">
        <SidebarLink href="/settings" icon={<SettingsIcon />} label="Settings" />
        <ThemeToggle />
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="flex md:hidden items-center gap-1 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 overflow-x-auto shrink-0">
      <span className="text-sm font-bold text-gray-900 dark:text-gray-100 pr-2 shrink-0">TaskMgmt</span>
      <div className="flex-1" />
      <SidebarLink href="/kanban" icon={<KanbanIcon />} label="Kanban" />
      <SidebarLink href="/projects" icon={<ProjectsIcon />} label="Projects" />
      <SidebarLink href="/archive" icon={<ArchiveIcon />} label="Archive" />
      <SidebarLink href="/settings" icon={<SettingsIcon />} label="Settings" />
      <ThemeToggle compact />
    </nav>
  );
}
