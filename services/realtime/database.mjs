import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { zones } from '../../apps/desktop/src/world/map.ts';

dotenv.config({ path: new URL('../../.env', import.meta.url), quiet: true });

export const persistentFields = {
  chat: ['messages'], 'event-create': ['events'], 'event-delete': ['events'],
  'note-create': ['notes'], 'note-delete': ['notes'], stroke: ['boards'],
  'clear-board': ['boards'], interact: ['fixtureStates'],
};

export async function connectDatabase() {
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL in the root .env file.');
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, max: 5 }), log: [] });
  try { await client.$connect(); await client.$queryRaw`SELECT 1`; }
  catch { await client.$disconnect(); throw new Error('Database connection failed. Check the root .env file and database availability.'); }
  return client;
}

export function workspaceStore(client) {
  return {
    async create(room) {
      await client.workspace.create({ data: {
        id: room.id, worldSeed: room.worldSeed, name: room.name, private: room.private,
        passwordHash: room.password, passwordSalt: room.salt,
        state: { create: {} },
        spaces: { create: zones.map(z => ({ zoneId: z.id, name: z.name, capacity: z.capacity, audioMode: z.audio })) },
      } });
    },
    async load(code) {
      const row = await client.workspace.findFirst({ where: { OR: [{ id: code }, { worldSeed: code }] }, include: { state: true } });
      if (!row) return null;
      return { id: row.id, worldSeed: row.worldSeed, name: row.name, private: row.private, password: row.passwordHash, salt: row.passwordSalt,
        messages: row.state?.messages || [], events: row.state?.events || [], notes: row.state?.notes || [], boards: row.state?.boards || {}, fixtureStates: row.state?.fixtureStates || {} };
    },
    list: () => client.workspace.findMany({ where: { private: false }, select: { id: true, name: true }, orderBy: { createdAt: 'asc' }, take: 100 }),
    async save(room, fields) {
      // Direct messages belong to connection identities, not persistent user accounts.
      const data = Object.fromEntries(fields.map(field => [field, field === 'messages' ? room.messages.filter(message => !message.recipientId) : room[field]]));
      await client.workspaceState.upsert({ where: { workspaceId: room.id }, create: { workspaceId: room.id, ...data }, update: data });
    },
    putAsset: (roomId, id, asset) => client.asset.create({ data: { id, workspaceId: roomId, type: asset.type, data: asset.data } }),
    getAsset: (roomId, id) => client.asset.findFirst({ where: { id, workspaceId: roomId } }),
    countAssets: roomId => client.asset.count({ where: { workspaceId: roomId } }),
    close: () => client.$disconnect(),
  };
}
