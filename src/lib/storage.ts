// Persistent storage helpers: request persistent storage and a small IndexedDB wrapper

export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('storage' in navigator) || !(navigator as any).storage.persist) {
    return false;
  }
  try {
    const granted = await (navigator as any).storage.persist();
    console.log('Persistent storage granted:', granted);
    return granted;
  } catch (e) {
    console.error('requestPersistentStorage failed', e);
    return false;
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('easyfollowup-local', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('leads')) db.createObjectStore('leads', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('reminders')) db.createObjectStore('reminders', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('syncQueue')) db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function withStore<T>(storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest | PromiseLike<any>): Promise<T> {
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    try {
      const r = fn(store);
      tx.oncomplete = () => resolve(r as unknown as T);
      tx.onerror = () => reject(tx.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function addLead(lead: Record<string, any>) {
  const db = await openDB();
  return new Promise<number>((resolve, reject) => {
    const tx = db.transaction('leads', 'readwrite');
    const store = tx.objectStore('leads');
    const req = store.add({ ...lead, createdAt: Date.now() });
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getLeads(): Promise<Record<string, any>[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('leads', 'readonly');
    const store = tx.objectStore('leads');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as Record<string, any>[]);
    req.onerror = () => reject(req.error);
  });
}

export async function addReminder(reminder: { time: number; title: string; body?: string }) {
  const db = await openDB();
  return new Promise<number>((resolve, reject) => {
    const tx = db.transaction('reminders', 'readwrite');
    const store = tx.objectStore('reminders');
    const req = store.add(reminder);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getDueReminders(now = Date.now()): Promise<Array<{ id?: number; time: number; title: string; body?: string }>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('reminders', 'readonly');
    const store = tx.objectStore('reminders');
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result as any[];
      const due = all.filter((r) => typeof r.time === 'number' && r.time <= now);
      resolve(due);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllData() {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(['leads', 'reminders', 'syncQueue'], 'readwrite');
    tx.objectStore('leads').clear();
    tx.objectStore('reminders').clear();
    tx.objectStore('syncQueue').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export default {
  requestPersistentStorage,
  addLead,
  getLeads,
  addReminder,
  getDueReminders,
  clearAllData,
};
