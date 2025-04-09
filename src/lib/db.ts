import { UserSettings, UserProfile } from '../types/auth';

const DB_NAME = 'manus-ui-db';
const DB_VERSION = 1;
const USER_STORE = 'user';
const SETTINGS_STORE = 'settings';

export class Database {
  private db: IDBDatabase | null = null;
  private connecting: Promise<IDBDatabase> | null = null;

  async connect(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.connecting) return this.connecting;

    this.connecting = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to connect to IndexedDB'));
        this.connecting = null;
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
        this.connecting = null;
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains(USER_STORE)) {
          db.createObjectStore(USER_STORE, { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE, { keyPath: 'id' });
        }
      };
    });

    return this.connecting;
  }

  async saveUser(user: UserProfile): Promise<void> {
    const db = await this.connect();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_STORE], 'readwrite');
      const store = transaction.objectStore(USER_STORE);
      
      const request = store.put(user);
      
      request.onerror = () => reject(new Error('Failed to save user'));
      request.onsuccess = () => resolve();
    });
  }

  async getUser(): Promise<UserProfile | null> {
    const db = await this.connect();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_STORE], 'readonly');
      const store = transaction.objectStore(USER_STORE);
      
      // Get the most recent user (we only store one user)
      const request = store.getAll();
      
      request.onerror = () => reject(new Error('Failed to get user'));
      request.onsuccess = () => {
        const users = request.result;
        resolve(users.length > 0 ? users[0] : null);
      };
    });
  }

  async clearUser(): Promise<void> {
    const db = await this.connect();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_STORE], 'readwrite');
      const store = transaction.objectStore(USER_STORE);
      
      const request = store.clear();
      
      request.onerror = () => reject(new Error('Failed to clear user'));
      request.onsuccess = () => resolve();
    });
  }

  async saveSettings(settings: UserSettings): Promise<void> {
    const db = await this.connect();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE], 'readwrite');
      const store = transaction.objectStore(SETTINGS_STORE);
      
      // We only have one settings object, always use the same ID
      const settingsWithId = { ...settings, id: 'user-settings' };
      const request = store.put(settingsWithId);
      
      request.onerror = () => reject(new Error('Failed to save settings'));
      request.onsuccess = () => resolve();
    });
  }

  async getSettings(): Promise<UserSettings | null> {
    const db = await this.connect();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(SETTINGS_STORE);
      
      const request = store.get('user-settings');
      
      request.onerror = () => reject(new Error('Failed to get settings'));
      request.onsuccess = () => {
        const settings = request.result;
        if (settings) {
          // Remove the id property before returning
          const { id, ...settingsWithoutId } = settings;
          resolve(settingsWithoutId as UserSettings);
        } else {
          resolve(null);
        }
      };
    });
  }
}

// Create a singleton instance
export const db = new Database(); 