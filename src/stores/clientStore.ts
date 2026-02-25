import { create } from 'zustand';
import type { Client, ClientCreate, ClientUpdate } from '@/types/client';
import { getClientRepository } from '@/repositories';
import { generateId, nowISO } from '@/lib/utils';

interface ClientState {
  clients: Record<string, Client>;
  isLoaded: boolean;

  hydrate: () => Promise<void>;
  addClient: (input: ClientCreate) => Promise<Client>;
  updateClient: (input: ClientUpdate) => Promise<void>;
  deleteClient: (id: string) => Promise<Client | undefined>;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: {},
  isLoaded: false,

  hydrate: async () => {
    const repo = getClientRepository();
    const all = await repo.getAll();
    const clients: Record<string, Client> = {};
    for (const c of all) clients[c.id] = c;
    set({ clients, isLoaded: true });
  },

  addClient: async (input) => {
    const client: Client = {
      id: generateId(),
      name: input.name,
      color: input.color,
      createdAt: nowISO(),
    };
    const repo = getClientRepository();
    await repo.create(client);
    set((state) => ({
      clients: { ...state.clients, [client.id]: client },
    }));
    return client;
  },

  updateClient: async (input) => {
    const { id, ...changes } = input;
    const repo = getClientRepository();
    await repo.update(id, changes);
    set((state) => {
      const existing = state.clients[id];
      if (!existing) return state;
      return {
        clients: { ...state.clients, [id]: { ...existing, ...changes } },
      };
    });
  },

  deleteClient: async (id) => {
    const existing = get().clients[id];
    if (!existing) return undefined;
    const repo = getClientRepository();
    await repo.delete(id);
    set((state) => {
      const { [id]: _, ...rest } = state.clients;
      return { clients: rest };
    });
    return existing;
  },
}));
