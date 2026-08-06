const STORAGE_KEY = "portfolio-visitor-count";

const getStorage = () => {
  const storageCandidate = typeof window !== "undefined" ? window.localStorage : undefined;
  if (storageCandidate) {
    return storageCandidate;
  }

  try {
    return (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null;
  }
};

export const getStoredVisitorCount = () => {
  const storage = getStorage();
  if (!storage) {
    return 0;
  }

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return 0;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
};

export const setStoredVisitorCount = (count: number) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    const normalized = Math.max(0, Math.floor(count));
    storage.setItem(STORAGE_KEY, String(normalized));
  } catch {
    // ignore storage failures
  }
};
