'use client';

import { useState } from 'react';
import { useClientStore } from '@/stores/clientStore';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DEFAULT_CLIENT_COLORS } from '@/lib/constants';
import type { Client } from '@/types/client';

interface ClientFormProps {
  client: Client | null;
  onClose: () => void;
}

export function ClientForm({ client, onClose }: ClientFormProps) {
  const addClient = useClientStore((s) => s.addClient);
  const updateClient = useClientStore((s) => s.updateClient);

  const [name, setName] = useState(client?.name ?? '');
  const [color, setColor] = useState(
    client?.color ?? DEFAULT_CLIENT_COLORS[Math.floor(Math.random() * DEFAULT_CLIENT_COLORS.length)]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (client) {
      await updateClient({ id: client.id, name: trimmed, color });
    } else {
      await addClient({ name: trimmed, color });
    }
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {client ? 'Edit Client' : 'New Client'}
        </h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client name"
              autoFocus
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {DEFAULT_CLIENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-gray-900 dark:border-gray-100 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {client ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
