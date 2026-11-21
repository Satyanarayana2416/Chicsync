// Production-grade IndexedDB wrapper
import { UserProfile, AnalysisResult } from '../services/geminiService';
import type { HistoryItem, Mode } from '../App';

const DB_NAME = 'ChicSyncDB';
const DB_VERSION = 1;

export interface User {
  id?: number;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

export interface StoredHistoryItem {
  id?: number;
  userId: number;
  timestamp: number;
  result: AnalysisResult;
  generatedImage: string | null;
  mode: Mode;
}

export interface StoredUserProfile {
  userId: number;
  profile: UserProfile;
}

class Database {
  private db: IDBDatabase | null = null;

  async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = (event) => reject('Database error: ' + (event.target as any).error);

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Users Store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Profiles Store
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'userId' });
        }

        // History Store
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
          historyStore.createIndex('userId', 'userId', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Generic transaction helper
  private async transaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T> | void
  ): Promise<T> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      
      let request: IDBRequest<T> | void;
      try {
        request = operation(store);
      } catch (err) {
        reject(err);
        return;
      }

      tx.oncomplete = () => {
        if (request) resolve(request.result);
        else resolve(undefined as unknown as T);
      };
      
      tx.onerror = () => reject(tx.error);
    });
  }

  // --- User Operations ---
  
  async createUser(user: Omit<User, 'id'>): Promise<number> {
    return this.transaction<number>('users', 'readwrite', (store) => store.add(user) as IDBRequest<number>);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('users', 'readonly');
      const store = tx.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // --- Profile Operations ---

  async getUserProfile(userId: number): Promise<UserProfile | null> {
    const result = await this.transaction<StoredUserProfile>('profiles', 'readonly', (store) => store.get(userId));
    return result ? result.profile : null;
  }

  async saveUserProfile(userId: number, profile: UserProfile): Promise<void> {
    await this.transaction('profiles', 'readwrite', (store) => store.put({ userId, profile }));
  }

  // --- History Operations ---

  async getUserHistory(userId: number): Promise<HistoryItem[]> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const index = store.index('userId');
      // GetAll might be slow for massive datasets, but fine for user history here.
      // Cursor would be better for pagination.
      const request = index.getAll(userId);

      request.onsuccess = () => {
        // Map stored items to runtime items (strip internal IDs if needed, but we keep them for deletion)
        const items = request.result.sort((a: StoredHistoryItem, b: StoredHistoryItem) => b.timestamp - a.timestamp);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addHistoryItem(userId: number, item: Omit<HistoryItem, 'id' | 'timestamp'>): Promise<number> {
    const storedItem: Omit<StoredHistoryItem, 'id'> = {
      userId,
      timestamp: Date.now(),
      ...item
    };
    return this.transaction<number>('history', 'readwrite', (store) => store.add(storedItem) as IDBRequest<number>);
  }

  async clearUserHistory(userId: number): Promise<void> {
    const db = await this.connect();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      const index = store.index('userId');
      const request = index.openCursor(IDBKeyRange.only(userId));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
      
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new Database();