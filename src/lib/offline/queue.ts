import { getDB } from './db';

export async function enqueueRequest(url: string, method = 'POST', body?: any) {
  if (typeof window === 'undefined') return;
  const db = getDB();
  await db.table('syncQueue').add({ url, method, body, createdAt: Date.now() });
}

export async function processQueue() {
  if (typeof window === 'undefined') return;
  const db = getDB();
  const items = await db.table('syncQueue').toArray();
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
        body: item.body ? JSON.stringify(item.body) : undefined,
      });
      if (res.ok) {
        await db.table('syncQueue').delete(item.id as number);
      }
    } catch (e) {
      // keep item in queue for later retry
    }
  }
}

// Process queue when browser regains connectivity
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void processQueue());
}

export default { enqueueRequest, processQueue };
