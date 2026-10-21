import { describe, it, expect, beforeEach } from "vitest";
import { createStorage } from "../src/index";

// Mock localStorage for Node.js environment
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] || null,
    get length() {
      return store.size;
    },
  } as Storage;
}

interface TestSchema {
  token: string;
  count: number;
  user: { name: string };
}

describe("safe-storage-ts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should set and get typed items correctly", () => {
    const storage = createStorage<TestSchema>("test:");
    storage.set("count", 42);
    expect(storage.get("count")).toBe(42);
  });

  it("should handle TTL expiration correctly", async () => {
    const storage = createStorage<TestSchema>("test:");
    storage.set("token", "secret123", { ttl: 40 });

    expect(storage.get("token")).toBe("secret123");

    await new Promise((resolve) => setTimeout(resolve, 70));
    expect(storage.get("token")).toBeNull();
  });

  it("should recover safely from malformed JSON payloads", () => {
    const storage = createStorage<TestSchema>("test:");
    localStorage.setItem("test:count", "not-valid-json{{{");
    expect(storage.get("count")).toBeNull();
  });
});
