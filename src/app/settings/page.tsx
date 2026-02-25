'use client';

import { ClientManager } from '@/components/settings/ClientManager';
import { BackupRestore } from '@/components/settings/BackupRestore';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
      <div className="mt-6 space-y-8">
        <ClientManager />
        <hr className="border-gray-200" />
        <BackupRestore />
      </div>
    </div>
  );
}
