// =============================================
// ELYXORA TAB — MODUL SETTINGS (settings.js)
// Settings modal, wallpaper, live previews, render engine, search
// =============================================

// --- MODAL SETTINGS ---
const setModal = document.getElementById('settingsModal');

// Tab Switching Logic
document.querySelectorAll('.settings-tab').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    
    // Remove active from all tabs and panes
    document.querySelectorAll('.settings-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Add active to current
    button.classList.add('active');
    const targetPane = document.getElementById(tabId);
    if (targetPane) targetPane.classList.add('active');
  });
});

document.getElementById('settingsBtn').onclick = () => {
  takeSettingsSnapshot();
  syncInputsWithVars();
  
  // Reset to first tab
  const firstTab = document.querySelector('.settings-tab[data-tab="tab-style"]');
  if (firstTab) firstTab.click();
  
  setModal.style.display = 'flex';
};

document.getElementById('closeSettingsBtn').onclick = () => {
  revertSettings();
  setModal.style.display = 'none';
};

const btnX = document.getElementById('closeSettingsXBtn');
if (btnX) {
  btnX.onclick = () => {
    revertSettings();
    setModal.style.display = 'none';
  };
}

// --- WALLPAPER CONTROLS ---
const bgRadioUrl = document.querySelector('input[name="bgMode"][value="url"]');
const bgRadioFile = document.querySelector('input[name="bgMode"][value="file"]');
const bgUrlWrapper = document.getElementById('bgUrlWrapper');
const bgFileWrapper = document.getElementById('bgFileWrapper');
const bgUrlInput = document.getElementById('bgUrlInput');
const bgFileInput = document.getElementById('bgFileInput');
const bgFileName = document.getElementById('bgFileName');

const bgBlurInput = document.getElementById('bgBlurInput');
const bgDarkInput = document.getElementById('bgDarkInput');
const bgPreviewContainer = document.getElementById('bgPreviewContainer');
const bgPreviewImg = document.getElementById('bgPreviewImg');

if (bgUrlInput) {
  bgUrlInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val) {
      bgPreviewImg.src = val;
      bgPreviewContainer.style.display = 'block';
    } else {
      bgPreviewContainer.style.display = 'none';
    }
  });
}

if (bgBlurInput) {
  bgBlurInput.addEventListener('input', (e) => {
    document.getElementById('blurValueDisplay').textContent = e.target.value + 'px';
    applyBgEffects(e.target.value, bgDarkInput ? bgDarkInput.value : bgDarkLevel);
  });
}
if (bgDarkInput) {
  bgDarkInput.addEventListener('input', (e) => {
    document.getElementById('darkValueDisplay').textContent = e.target.value + '%';
    applyBgEffects(bgBlurInput ? bgBlurInput.value : bgBlurLevel, e.target.value);
  });
}

let uploadedBgBase64 = '';

document.querySelectorAll('input[name="bgMode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    bgUrlWrapper.style.display = bgRadioUrl.checked ? 'block' : 'none';
    bgFileWrapper.style.display = bgRadioFile.checked ? 'block' : 'none';

    const isDefault = document.querySelector('input[name="bgMode"][value="default"]').checked;
    if (isDefault) {
      bgPreviewContainer.style.display = 'none';
    } else if (bgRadioUrl.checked && bgUrlInput.value) {
      bgPreviewImg.src = bgUrlInput.value;
      bgPreviewContainer.style.display = 'block';
    } else if (bgRadioFile.checked && uploadedBgBase64) {
      bgPreviewImg.src = uploadedBgBase64;
      bgPreviewContainer.style.display = 'block';
    } else {
      bgPreviewContainer.style.display = 'none';
    }
  });
});

bgFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    bgFileName.textContent = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (bgPreviewImg) bgPreviewImg.src = event.target.result;
      if (bgPreviewContainer) bgPreviewContainer.style.display = 'block';
      if (file.type === 'image/gif') {
        uploadedBgBase64 = event.target.result;
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Mobile: batasi 1080px untuk hemat RAM, Desktop: 1920px
        const isMobile = window.innerWidth <= 768;
        const maxSize = isMobile ? 1080 : 1920;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // WebP lebih hemat storage dibanding PNG
        uploadedBgBase64 = canvas.toDataURL('image/webp', 0.82);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// --- ACCENT COLOR ---
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.onclick = () => {
    accentColor = btn.getAttribute('data-color');
    applyAccentColor(accentColor);
    document.querySelectorAll('.color-btn').forEach(b => b.style.borderColor = 'transparent');
    document.querySelector('.custom-color-label').style.borderColor = 'var(--modal-border)';
    btn.style.borderColor = 'white';
  };
});

const customColorInput = document.getElementById('customAccentPicker');
if (customColorInput) {
  customColorInput.addEventListener('input', (e) => {
    accentColor = e.target.value;
    applyAccentColor(accentColor);
    document.querySelectorAll('.color-btn').forEach(b => b.style.borderColor = 'transparent');
    document.querySelector('.custom-color-label').style.borderColor = 'white';
  });
}

// Live Preview untuk Tema
document.querySelectorAll('input[name="themeModeRadio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    themeMode = radio.value;
    applyThemeMode(themeMode);
  });
});

const enW = document.getElementById('enableWeather');
if (enW) {
  enW.addEventListener('change', (e) => {
    document.getElementById('weatherSettingsBlock').style.display = e.target.checked ? 'block' : 'none';
  });
}

// --- SAVE SETTINGS ---
document.getElementById('saveSettingsBtn').onclick = async () => {
  // 1. General Settings
  const newName = document.getElementById('userNameInput').value.trim();
  userName = newName || 'Kak';

  clockFormat = document.getElementById('clockFormat').value;
  showSeconds = document.getElementById('showSeconds').checked;
  showDate = document.getElementById('showDate').checked;

  enableWeather = document.getElementById('enableWeather').checked;
  weatherLocation = document.getElementById('weatherLocation').value.trim();
  weatherUnit = document.getElementById('weatherUnit').value;
  weatherForecast = document.getElementById('weatherForecast').checked;
  
  const selectedTheme = document.querySelector('input[name="themeModeRadio"]:checked');
  themeMode = selectedTheme ? selectedTheme.value : 'dark';
  
  clockStyle = document.getElementById('clockStyle').value;
  clockSize = parseInt(document.getElementById('clockSize').value);
  weatherSize = parseInt(document.getElementById('weatherSize').value);
  iconSize = parseInt(document.getElementById('iconSize').value);
  iconRadius = parseInt(document.getElementById('iconRadius').value);
  useIconBg = document.getElementById('useIconBg').checked;
  useCardBg = document.getElementById('useCardBg').checked;
  titlePosition = document.getElementById('titlePosition').value;
  defaultGroupBehavior = document.getElementById('defaultGroupBehavior').value;
  groupTransitionEffect = document.getElementById('groupTransitionEffect').value;
  showGroupItemCount = document.getElementById('showGroupItemCount').checked;
  openInNewTab = document.getElementById('openInNewTab').checked;
  confirmDelete = document.getElementById('confirmDelete').checked;

  // 2. Wallpaper Settings
  const currentBlur = document.getElementById('bgBlurInput').value;
  const currentDark = document.getElementById('bgDarkInput').value;
  bgBlurLevel = parseInt(currentBlur);
  bgDarkLevel = parseInt(currentDark);

  let finalBg = null;
  const bgModeRadio = document.querySelector('input[name="bgMode"]:checked');
  const bgModeVal = bgModeRadio ? bgModeRadio.value : 'default';

  if (bgModeVal === 'url' && bgUrlInput && bgUrlInput.value) {
    finalBg = bgUrlInput.value;
  } else if (bgModeVal === 'file' && uploadedBgBase64) {
    finalBg = uploadedBgBase64;
  } else if (bgModeVal === 'default') {
    finalBg = '';
  }

  const saveData = {
    userName, accentColor, clockFormat, showSeconds, showDate,
    enableWeather, weatherLocation, weatherUnit, weatherForecast,
    themeMode, clockStyle, clockSize, weatherSize, iconSize, iconRadius,
    useIconBg, useCardBg, titlePosition, defaultGroupBehavior, groupTransitionEffect, showGroupItemCount,
    openInNewTab, confirmDelete,
    bgBlurLevel, bgDarkLevel
  };

  if (finalBg) {
    currentWallpaperUrl = finalBg;
    document.body.style.backgroundImage = `url('${finalBg}')`;
    document.body.style.backgroundAttachment = 'scroll';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    saveData.customBackground = finalBg;
  } else {
    currentWallpaperUrl = '';
    document.body.style.backgroundImage = 'none';
    const bgLayer = document.getElementById('bgImageLayer');
    if (bgLayer) { bgLayer.style.backgroundImage = 'none'; bgLayer.style.filter = 'none'; }
    saveData.customBackground = '';
  }

  await chrome.storage.local.set(saveData);

  applyThemeMode(themeMode);
  applyVisualScales();
  applyClockStyle();
  applyIconStyles();
  applySearchTarget();
  applyBgEffects(bgBlurLevel, bgDarkLevel);
  updateClock();
  fetchWeather();
  if (typeof renderGroups === 'function') renderGroups();
  setModal.style.display = 'none';
};

// --- TRANSACTIONAL SETTINGS ---
let settingsSnapshot = {};

function takeSettingsSnapshot() {
  const bgModeRadio = document.querySelector('input[name="bgMode"]:checked');
  let bgImg = document.body.style.backgroundImage || '';
  let bgUrl = '';
  if (bgImg && bgImg !== 'none') {
    const match = bgImg.match(/url\(['"]?(.*?)['"]?\)/);
    if (match) bgUrl = match[1];
  }
  settingsSnapshot = {
    userName, accentColor, clockFormat, showSeconds, showDate,
    enableWeather, weatherLocation, weatherUnit, weatherForecast,
    themeMode, clockStyle, clockSize, weatherSize, iconSize, iconRadius, useIconBg, useCardBg, titlePosition, defaultGroupBehavior, groupTransitionEffect, showGroupItemCount, openInNewTab, confirmDelete,
    bgBlurLevel, bgDarkLevel,
    customBackground: bgUrl,
    bgMode: bgModeRadio ? bgModeRadio.value : 'default'
  };
}

function revertSettings() {
  ({
    userName, accentColor, clockFormat, showSeconds, showDate,
    enableWeather, weatherLocation, weatherUnit, weatherForecast,
    themeMode, clockStyle, clockSize, weatherSize, iconSize, iconRadius, useIconBg, useCardBg, titlePosition, defaultGroupBehavior, groupTransitionEffect, showGroupItemCount, openInNewTab, confirmDelete,
    bgBlurLevel, bgDarkLevel
  } = settingsSnapshot);

  if (settingsSnapshot.customBackground) {
    currentWallpaperUrl = settingsSnapshot.customBackground;
    document.body.style.backgroundImage = `url('${settingsSnapshot.customBackground}')`;
  } else {
    currentWallpaperUrl = '';
    document.body.style.backgroundImage = 'none';
    // Reset bgImageLayer agar blur lama tidak tertinggal di mobile
    const bgLayer = document.getElementById('bgImageLayer');
    if (bgLayer) { bgLayer.style.backgroundImage = 'none'; bgLayer.style.filter = 'none'; }
  }

  applyThemeMode(themeMode);
  applyAccentColor(accentColor);
  applyVisualScales();
  applyClockStyle();
  applyIconStyles();
  applyBgEffects(bgBlurLevel, bgDarkLevel);
  updateClock();
  if (typeof renderGroups === 'function') renderGroups();
  syncInputsWithVars();
}

function syncInputsWithVars() {
  const nameInput = document.getElementById('userNameInput');
  if (nameInput) nameInput.value = userName;

  if (document.getElementById('clockFormat')) document.getElementById('clockFormat').value = clockFormat;
  if (document.getElementById('showSeconds')) document.getElementById('showSeconds').checked = showSeconds;
  if (document.getElementById('showDate')) document.getElementById('showDate').checked = showDate;
  if (document.getElementById('enableWeather')) document.getElementById('enableWeather').checked = enableWeather;
  if (document.getElementById('weatherLocation')) document.getElementById('weatherLocation').value = weatherLocation;
  if (document.getElementById('weatherUnit')) document.getElementById('weatherUnit').value = weatherUnit;
  if (document.getElementById('weatherForecast')) document.getElementById('weatherForecast').checked = weatherForecast;

  if (document.getElementById('clockStyle')) document.getElementById('clockStyle').value = clockStyle;
  if (document.getElementById('clockSize')) document.getElementById('clockSize').value = clockSize;
  if (document.getElementById('weatherSize')) document.getElementById('weatherSize').value = weatherSize;
  if (document.getElementById('iconSize')) document.getElementById('iconSize').value = iconSize;
  if (document.getElementById('iconRadius')) document.getElementById('iconRadius').value = iconRadius;
  if (document.getElementById('useIconBg')) document.getElementById('useIconBg').checked = useIconBg;
  if (document.getElementById('useCardBg')) document.getElementById('useCardBg').checked = useCardBg;
  if (document.getElementById('titlePosition')) document.getElementById('titlePosition').value = titlePosition;
  if (document.getElementById('defaultGroupBehavior')) document.getElementById('defaultGroupBehavior').value = defaultGroupBehavior;
  if (document.getElementById('groupTransitionEffect')) document.getElementById('groupTransitionEffect').value = groupTransitionEffect;
  if (document.getElementById('showGroupItemCount')) document.getElementById('showGroupItemCount').checked = showGroupItemCount;
  if (document.getElementById('openInNewTab')) document.getElementById('openInNewTab').checked = openInNewTab;
  if (document.getElementById('confirmDelete')) document.getElementById('confirmDelete').checked = confirmDelete;

  // Wallpaper sync
  if (document.getElementById('bgBlurInput')) document.getElementById('bgBlurInput').value = bgBlurLevel;
  if (document.getElementById('bgDarkInput')) document.getElementById('bgDarkInput').value = bgDarkLevel;
  if (document.getElementById('blurValueDisplay')) document.getElementById('blurValueDisplay').textContent = bgBlurLevel + 'px';
  if (document.getElementById('darkValueDisplay')) document.getElementById('darkValueDisplay').textContent = bgDarkLevel + '%';

  const bgMode = settingsSnapshot.bgMode || 'default';
  const bgRadio = document.querySelector(`input[name="bgMode"][value="${bgMode}"]`);
  if (bgRadio) {
    bgRadio.checked = true;
    bgRadio.dispatchEvent(new Event('change'));
  }

  if (document.getElementById('clockSizeVal')) document.getElementById('clockSizeVal').textContent = clockSize + '%';
  if (document.getElementById('weatherSizeVal')) document.getElementById('weatherSizeVal').textContent = weatherSize + '%';
  if (document.getElementById('iconSizeVal')) document.getElementById('iconSizeVal').textContent = iconSize + '%';
  if (document.getElementById('iconRadiusVal')) document.getElementById('iconRadiusVal').textContent = iconRadius + 'px';

  const themeRadio = document.querySelector(`input[name="themeModeRadio"][value="${themeMode}"]`);
  if (themeRadio) themeRadio.checked = true;

  const wBlock = document.getElementById('weatherSettingsBlock');
  if (wBlock) wBlock.style.display = enableWeather ? 'block' : 'none';
}

// --- LIVE PREVIEW LISTENERS ---
function initLivePreviews() {
  const sliders = [
    { id: 'clockSize', var: 'clockSize', label: 'clockSizeVal', suffix: '%', fn: applyVisualScales },
    { id: 'weatherSize', var: 'weatherSize', label: 'weatherSizeVal', suffix: '%', fn: applyVisualScales },
    { id: 'iconSize', var: 'iconSize', label: 'iconSizeVal', suffix: '%', fn: applyIconStyles },
    { id: 'iconRadius', var: 'iconRadius', label: 'iconRadiusVal', suffix: 'px', fn: applyIconStyles }
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    if (el) {
      el.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        if (s.var === 'clockSize') clockSize = val;
        if (s.var === 'weatherSize') weatherSize = val;
        if (s.var === 'iconSize') iconSize = val;
        if (s.var === 'iconRadius') iconRadius = val;

        const label = document.getElementById(s.label);
        if (label) label.textContent = val + s.suffix;
        s.fn();
      });
    }
  });

  const clockStyleSelect = document.getElementById('clockStyle');
  if (clockStyleSelect) {
    clockStyleSelect.addEventListener('change', (e) => {
      clockStyle = e.target.value;
      applyClockStyle();
    });
  }

  const useIconBgCheck = document.getElementById('useIconBg');
  if (useIconBgCheck) {
    useIconBgCheck.addEventListener('change', (e) => {
      useIconBg = e.target.checked;
      applyIconStyles();
    });
  }

  const useCardBgCheck = document.getElementById('useCardBg');
  if (useCardBgCheck) {
    useCardBgCheck.addEventListener('change', (e) => {
      useCardBg = e.target.checked;
      applyIconStyles();
    });
  }

  const titlePosSelect = document.getElementById('titlePosition');
  if (titlePosSelect) {
    titlePosSelect.addEventListener('change', (e) => {
      titlePosition = e.target.value;
      applyIconStyles();
    });
  }

  const defaultGroupSelect = document.getElementById('defaultGroupBehavior');
  if (defaultGroupSelect) {
    defaultGroupSelect.addEventListener('change', (e) => {
      defaultGroupBehavior = e.target.value;
    });
  }

  const transitionSelect = document.getElementById('groupTransitionEffect');
  if (transitionSelect) {
    transitionSelect.addEventListener('change', (e) => {
      groupTransitionEffect = e.target.value;
      // Trigger renderElyxoras untuk memutar animasi segera saat memilih dari settings
      if (typeof renderElyxoras === 'function') renderElyxoras();
    });
  }
}
initLivePreviews();

// --- RENDER ENGINE ---
function applyIconStyles() {
  let styleEl = document.getElementById('dynamicIconStyles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicIconStyles';
    document.head.appendChild(styleEl);
  }

  const isPhoneScreen = window.innerWidth <= 767;

  // Widescreen rectangle format for Desktop & iPad
  let finalWidth = 180 * (iconSize / 100);
  let finalHeight = 120 * (iconSize / 100);
  let finalRadius = iconRadius;
  let finalTitleDisplay = titlePosition === 'hidden' ? 'none' : 'block';
  let iconHeightPercent = titlePosition === 'inside' ? '75%' : '100%';
  let gridColumnSize = `auto-fill, minmax(${finalWidth}px, 1fr)`;

  if (isPhoneScreen) {
    let mobileGridBase = 110 * (iconSize / 100);
    gridColumnSize = `auto-fill, minmax(${mobileGridBase}px, 1fr)`;
    finalWidth = '100%';
    finalHeight = 'auto';
    finalRadius = iconRadius;
    iconHeightPercent = titlePosition === 'inside' ? '55%' : '75%';
  }

  styleEl.textContent = `
    .elyxora-grid {
      grid-template-columns: repeat(${gridColumnSize}) !important;
    }
    .force-centered .elyxora-grid {
      grid-template-columns: repeat(${gridColumnSize}) !important;
    }
    .elyxora-item { 
      width: ${isPhoneScreen ? finalWidth : finalWidth + 'px'} !important; 
      height: ${isPhoneScreen ? finalHeight : finalHeight + 'px'} !important; 
      aspect-ratio: ${isPhoneScreen ? '1 / 1' : 'auto'} !important;
      border-radius: ${finalRadius}px !important; 
      padding: ${isPhoneScreen ? '0' : '8px'} !important;
      margin-bottom: ${titlePosition === 'outside' ? '30px' : '0'} !important;
      background: ${useCardBg ? 'var(--glass-bg)' : 'transparent'} !important;
      border: ${useCardBg ? '1px solid var(--glass-border)' : 'none'} !important;
      box-shadow: ${useCardBg ? 'var(--glass-shadow)' : 'none'} !important;
      backdrop-filter: ${(useCardBg && !isPhoneScreen) ? 'blur(20px) saturate(180%)' : 'none'} !important;
      -webkit-backdrop-filter: ${(useCardBg && !isPhoneScreen) ? 'blur(20px) saturate(180%)' : 'none'} !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 4px !important;
      position: relative !important;
      overflow: visible !important;
    }
    .elyxora-icon {
      width: ${isPhoneScreen ? iconHeightPercent : '100%'} !important;
      height: ${isPhoneScreen ? iconHeightPercent : iconHeightPercent} !important;
      flex-shrink: 0 !important;
      border-radius: ${Math.max(0, finalRadius - 4)}px !important;
      background: ${useIconBg ? 'white' : 'transparent'} !important;
      box-shadow: ${useIconBg ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'} !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
    }
    .elyxora-title {
      display: ${finalTitleDisplay} !important;
      position: ${titlePosition === 'outside' ? 'absolute' : 'static'} !important;
      bottom: ${titlePosition === 'outside' ? '-28px' : 'auto'} !important;
      width: 100% !important;
      flex: none !important;
      text-align: center !important;
      font-size: ${isPhoneScreen ? '0.85rem' : '0.9rem'} !important;
      font-weight: 600 !important;
      opacity: 0.9 !important;
      color: var(--text-color) !important;
      text-shadow: ${titlePosition === 'outside' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'} !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }
    .elyxora-icon img {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
      padding: ${isPhoneScreen ? '2px' : '8px'} !important;
    }
  `;
}

function applyVisualScales() {
  const clockWidget = document.querySelector('.time-widget');
  const weatherWidget = document.querySelector('.weather-widget');
  const searchBox = document.getElementById('searchForm');
  const isMobileSize = window.innerWidth <= 1100;

  /* 
  Logika force-centered telah dihapus karena antarmuka sekarang 
  menggunakan layout Opsi 1 (Minimalis Sentral) secara permanen.
  */

  if (clockWidget) {
    if (isMobileSize) {
      clockWidget.style.setProperty('zoom', '1', 'important');
    } else {
      clockWidget.style.setProperty('zoom', `${clockSize / 100}`, 'important');
    }
  }
  if (weatherWidget) {
    if (isMobileSize) {
      weatherWidget.style.setProperty('zoom', '1', 'important');
    } else {
      weatherWidget.style.setProperty('zoom', `${weatherSize / 100}`, 'important');
    }
  }

  applyIconStyles();
}

window.addEventListener('resize', applyVisualScales);
document.addEventListener('DOMContentLoaded', applyVisualScales);

function applyClockStyle() {
  const timeEl = document.getElementById('time');
  if (!timeEl) return;

  // Reset semua properti custom — TANPA transition agar tidak boros GPU saat jam update tiap detik
  timeEl.style.cssText = `
    font-size: 6rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -3px;
    position: relative;
    transform: translateZ(0);
  `;

  // Default values
  let bgColor = 'transparent';
  let bgClip = 'border-box';
  let textFill = 'var(--text-color)';
  let textShadow = 'none';
  let fontWeight = '800';
  let letterSpacing = '-3px';
  let fontFamily = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  let padding = '0';
  let borderRadius = '0';
  let border = 'none';
  let boxShadow = 'none';

  if (clockStyle === 'minimal') {
    fontWeight = '300';
    letterSpacing = '0px';
  } else if (clockStyle === 'bold') {
    bgColor = 'linear-gradient(180deg, var(--text-color) 0%, var(--text-dim) 100%)';
    bgClip = 'text';
    textFill = 'transparent';
  } else if (clockStyle === 'glass') {
    textFill = 'rgba(255,255,255,0.9)';
    textShadow = '0 4px 15px rgba(0,0,0,0.5)';
    fontWeight = '700';
  } else if (clockStyle === 'neumorphism') {
    textFill = 'var(--bg-color)';
    textShadow = '4px 4px 8px rgba(0,0,0,0.3), -4px -4px 8px rgba(255,255,255,0.1)';
    fontWeight = '800';
  } else if (clockStyle === 'cyberpunk') {
    textFill = '#fff';
    textShadow = '0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #f0f, 0 0 40px #f0f';
    fontFamily = '"Courier New", Courier, monospace';
    letterSpacing = '2px';
  } else if (clockStyle === 'swiss') {
    fontFamily = '"Helvetica Neue", Helvetica, Arial, sans-serif';
    fontWeight = '900';
    letterSpacing = '-4px';
    textFill = '#e63946';
  } else if (clockStyle === 'retro') {
    fontFamily = '"Courier New", Courier, monospace';
    bgColor = '#111';
    textFill = '#0f0';
    border = '3px solid #0f0';
    padding = '10px 30px';
    borderRadius = '12px';
    textShadow = '0 0 8px #0f0';
    letterSpacing = '2px';
  } else if (clockStyle === 'rainbow') {
    bgColor = 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)';
    bgClip = 'text';
    textFill = 'transparent';
  } else if (clockStyle === 'flip') {
    bgColor = '#222';
    textFill = '#f1f1f1';
    padding = '10px 30px';
    borderRadius = '16px';
    boxShadow = 'inset 0 -2px 0 rgba(0,0,0,0.8), 0 4px 10px rgba(0,0,0,0.5)';
    letterSpacing = '6px';
    border = '1px solid #444';
  } else if (clockStyle === 'tracer') {
    textFill = 'var(--text-color)';
    border = '3px dashed var(--accent-color)';
    padding = '10px 40px';
    borderRadius = '24px';
  } else if (clockStyle === 'oled') {
    bgColor = '#000';
    textFill = '#fff';
    padding = '20px 50px';
    borderRadius = '40px';
    fontWeight = '200';
    letterSpacing = '5px';
    boxShadow = '0 0 20px rgba(255,255,255,0.05)';
  }

  timeEl.style.background = bgColor;
  if (bgClip === 'text') {
    timeEl.style.webkitBackgroundClip = 'text';
    timeEl.style.backgroundClip = 'text';
  } else {
    timeEl.style.webkitBackgroundClip = 'border-box';
    timeEl.style.backgroundClip = 'border-box';
  }
  timeEl.style.webkitTextFillColor = textFill;
  timeEl.style.color = textFill === 'transparent' ? 'transparent' : textFill;
  timeEl.style.textShadow = textShadow;
  timeEl.style.fontWeight = fontWeight;
  timeEl.style.letterSpacing = letterSpacing;
  timeEl.style.fontFamily = fontFamily;
  timeEl.style.padding = padding;
  timeEl.style.borderRadius = borderRadius;
  timeEl.style.border = border;
  timeEl.style.boxShadow = boxShadow;
}



// --- SEARCH ENGINE SWITCHER ---
const activeEngineIcon = document.getElementById('activeEngineIcon');
const engineDropdown = document.getElementById('engineDropdown');
const searchFormElement = document.getElementById('searchForm');
const searchInputControl = document.getElementById('searchInput');

if (activeEngineIcon && engineDropdown) {
  activeEngineIcon.onclick = (e) => {
    e.stopPropagation();
    engineDropdown.style.display = engineDropdown.style.display === 'none' ? 'block' : 'none';
  };

  document.addEventListener('click', () => {
    if (engineDropdown) engineDropdown.style.display = 'none';
  });

  document.querySelectorAll('.engine-option').forEach(option => {
    option.onclick = async () => {
      const engine = option.getAttribute('data-engine');
      const action = option.getAttribute('data-action');
      const param = option.getAttribute('data-param');
      const engineName = option.querySelector('span:last-child').textContent;

      // Update currentEngine saat dipilih
      currentEngine = engine;

      // Kloning SVG dari opsi yang dipilih ke tombol ikon aktif (offline-safe)
      const optionSvg = option.querySelector('svg');
      if (optionSvg && activeEngineIcon) {
        const existingSvg = activeEngineIcon.querySelector('svg:first-child');
        if (existingSvg) {
          activeEngineIcon.replaceChild(optionSvg.cloneNode(true), existingSvg);
        }
      }

      if (searchFormElement) searchFormElement.action = action;
      if (searchInputControl) {
        searchInputControl.name = param;
        searchInputControl.placeholder = 'Cari di ' + engineName + '...';
      }

      document.querySelectorAll('.engine-option').forEach(o => o.classList.remove('active'));
      option.classList.add('active');

      await chrome.storage.local.set({ preferredEngine: engine });
      engineDropdown.style.display = 'none';
    };
  });
}

// --- AUTOCOMPLETE SUGGESTIONS ---
let suggestTimeout;
const searchSuggestions = document.getElementById('searchSuggestions');
let currentEngine = 'google';

if (searchInputControl && searchSuggestions) {
  searchInputControl.addEventListener('input', (e) => {
    clearTimeout(suggestTimeout);
    const query = e.target.value.trim();
    if (!query) {
      searchSuggestions.style.display = 'none';
      return;
    }

    suggestTimeout = setTimeout(() => {
      fetchSuggestions(query, currentEngine);
    }, 250);
  });

  searchInputControl.addEventListener('focus', () => {
    if (searchInputControl.value.trim() && searchSuggestions.innerHTML) {
      searchSuggestions.style.display = 'flex';
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchFormElement.contains(e.target)) {
      searchSuggestions.style.display = 'none';
    }
  });

  // Handle keyboard navigation
  searchInputControl.addEventListener('keydown', (e) => {
    if (searchSuggestions.style.display !== 'none') {
      const items = searchSuggestions.querySelectorAll('.suggestion-item');
      let currentIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < items.length - 1) {
          if (currentIndex >= 0) items[currentIndex].classList.remove('selected');
          items[currentIndex + 1].classList.add('selected');
          searchInputControl.value = items[currentIndex + 1].textContent.trim();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          items[currentIndex].classList.remove('selected');
          items[currentIndex - 1].classList.add('selected');
          searchInputControl.value = items[currentIndex - 1].textContent.trim();
        }
      }
    }
  });
}

async function fetchSuggestions(query, engine) {
  const encQuery = encodeURIComponent(query);
  let url = '';

  if (engine === 'google') {
    url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encQuery}`;
  } else if (engine === 'bing') {
    url = `https://api.bing.com/osjson.aspx?query=${encQuery}`;
  } else if (engine === 'duckduckgo') {
    url = `https://duckduckgo.com/ac/?q=${encQuery}&type=list`;
  } else if (engine === 'yahoo') {
    url = `https://sugg.search.yahoo.net/sg/?output=fxjson&command=${encQuery}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    const suggestions = data[1] || []; // Format standar OpenSearch: ["query", ["sug1", "sug2"]]

    showSuggestions(suggestions.slice(0, 10));
  } catch (err) {
    console.error("Gagal memuat saran pencarian:", err);
  }
}

function showSuggestions(suggestions) {
  if (suggestions.length === 0) {
    searchSuggestions.style.display = 'none';
    return;
  }

  searchSuggestions.innerHTML = suggestions.map(sug => `
    <div class="suggestion-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <span>${sug}</span>
    </div>
  `).join('');

  searchSuggestions.style.display = 'flex';

  document.querySelectorAll('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      searchInputControl.value = item.textContent.trim();
      // Pastikan target terupdate sesuai pengaturan terbaru sebelum submit
      if (typeof applySearchTarget === 'function') applySearchTarget();
      searchFormElement.submit();
      searchSuggestions.style.display = 'none';
    });
  });
}

// Update currentEngine saat memilih dropdown — digabung dengan listener onclick di atas
// (listener sudah ditangani di blok engine-option onclick baris 699-727)

async function loadSearchEngine() {
  const result = await chrome.storage.local.get('preferredEngine');
  if (result.preferredEngine) {
    currentEngine = result.preferredEngine;
    const option = document.querySelector('.engine-option[data-engine="' + result.preferredEngine + '"]');
    if (option) option.click();
  }
}

// Inisialisasi awal (settings.js adalah file terakhir yang dimuat)
loadSearchEngine();
loadSettings();
