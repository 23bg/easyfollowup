import Dexie from 'dexie';

interface OfflineDBSchema {
  leads: {
    key: string;
    value: { id: string; name?: string; updatedAt?: number };
    indexes: { updatedAt: number };
  };
  followUps: {
    key: string;
    value: { id: string; leadId: string; notes?: string; dueAt?: number };
    indexes: { leadId: string };
  };
  syncQueue: {
    key: number;
    value: { id?: number; url: string; method: string; body?: any; createdAt: number };
    indexes: { createdAt: number };
  };
}

let _db: Dexie | null = null;

export function getDB() {
  if (typeof window === 'undefined') throw new Error('IndexedDB is only available in the browser');
  if (_db) return _db as Dexie;

  const db = new Dexie('easyfollowup-offline');
  db.version(1).stores({
    leads: 'id, updatedAt',
    followUps: 'id, leadId, dueAt',
    syncQueue: '++id, url, createdAt',
  });

  _db = db;
  return db;
}

export async function clearOfflineData() {
  const db = getDB();
  await Promise.all([db.table('leads').clear(), db.table('followUps').clear(), db.table('syncQueue').clear()]);
}
