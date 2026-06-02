// =============================================
// MAIN ENTRY (main.js)
// Menginisialisasi aplikasi dan merangkai semua modul
// =============================================
import { AppState, loadState } from './state.js';
import { applyThemeMode, applyBgEffects, applyAccentColor, applyVisualScales, applyClockStyle, applySearchStyle, applyIconStyles } from './theme.js';
import { updateClock } from './clock.js';
import { fetchWeather } from './weather.js';
import { renderGroups, renderElyxoras, initGroupDrop, upgradeIconsToBase64, initFAB } from './groups.js';
import { loadTranslations, applyI18n } from './i18n.js';
import './modal.js';    // Modul modal diinisialisasi saat di-import
import './settings.js'; // Modul settings diinisialisasi saat di-import

async function initApp() {
  // 1. Muat semua state dari chrome.storage
  await loadState();

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

  // 8. Upgrade ikon ke base64 di background (tidak blocking)
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
              searchSuggestions.innerHTML = suggestions.map(s => `
                <div class="suggestion-item" style="padding: 10px 16px; cursor: pointer; transition: 0.2s; color: var(--text-color); font-size: 0.95rem;" 
                     onmouseover="this.style.background='var(--glass-bg)'" 
                     onmouseout="this.style.background=''">
                  ${s}
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
            } else {
              searchSuggestions.style.display = 'none';
            }
          }
        } catch (err) {
          console.warn('Error fetching suggestions:', err);
        }
      }, 300);
    });

    // Tutup suggestions kalau klik di luar
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-section')) {
        searchSuggestions.style.display = 'none';
      }
    });
  }
}

// Jalankan
initApp();
