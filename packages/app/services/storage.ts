// Simple key-value storage using a global Map + JSON
// Persists within the app session. For true persistence across restarts,
// we'll add proper storage later. This avoids native dependency issues.

const store = new Map<string, string>();

export async function getItem(key: string): Promise<string | null> {
  return store.get(key) ?? null;
}

export async function setItem(key: string, value: string): Promise<void> {
  store.set(key, value);
}

export async function removeItem(key: string): Promise<void> {
  store.delete(key);
}
