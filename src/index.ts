export interface StorageOptions {
  /** Default Time-To-Live in milliseconds */
  ttl?: number;
  /** Namespace prefix to avoid key collisions */
  prefix?: string;
  /** Choose between localStorage (default) or sessionStorage */
  storageType?: "local" | "session";
}

interface StorageItem<T> {
  value: T;
  expiry: number | null;
}

export function createStorage<Schema extends Record<string, any>>(
  defaultPrefix = "",
  globalOptions: StorageOptions = {},
) {
  const memoryFallback = new Map<string, string>();
  const storageType = globalOptions.storageType ?? "local";

  function getStorageEngine(): Storage | null {
    try {
      const win = typeof window !== "undefined" ? window : null;
      if (!win) return null;

      const engine =
        storageType === "session" ? win.sessionStorage : win.localStorage;
      const testKey = "__safe_storage_test__";
      engine.setItem(testKey, testKey);
      engine.removeItem(testKey);
      return engine;
    } catch {
      return null;
    }
  }

  const engine = getStorageEngine();

  function getFullKey(key: string): string {
    return `${globalOptions.prefix || ""}${defaultPrefix}${key}`;
  }

  return {
    get<K extends keyof Schema>(key: K): Schema[K] | null {
      const fullKey = getFullKey(String(key));
      try {
        const raw = engine
          ? engine.getItem(fullKey)
          : memoryFallback.get(fullKey);

        if (!raw) return null;

        const item: StorageItem<Schema[K]> = JSON.parse(raw);

        if (item.expiry && Date.now() > item.expiry) {
          this.remove(key);
          return null;
        }

        return item.value;
      } catch {
        return null;
      }
    },

    set<K extends keyof Schema>(
      key: K,
      value: Schema[K],
      options?: StorageOptions,
    ): void {
      const fullKey = getFullKey(String(key));
      const ttl = options?.ttl ?? globalOptions.ttl;
      const expiry = ttl ? Date.now() + ttl : null;

      const item: StorageItem<Schema[K]> = { value, expiry };

      try {
        const serialized = JSON.stringify(item);
        if (engine) {
          engine.setItem(fullKey, serialized);
        } else {
          memoryFallback.set(fullKey, serialized);
        }
      } catch (error) {
        console.warn(
          `[safe-storage-ts] Failed to set key "${String(key)}":`,
          error,
        );
      }
    },

    remove<K extends keyof Schema>(key: K): void {
      const fullKey = getFullKey(String(key));
      if (engine) {
        engine.removeItem(fullKey);
      } else {
        memoryFallback.delete(fullKey);
      }
    },

    clear(): void {
      if (engine) {
        const prefix = globalOptions.prefix || defaultPrefix;
        const keysToRemove: string[] = [];
        for (let i = 0; i < engine.length; i++) {
          const k = engine.key(i);
          if (k && k.startsWith(prefix)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => engine.removeItem(k));
      } else {
        memoryFallback.clear();
      }
    },
  };
}
