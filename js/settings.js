// =============================================
// SETTINGS ENGINE (settings.js)
// Mengelola modal pengaturan, wallpaper, dan live preview
// =============================================
import { AppState, saveState, KeysToSave } from './state.js';
import { applyThemeMode, applyBgEffects, applyAccentColor, applyVisualScales, applyIconStyles, applyClockStyle, applySearchStyle } from './theme.js';
import { updateClock } from './clock.js';
import { fetchWeather } from './weather.js';
import { renderGroups, renderElyxoras } from './groups.js';
import { debounce } from './utils.js';
import { loadTranslations, applyI18n } from './i18n.js';

const setModal = document.getElementById('settingsModal');
let settingsSnapshot = {};
let uploadedBgBase64 = '';
let currentBgModeOnOpen = 'default';

// -----------------------------------------------
// TAB SWITCHING
// -----------------------------------------------
document.querySelectorAll('.settings-tab').forEach(button => {
  button.addEventListener('click', () => {
    const tabId = button.getAttribute('data-tab');
    document.querySelectorAll('.settings-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    button.classList.add('active');
    const targetPane = document.getElementById(tabId);
    if (targetPane) targetPane.classList.add('active');
  });
});

// -----------------------------------------------
// SNAPSHOT & REVERT
// -----------------------------------------------
function takeSettingsSnapshot() {
  // Ambil mode wallpaper yang sedang aktif
  const bgModeRadio = document.querySelector('input[name="bgMode"]:checked');
  currentBgModeOnOpen = bgModeRadio ? bgModeRadio.value : 'default';

  // Deep clone seluruh AppState
  settingsSnapshot = JSON.parse(JSON.stringify(AppState));
  settingsSnapshot.bgMode = currentBgModeOnOpen;
}

function revertSettings() {
  // Kembalikan AppState ke snapshot
  for (const key in settingsSnapshot) {
    if (key !== 'bgMode' && key in AppState) {
      AppState[key] = settingsSnapshot[key];
    }
  }
  applyThemeMode(AppState.themeMode);
  applyAccentColor();
  applyVisualScales();
  applyClockStyle();
  applySearchStyle();
  applyIconStyles();
  applyBgEffects();
  updateClock();
  renderGroups();
  syncInputsWithVars();
}

// -----------------------------------------------
// SYNC INPUTS
// -----------------------------------------------
export function syncInputsWithVars() {
  const get = id => document.getElementById(id);

  if (get('appLanguage')) get('appLanguage').value = AppState.language;
  if (get('userNameInput')) get('userNameInput').value = AppState.userName;
  if (get('clockFormat')) get('clockFormat').value = AppState.clockFormat;
  if (get('showSeconds')) get('showSeconds').checked = AppState.showSeconds;
  if (get('showDate')) get('showDate').checked = AppState.showDate;
  if (get('enableWeather')) get('enableWeather').checked = AppState.enableWeather;
  if (get('weatherLocation')) get('weatherLocation').value = AppState.weatherLocation;
  if (get('weatherUnit')) get('weatherUnit').value = AppState.weatherUnit;
  if (get('weatherForecast')) get('weatherForecast').checked = AppState.weatherForecast;

  if (get('clockStyle')) get('clockStyle').value = AppState.clockStyle;
  if (get('searchStyle')) get('searchStyle').value = AppState.searchStyle || 'default';
  if (get('clockSize')) get('clockSize').value = AppState.clockSize;
  if (get('weatherSize')) get('weatherSize').value = AppState.weatherSize;
  if (get('iconSize')) get('iconSize').value = AppState.iconSize;
  if (get('iconRadius')) get('iconRadius').value = AppState.iconRadius;
  if (get('useIconBg')) get('useIconBg').checked = AppState.useIconBg;
  if (get('useCardBg')) get('useCardBg').checked = AppState.useCardBg;
  if (get('titlePosition')) get('titlePosition').value = AppState.titlePosition;
  if (get('defaultGroupBehavior')) get('defaultGroupBehavior').value = AppState.defaultGroupBehavior;
  if (get('groupTransitionEffect')) get('groupTransitionEffect').value = AppState.groupTransitionEffect;
  if (get('showGroupItemCount')) get('showGroupItemCount').checked = AppState.showGroupItemCount;
  if (get('openInNewTab')) get('openInNewTab').checked = AppState.openInNewTab;
  if (get('confirmDelete')) get('confirmDelete').checked = AppState.confirmDelete;

  // Wallpaper
  if (get('bgBlurInput')) get('bgBlurInput').value = AppState.bgBlurLevel;
  if (get('bgDarkInput')) get('bgDarkInput').value = AppState.bgDarkLevel;
  if (get('blurValueDisplay')) get('blurValueDisplay').textContent = AppState.bgBlurLevel + 'px';
  if (get('darkValueDisplay')) get('darkValueDisplay').textContent = AppState.bgDarkLevel + '%';
  if (get('bgTypeSelect')) get('bgTypeSelect').value = AppState.bgType;
  if (get('parallaxStrengthInput')) get('parallaxStrengthInput').value = AppState.bgParallaxStrength;
  if (get('parallaxStrengthVal')) get('parallaxStrengthVal').textContent = AppState.bgParallaxStrength + '%';
  const pw = get('parallaxStrengthWrapper');
  if (pw) pw.style.display = AppState.bgType === 'parallax' ? 'block' : 'none';

  // Tentukan mode wallpaper berdasarkan apakah ada customBackground
  let bgMode = 'default';
  if (AppState.customBackground) {
    if (AppState.customBackground.startsWith('data:image') || AppState.customBackground.startsWith('blob:')) {
      bgMode = 'file';
    } else {
      bgMode = 'url';
      if (get('bgUrlInput')) get('bgUrlInput').value = AppState.customBackground;
    }
  }

  const bgRadioEl = document.querySelector(`input[name="bgMode"][value="${bgMode}"]`);
  if (bgRadioEl) {
    bgRadioEl.checked = true;
    bgRadioEl.dispatchEvent(new Event('change'));
  }

  if (get('clockSizeVal')) get('clockSizeVal').textContent = AppState.clockSize + '%';
  if (get('weatherOpacity')) get('weatherOpacity').value = AppState.weatherOpacity ?? 100;
  if (get('weatherOpacityVal')) get('weatherOpacityVal').textContent = (AppState.weatherOpacity ?? 100) + '%';
  if (get('settingsOpacity')) get('settingsOpacity').value = AppState.settingsOpacity ?? 100;
  if (get('settingsOpacityVal')) get('settingsOpacityVal').textContent = (AppState.settingsOpacity ?? 100) + '%';
  
  const modalContent = document.getElementById('settingsModalContent');
  if (modalContent) modalContent.style.opacity = (AppState.settingsOpacity ?? 100) / 100;

  if (get('weatherSizeVal')) get('weatherSizeVal').textContent = AppState.weatherSize + '%';
  if (get('iconSizeVal')) get('iconSizeVal').textContent = AppState.iconSize + '%';
  if (get('iconRadiusVal')) get('iconRadiusVal').textContent = AppState.iconRadius + 'px';

  const themeRadio = document.querySelector(`input[name="themeModeRadio"][value="${AppState.themeMode}"]`);
  if (themeRadio) themeRadio.checked = true;

  const wBlock = get('weatherSettingsBlock');
  if (wBlock) wBlock.style.display = AppState.enableWeather ? 'block' : 'none';

  // Accent color sync
  const colorBtns = document.querySelectorAll('.color-btn');
  let matched = false;
  colorBtns.forEach(btn => {
    btn.style.borderColor = 'transparent';
    if (btn.getAttribute('data-color') === AppState.accentColor) {
      btn.style.borderColor = 'white';
      matched = true;
    }
  });
  const customColorLabel = document.querySelector('.custom-color-label');
  const customColorPicker = document.getElementById('customAccentPicker');
  if (customColorLabel) customColorLabel.style.borderColor = matched ? 'var(--modal-border)' : 'white';
  if (customColorPicker && !matched) customColorPicker.value = AppState.accentColor;

  const cPanel = get('customClockPanel');
  if (cPanel) cPanel.style.display = AppState.clockStyle === 'custom' ? 'block' : 'none';

  syncCustomClockInputs();
  syncCustomSearchInputs();
}

// -----------------------------------------------
// TOMBOL BUKA/TUTUP SETTINGS
// -----------------------------------------------
const settingsBtn = document.getElementById('settingsBtn');
if (settingsBtn) {
  settingsBtn.onclick = () => {
    takeSettingsSnapshot();
    syncInputsWithVars();
    const firstTab = document.querySelector('.settings-tab[data-tab="tab-style"]');
    if (firstTab) firstTab.click();
    if (setModal) {
      setModal.style.display = 'flex';
    }
  };
}

const closeSettingsBtn = document.getElementById('closeSettingsBtn');
if (closeSettingsBtn) {
  closeSettingsBtn.onclick = () => {
    revertSettings();
    if (setModal) setModal.style.display = 'none';
  };
}

const closeSettingsXBtn = document.getElementById('closeSettingsXBtn');
if (closeSettingsXBtn) {
  closeSettingsXBtn.onclick = () => {
    revertSettings();
    if (setModal) setModal.style.display = 'none';
  };
}

// -----------------------------------------------
// DRAGGABLE SETTINGS MODAL
// -----------------------------------------------
const settingsModalContent = document.getElementById('settingsModalContent');
const settingsModalHeader = document.getElementById('settingsModalHeader');

if (settingsModalContent && settingsModalHeader) {
  let isDragging = false;
  let offsetX, offsetY;

  settingsModalHeader.addEventListener('mousedown', (e) => {
    if (e.target === closeSettingsXBtn) return; // Don't drag if clicking close button
    isDragging = true;
    
    // Get current position
    const rect = settingsModalContent.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Set position absolute for dragging, remove flex centering effects
    settingsModalContent.style.position = 'absolute';
    settingsModalContent.style.left = rect.left + 'px';
    settingsModalContent.style.top = rect.top + 'px';
    settingsModalContent.style.margin = '0';
    settingsModalContent.style.transform = 'none';
    
    settingsModalHeader.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    // Boundary check so it doesn't go off-screen
    const maxX = window.innerWidth - settingsModalContent.offsetWidth;
    const maxY = window.innerHeight - settingsModalContent.offsetHeight;
    
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x > maxX) x = maxX;
    if (y > maxY) y = maxY;

    settingsModalContent.style.left = `${x}px`;
    settingsModalContent.style.top = `${y}px`;
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      settingsModalHeader.style.cursor = 'grab';
    }
  });
}

// -----------------------------------------------
// WALLPAPER HANDLERS
// -----------------------------------------------
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
const bgTypeSelect = document.getElementById('bgTypeSelect');
const parallaxStrengthWrapper = document.getElementById('parallaxStrengthWrapper');
const parallaxStrengthInput = document.getElementById('parallaxStrengthInput');

if (bgUrlInput) {
  bgUrlInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val && bgPreviewImg) {
      bgPreviewImg.src = val;
      if (bgPreviewContainer) bgPreviewContainer.style.display = 'block';
    } else {
      if (bgPreviewContainer) bgPreviewContainer.style.display = 'none';
    }
  });
}

const applyBlurDebounced = debounce((val) => {
  AppState.bgBlurLevel = parseInt(val);
  applyBgEffects();
}, 100);
const applyDarkDebounced = debounce((val) => {
  AppState.bgDarkLevel = parseInt(val);
  applyBgEffects();
}, 100);

if (bgBlurInput) {
  bgBlurInput.addEventListener('input', (e) => {
    const blurDisp = document.getElementById('blurValueDisplay');
    if (blurDisp) blurDisp.textContent = e.target.value + 'px';
    applyBlurDebounced(e.target.value);
  });
}
if (bgDarkInput) {
  bgDarkInput.addEventListener('input', (e) => {
    const darkDisp = document.getElementById('darkValueDisplay');
    if (darkDisp) darkDisp.textContent = e.target.value + '%';
    applyDarkDebounced(e.target.value);
  });
}
if (bgTypeSelect) {
  bgTypeSelect.addEventListener('change', (e) => {
    AppState.bgType = e.target.value;
    if (parallaxStrengthWrapper) {
      parallaxStrengthWrapper.style.display = AppState.bgType === 'parallax' ? 'block' : 'none';
    }
    applyBgEffects();
  });
}
if (parallaxStrengthInput) {
  parallaxStrengthInput.addEventListener('input', (e) => {
    AppState.bgParallaxStrength = parseInt(e.target.value);
    const pVal = document.getElementById('parallaxStrengthVal');
    if (pVal) pVal.textContent = AppState.bgParallaxStrength + '%';
    applyBgEffects();
    // Simulate mouse move to force parallax update
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }));
  });
}

document.querySelectorAll('input[name="bgMode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (bgUrlWrapper) bgUrlWrapper.style.display = bgRadioUrl?.checked ? 'block' : 'none';
    if (bgFileWrapper) bgFileWrapper.style.display = bgRadioFile?.checked ? 'block' : 'none';

    const isDefault = document.querySelector('input[name="bgMode"][value="default"]')?.checked;
    if (isDefault) {
      if (bgPreviewContainer) bgPreviewContainer.style.display = 'none';
    } else if (bgRadioUrl?.checked && bgUrlInput?.value) {
      if (bgPreviewImg) bgPreviewImg.src = bgUrlInput.value;
      if (bgPreviewContainer) bgPreviewContainer.style.display = 'block';
    } else if (bgRadioFile?.checked && uploadedBgBase64) {
      if (bgPreviewImg) bgPreviewImg.src = uploadedBgBase64;
      if (bgPreviewContainer) bgPreviewContainer.style.display = 'block';
    } else {
      if (bgPreviewContainer) bgPreviewContainer.style.display = 'none';
    }
  });
});

if (bgFileInput) {
  bgFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (bgFileName) bgFileName.textContent = file.name;
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
        const isMobile = window.innerWidth <= 768;
        const maxSize = isMobile ? 1080 : 1920;
        let w = img.width, h = img.height;
        if (w > h && w > maxSize) { h *= maxSize / w; w = maxSize; }
        else if (h > maxSize) { w *= maxSize / h; h = maxSize; }
        canvas.width = Math.round(w);
        canvas.height = Math.round(h);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        uploadedBgBase64 = canvas.toDataURL('image/webp', 0.82);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// -----------------------------------------------
// ACCENT COLOR
// -----------------------------------------------
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.onclick = () => {
    AppState.accentColor = btn.getAttribute('data-color');
    applyAccentColor();
    document.querySelectorAll('.color-btn').forEach(b => b.style.borderColor = 'transparent');
    const customLabel = document.querySelector('.custom-color-label');
    if (customLabel) customLabel.style.borderColor = 'var(--modal-border)';
    btn.style.borderColor = 'white';
  };
});

const customColorInput = document.getElementById('customAccentPicker');
if (customColorInput) {
  customColorInput.addEventListener('input', (e) => {
    AppState.accentColor = e.target.value;
    applyAccentColor();
    document.querySelectorAll('.color-btn').forEach(b => b.style.borderColor = 'transparent');
    const customLabel = document.querySelector('.custom-color-label');
    if (customLabel) customLabel.style.borderColor = 'white';
  });
}

// -----------------------------------------------
// LIVE PREVIEW TEMA
// -----------------------------------------------
document.querySelectorAll('input[name="themeModeRadio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    AppState.themeMode = radio.value;
    applyThemeMode(AppState.themeMode);
  });
});

const enW = document.getElementById('enableWeather');
if (enW) {
  enW.addEventListener('change', (e) => {
    const wBlock = document.getElementById('weatherSettingsBlock');
    if (wBlock) wBlock.style.display = e.target.checked ? 'block' : 'none';
  });
}

// -----------------------------------------------
// LIVE PREVIEW SLIDERS
// -----------------------------------------------
const applyClockSizeDebounced = debounce(() => applyVisualScales(), 100);
const applyIconStylesDebounced = debounce(() => applyIconStyles(), 100);

['clockSize', 'weatherSize', 'weatherOpacity', 'settingsOpacity', 'iconSize', 'iconRadius'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      AppState[id] = val;
      const label = document.getElementById(`${id}Val`);
      if (label) label.textContent = val + (id === 'iconRadius' ? 'px' : '%');
      if (id === 'clockSize' || id === 'weatherSize' || id === 'weatherOpacity') applyClockSizeDebounced();
      else if (id === 'settingsOpacity') {
        const modalContent = document.getElementById('settingsModalContent');
        if (modalContent) modalContent.style.opacity = val / 100;
      }
      else applyIconStylesDebounced();
    });
  }
});

// Clock Style Live Preview
const clockStyleSelect = document.getElementById('clockStyle');
const customClockPanel = document.getElementById('customClockPanel');
if (clockStyleSelect) {
  clockStyleSelect.addEventListener('change', (e) => {
    AppState.clockStyle = e.target.value;
    if (customClockPanel) customClockPanel.style.display = AppState.clockStyle === 'custom' ? 'block' : 'none';
    applyClockStyle();
  });
}

// -----------------------------------------------
// CUSTOM CLOCK PANEL
// -----------------------------------------------
function getCC(id) { return document.getElementById(id); }

function applyCustomClockPreview() {
  const textColor  = getCC('ccTextColor')?.value || '#ffffff';
  const bgTransp   = getCC('ccBgTransparent')?.checked ?? true;
  const bgColor    = bgTransp ? 'transparent' : (getCC('ccBgColor')?.value || '#000000');
  const fontFamily = getCC('ccFontFamily')?.value || 'system-ui, sans-serif';
  const fontWeight = getCC('ccFontWeight')?.value || '800';
  const spacing    = getCC('ccLetterSpacing')?.value ?? '-3';
  const opacity    = (parseFloat(getCC('ccOpacity')?.value ?? 100)) / 100;
  const padding    = getCC('ccPadding')?.value ?? 0;
  const radius     = getCC('ccBorderRadius')?.value ?? 0;
  const bdrColor   = getCC('ccBorderColor')?.value || '#8b5cf6';
  const bdrWidth   = getCC('ccBorderWidth')?.value ?? 0;
  const bdrStyle   = getCC('ccBorderStyle')?.value || 'solid';
  const shColor    = getCC('ccShadowColor')?.value || '#000000';
  const shBlur     = getCC('ccShadowBlur')?.value ?? 0;
  const shDist     = getCC('ccShadowDist')?.value ?? 0;
  const anim       = getCC('ccAnimation')?.value || 'none';

  AppState.customClock = { textColor, bgTransp, bgColor, fontFamily, fontWeight, spacing, opacity, padding, radius, bdrColor, bdrWidth, bdrStyle, shColor, shBlur, shDist, anim };

  if (AppState.clockStyle === 'custom') applyClockStyle();

  // Apply ke preview box di panel settings
  const preview = getCC('customClockPreview');
  if (preview) {
    const bdr = parseInt(bdrWidth) > 0 ? `${bdrWidth}px ${bdrStyle} ${bdrColor}` : 'none';
    const shd = parseInt(shBlur) > 0 || parseInt(shDist) > 0 ? `${shDist}px ${shDist}px ${shBlur}px ${shColor}` : 'none';
    preview.style.cssText = `
      color: ${textColor};
      -webkit-text-fill-color: ${textColor};
      background: ${bgColor};
      font-family: ${fontFamily};
      font-weight: ${fontWeight};
      letter-spacing: ${spacing}px;
      opacity: ${opacity};
      padding: ${padding}px ${parseInt(padding) * 2.5}px;
      border-radius: ${radius}px;
      border: ${bdr};
      text-shadow: ${shd};
      animation: ${anim === 'none' ? 'none' : anim};
      font-size: 2rem;
      display: inline-block;
      transition: all 0.2s;
    `;
  }
}

function syncCustomClockInputs() {
  const cc = AppState.customClock;
  if (!cc) return;
  if (getCC('ccTextColor')) { getCC('ccTextColor').value = cc.textColor; }
  if (getCC('ccTextColorHex')) getCC('ccTextColorHex').textContent = cc.textColor;
  if (getCC('ccBgTransparent')) getCC('ccBgTransparent').checked = cc.bgTransp;
  if (getCC('ccBgColor')) { getCC('ccBgColor').value = cc.bgColor || '#000000'; }
  if (getCC('ccBgColorHex')) getCC('ccBgColorHex').textContent = cc.bgColor || '#000000';
  if (getCC('ccFontFamily')) getCC('ccFontFamily').value = cc.fontFamily;
  if (getCC('ccFontWeight')) getCC('ccFontWeight').value = cc.fontWeight;
  if (getCC('ccLetterSpacing')) {
    getCC('ccLetterSpacing').value = cc.spacing;
    if (getCC('ccLetterSpacingVal')) getCC('ccLetterSpacingVal').textContent = cc.spacing + 'px';
  }
  if (getCC('ccOpacity')) {
    const opacityPct = Math.round((parseFloat(cc.opacity) || 1) * 100);
    getCC('ccOpacity').value = opacityPct;
    if (getCC('ccOpacityVal')) getCC('ccOpacityVal').textContent = opacityPct + '%';
  }
  if (getCC('ccPadding')) {
    getCC('ccPadding').value = cc.padding;
    if (getCC('ccPaddingVal')) getCC('ccPaddingVal').textContent = cc.padding + 'px';
  }
  if (getCC('ccBorderRadius')) {
    getCC('ccBorderRadius').value = cc.radius;
    if (getCC('ccBorderRadiusVal')) getCC('ccBorderRadiusVal').textContent = cc.radius + 'px';
  }
  if (getCC('ccBorderColor')) getCC('ccBorderColor').value = cc.bdrColor;
  if (getCC('ccBorderWidth')) {
    getCC('ccBorderWidth').value = cc.bdrWidth;
    if (getCC('ccBorderWidthVal')) getCC('ccBorderWidthVal').textContent = cc.bdrWidth + 'px';
  }
  if (getCC('ccBorderStyle')) getCC('ccBorderStyle').value = cc.bdrStyle;
  if (getCC('ccShadowColor')) getCC('ccShadowColor').value = cc.shColor;
  if (getCC('ccShadowBlur')) {
    getCC('ccShadowBlur').value = cc.shBlur;
    if (getCC('ccShadowBlurVal')) getCC('ccShadowBlurVal').textContent = cc.shBlur + 'px';
  }
  if (getCC('ccShadowDist')) {
    getCC('ccShadowDist').value = cc.shDist;
    if (getCC('ccShadowDistVal')) getCC('ccShadowDistVal').textContent = cc.shDist + 'px';
  }
  if (getCC('ccAnimation')) getCC('ccAnimation').value = cc.anim;
}

// Wire semua input custom clock ke live preview
const ccInputIds = [
  'ccTextColor', 'ccBgColor', 'ccBgTransparent', 'ccFontFamily', 'ccFontWeight',
  'ccLetterSpacing', 'ccOpacity', 'ccPadding', 'ccBorderRadius', 'ccBorderColor',
  'ccBorderWidth', 'ccBorderStyle', 'ccShadowColor', 'ccShadowBlur', 'ccShadowDist', 'ccAnimation'
];
const ccSliderLabels = {
  ccLetterSpacing: { id: 'ccLetterSpacingVal', suffix: 'px' },
  ccOpacity:       { id: 'ccOpacityVal',       suffix: '%' },
  ccPadding:       { id: 'ccPaddingVal',        suffix: 'px' },
  ccBorderRadius:  { id: 'ccBorderRadiusVal',   suffix: 'px' },
  ccBorderWidth:   { id: 'ccBorderWidthVal',    suffix: 'px' },
  ccShadowBlur:    { id: 'ccShadowBlurVal',     suffix: 'px' },
  ccShadowDist:    { id: 'ccShadowDistVal',     suffix: 'px' },
};
const ccColorLabels = { ccTextColor: 'ccTextColorHex', ccBgColor: 'ccBgColorHex' };

ccInputIds.forEach(id => {
  const el = getCC(id);
  if (!el) return;
  el.addEventListener('input', () => {
    if (ccSliderLabels[id]) {
      const lbl = getCC(ccSliderLabels[id].id);
      if (lbl) lbl.textContent = el.value + ccSliderLabels[id].suffix;
    }
    if (ccColorLabels[id]) {
      const lbl = getCC(ccColorLabels[id]);
      if (lbl) lbl.textContent = el.value;
    }
    applyCustomClockPreview();
  });
});

const ccResetBtn = getCC('ccResetBtn');
if (ccResetBtn) {
  ccResetBtn.addEventListener('click', () => {
    AppState.customClock = {
      textColor: '#ffffff', bgTransp: true, bgColor: '#000000',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontWeight: '800', spacing: '-3', opacity: 1,
      padding: 0, radius: 0, bdrColor: '#8b5cf6',
      bdrWidth: 0, bdrStyle: 'solid', shColor: '#000000',
      shBlur: 0, shDist: 0, anim: 'none'
    };
    syncCustomClockInputs();
    applyCustomClockPreview();
  });
}

// -----------------------------------------------
// SEARCH STYLE LIVE PREVIEW
// -----------------------------------------------
const searchStyleSelect = document.getElementById('searchStyle');
const customSearchPanel = document.getElementById('customSearchPanel');
if (searchStyleSelect) {
  searchStyleSelect.addEventListener('change', (e) => {
    AppState.searchStyle = e.target.value;
    if (customSearchPanel) customSearchPanel.style.display = AppState.searchStyle === 'custom' ? 'block' : 'none';
    applySearchStyle();
  });
}

// -----------------------------------------------
// CUSTOM SEARCH PANEL
// -----------------------------------------------
function getCS(id) { return document.getElementById(id); }

function applyCustomSearchPreview() {
  const textColor = getCS('csTextColor')?.value || '#ffffff';
  const bgColor = getCS('csBgColor')?.value || '#000000';
  const bgTransp = getCS('csBgTransparent')?.checked ?? true;
  const opacity = getCS('csOpacity')?.value ?? 15;
  const blur = getCS('csBlur')?.value ?? 10;
  const radius = getCS('csRadius')?.value ?? 24;
  const padding = getCS('csPadding')?.value ?? 12;
  const bdrColor = getCS('csBorderColor')?.value || '#ffffff';
  const bdrOpacity = getCS('csBorderOpacity')?.value ?? 10;
  const bdrWidth = getCS('csBorderWidth')?.value ?? 1;
  const bdrStyle = getCS('csBorderStyle')?.value || 'solid';
  const shColor = getCS('csShadowColor')?.value || '#000000';
  const shOpacity = getCS('csShadowOpacity')?.value ?? 15;
  const shBlur = getCS('csShadowBlur')?.value ?? 12;
  const shDist = getCS('csShadowDist')?.value ?? 4;
  const iconColor = getCS('csIconColor')?.value || '#ffffff';

  AppState.customSearch = { textColor, bgColor, bgTransp, opacity, blur, radius, padding, bdrColor, bdrOpacity, bdrWidth, bdrStyle, shColor, shOpacity, shBlur, shDist, iconColor };

  if (AppState.searchStyle === 'custom') applySearchStyle();

  // Apply to preview
  const preview = getCS('customSearchPreview');
  if (preview) {
    preview.style.cssText = `
      padding: ${padding}px ${parseInt(padding)+12}px;
      border-radius: ${radius}px;
      display: inline-flex; align-items: stretch; gap: 10px; font-size: 1rem; width: 100%; max-width: 400px; justify-content: flex-start; transition: all 0.3s ease;
      color: ${textColor};
    `;
    preview.style.background = bgTransp ? 'transparent' : bgColor;
    if (!bgTransp && bgColor.startsWith('#')) {
      const hex = bgColor.replace('#', '');
      if (hex.length >= 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        preview.style.background = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
      }
    }
    
    if (parseInt(bdrWidth) > 0) {
      if (bdrColor.startsWith('#')) {
         const hex = bdrColor.replace('#', '');
         if (hex.length >= 6) {
           const r = parseInt(hex.substring(0, 2), 16);
           const g = parseInt(hex.substring(2, 4), 16);
           const b = parseInt(hex.substring(4, 6), 16);
           preview.style.border = `${bdrWidth}px ${bdrStyle} rgba(${r}, ${g}, ${b}, ${bdrOpacity / 100})`;
         }
      } else {
         preview.style.border = `${bdrWidth}px ${bdrStyle} ${bdrColor}`;
      }
    } else {
      preview.style.border = 'none';
    }
    
    if (parseInt(shBlur) > 0 || parseInt(shDist) > 0) {
      if (shColor.startsWith('#')) {
         const hex = shColor.replace('#', '');
         if (hex.length >= 6) {
           const r = parseInt(hex.substring(0, 2), 16);
           const g = parseInt(hex.substring(2, 4), 16);
           const b = parseInt(hex.substring(4, 6), 16);
           preview.style.boxShadow = `${shDist}px ${shDist}px ${shBlur}px rgba(${r}, ${g}, ${b}, ${shOpacity / 100})`;
         }
      } else {
         preview.style.boxShadow = `${shDist}px ${shDist}px ${shBlur}px ${shColor}`;
      }
    } else {
      preview.style.boxShadow = 'none';
    }
    
    const svg = preview.querySelector('svg');
    if (svg) {
        svg.style.stroke = iconColor;
        svg.style.color = iconColor;
    }
  }
}

function syncCustomSearchInputs() {
  const cs = AppState.customSearch;
  if (!cs) return;
  if (getCS('csTextColor')) getCS('csTextColor').value = cs.textColor;
  if (getCS('csBgColor')) getCS('csBgColor').value = cs.bgColor;
  if (getCS('csBgTransparent')) getCS('csBgTransparent').checked = cs.bgTransp;
  if (getCS('csOpacity')) { getCS('csOpacity').value = cs.opacity; if (getCS('csOpacityVal')) getCS('csOpacityVal').textContent = cs.opacity + '%'; }
  if (getCS('csBlur')) { getCS('csBlur').value = cs.blur; if (getCS('csBlurVal')) getCS('csBlurVal').textContent = cs.blur + 'px'; }
  if (getCS('csRadius')) { getCS('csRadius').value = cs.radius; if (getCS('csRadiusVal')) getCS('csRadiusVal').textContent = cs.radius + 'px'; }
  if (getCS('csPadding')) { getCS('csPadding').value = cs.padding; if (getCS('csPaddingVal')) getCS('csPaddingVal').textContent = cs.padding + 'px'; }
  if (getCS('csBorderColor')) getCS('csBorderColor').value = cs.bdrColor;
  if (getCS('csBorderOpacity')) { getCS('csBorderOpacity').value = cs.bdrOpacity; if (getCS('csBorderOpacityVal')) getCS('csBorderOpacityVal').textContent = cs.bdrOpacity + '%'; }
  if (getCS('csBorderWidth')) { getCS('csBorderWidth').value = cs.bdrWidth; if (getCS('csBorderWidthVal')) getCS('csBorderWidthVal').textContent = cs.bdrWidth + 'px'; }
  if (getCS('csBorderStyle')) getCS('csBorderStyle').value = cs.bdrStyle;
  if (getCS('csShadowColor')) getCS('csShadowColor').value = cs.shColor;
  if (getCS('csShadowOpacity')) { getCS('csShadowOpacity').value = cs.shOpacity; if (getCS('csShadowOpacityVal')) getCS('csShadowOpacityVal').textContent = cs.shOpacity + '%'; }
  if (getCS('csShadowBlur')) { getCS('csShadowBlur').value = cs.shBlur; if (getCS('csShadowBlurVal')) getCS('csShadowBlurVal').textContent = cs.shBlur + 'px'; }
  if (getCS('csShadowDist')) { getCS('csShadowDist').value = cs.shDist; if (getCS('csShadowDistVal')) getCS('csShadowDistVal').textContent = cs.shDist + 'px'; }
  if (getCS('csIconColor')) getCS('csIconColor').value = cs.iconColor;
}

const csInputIds = [
  'csTextColor', 'csBgColor', 'csBgTransparent', 'csOpacity', 'csBlur', 'csRadius', 'csPadding',
  'csBorderColor', 'csBorderOpacity', 'csBorderWidth', 'csBorderStyle',
  'csShadowColor', 'csShadowOpacity', 'csShadowBlur', 'csShadowDist', 'csIconColor'
];

const csSliderLabels = {
  csOpacity: { id: 'csOpacityVal', suffix: '%' },
  csBlur: { id: 'csBlurVal', suffix: 'px' },
  csRadius: { id: 'csRadiusVal', suffix: 'px' },
  csPadding: { id: 'csPaddingVal', suffix: 'px' },
  csBorderOpacity: { id: 'csBorderOpacityVal', suffix: '%' },
  csBorderWidth: { id: 'csBorderWidthVal', suffix: 'px' },
  csShadowOpacity: { id: 'csShadowOpacityVal', suffix: '%' },
  csShadowBlur: { id: 'csShadowBlurVal', suffix: 'px' },
  csShadowDist: { id: 'csShadowDistVal', suffix: 'px' }
};

csInputIds.forEach(id => {
  const el = getCS(id);
  if (!el) return;
  el.addEventListener('input', () => {
    if (csSliderLabels[id]) {
      const lbl = getCS(csSliderLabels[id].id);
      if (lbl) lbl.textContent = el.value + csSliderLabels[id].suffix;
    }
    applyCustomSearchPreview();
  });
});

const csResetBtn = getCS('csResetBtn');
if (csResetBtn) {
  csResetBtn.addEventListener('click', () => {
    AppState.customSearch = {
      textColor: '#ffffff', bgColor: '#000000', bgTransp: true, opacity: 15, blur: 10,
      radius: 24, padding: 12, bdrColor: '#ffffff', bdrOpacity: 10, bdrWidth: 1,
      bdrStyle: 'solid', shColor: '#000000', shOpacity: 15, shBlur: 12, shDist: 4, iconColor: '#ffffff'
    };
    syncCustomSearchInputs();
    applyCustomSearchPreview();
  });
}

// -----------------------------------------------
// ICON & GROUP SETTINGS LIVE PREVIEW
// -----------------------------------------------
['useIconBg', 'useCardBg'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', (e) => { AppState[id] = e.target.checked; applyIconStyles(); });
});

const titlePositionEl = document.getElementById('titlePosition');
if (titlePositionEl) titlePositionEl.addEventListener('change', (e) => { AppState.titlePosition = e.target.value; applyIconStyles(); });

const defaultGroupBehaviorEl = document.getElementById('defaultGroupBehavior');
if (defaultGroupBehaviorEl) defaultGroupBehaviorEl.addEventListener('change', (e) => { AppState.defaultGroupBehavior = e.target.value; });

const groupTransitionEl = document.getElementById('groupTransitionEffect');
if (groupTransitionEl) groupTransitionEl.addEventListener('change', (e) => { AppState.groupTransitionEffect = e.target.value; renderElyxoras(); });

// -----------------------------------------------
// SIMPAN PENGATURAN
// -----------------------------------------------
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
if (saveSettingsBtn) {
  saveSettingsBtn.onclick = async () => {
    // Helper untuk membaca DOM dengan aman tanpa menimpa dengan default jika elemen tidak ada
    const readVal = (id, current, parser = String) => {
      const el = document.getElementById(id);
      if (!el) return current;
      const val = el.value.trim();
      if (val === '') return current;
      return parser(val);
    };
    const readCheck = (id, current) => {
      const el = document.getElementById(id);
      return el ? el.checked : current;
    };

    AppState.language = readVal('appLanguage', AppState.language);
    AppState.userName = readVal('userNameInput', AppState.userName);
    AppState.clockFormat = readVal('clockFormat', AppState.clockFormat);
    AppState.showSeconds = readCheck('showSeconds', AppState.showSeconds);
    AppState.showDate = readCheck('showDate', AppState.showDate);
    AppState.enableWeather = readCheck('enableWeather', AppState.enableWeather);
    AppState.weatherLocation = readVal('weatherLocation', AppState.weatherLocation);
    AppState.weatherUnit = readVal('weatherUnit', AppState.weatherUnit);
    AppState.weatherForecast = readCheck('weatherForecast', AppState.weatherForecast);
    
    const themeRadio = document.querySelector('input[name="themeModeRadio"]:checked');
    if (themeRadio) AppState.themeMode = themeRadio.value;

    AppState.clockStyle = readVal('clockStyle', AppState.clockStyle);
    AppState.clockSize = readVal('clockSize', AppState.clockSize, Number);
    AppState.weatherSize = readVal('weatherSize', AppState.weatherSize, Number);
    AppState.weatherOpacity = readVal('weatherOpacity', AppState.weatherOpacity, Number);
    AppState.settingsOpacity = readVal('settingsOpacity', AppState.settingsOpacity, Number);
    AppState.iconSize = readVal('iconSize', AppState.iconSize, Number);
    AppState.iconRadius = readVal('iconRadius', AppState.iconRadius, Number);
    AppState.useIconBg = readCheck('useIconBg', AppState.useIconBg);
    AppState.useCardBg = readCheck('useCardBg', AppState.useCardBg);
    AppState.titlePosition = readVal('titlePosition', AppState.titlePosition);
    AppState.defaultGroupBehavior = readVal('defaultGroupBehavior', AppState.defaultGroupBehavior);
    AppState.groupTransitionEffect = readVal('groupTransitionEffect', AppState.groupTransitionEffect);
    AppState.showGroupItemCount = readCheck('showGroupItemCount', AppState.showGroupItemCount);
    AppState.openInNewTab = readCheck('openInNewTab', AppState.openInNewTab);
    AppState.confirmDelete = readCheck('confirmDelete', AppState.confirmDelete);
    AppState.bgBlurLevel = readVal('bgBlurInput', AppState.bgBlurLevel, Number);
    AppState.bgDarkLevel = readVal('bgDarkInput', AppState.bgDarkLevel, Number);

    // Tentukan wallpaper baru
    const bgModeVal = document.querySelector('input[name="bgMode"]:checked')?.value || 'default';
    currentBgModeOnOpen = bgModeVal;

    if (bgModeVal === 'url' && bgUrlInput?.value.trim()) {
      AppState.currentWallpaperUrl = bgUrlInput.value.trim();
      AppState.customBackground = bgUrlInput.value.trim();
    } else if (bgModeVal === 'file' && uploadedBgBase64) {
      AppState.currentWallpaperUrl = uploadedBgBase64;
      AppState.customBackground = uploadedBgBase64;
    } else if (bgModeVal === 'default') {
      AppState.currentWallpaperUrl = '';
      AppState.customBackground = '';
    }
    // Jika bgModeVal === 'keep' atau tidak berubah, biarkan nilai yang ada

    // Simpan ke storage
    await saveState();

    // Terapkan perubahan HANYA jika ada yang berubah
    const prev = settingsSnapshot;

    if (prev.themeMode !== AppState.themeMode) applyThemeMode(AppState.themeMode);
    
    if (prev.clockSize !== AppState.clockSize || prev.weatherSize !== AppState.weatherSize || prev.iconSize !== AppState.iconSize) {
      applyVisualScales();
    }
    
    // Periksa jam
    const clockChanged = prev.clockStyle !== AppState.clockStyle || 
                         JSON.stringify(prev.customClock) !== JSON.stringify(AppState.customClock) || 
                         prev.clockFormat !== AppState.clockFormat || 
                         prev.showSeconds !== AppState.showSeconds || 
                         prev.showDate !== AppState.showDate;
    if (clockChanged) {
      applyClockStyle();
      updateClock();
    }
    
    // Periksa gaya ikon
    const iconStyleChanged = prev.iconRadius !== AppState.iconRadius || prev.useIconBg !== AppState.useIconBg || prev.useCardBg !== AppState.useCardBg;
    if (iconStyleChanged) applyIconStyles();

    // Periksa grup & shortcut (render ulang grup hanya jika visual atau behaviornya berubah)
    const groupsChanged = iconStyleChanged || 
                          prev.titlePosition !== AppState.titlePosition || 
                          prev.showGroupItemCount !== AppState.showGroupItemCount || 
                          prev.groupTransitionEffect !== AppState.groupTransitionEffect ||
                          prev.language !== AppState.language;
    if (groupsChanged) renderGroups();

    // Periksa Bahasa
    if (prev.language !== AppState.language || prev.userName !== AppState.userName) {
      if (prev.language !== AppState.language) {
        await loadTranslations(AppState.language);
        applyI18n();
      }
      // Jika nama ganti atau bahasa ganti, update sapaan dan cuaca
      updateClock();
      fetchWeather();
    }
    
    // Periksa wallpaper
    const bgChanged = prev.bgMode !== currentBgModeOnOpen ||
                      prev.bgType !== AppState.bgType || 
                      prev.bgBlurLevel !== AppState.bgBlurLevel || 
                      prev.bgDarkLevel !== AppState.bgDarkLevel || 
                      prev.bgParallaxStrength !== AppState.bgParallaxStrength || 
                      prev.currentWallpaperUrl !== AppState.currentWallpaperUrl;
    if (bgChanged) applyBgEffects();
    
    // Periksa cuaca
    const weatherChanged = prev.enableWeather !== AppState.enableWeather || 
                           prev.weatherLocation !== AppState.weatherLocation || 
                           prev.weatherUnit !== AppState.weatherUnit || 
                           prev.weatherForecast !== AppState.weatherForecast;
    if (weatherChanged) fetchWeather();

    // Pastikan accent color dipaly meski tidak terpantau langsung di variabel
    applyAccentColor();

    // Update search form target
    const form = document.getElementById('searchForm');
    if (form) form.target = AppState.openInNewTab ? '_blank' : '_self';

    if (setModal) setModal.style.display = 'none';
  };
}
