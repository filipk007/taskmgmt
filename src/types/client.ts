export interface Client {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export type ClientCreate = Omit<Client, 'id' | 'createdAt'>;

export type ClientUpdate = Partial<Omit<Client, 'id' | 'createdAt'>> & {
  id: string;
};
