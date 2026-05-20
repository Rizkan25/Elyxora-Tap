// =============================================
// ELYXORA TAB — MODUL INTI (newtab.js)
// State global, pengaturan, tema, jam, cuaca
// =============================================

// --- STATE GLOBAL ---
let elyxoras = [];
let groups = [];
let activeGroup = 'mostUsed';
let clickStats = {};

let userName = 'Kak';
let bgBlurLevel = 5;
let bgDarkLevel = 60;
let accentColor = '#3b82f6';
let clockFormat = '24';
let showSeconds = false;
let showDate = true;
let enableWeather = true;
let weatherLocation = '';
let weatherUnit = 'celsius';
let weatherForecast = false;
let themeMode = 'dark';
let clockStyle = 'bold';
let clockSize = 100;
let weatherSize = 100;
let iconSize = 100;
let iconRadius = 20;
let useIconBg = false;
let useCardBg = true;
let titlePosition = 'outside';
let editingId = null;
let defaultGroupBehavior = 'lastUsed';
let groupTransitionEffect = 'fadeUp';
let lastActiveGroup = 'mostUsed';
let showGroupItemCount = true;
let openInNewTab = false;
let confirmDelete = true;

// URL wallpaper aktif — disimpan sebagai state agar tidak hilang saat applyBgEffects berulang
let currentWallpaperUrl = '';

// --- UTILITAS OFFLINE: KONVERSI GAMBAR KE BASE64 ---
// Mengunduh gambar dari URL dan menyimpannya sebagai Base64
// sehingga ikon dapat tampil tanpa koneksi internet
async function fetchIconAsBase64(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:')) return imageUrl; // Sudah Base64
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Gagal fetch');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return ''; // Kembalikan string kosong jika offline atau gagal
  }
}

// SVG fallback global untuk ikon yang tidak bisa dimuat (bekerja 100% offline)
const OFFLINE_ICON_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E`;

// --- TEMA & EFEK VISUAL ---
function applyThemeMode(mode) {
  themeMode = mode;
  if (mode === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    document.body.setAttribute('data-theme', mode);
  }
  applyBgEffects(bgBlurLevel, bgDarkLevel);
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (themeMode === 'system') applyThemeMode('system');
});

function applyBgEffects(blur, dark) {
  const overlay = document.querySelector('.bg-overlay');
  const bgLayer = document.getElementById('bgImageLayer');
  const overlayBase = getComputedStyle(document.body).getPropertyValue('--overlay-base').trim() || '15, 23, 42';
  const overlayColor = `rgba(${overlayBase}, ${dark / 100})`;

  // Sinkronisasi state wallpaper: baca dari body jika currentWallpaperUrl belum diset
  const bodyBgRaw = document.body.style.backgroundImage || '';
  if (bodyBgRaw && bodyBgRaw !== 'none') {
    const match = bodyBgRaw.match(/url\(['"]?(.*?)['"]?\)/);
    if (match && match[1]) currentWallpaperUrl = match[1];
  }

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {
    // --- MOBILE: filter:blur() pada #bgImageLayer (ringan, tanpa backdrop-filter) ---
    if (overlay) {
      overlay.style.backdropFilter = 'none';
      overlay.style.webkitBackdropFilter = 'none';
      overlay.style.backgroundColor = overlayColor;
    }
    if (bgLayer) {
      if (currentWallpaperUrl) {
        bgLayer.style.backgroundImage = `url('${currentWallpaperUrl}')`;
        bgLayer.style.filter = blur > 0 ? `blur(${Math.min(blur, 8)}px)` : 'none';
        // Pastikan body tidak menampilkan gambar dobel
        document.body.style.backgroundImage = 'none';
      } else {
        bgLayer.style.backgroundImage = 'none';
        bgLayer.style.filter = 'none';
      }
    }
  } else {
    // --- DESKTOP: backdrop-filter kualitas tinggi ---
    if (bgLayer) {
      bgLayer.style.backgroundImage = 'none';
      bgLayer.style.filter = 'none';
    }
    if (currentWallpaperUrl) {
      document.body.style.backgroundImage = `url('${currentWallpaperUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'scroll';
    }
    if (overlay) {
      if (blur > 0) {
        overlay.style.backdropFilter = `blur(${blur}px)`;
        overlay.style.webkitBackdropFilter = `blur(${blur}px)`;
      } else {
        overlay.style.backdropFilter = 'none';
        overlay.style.webkitBackdropFilter = 'none';
      }
      overlay.style.backgroundColor = overlayColor;
    }
  }

  const previewOverlay = document.getElementById('bgPreviewOverlay');
  if (previewOverlay) {
    previewOverlay.style.backdropFilter = blur > 0 ? `blur(${blur}px)` : 'none';
    previewOverlay.style.webkitBackdropFilter = blur > 0 ? `blur(${blur}px)` : 'none';
    previewOverlay.style.backgroundColor = overlayColor;
  }
}

function applyAccentColor(color) {
  let styleEl = document.getElementById('dynamicAccent');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicAccent';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    :root { --accent-color: ${color}; }
    .group-tab.active { background: var(--accent-color) !important; border-color: var(--accent-color) !important; color: white !important; }
    .save-btn { background: var(--accent-color) !important; }
    input:focus, select:focus { border-color: var(--accent-color) !important; outline: none; }
    input[type=range] { accent-color: var(--accent-color) !important; }
    input[type=radio], input[type=checkbox] { accent-color: var(--accent-color) !important; }
    #searchForm button:hover { background: var(--accent-color) !important; border-color: var(--accent-color) !important; }
  `;
}

// --- LOAD SETTINGS ---
async function loadSettings() {
  const keys = [
    'customBackground', 'userName', 'bgBlurLevel', 'bgDarkLevel',
    'accentColor', 'clockFormat', 'showSeconds', 'showDate',
    'enableWeather', 'weatherLocation', 'weatherUnit', 'weatherForecast',
    'themeMode', 'clockStyle', 'clockSize', 'weatherSize', 'iconSize', 'iconRadius',
    'useIconBg', 'useCardBg', 'titlePosition', 'defaultGroupBehavior', 'groupTransitionEffect', 'lastActiveGroup'
  ];
  const result = await chrome.storage.local.get(keys);

  if (result.customBackground) {
    currentWallpaperUrl = result.customBackground;
    document.body.style.backgroundImage = `url('${result.customBackground}')`;
    document.body.style.backgroundAttachment = 'scroll';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    const isBase64 = result.customBackground.startsWith('data:');
    const mode = isBase64 ? 'file' : 'url';
    const radio = document.querySelector(`input[name="bgMode"][value="${mode}"]`);
    if (radio) radio.checked = true;

    if (mode === 'url') {
      if (typeof bgUrlWrapper !== 'undefined' && bgUrlWrapper) bgUrlWrapper.style.display = 'block';
      if (typeof bgUrlInput !== 'undefined' && bgUrlInput) bgUrlInput.value = result.customBackground;
    } else {
      if (typeof bgFileWrapper !== 'undefined' && bgFileWrapper) bgFileWrapper.style.display = 'block';
      if (typeof uploadedBgBase64 !== 'undefined') uploadedBgBase64 = result.customBackground;
    }

    if (typeof bgPreviewImg !== 'undefined' && bgPreviewImg) bgPreviewImg.src = result.customBackground;
    if (typeof bgPreviewContainer !== 'undefined' && bgPreviewContainer) bgPreviewContainer.style.display = 'block';
  } else {
    currentWallpaperUrl = '';
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = '';
    const radioDef = document.querySelector('input[name="bgMode"][value="default"]');
    if (radioDef) radioDef.checked = true;
  }

  if (result.userName) userName = result.userName;
  if (result.bgBlurLevel !== undefined) bgBlurLevel = result.bgBlurLevel;
  if (result.bgDarkLevel !== undefined) bgDarkLevel = result.bgDarkLevel;
  if (result.accentColor) accentColor = result.accentColor;
  if (result.clockFormat) clockFormat = result.clockFormat;
  if (result.showSeconds !== undefined) showSeconds = result.showSeconds;
  if (result.showDate !== undefined) showDate = result.showDate;
  if (result.enableWeather !== undefined) enableWeather = result.enableWeather;
  if (result.weatherLocation !== undefined) weatherLocation = result.weatherLocation;
  if (result.weatherUnit) weatherUnit = result.weatherUnit;
  if (result.weatherForecast !== undefined) weatherForecast = result.weatherForecast;
  if (result.themeMode) themeMode = result.themeMode;
  if (result.clockStyle) clockStyle = result.clockStyle;
  if (result.clockSize) clockSize = result.clockSize;
  if (result.weatherSize) weatherSize = result.weatherSize;
  if (result.iconSize) iconSize = result.iconSize;
  if (result.iconRadius !== undefined) iconRadius = result.iconRadius;
  if (result.useIconBg !== undefined) useIconBg = result.useIconBg;
  if (result.useCardBg !== undefined) useCardBg = result.useCardBg;
  if (result.titlePosition) titlePosition = result.titlePosition;
  if (result.defaultGroupBehavior) defaultGroupBehavior = result.defaultGroupBehavior;
  if (result.groupTransitionEffect) groupTransitionEffect = result.groupTransitionEffect;
  if (result.lastActiveGroup) lastActiveGroup = result.lastActiveGroup;
  if (result.showGroupItemCount !== undefined) showGroupItemCount = result.showGroupItemCount;
  if (result.openInNewTab !== undefined) openInNewTab = result.openInNewTab;
  if (result.confirmDelete !== undefined) confirmDelete = result.confirmDelete;

  applyThemeMode(themeMode);
  applyAccentColor(accentColor);
  applyVisualScales();
  applyClockStyle();
  applyIconStyles();
  if (typeof renderGroups === 'function') renderGroups();

  const nameInput = document.getElementById('userNameInput');
  if (nameInput) nameInput.value = userName;
  const blurInput = document.getElementById('bgBlurInput');
  if (blurInput) blurInput.value = bgBlurLevel;
  const bd = document.getElementById('blurValueDisplay');
  if (bd) bd.textContent = bgBlurLevel + 'px';
  const darkInput = document.getElementById('bgDarkInput');
  if (darkInput) darkInput.value = bgDarkLevel;
  const dd = document.getElementById('darkValueDisplay');
  if (dd) dd.textContent = bgDarkLevel + '%';

  const clkSelect = document.getElementById('clockFormat');
  if (clkSelect) clkSelect.value = clockFormat;
  const secCheck = document.getElementById('showSeconds');
  if (secCheck) secCheck.checked = showSeconds;
  const dateCheck = document.getElementById('showDate');
  if (dateCheck) dateCheck.checked = showDate;

  const wEnCheck = document.getElementById('enableWeather');
  if (wEnCheck) wEnCheck.checked = enableWeather;
  const wLocInput = document.getElementById('weatherLocation');
  if (wLocInput) wLocInput.value = weatherLocation;
  const wUnitSelect = document.getElementById('weatherUnit');
  if (wUnitSelect) wUnitSelect.value = weatherUnit;
  const wForeCheck = document.getElementById('weatherForecast');
  if (wForeCheck) wForeCheck.checked = weatherForecast;

  if (document.getElementById('clockStyle')) document.getElementById('clockStyle').value = clockStyle;
  if (document.getElementById('clockSize')) document.getElementById('clockSize').value = clockSize;
  if (document.getElementById('weatherSize')) document.getElementById('weatherSize').value = weatherSize;
  if (document.getElementById('iconSize')) document.getElementById('iconSize').value = iconSize;
  if (document.getElementById('iconRadius')) document.getElementById('iconRadius').value = iconRadius;

  const themeRadio = document.querySelector(`input[name="themeModeRadio"][value="${themeMode}"]`);
  if (themeRadio) themeRadio.checked = true;

  const wBlock = document.getElementById('weatherSettingsBlock');
  if (wBlock) wBlock.style.display = enableWeather ? 'block' : 'none';

  if (document.getElementById('clockSizeVal')) document.getElementById('clockSizeVal').textContent = clockSize + '%';
  if (document.getElementById('weatherSizeVal')) document.getElementById('weatherSizeVal').textContent = weatherSize + '%';
  if (document.getElementById('iconSizeVal')) document.getElementById('iconSizeVal').textContent = iconSize + '%';
  if (document.getElementById('iconRadiusVal')) document.getElementById('iconRadiusVal').textContent = iconRadius + 'px';

  let matchedPreset = false;
  document.querySelectorAll('.color-btn').forEach(b => {
    if (b.getAttribute('data-color').toLowerCase() === accentColor.toLowerCase()) {
      b.style.borderColor = 'white';
      matchedPreset = true;
    } else {
      b.style.borderColor = 'transparent';
    }
  });

  const customLabel = document.querySelector('.custom-color-label');
  if (customLabel) {
    customLabel.style.borderColor = matchedPreset ? 'var(--modal-border)' : 'white';
    if (!matchedPreset && customAccentPicker) {
      customAccentPicker.value = accentColor;
    }
  }

  const countCheck = document.getElementById('showGroupItemCount');
  if (countCheck) countCheck.checked = showGroupItemCount;
  const newTabCheck = document.getElementById('openInNewTab');
  if (newTabCheck) newTabCheck.checked = openInNewTab;
  const confirmDelCheck = document.getElementById('confirmDelete');
  if (confirmDelCheck) confirmDelCheck.checked = confirmDelete;

  applySearchTarget();
  applyBgEffects(bgBlurLevel, bgDarkLevel); // Terapkan efek blur/gelap wallpaper SETELAH semua vars diset
  updateClock();
  fetchWeather();
}

function applySearchTarget() {
  const form = document.getElementById('searchForm');
  if (form) {
    form.target = (typeof openInNewTab !== 'undefined' && openInNewTab) ? '_blank' : '_self';
  }
}
// loadSettings() dipanggil dari settings.js setelah semua modul dimuat

// --- JAM & UCAPAN ---
let lastTimeStr = '';
let lastDateStr = '';
let lastGreetingStr = '';

function updateClock() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const greetingEl = document.getElementById('greeting');
  if (!timeEl) return;

  const now = new Date();

  let hr = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  let ampm = '';
  if (clockFormat === '12') {
    ampm = hr >= 12 ? ' PM' : ' AM';
    hr = hr % 12;
    if (hr === 0) hr = 12;
  }

  const hrStr = String(hr).padStart(2, '0');
  const newTimeStr = `${hrStr}:${m}${showSeconds ? ':' + s : ''}${ampm}`;
  
  if (lastTimeStr !== newTimeStr) {
    timeEl.textContent = newTimeStr;
    lastTimeStr = newTimeStr;
  }

  if (showDate) {
    if (dateEl.style.display !== 'block') dateEl.style.display = 'block';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const newDateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    
    if (lastDateStr !== newDateStr) {
      dateEl.textContent = newDateStr;
      lastDateStr = newDateStr;
    }
  } else {
    if (dateEl.style.display !== 'none') dateEl.style.display = 'none';
  }

  const actualHr = now.getHours();
  let newGreetingStr = '';
  if (actualHr >= 5 && actualHr < 11) newGreetingStr = `Selamat Pagi, ${userName}`;
  else if (actualHr >= 11 && actualHr < 15) newGreetingStr = `Selamat Siang, ${userName}`;
  else if (actualHr >= 15 && actualHr < 18) newGreetingStr = `Selamat Sore, ${userName}`;
  else newGreetingStr = `Selamat Malam, ${userName}`;

  if (lastGreetingStr !== newGreetingStr) {
    greetingEl.textContent = newGreetingStr;
    lastGreetingStr = newGreetingStr;
  }
}

// --- CUACA ---
function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2 || code === 3) return '⛅';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 85 && code <= 86) return '❄️';
  if (code >= 95) return '⛈️';
  return '⛅';
}

function getWeatherDesc(code) {
  if (code === 0) return 'Cerah';
  if (code === 1 || code === 2 || code === 3) return 'Berawan';
  if (code === 45 || code === 48) return 'Berkabut';
  if (code >= 51 && code <= 67) return 'Hujan Ringan';
  if (code >= 71 && code <= 77) return 'Salju';
  if (code >= 80 && code <= 82) return 'Hujan Deras';
  if (code >= 95) return 'Badai Petir';
  return 'Berawan';
}

async function fetchWeather() {
  const wWidget = document.getElementById('weatherWidget');
  if (!wWidget) return;
  if (!enableWeather) {
    wWidget.style.display = 'none';
    return;
  }
  wWidget.style.display = 'block';
  document.getElementById('wDesc').textContent = 'Memuat Cuaca...';

  try {
    let cityName = weatherLocation.trim();
    
    // Gunakan wttr.in sebagai sumber utama karena seringkali lebih akurat (mirip Google)
    const wttrUrl = `https://wttr.in/${cityName ? encodeURIComponent(cityName) : ''}?format=j1`;
    const wttrRes = await fetch(wttrUrl);
    
    if (wttrRes.ok) {
      const data = await wttrRes.json();
      const curr = data.current_condition[0];
      const nearest = data.nearest_area[0];
      
      const tempC = curr.temp_C;
      const tempF = curr.temp_F;
      const displayTemp = weatherUnit === 'fahrenheit' ? tempF : tempC;
      const desc = curr.lang_id ? curr.lang_id[0].value : curr.weatherDesc[0].value;
      const finalCity = cityName || (nearest ? nearest.areaName[0].value : 'Lokasi Anda');
      
      // Mapping WeatherCode wttr.in (WWO codes) ke Emoji
      const wwoEmoji = (code) => {
        code = parseInt(code);
        if (code === 113) return '☀️'; // Sunny
        if (code === 116) return '⛅'; // Partly Cloudy
        if (code === 119 || code === 122) return '☁️'; // Cloudy/Overcast
        if (code === 143 || code === 248 || code === 260) return '🌫️'; // Fog
        if (code >= 176 && code <= 308) return '🌧️'; // Rain
        if (code >= 311 && code <= 377) return '❄️'; // Snow
        if (code >= 386) return '⛈️'; // Thunder
        return '⛅';
      };

      document.getElementById('wIcon').textContent = wwoEmoji(curr.weatherCode);
      document.getElementById('wTemp').textContent = `${displayTemp}°${weatherUnit === 'fahrenheit' ? 'F' : 'C'}`;
      document.getElementById('wDesc').textContent = `${desc} - ${finalCity}`;

      // Forecast 3 hari
      if (weatherForecast && data.weather) {
        const box = document.getElementById('forecastData');
        let html = '';
        for (let i = 1; i <= 3; i++) {
          const d = data.weather[i];
          const dDate = new Date(d.date);
          const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
          const dName = days[dDate.getDay()];
          const e = wwoEmoji(d.hourly[4].weatherCode); // Ambil tengah hari
          const minT = weatherUnit === 'fahrenheit' ? d.mintempF : d.mintempC;
          const maxT = weatherUnit === 'fahrenheit' ? d.maxtempF : d.maxtempC;
          html += `<div><div style="font-weight:bold;">${dName}</div><div style="font-size: 1.5rem; margin:4px 0;">${e}</div><div>${minT}°/${maxT}°</div></div>`;
        }
        box.innerHTML = html;
        
        wWidget.onclick = () => {
          const fbox = document.getElementById('weatherForecastBox');
          fbox.style.display = fbox.style.display === 'none' ? 'block' : 'none';
        };
        wWidget.style.cursor = 'pointer';
      } else {
        wWidget.onclick = null;
        wWidget.style.cursor = 'default';
        document.getElementById('weatherForecastBox').style.display = 'none';
      }
      return; // Berhasil menggunakan wttr.in, keluar dari fungsi
    }
  } catch (err) {
    console.warn("wttr.in failed, falling back to Open-Meteo", err);
  }

  // FALLBACK KE OPEN-METEO (Jika wttr.in gagal)
  try {
    let lat = null, lon = null, cityName = weatherLocation.trim();
    if (!cityName) {
      const ipRes = await fetch('http://ip-api.com/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        lat = ipData.lat; lon = ipData.lon; cityName = ipData.city;
      }
    } else {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude; lon = geoData.results[0].longitude; cityName = geoData.results[0].name;
        }
      }
    }

    if (lat && lon) {
      const unitQ = weatherUnit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto${unitQ}`);

      if (weatherRes.ok) {
        const data = await weatherRes.json();
        const curr = data.current;
        document.getElementById('wIcon').textContent = getWeatherEmoji(curr.weather_code);
        document.getElementById('wTemp').textContent = `${Math.round(curr.temperature_2m)}°${weatherUnit === 'fahrenheit' ? 'F' : 'C'}`;
        document.getElementById('wDesc').textContent = `${getWeatherDesc(curr.weather_code)} - ${cityName}`;
      }
    }
  } catch (err) {
    document.getElementById('wDesc').textContent = 'Gagal memuat cuaca';
  }
}

setInterval(updateClock, 1000);
// Catatan: updateClock() pertama dipanggil di akhir loadSettings() — tidak perlu duplikat di sini

// =============================================
// VIEWPORT SYNC — Menyesuaikan --real-vh saat keyboard muncul/hilang
// Layout sepenuhnya dihandle CSS Flexbox (height: 100dvh + flex:1)
// Engine ini TIDAK mengubah spacing/margin/overflow agar layout stabil
// =============================================

(function ViewportSync() {
  function syncVH() {
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--real-vh', `${vh}px`);
  }

  // Sync saat keyboard muncul/hilang (visualViewport resize)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncVH);
  }
  window.addEventListener('resize', syncVH);
  window.addEventListener('orientationchange', () => setTimeout(syncVH, 200));

  // Jalankan sekali saat load
  syncVH();

  // Expose ke global agar bisa dipanggil dari modul lain jika perlu
  // (tidak dipakai lagi untuk spacing, hanya untuk kompatibilitas backward)
  window.adaptMobileLayout = syncVH;
})();

