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
  initModeCapsules();
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
    // Ganti ikon di tombol
    const activeOpt = document.querySelector(`.engine-option[data-engine="${eng}"]`);
    if (activeEngineIcon && activeOpt) {
      const svg = activeOpt.querySelector('svg');
      if (svg) {
        const chevron = activeEngineIcon.querySelector('svg:last-child');
        activeEngineIcon.innerHTML = '';
        activeEngineIcon.appendChild(svg.cloneNode(true));
        if (chevron) activeEngineIcon.appendChild(chevron.cloneNode(true));
      }
    }
    // Update placeholder
    if (searchInput) {
      const name = activeOpt?.querySelector('span')?.textContent || eng;
      searchInput.placeholder = `Cari di ${name}...`;
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

// 2. LO-FI MUSIC & AMBIENT CHORD ENGINE (OFFLINE-READY)
let lofiAudio = null;
let isLofiPlaying = false;
let audioCtx = null;
let ambientOscillators = [];

function toggleLofiAudio() {
  const eqBars = document.getElementById('eqBars');
  const playIcon = document.getElementById('lofiPlayIcon');
  const pauseIcon = document.getElementById('lofiPauseIcon');

  if (!isLofiPlaying) {
    if (!lofiAudio) {
      lofiAudio = new Audio('https://streams.ilovemusic.de/iloveradio17.mp3');
      lofiAudio.crossOrigin = 'anonymous';
      lofiAudio.volume = 0.5;
      lofiAudio.addEventListener('error', () => {
        playAmbientSynth();
      });
    }

    lofiAudio.play().then(() => {
      isLofiPlaying = true;
      if (eqBars) eqBars.classList.add('playing');
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
    }).catch(() => {
      playAmbientSynth();
      isLofiPlaying = true;
      if (eqBars) eqBars.classList.add('playing');
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
    });
  } else {
    if (lofiAudio) {
      lofiAudio.pause();
    }
    stopAmbientSynth();
    isLofiPlaying = false;
    if (eqBars) eqBars.classList.remove('playing');
    if (playIcon) playIcon.style.display = 'block';
    if (pauseIcon) pauseIcon.style.display = 'none';
  }
}

function playAmbientSynth() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    stopAmbientSynth();

    const chord = [220, 261.63, 329.63, 392.00]; // A minor 7 warm lo-fi pad
    chord.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
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
      gain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
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
  const toggleBtn = document.getElementById('dockLofiToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleLofiAudio);
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

function initModeCapsules() {
  const capsules = document.querySelectorAll('.mode-capsule');
  const focusOverlay = document.getElementById('focusOverlay');
  const closeFocusBtn = document.getElementById('closeFocusBtn');
  const startPauseBtn = document.getElementById('focusStartPauseBtn');
  const resetBtn = document.getElementById('focusResetBtn');
  const timerDisplay = document.getElementById('focusTimerDisplay');

  capsules.forEach(cap => {
    cap.addEventListener('click', () => {
      capsules.forEach(c => c.classList.remove('active'));
      cap.classList.add('active');
      const mode = cap.dataset.mode;

      if (mode === 'zen') {
        document.body.classList.add('zen-mode');
        if (focusOverlay) focusOverlay.style.display = 'none';
      } else if (mode === 'focus') {
        document.body.classList.remove('zen-mode');
        if (focusOverlay) focusOverlay.style.display = 'flex';
      } else {
        document.body.classList.remove('zen-mode');
        if (focusOverlay) focusOverlay.style.display = 'none';
      }
    });
  });

  if (closeFocusBtn && focusOverlay) {
    closeFocusBtn.addEventListener('click', () => {
      focusOverlay.style.display = 'none';
      capsules.forEach(c => c.classList.remove('active'));
      const defCap = document.querySelector('.mode-capsule[data-mode="default"]');
      if (defCap) defCap.classList.add('active');
    });
  }

  function updateTimerDisplay() {
    const mins = String(Math.floor(focusSecondsLeft / 60)).padStart(2, '0');
    const secs = String(focusSecondsLeft % 60).padStart(2, '0');
    if (timerDisplay) timerDisplay.textContent = `${mins}:${secs}`;
    const label = document.getElementById('focusTimerLabel');
    if (label) label.textContent = `Focus (${mins}:${secs})`;
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

  const navPills = document.querySelectorAll('.nav-pill');
  navPills.forEach(pill => {
    pill.addEventListener('click', () => {
      navPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const view = pill.dataset.view;
      if (view === 'focus-mode') {
        const focusCap = document.getElementById('focusModeBtn');
        if (focusCap) focusCap.click();
      } else if (view === 'speed-dial') {
        document.body.classList.remove('zen-mode');
        const focusOverlay = document.getElementById('focusOverlay');
        if (focusOverlay) focusOverlay.style.display = 'none';
        AppState.activeGroup = 'mostUsed';
        renderGroups();
        renderElyxoras();
      } else if (view === 'workspace-dev') {
        document.body.classList.remove('zen-mode');
        const focusOverlay = document.getElementById('focusOverlay');
        if (focusOverlay) focusOverlay.style.display = 'none';
        if (!AppState.groups.includes('Kerja & Dev')) {
          AppState.groups.push('Kerja & Dev');
        }
        AppState.activeGroup = 'Kerja & Dev';
        renderGroups();
        renderElyxoras();
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

