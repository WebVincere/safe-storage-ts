# safe-storage-ts


> A zero-dependency, type-safe browser storage wrapper for TypeScript with built-in SSR memory fallback, TTL expiration, and support for both `localStorage` and `sessionStorage`.


---


## ✨ Features


* **Strict TypeScript Generics:** Define a schema interface for your keys and values to get bulletproof autocomplete and type safety.
* **Dual Storage Engines:** Seamlessly switch between persistent `localStorage` and tab-scoped `sessionStorage` via configuration.
* **SSR Safe Out-of-the-Box:** Gracefully falls back to an in-memory store during Server-Side Rendering (e.g., Next.js, Remix, Astro) without throwing `window is not defined` errors.
* **Built-in TTL (Time-To-Live):** Expire stored items automatically after a specified millisecond duration.
* **Zero Dependencies:** Ultra-lightweight with clean, modern ESM and CJS bundle outputs.
* **Fault Tolerant:** Safe JSON serialization/deserialization with built-in error suppression and quota management.


---


## 🤔 Why `safe-storage-ts`?


Writing raw `localStorage` in TypeScript apps usually leads to repetitive boilerplate:
* ❌ **No Type Safety:** Everything is stored as a raw string, requiring manual `JSON.parse` and dangerous type castings (`as MyType`).
* ❌ **SSR Crashes:** Accessing `localStorage` during Server-Side Rendering throws `ReferenceError: window is not defined`.
* ❌ **No Expiration (TTL):** Native storage doesn't support expiration times out of the box.
* ❌ **Silent Failures:** Quota exceeded errors (especially in Safari Private Mode) crash your UI if unhandled.


`safe-storage-ts` solves all of these with a **zero-dependency, featherlight footprint**.
---


## 📦 Installation


```bash
npm install safe-storage-ts
```


---


## 🚀 Quick Start


Define your storage schema to enforce type safety across your keys and values:
```typescript
import { createStorage } from 'safe-storage-ts';

// 1. Define your data schema
interface AppSchema {
  theme: 'dark' | 'light';
  userToken: string;
  loginAttempts: number;
}

// 2. Initialize storage with an optional namespace prefix
const storage = createStorage<AppSchema>('app:');

// 3. Set and get typed values
storage.set('theme', 'dark');
const currentTheme = storage.get('theme'); // Type: 'dark' | 'light' | null
```


---


## ⚙️ Advanced Configuration


### 1. Using Session Storage


To use `sessionStorage` instead of persistent `localStorage`, pass `storageType: 'session'` in the options:
```typescript
interface SignupSchema {
  signupChallenge: string;
}

const sessionStore = createStorage<SignupSchema>('signup:', { 
  storageType: 'session' 
});

sessionStore.set('signupChallenge', 'xyz-token-123');
// Clears automatically when the browser tab closes!
```


### 2. Time-To-Live (TTL) Expiration


You can set a default TTL globally or override it per item write:
```typescript
// Set an item that expires automatically after 5 minutes (300,000 ms)
storage.set('userToken', 'secret_abc', { ttl: 5 * 60 * 1000 });

// Later... returns null if expired and automatically cleans up the key
const token = storage.get('userToken'); 
```


---


## 🌍 Server-Side Rendering (SSR) Behavior


When executed on the server where `window` is unavailable, `safe-storage-ts` automatically switches to a safe **in-memory fallback (`Map`)**.
* Your app will **never crash** with `window is not defined`.
* Data written on the server persists safely for the duration of that request lifecycle without polluting global scope.


---


## 📖 API Reference


### `createStorage<Schema>(prefix?, options?)`


Creates a new storage instance bound to your schema.
* **`prefix`** *(string, optional)*: A namespace prefix prepended to all storage keys (e.g., `'app:'`).
* **`options`** *(StorageOptions, optional)*:
* `storageType`: `'local' | 'session'` (default: `'local'`)
* `ttl`: Default expiration time in milliseconds
* `prefix`: Alternative way to supply a prefix




### Methods


* **`get<K Schema extends keyof>(key: K): Schema[K] | null`**
Retrieves and parses the value for the given key. Returns `null` if the item doesn't exist, is malformed, or has expired.
* **`set<K Schema extends keyof>(key: K, value: Schema[K], options?: StorageOptions): void`**
Serializes and stores the value with optional per-item TTL overrides.
* **`remove<K Schema extends keyof>(key: K): void`**
Removes a specific key from storage.
* **`clear(): void`**
Clears all keys belonging to this storage instance's namespace/prefix without wiping unrelated keys in the browser.


---


## 🛡️ License


[MIT](https://www.google.com/search?q=LICENSE)