// =============================================
// INDEXEDDB VIDEO STORAGE (idb.js)
// Menyimpan dan mengambil Blob Video untuk Live Wallpaper
// =============================================

const DB_NAME = 'ElyxoraDB';
const DB_VERSION = 1;
const STORE_NAME = 'media';
const VIDEO_KEY = 'liveWallpaper';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Menyimpan video Blob ke IndexedDB.
 * @param {Blob} blob - File video mentah
 * @returns {Promise<void>}
 */
export async function saveVideoBlob(blob) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(blob, VIDEO_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/**
 * Mengambil video Blob dari IndexedDB.
 * @returns {Promise<Blob|null>}
 */
export async function getVideoBlob() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(VIDEO_KEY);
    request.onsuccess = () => { db.close(); resolve(request.result || null); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

/**
 * Menghapus video Blob dari IndexedDB.
 * @returns {Promise<void>}
 */
export async function deleteVideoBlob() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(VIDEO_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
