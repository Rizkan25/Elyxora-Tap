// =============================================
// MAIN ENTRY (main.js)
// Menginisialisasi aplikasi dan merangkai semua modul
// =============================================
import { AppState, loadState } from './state.js';
import { applyThemeMode, applyBgEffects, applyAccentColor, applyVisualScales, applyClockStyle, applySearchStyle, applyIconStyles, applyWatermarkVisibility, applyProfileAvatar, updateCanvasPillVisibility } from './theme.js';
import { updateClock } from './clock.js';
import { fetchWeather } from './weather.js';
import { renderGroups, renderElyxoras, initGroupDrop, upgradeIconsToBase64, initFAB } from './groups.js';
import { loadTranslations, applyI18n } from './i18n.js';
import { escapeHTML } from './utils.js';
import { openAddModal } from './modal.js';
import { openSettingsModal } from './settings.js';

async function initApp() {
  // 1. Muat semua state dari chrome.storage
  await loadState();
  window.AppState = AppState;
  window.updateCanvasPillVisibility = updateCanvasPillVisibility;

  // 2. Muat file bahasa (i18n) berdasarkan preferensi
  await loadTranslations(AppState.language);
  applyI18n();

  // 3. Terapkan tema dan visual awal
  applyThemeMode(AppState.themeMode);
  applyAccentColor();
  applyClockStyle();
  applySearchStyle();
  applyIconStyles();
  applyVisualScales();
  applyBgEffects();
  applyWatermarkVisibility();
  applyProfileAvatar();
  updateCanvasPillVisibility();
  applySearchTarget();

  // 3. Render grup dan pintasan
  renderGroups();
  renderElyxoras();
  initGroupDrop();
  initFAB();

  // 4. Sync warna accent pada UI settings
  syncAccentColorUI();

  // 5. Setup Viewport Sync
  initViewportSync();

  // 6. Setup Search
  initSearch();

  // 7. Mulai jam dan cuaca
  updateClock();
  fetchWeather();

  // 8. Inisialisasi Fitur & Algoritma Stitch Master Speed Dial
  initGlobalShortcuts();
  initTopHeader();
  initQuickNotes();
  initWeatherDetailModal();
  initFocusOverlay();
  initVoiceSearch();
  initRecentQueries();
  initViewSwitcher();
  initPrecisionDock();
  initShortcutsModal();
  initExportJSONTrigger();

  // 9. Upgrade ikon ke base64 di background (tidak blocking)
  setTimeout(() => upgradeIconsToBase64(), 2000);
}

function syncAccentColorUI() {
  // Sinkronkan tampilan tombol warna yang dipilih
  const accentColor = AppState.accentColor;
  const colorBtns = document.querySelectorAll('.color-btn');
  let matched = false;
  colorBtns.forEach(btn => {
    btn.style.borderColor = 'transparent';
    if (btn.getAttribute('data-color') === accentColor) {
      btn.style.borderColor = 'white';
      matched = true;
    }
  });
  const customLabel = document.querySelector('.custom-color-label');
  const customPicker = document.getElementById('customAccentPicker');
  if (customLabel) {
    customLabel.style.borderColor = matched ? 'var(--modal-border)' : 'white';
  }
  if (customPicker && !matched) {
    customPicker.value = accentColor;
  }
}

function applySearchTarget() {
  const form = document.getElementById('searchForm');
  if (form) {
    form.target = AppState.openInNewTab ? '_blank' : '_self';
  }
}

function initViewportSync() {
  function syncVH() {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--real-vh', `${vh}px`);
  }
  if (window.visualViewport) window.visualViewport.addEventListener('resize', syncVH);
  window.addEventListener('resize', syncVH);
  window.addEventListener('orientationchange', () => setTimeout(syncVH, 200));
  syncVH();
  window.adaptMobileLayout = syncVH;
}

function initSearch() {
  // Engine map: data-engine -> URL builder
  const engineActions = {};
  document.querySelectorAll('.engine-option').forEach(opt => {
    const eng = opt.dataset.engine;
    const action = opt.dataset.action;
    const param = opt.dataset.param || 'q';
    if (eng && action) engineActions[eng] = (q) => `${action}?${param}=${encodeURIComponent(q)}`;
  });

  let currentEngine = localStorage.getItem('elyxora_search_engine') || 'google';
  const activeEngineIcon = document.getElementById('activeEngineIcon');
  const engineDropdown = document.getElementById('engineDropdown');
  const searchInput = document.getElementById('searchInput');

  // Fungsi update tampilan engine aktif dan placeholder
  function setActiveEngine(eng) {
    currentEngine = eng;
    localStorage.setItem('elyxora_search_engine', eng);
    
    const activeOpt = document.querySelector(`.engine-option[data-engine="${eng}"]`);
    const labelEl = document.getElementById('activeEngineLabel');
    const name = activeOpt?.querySelector('span:last-child')?.textContent || eng.charAt(0).toUpperCase() + eng.slice(1);
    
    if (labelEl) {
      labelEl.textContent = name;
    }
    
    // Update placeholder Stitch
    if (searchInput) {
      searchInput.placeholder = `Cari di ${name} atau ketik perintah... (Tekan / untuk fokus)`;
    }
    
    // Update form action
    const form = document.getElementById('searchForm');
    if (form && activeOpt) {
      form.action = activeOpt.dataset.action;
      const input = form.querySelector('input[name]');
      if (input) input.name = activeOpt.dataset.param || 'q';
    }
  }

  // Toggle dropdown
  if (activeEngineIcon && engineDropdown) {
    activeEngineIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = engineDropdown.style.display !== 'none';
      engineDropdown.style.display = isVisible ? 'none' : 'block';
    });
    document.addEventListener('click', () => { engineDropdown.style.display = 'none'; });
  }

  // Pilih engine
  document.querySelectorAll('.engine-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveEngine(opt.dataset.engine);
      if (engineDropdown) engineDropdown.style.display = 'none';
    });
    opt.addEventListener('mouseenter', () => opt.style.background = 'var(--glass-bg)');
    opt.addEventListener('mouseleave', () => opt.style.background = '');
  });

  // Inisialisasi dengan engine yang tersimpan
  setActiveEngine(currentEngine);

  // Submit via custom handler agar bisa force buka tab baru jika AppState.openInNewTab
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = searchInput?.value?.trim();
      if (!q) return;
      const activeOpt = document.querySelector(`.engine-option[data-engine="${currentEngine}"]`);
      const action = activeOpt?.dataset.action || 'https://www.google.com/search';
      const param = activeOpt?.dataset.param || 'q';
      const url = `${action}?${param}=${encodeURIComponent(q)}`;
      if (AppState.openInNewTab) window.open(url, '_blank');
      else window.location.href = url;
    });
  }

  // Search Suggestions (Google)
  const searchSuggestions = document.getElementById('searchSuggestions');
  let suggestTimeout;
  if (searchInput && searchSuggestions) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearTimeout(suggestTimeout);
      
      if (!q) {
        searchSuggestions.style.display = 'none';
        return;
      }
      
      suggestTimeout = setTimeout(async () => {
        try {
          // Hanya mendukung autocomplete standar via API Google
          const res = await fetch(`https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}`);
          if (res.ok) {
            const data = await res.json();
            const suggestions = data[1] || [];
            if (suggestions.length > 0) {
              searchSuggestions.innerHTML = suggestions.map((s, idx) => `
                <div class="suggestion-item" data-index="${idx}" style="padding: 10px 16px; cursor: pointer; transition: 0.2s; color: var(--text-color); font-size: 0.95rem;" 
                     onmouseover="this.style.background='var(--glass-bg)'" 
                     onmouseout="this.style.background=''">
                  ${escapeHTML(s)}
                </div>
              `).join('');
              
              searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                  searchInput.value = item.textContent.trim();
                  searchSuggestions.style.display = 'none';
                  searchForm.dispatchEvent(new Event('submit'));
                });
              });
              
              searchSuggestions.style.display = 'block';
              searchSuggestions.dataset.selectedIndex = -1; // Reset selection
            } else {
              searchSuggestions.style.display = 'none';
            }
          }
        } catch (err) {
          console.warn('Error fetching suggestions:', err);
        }
      }, 300);
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
      if (searchSuggestions.style.display === 'none') return;
      
      const items = searchSuggestions.querySelectorAll('.suggestion-item');
      if (items.length === 0) return;
      
      let selectedIndex = parseInt(searchSuggestions.dataset.selectedIndex || '-1');

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      } else if (e.key === 'Escape') {
        searchSuggestions.style.display = 'none';
        return;
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        searchInput.value = items[selectedIndex].textContent.trim();
        searchSuggestions.style.display = 'none';
        searchForm.dispatchEvent(new Event('submit'));
        return;
      } else {
        return; // Ignore other keys
      }

      searchSuggestions.dataset.selectedIndex = selectedIndex;
      items.forEach((item, idx) => {
        if (idx === selectedIndex) {
          item.style.background = 'var(--glass-bg)';
        } else {
          item.style.background = '';
        }
      });
    });

    // Tutup suggestions kalau klik di luar
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-section')) {
        searchSuggestions.style.display = 'none';
      }
    });
  }
}

// =============================================
// ALGORITMA FITUR STITCH CONCEPT
// =============================================

// 1. GLOBAL KEYBOARD SHORTCUTS
function initGlobalShortcuts() {
  window.addEventListener('keydown', (e) => {
    const activeEl = document.activeElement;
    const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
    const searchInput = document.getElementById('searchInput');

    // Shortcut di dalam search input: Tab untuk rotasi search engine
    if (activeEl === searchInput && e.key === 'Tab') {
      e.preventDefault();
      cycleSearchEngine();
      return;
    }

    // Escape untuk menutup modal atau melepas fokus
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal');
      modals.forEach(m => m.style.display = 'none');
      const focusOverlay = document.getElementById('focusOverlay');
      if (focusOverlay) focusOverlay.style.display = 'none';
      if (document.body.classList.contains('zen-mode')) {
        document.body.classList.remove('zen-mode');
        document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
        const spPill = document.querySelector('.nav-pill[data-view="speed-dial"]');
        if (spPill) spPill.classList.add('active');
      }
      if (isInput) activeEl.blur();
      return;
    }

    // Jika sedang mengetik di input/textarea, abaikan shortcut huruf tunggal
    if (isInput) return;

    // Hotkey: '/' atau Cmd+K / Ctrl+K untuk fokus pencarian
    if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
      return;
    }

    // Hotkey: 1 - 8 untuk membuka pintasan Speed Dial secara instan
    if (/^[1-8]$/.test(e.key)) {
      const idx = parseInt(e.key) - 1;
      const items = document.querySelectorAll('.elyxora-item');
      if (items[idx]) {
        e.preventDefault();
        items[idx].click();
      }
      return;
    }

    // Hotkey: 'N' atau 'n' -> Tambah Pintasan Baru
    if (e.key.toLowerCase() === 'n') {
      e.preventDefault();
      openAddModal();
      return;
    }

    // Hotkey: 'S' atau 's' -> Buka Pengaturan
    if (e.key.toLowerCase() === 's') {
      e.preventDefault();
      openSettingsModal();
      return;
    }

    // Hotkey: '?' -> Cheat Sheet Shortcuts
    if (e.key === '?') {
      e.preventDefault();
      toggleShortcutsModal();
      return;
    }

    // Hotkey: 'P' atau 'p' -> Toggle Musik Lo-fi
    if (e.key.toLowerCase() === 'p') {
      e.preventDefault();
      toggleLofiAudio();
      return;
    }

    // Hotkey: 'M' atau 'm' -> Toggle Mute Musik Lo-fi
    if (e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleLofiMute();
      return;
    }

    // Hotkey: ']' -> Ganti Musik Lo-fi Berikutnya
    if (e.key === ']') {
      e.preventDefault();
      switchLofiTrack(1);
      return;
    }
  });
}

function cycleSearchEngine() {
  const options = Array.from(document.querySelectorAll('.engine-option'));
  if (options.length === 0) return;
  const currentEngine = localStorage.getItem('elyxora_search_engine') || 'google';
  const currentIndex = options.findIndex(o => o.dataset.engine === currentEngine);
  const nextIndex = (currentIndex + 1) % options.length;
  options[nextIndex].click();
}

// 2. LO-FI MUSIC STREAM & MULTI-STATION AUDIO ENGINE (OFFLINE-READY)
const LOFI_PLAYLIST = [
  {
    id: 'chilled-cow',
    title: 'Lofi Hip Hop Radio',
    desc: 'Chilled Cow • Beats to Relax',
    badge: 'LIVE',
    art: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80',
    url: 'https://streams.ilovemusic.de/iloveradio17.mp3'
  },
  {
    id: 'chillhop-cafe',
    title: 'Chillhop Cafe Beats',
    desc: 'Chillhop Music • Jazzy Vibes',
    badge: 'LIVE',
    art: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150&auto=format&fit=crop&q=80',
    url: 'https://streams.fluxfm.de/chillhop/mp3-128/audio/'
  },
  {
    id: 'ambient-chill',
    title: 'Music & Deep Chill',
    desc: 'I Love Chill • Ambient Waves',
    badge: 'LIVE',
    art: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
    url: 'https://streams.ilovemusic.de/iloveradio10.mp3'
  },
  {
    id: 'rain-sleep',
    title: 'Peaceful Night Beats',
    desc: 'Midnight Rain • Deep Relax',
    badge: 'LIVE',
    art: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150&auto=format&fit=crop&q=80',
    url: 'https://stream.zeno.fm/f3wvbbqmdg8uv'
  },
  {
    id: 'tokyo-night',
    title: 'Tokyo Midnight Lofi',
    desc: 'Urban Flow • Code & Study',
    badge: 'LIVE',
    art: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150&auto=format&fit=crop&q=80',
    url: 'https://stream.zeno.fm/0r0xa792kwzuv'
  }
];

let lofiAudio = null;
let isLofiPlaying = false;
let isLofiMuted = localStorage.getItem('elyxora_lofi_muted') === 'true';
let lofiVolume = parseFloat(localStorage.getItem('elyxora_lofi_volume') || '0.5');
let currentLofiIndex = parseInt(localStorage.getItem('elyxora_lofi_index') || '0', 10);
if (isNaN(currentLofiIndex) || currentLofiIndex < 0 || currentLofiIndex >= LOFI_PLAYLIST.length) {
  currentLofiIndex = 0;
}
let audioCtx = null;
let ambientOscillators = [];
let isUsingAmbientFallback = false;

// Perbarui tampilan metadata lagu di UI
function updateLofiPlayerUI(track) {
  if (!track) return;
  const artImg = document.getElementById('lofiArtImg');
  const titleEl = document.getElementById('lofiTrackTitle');
  const descEl = document.getElementById('lofiTrackDesc');
  const badgeEl = document.getElementById('lofiBadgeLive');

  if (artImg) {
    artImg.style.opacity = '0.35';
    setTimeout(() => {
      artImg.src = track.art;
      artImg.alt = track.title;
      artImg.style.opacity = '1';
    }, 120);
  }
  if (titleEl) {
    titleEl.textContent = track.title;
    titleEl.title = `${track.title} (Stasiun ${currentLofiIndex + 1}/${LOFI_PLAYLIST.length})`;
  }
  if (descEl) {
    descEl.textContent = track.desc;
    descEl.title = track.desc;
  }
  if (badgeEl) {
    badgeEl.textContent = track.badge || 'LIVE';
  }
}

// Sinkronisasi status Play/Pause & animasi Equalizer Bar
function setLofiPlayStateUI(isPlaying) {
  const eqBars = document.getElementById('eqBars');
  const playIcon = document.getElementById('lofiPlayIcon');
  const pauseIcon = document.getElementById('lofiPauseIcon');

  if (eqBars) {
    if (isPlaying) {
      eqBars.classList.add('playing');
    } else {
      eqBars.classList.remove('playing');
    }
  }
  if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
  if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
}

// Sinkronisasi ikon dan tooltip Mute/Unmute
function updateLofiMuteUI() {
  const volUpIcon = document.getElementById('lofiVolUpIcon');
  const volMuteIcon = document.getElementById('lofiVolMuteIcon');
  const muteBtn = document.getElementById('lofiMuteBtn');

  if (volUpIcon) volUpIcon.style.display = isLofiMuted ? 'none' : 'block';
  if (volMuteIcon) volMuteIcon.style.display = isLofiMuted ? 'block' : 'none';
  if (muteBtn) {
    muteBtn.title = isLofiMuted ? 'Bunyikan Suara (Unmute - M)' : 'Bisukan Suara (Mute - M)';
  }
}

// Toggle Play / Pause audio
function toggleLofiAudio() {
  if (!isLofiPlaying) {
    playCurrentLofiTrack();
  } else {
    pauseLofiAudio();
  }
}

// Memutar trek saat ini dengan penanganan error & fallback otomatis
function playCurrentLofiTrack() {
  const track = LOFI_PLAYLIST[currentLofiIndex];
  updateLofiPlayerUI(track);
  stopAmbientSynth();
  isUsingAmbientFallback = false;

  // Hentikan dan bersihkan instance audio lama untuk mencegah tumpang tindih suara
  if (lofiAudio) {
    try {
      lofiAudio.pause();
      lofiAudio.onended = null;
      lofiAudio.onerror = null;
      lofiAudio.src = '';
      lofiAudio.load();
    } catch(e) {}
  }

  lofiAudio = new Audio(track.url);
  lofiAudio.crossOrigin = 'anonymous';
  lofiAudio.volume = isLofiMuted ? 0 : lofiVolume;

  // Fallback offline bila stream gagal dimuat
  lofiAudio.addEventListener('error', () => {
    console.warn(`[Lo-fi Player] Stream gagal dimuat untuk "${track.title}", beralih ke ambient lofi chord generator.`);
    playAmbientSynth();
    isLofiPlaying = true;
    isUsingAmbientFallback = true;
    setLofiPlayStateUI(true);
  });

  lofiAudio.addEventListener('playing', () => {
    isLofiPlaying = true;
    setLofiPlayStateUI(true);
  });

  lofiAudio.play().then(() => {
    isLofiPlaying = true;
    setLofiPlayStateUI(true);
  }).catch((err) => {
    console.warn('[Lo-fi Player] Autoplay stream dicegah atau offline, mengaktifkan synth fallback:', err);
    playAmbientSynth();
    isLofiPlaying = true;
    isUsingAmbientFallback = true;
    setLofiPlayStateUI(true);
  });
}

// Menjeda pemutaran musik
function pauseLofiAudio() {
  if (lofiAudio) {
    try {
      lofiAudio.pause();
    } catch(e) {}
  }
  stopAmbientSynth();
  isLofiPlaying = false;
  isUsingAmbientFallback = false;
  setLofiPlayStateUI(false);
}

// Algoritma pergantian trek musik secara manual
function switchLofiTrack(direction = 1) {
  const newIndex = (currentLofiIndex + direction + LOFI_PLAYLIST.length) % LOFI_PLAYLIST.length;
  currentLofiIndex = newIndex;
  try {
    localStorage.setItem('elyxora_lofi_index', currentLofiIndex.toString());
  } catch(e) {}

  const track = LOFI_PLAYLIST[currentLofiIndex];
  updateLofiPlayerUI(track);

  // Jika musik sedang berputar, langsung putar stasiun yang baru dipilih
  if (isLofiPlaying) {
    playCurrentLofiTrack();
  }
}

// Toggle Mute / Unmute
function toggleLofiMute() {
  isLofiMuted = !isLofiMuted;
  try {
    localStorage.setItem('elyxora_lofi_muted', isLofiMuted ? 'true' : 'false');
  } catch(e) {}

  if (lofiAudio) {
    lofiAudio.volume = isLofiMuted ? 0 : lofiVolume;
  }
  if (isUsingAmbientFallback) {
    ambientOscillators.forEach(({ gain }) => {
      try {
        gain.gain.setValueAtTime(isLofiMuted ? 0 : 0.015, audioCtx.currentTime);
      } catch(e) {}
    });
  }
  updateLofiMuteUI();
}

// Ambient Lo-Fi Synthesizer Fallback (Offline-Ready)
function playAmbientSynth() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    stopAmbientSynth();

    const chord = [220, 261.63, 329.63, 392.00, 493.88]; // A minor 9 warm pad
    const targetGain = isLofiMuted ? 0 : 0.015;
    chord.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(targetGain, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      ambientOscillators.push({ osc, gain });
    });
  } catch (e) {
    console.warn('Ambient synth unavailable', e);
  }
}

function stopAmbientSynth() {
  ambientOscillators.forEach(({ osc, gain }) => {
    try {
      if (audioCtx) {
        gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
      }
      setTimeout(() => osc.stop(), 300);
    } catch(e) {}
  });
  ambientOscillators = [];
}

// 3. CANVAS QUICK SWITCHER
function initCanvasSwitcher() {
  const canvasBtns = document.querySelectorAll('.canvas-btn');
  const footerMode = document.getElementById('footerEngineMode');
  const liveBtn = document.getElementById('canvasLiveBtn');

  if (liveBtn && AppState.bgModeType === 'video' && AppState.bgType !== 'none') {
    liveBtn.style.display = 'inline-block';
  }

  canvasBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      canvasBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const canvas = btn.dataset.canvas;
      AppState.activeCanvas = canvas;

      if (canvas === 'obsidian') {
        document.body.style.backgroundImage = 'linear-gradient(135deg, #10131c 0%, #0b0e17 100%)';
        if (footerMode) footerMode.textContent = 'Solid Obsidian';
      } else if (canvas === 'sunset') {
        document.body.style.backgroundImage = 'linear-gradient(135deg, #1a1035 0%, #2c0051 50%, #480081 100%)';
        if (footerMode) footerMode.textContent = 'Neon Sunset';
      } else if (canvas === 'cyber') {
        document.body.style.backgroundImage = 'linear-gradient(135deg, #001e2c 0%, #00363a 50%, #0d111e 100%)';
        if (footerMode) footerMode.textContent = 'Cyber City';
      } else if (canvas === 'live') {
        applyBgEffects();
        if (footerMode) footerMode.textContent = 'Live Wallpaper Engine';
      }
    });
  });
}

function initPrecisionDock() {
  // Inisialisasi UI awal pemutar Lo-fi dari playlist
  const initialTrack = LOFI_PLAYLIST[currentLofiIndex];
  updateLofiPlayerUI(initialTrack);
  updateLofiMuteUI();

  // Tombol Play / Pause
  const toggleBtn = document.getElementById('dockLofiToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleLofiAudio);
  }

  // Tombol Ganti Musik Berikutnya (Next Track)
  const nextBtn = document.getElementById('lofiNextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchLofiTrack(1);
    });
  }

  // Tombol Mute / Unmute
  const muteBtn = document.getElementById('lofiMuteBtn');
  if (muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLofiMute();
    });
  }

  // Klik gambar cover art juga mengganti stasiun berikutnya
  const artBox = document.getElementById('lofiArtBox');
  if (artBox) {
    artBox.addEventListener('click', () => {
      switchLofiTrack(1);
    });
  }

  initCanvasSwitcher();
}

// 4. VOICE SEARCH (WEB SPEECH API)
function initVoiceSearch() {
  const voiceBtn = document.getElementById('voiceSearchBtn');
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');
  if (!voiceBtn || !searchInput) return;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.style.display = 'none';
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = AppState.language === 'en' ? 'en-US' : 'id-ID';
  recognition.continuous = false;
  recognition.interimResults = false;

  let listening = false;

  voiceBtn.addEventListener('click', () => {
    if (listening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
      listening = true;
      voiceBtn.classList.add('listening');
    } catch(e) {
      voiceBtn.classList.remove('listening');
      listening = false;
    }
  });

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    searchInput.value = text;
    voiceBtn.classList.remove('listening');
    listening = false;
    if (searchForm) searchForm.dispatchEvent(new Event('submit'));
  };

  recognition.onerror = () => {
    voiceBtn.classList.remove('listening');
    listening = false;
  };

  recognition.onend = () => {
    voiceBtn.classList.remove('listening');
    listening = false;
  };
}

// 5. RECENT SEARCH CHIPS
function initRecentQueries() {
  const chips = document.querySelectorAll('.recent-chip');
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.query || chip.textContent.trim();
      if (searchInput && q) {
        searchInput.value = q;
        if (searchForm) searchForm.dispatchEvent(new Event('submit'));
      }
    });
  });
}

// 6. VIEW SWITCHER & SPEED DIAL CONTROLS
function initViewSwitcher() {
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');
  const sortIndicator = document.getElementById('matrixSortIndicator');
  const sortModeLabel = document.getElementById('sortModeLabel');
  const bentoAddBtn = document.getElementById('bentoAddBtn');
  const fabAddBtn = document.getElementById('fabAddBtn');

  if (gridBtn && listBtn) {
    if (AppState.viewMode === 'list') {
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
    }

    gridBtn.addEventListener('click', () => {
      gridBtn.classList.add('active');
      listBtn.classList.remove('active');
      AppState.viewMode = 'grid';
      savePartialState({ viewMode: 'grid' });
      renderElyxoras();
    });

    listBtn.addEventListener('click', () => {
      listBtn.classList.add('active');
      gridBtn.classList.remove('active');
      AppState.viewMode = 'list';
      savePartialState({ viewMode: 'list' });
      renderElyxoras();
    });
  }

  if (sortIndicator && sortModeLabel) {
    sortIndicator.style.cursor = 'pointer';
    sortIndicator.addEventListener('click', () => {
      if (AppState.activeGroup === 'mostUsed') {
        const targetGroup = AppState.groups[0] || 'Default';
        AppState.activeGroup = targetGroup;
        sortModeLabel.textContent = `Grup: ${targetGroup}`;
      } else {
        AppState.activeGroup = 'mostUsed';
        sortModeLabel.textContent = 'Sering Dikunjungi';
      }
      renderGroups();
      renderElyxoras();
    });
  }

  if (bentoAddBtn && fabAddBtn) {
    bentoAddBtn.addEventListener('click', () => fabAddBtn.click());
  }
}

// 7. MODE CAPSULES & POMODORO FOCUS TIMER
let focusInterval = null;
let focusSecondsLeft = 25 * 60;
let isFocusRunning = false;

function initFocusOverlay() {
  const focusOverlay = document.getElementById('focusOverlay');
  const closeFocusBtn = document.getElementById('closeFocusBtn');
  const startPauseBtn = document.getElementById('focusStartPauseBtn');
  const resetBtn = document.getElementById('focusResetBtn');
  const timerDisplay = document.getElementById('focusTimerDisplay');

  function updateTimerDisplay() {
    const mins = String(Math.floor(focusSecondsLeft / 60)).padStart(2, '0');
    const secs = String(focusSecondsLeft % 60).padStart(2, '0');
    if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
  }

  if (closeFocusBtn && focusOverlay) {
    closeFocusBtn.addEventListener('click', () => {
      focusOverlay.style.display = 'none';
      document.querySelectorAll('.nav-pill').forEach(p => p.classList.remove('active'));
      const speedDialPill = document.querySelector('.nav-pill[data-view="speed-dial"]');
      if (speedDialPill) speedDialPill.classList.add('active');
    });
  }

  if (startPauseBtn) {
    startPauseBtn.addEventListener('click', () => {
      if (!isFocusRunning) {
        isFocusRunning = true;
        startPauseBtn.textContent = 'Jeda';
        focusInterval = setInterval(() => {
          if (focusSecondsLeft > 0) {
            focusSecondsLeft--;
            updateTimerDisplay();
          } else {
            clearInterval(focusInterval);
            isFocusRunning = false;
            startPauseBtn.textContent = 'Selesai!';
          }
        }, 1000);
      } else {
        clearInterval(focusInterval);
        isFocusRunning = false;
        startPauseBtn.textContent = 'Lanjut';
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      clearInterval(focusInterval);
      isFocusRunning = false;
      focusSecondsLeft = 25 * 60;
      updateTimerDisplay();
      if (startPauseBtn) startPauseBtn.textContent = 'Mulai';
    });
  }
}

// 8. TOP BRAND HEADER CONTROLS
function initTopHeader() {
  const topSettingsBtn = document.getElementById('topSettingsBtn');
  if (topSettingsBtn) {
    topSettingsBtn.addEventListener('click', () => openSettingsModal('tab-style'));
  }

  const userAvatarBadge = document.getElementById('userAvatarBadge');
  if (userAvatarBadge) {
    userAvatarBadge.addEventListener('click', () => {
      openSettingsModal('tab-general');
    });
  }

  const topWeatherPill = document.getElementById('topWeatherPill');
  if (topWeatherPill) {
    topWeatherPill.addEventListener('click', () => {
      openWeatherDetailModal();
    });
  }

  // Handle Collapsible Navbar (Buka / Tutup Bilah Atas Khas Stitch)
  const navbarToggleTab = document.getElementById('navbarToggleTab');
  const elyxoraHeader = document.getElementById('elyxoraHeader');

  function setNavbarCollapsed(isCollapsed, persist = true) {
    if (!elyxoraHeader) return;
    if (isCollapsed) {
      elyxoraHeader.classList.add('collapsed');
      document.body.classList.add('navbar-collapsed');
      if (navbarToggleTab) navbarToggleTab.title = 'Buka Nav Bar';
    } else {
      elyxoraHeader.classList.remove('collapsed');
      document.body.classList.remove('navbar-collapsed');
      if (navbarToggleTab) navbarToggleTab.title = 'Tutup Nav Bar';
    }
    if (persist) {
      try {
        localStorage.setItem('elyxora_navbar_collapsed', isCollapsed ? 'true' : 'false');
      } catch (e) {
        console.warn('Gagal menyimpan status navbar:', e);
      }
    }
  }

  // Restore status navbar dari localStorage
  const savedCollapsed = localStorage.getItem('elyxora_navbar_collapsed') === 'true';
  if (savedCollapsed) {
    setNavbarCollapsed(true, false);
  }

  if (navbarToggleTab) {
    navbarToggleTab.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyCollapsed = elyxoraHeader && elyxoraHeader.classList.contains('collapsed');
      setNavbarCollapsed(!isCurrentlyCollapsed, true);
    });
  }

  // Update speed dial count badge
  const speedDialPillCount = document.getElementById('speedDialPillCount');
  if (speedDialPillCount) {
    const totalItems = AppState.elyxoras ? AppState.elyxoras.length : 16;
    speedDialPillCount.textContent = totalItems || 16;
  }

  const navPills = document.querySelectorAll('.nav-pill');
  navPills.forEach(pill => {
    pill.addEventListener('click', () => {
      navPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const view = pill.dataset.view;

      if (view === 'speed-dial') {
        document.body.classList.remove('zen-mode');
        const focusOverlay = document.getElementById('focusOverlay');
        if (focusOverlay) focusOverlay.style.display = 'none';
        AppState.activeGroup = 'mostUsed';
        renderGroups();
        renderElyxoras();
      } else if (view === 'zen-mode') {
        document.body.classList.add('zen-mode');
        const focusOverlay = document.getElementById('focusOverlay');
        if (focusOverlay) focusOverlay.style.display = 'none';
      } else if (view === 'focus-mode') {
        document.body.classList.remove('zen-mode');
        const focusOverlay = document.getElementById('focusOverlay');
        if (focusOverlay) focusOverlay.style.display = 'flex';
      } else if (view === 'notes') {
        openQuickNotesModal();
      }
    });
  });
}

// 8b. QUICK SCRATCHPAD & NOTES
function initQuickNotes() {
  const modal = document.getElementById('notesModal');
  const textarea = document.getElementById('quickNotesArea');
  const charCount = document.getElementById('notesCharCount');
  const copyBtn = document.getElementById('copyNotesBtn');
  const clearBtn = document.getElementById('clearNotesBtn');
  const closeBtn = document.getElementById('closeNotesBtn');

  if (!textarea) return;

  const savedNote = localStorage.getItem('elyxora_quick_notes') || '';
  textarea.value = savedNote;
  updateCounts();

  function updateCounts() {
    const text = textarea.value;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    if (charCount) charCount.textContent = `${chars} karakter • ${words} kata`;
  }

  textarea.addEventListener('input', () => {
    updateCounts();
    localStorage.setItem('elyxora_quick_notes', textarea.value);
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!textarea.value.trim()) return;
      try {
        await navigator.clipboard.writeText(textarea.value);
        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = `<span>Tersalin! ✓</span>`;
        setTimeout(() => copyBtn.innerHTML = originalHTML, 1500);
      } catch (err) {
        console.warn('Gagal copy:', err);
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!textarea.value) return;
      if (confirm('Bersihkan seluruh catatan cepat?')) {
        textarea.value = '';
        localStorage.removeItem('elyxora_quick_notes');
        updateCounts();
      }
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
}

function openQuickNotesModal() {
  const modal = document.getElementById('notesModal');
  if (!modal) return;
  modal.style.display = 'flex';
  const textarea = document.getElementById('quickNotesArea');
  if (textarea) textarea.focus();
}

// 8c. WEATHER DETAIL MODAL
function initWeatherDetailModal() {
  const modal = document.getElementById('weatherDetailModal');
  const closeBtn = document.getElementById('closeWeatherModalBtn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
}

function openWeatherDetailModal() {
  const modal = document.getElementById('weatherDetailModal');
  if (!modal) return;

  const tempEl = document.getElementById('weatherTemp');
  const descEl = document.getElementById('weatherDesc');
  const locEl = document.getElementById('topWeatherText');
  const unit = AppState.weatherUnit === 'F' ? '°F' : '°C';

  const wDetailLocation = document.getElementById('wDetailLocation');
  const wDetailTemp = document.getElementById('wDetailTemp');
  const wDetailDesc = document.getElementById('wDetailDesc');
  const wDetailMeta = document.getElementById('wDetailMeta');
  const wDetailForecastRow = document.getElementById('wDetailForecastRow');

  if (wDetailLocation) {
    wDetailLocation.textContent = AppState.weatherLocation || (locEl ? locEl.textContent : 'Banda Aceh, ID');
  }

  if (wDetailTemp) {
    wDetailTemp.textContent = tempEl ? tempEl.textContent : `26${unit}`;
  }

  if (wDetailDesc) {
    wDetailDesc.textContent = descEl ? descEl.textContent : 'Cerah Berawan';
  }

  if (wDetailMeta) {
    wDetailMeta.textContent = 'Kelembaban: 76% • Angin: 14 km/jam • Indeks UV: Rendah';
  }

  if (wDetailForecastRow) {
    const days = ['Besok', 'Lusa', 'H+3'];
    const icons = ['☀️', '⛅', '🌧️'];
    const temps = [`27${unit}`, `26${unit}`, `24${unit}`];
    wDetailForecastRow.innerHTML = days.map((day, i) => `
      <div class="forecast-mini-card">
        <div class="forecast-day">${day}</div>
        <div class="forecast-icon">${icons[i]}</div>
        <div class="forecast-temp">${temps[i]}</div>
      </div>
    `).join('');
  }

  modal.style.display = 'flex';
}

// 9. SHORTCUTS MODAL
function initShortcutsModal() {
  const link = document.getElementById('shortcutsHelpLink');
  const modal = document.getElementById('shortcutsModal');
  const closeBtn = document.getElementById('closeShortcutsBtn');

  if (link && modal) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
}

function toggleShortcutsModal() {
  openSettingsModal('tab-shortcuts');
}

// 10. EXPORT JSON TRIGGER
function initExportJSONTrigger() {
  const btn = document.getElementById('dockExportBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    let data = AppState;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      data = (await chrome.storage.local.get(null)) || AppState;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elyxora-tab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// Jalankan
initApp();

