import test from "node:test";
import assert from "node:assert/strict";
import { getStoredVisitorCount, setStoredVisitorCount } from "./visitorCountStore";

test("returns a persisted visitor count from storage", () => {
  const storage = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeItem: (key: string) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
    key: (index: number) => Array.from(storage.keys())[index] ?? null,
    get length() {
      return storage.size;
    },
  };

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorageMock,
  });

  assert.equal(getStoredVisitorCount(), 0);
  setStoredVisitorCount(42);
  assert.equal(getStoredVisitorCount(), 42);
});
