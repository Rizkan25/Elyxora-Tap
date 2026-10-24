// =============================================
// STATE MANAGEMENT (state.js)
// Semua variabel global dan pengaturan disimpan di sini
// =============================================

export const defaultCustomClock = {
  textColor: '#ffffff', bgTransp: true, bgColor: '#000000',
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontWeight: '800', spacing: '-3', opacity: 1,
  padding: 0, radius: 0,
  bdrColor: '#8b5cf6', bdrWidth: 0, bdrStyle: 'solid',
  shColor: '#000000', shBlur: 0, shDist: 0, anim: 'none'
};

export const defaultCustomSearch = {
  textColor: '#ffffff', bgTransp: true, bgColor: '#000000',
  opacity: 0.15, blur: 10, radius: 24, padding: 12,
  bdrColor: '#ffffff', bdrWidth: 1, bdrStyle: 'solid', bdrOpacity: 0.1,
  shColor: '#000000', shBlur: 12, shDist: 4, shOpacity: 0.15,
  iconColor: '#ffffff'
};

export const AppState = {
  // --- Data Utama ---
  elyxoras: [],
  groups: [],
  activeGroup: 'mostUsed',
  clickStats: {},
  lastActiveGroup: 'mostUsed',

  // --- Pengaturan Tampilan & UI ---
  language: 'auto',
  userName: 'Kak',
  bgBlurLevel: 5,
  bgDarkLevel: 60,
  bgType: 'fill',
  bgParallaxStrength: 70,
  accentColor: '#3b82f6',
  clockFormat: '24',
  showSeconds: false,
  showDate: true,
  enableWeather: true,
  weatherLocation: '',
  weatherUnit: 'celsius',
  weatherForecast: false,
  themeMode: 'dark',
  clockStyle: 'bold',
  searchStyle: 'default',
  clockSize: 100,
  weatherSize: 100,
  weatherOpacity: 100,
  settingsOpacity: 100,
  iconSize: 100,
  iconRadius: 20,
  useIconBg: false,
  useCardBg: true,
  titlePosition: 'outside',
  defaultGroupBehavior: 'lastUsed',
  groupTransitionEffect: 'fadeUp',
  showGroupItemCount: true,
  openInNewTab: false,
  confirmDelete: true,

  // --- Wallpaper Aktif ---
  customBackground: '',
  currentWallpaperUrl: '',
  bgModeType: 'image', // 'image' atau 'video'
  videoSizeLimit: 100, // 0 = unlimited, angka = MB

  // --- View Mode & Canvas ---
  viewMode: 'grid', // 'grid' atau 'list'
  activeCanvas: 'obsidian', // 'obsidian', 'sunset', 'cyber', 'live'

  // --- Custom Config ---
  customClock: { ...defaultCustomClock },
  customSearch: { ...defaultCustomSearch }
};

// Daftar kunci yang disimpan ke chrome.storage.local
export const KeysToSave = [
  'language', 'customBackground', 'userName', 'bgBlurLevel', 'bgDarkLevel', 'bgType', 'bgParallaxStrength',
  'accentColor', 'clockFormat', 'showSeconds', 'showDate',
  'enableWeather', 'weatherLocation', 'weatherUnit', 'weatherForecast',
  'themeMode', 'clockStyle', 'searchStyle', 'clockSize', 'weatherSize', 'weatherOpacity', 'settingsOpacity', 'iconSize', 'iconRadius',
  'useIconBg', 'useCardBg', 'titlePosition', 'defaultGroupBehavior', 'groupTransitionEffect', 'lastActiveGroup',
  'showGroupItemCount', 'openInNewTab', 'confirmDelete', 'customClock', 'customSearch',
  'elyxoras', 'groups', 'clickStats',
  'bgModeType', 'videoSizeLimit', 'viewMode', 'activeCanvas'
];

// --- LOAD STATE ---
// Membaca semua data dari chrome.storage.local dan mengisi AppState
export async function loadState() {
  let result = {};
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    try {
      result = (await chrome.storage.local.get(null)) || {};
    } catch (e) {
      console.warn('Gagal membaca chrome.storage.local:', e);
    }
  } else {
    try {
      const saved = localStorage.getItem('elyxora_app_state');
      if (saved) result = JSON.parse(saved);
    } catch (e) {
      console.warn('Gagal membaca localStorage fallback:', e);
    }
  }

  // Muat setiap key yang ada di storage ke AppState
  for (const key of Object.keys(AppState)) {
    if (result[key] !== undefined) {
      if (key === 'customClock') {
        AppState.customClock = { ...defaultCustomClock, ...result.customClock };
      } else if (key === 'customSearch') {
        AppState.customSearch = { ...defaultCustomSearch, ...result.customSearch };
      } else {
        AppState[key] = result[key];
      }
    }
  }

  // Jika tidak ada data awal, buat default elyxoras (Stitch Master Speed Dial)
  if (!AppState.elyxoras || AppState.elyxoras.length === 0) {
    AppState.elyxoras = [
      { id: 1, title: 'Google', url: 'https://google.com', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 2, title: 'GitHub', url: 'https://github.com/Rizkan25', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 3, title: 'Claude AI', url: 'https://claude.ai', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 4, title: 'ChatGPT', url: 'https://chatgpt.com', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 5, title: 'YouTube', url: 'https://youtube.com', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 6, title: 'Perplexity', url: 'https://perplexity.ai', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 7, title: 'WhatsApp', url: 'https://web.whatsapp.com', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 8, title: 'Notion', url: 'https://notion.so', icon: '', iconMode: 'auto', group: 'Favorit' }
    ];
  }
  if (!AppState.groups || AppState.groups.length === 0) {
    AppState.groups = ['Favorit', 'Kerja & Dev', 'AI Tools', 'Sosial & Media'];
  }

  // Tentukan activeGroup sesuai dengan preferensi perilaku default
  const behavior = AppState.defaultGroupBehavior || 'lastUsed';
  if (behavior === 'lastUsed') {
    AppState.activeGroup = result.lastActiveGroup || 'mostUsed';
  } else {
    AppState.activeGroup = 'mostUsed';
  }

  // Set URL wallpaper aktif
  if (AppState.customBackground) {
    AppState.currentWallpaperUrl = AppState.customBackground;
  } else {
    AppState.currentWallpaperUrl = '';
  }

  return AppState;
}

// --- SAVE STATE ---
// Simpan semua properti penting ke chrome.storage
export async function saveState() {
  const dataToSave = {};
  for (const key of KeysToSave) {
    if (AppState[key] !== undefined) {
      dataToSave[key] = AppState[key];
    }
  }
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set(dataToSave);
  } else {
    try {
      localStorage.setItem('elyxora_app_state', JSON.stringify(dataToSave));
    } catch (e) {}
  }
}

// --- SAVE PARTIAL STATE ---
// Simpan hanya beberapa properti — lebih ringan untuk update kecil
export async function savePartialState(partialData) {
  // Update AppState dengan data baru
  for (const key in partialData) {
    if (key in AppState) {
      AppState[key] = partialData[key];
    }
  }
  // Simpan hanya kunci yang valid ke storage
  const filtered = {};
  for (const key in partialData) {
    if (KeysToSave.includes(key)) {
      filtered[key] = partialData[key];
    }
  }
  if (Object.keys(filtered).length > 0) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set(filtered);
    } else {
      try {
        const existing = JSON.parse(localStorage.getItem('elyxora_app_state') || '{}');
        localStorage.setItem('elyxora_app_state', JSON.stringify({ ...existing, ...filtered }));
      } catch (e) {}
    }
  }
}
