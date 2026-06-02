// =============================================
// THEME & VISUAL ENGINE (theme.js)
// Mengatur tampilan CSS dinamis, gaya jam, ikon, dan background
// =============================================
import { AppState } from './state.js';

export function applyThemeMode(mode) {
  AppState.themeMode = mode;
  if (mode === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    document.body.setAttribute('data-theme', mode);
  }
  applyBgEffects();
}

// Deteksi perubahan tema sistem
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (AppState.themeMode === 'system') applyThemeMode('system');
});

export function applyBgEffects() {
  const overlay = document.querySelector('.bg-overlay');
  const bgLayer = document.getElementById('bgImageLayer');
  const overlayBase = getComputedStyle(document.body).getPropertyValue('--overlay-base').trim() || '15, 23, 42';
  
  const blur = AppState.bgBlurLevel;
  const dark = AppState.bgDarkLevel;
  const bgType = AppState.bgType;
  const overlayColor = `rgba(${overlayBase}, ${dark / 100})`;
  const currentWallpaperUrl = AppState.currentWallpaperUrl;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {
    if (overlay) {
      overlay.style.backdropFilter = 'none';
      overlay.style.webkitBackdropFilter = 'none';
      overlay.style.backgroundColor = overlayColor;
    }
    if (bgLayer) {
      if (currentWallpaperUrl && bgType !== 'none') {
        bgLayer.style.backgroundImage = `url('${currentWallpaperUrl}')`;
        bgLayer.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
        
        if (bgType === 'fill' || bgType === 'parallax') bgLayer.style.backgroundSize = 'cover';
        else if (bgType === 'fit') bgLayer.style.backgroundSize = 'contain';
        else if (bgType === 'stretch') bgLayer.style.backgroundSize = '100% 100%';
        
        bgLayer.style.backgroundPosition = 'center';
        bgLayer.style.backgroundRepeat = 'no-repeat';
        bgLayer.style.transform = 'scale(1.05)';
        document.body.style.backgroundImage = 'none';
      } else {
        bgLayer.style.backgroundImage = 'none';
        document.body.style.backgroundImage = 'none';
      }
    }
  } else {
    // Desktop
    if (bgLayer) {
      if (bgType === 'parallax' && currentWallpaperUrl) {
        bgLayer.style.backgroundImage = `url('${currentWallpaperUrl}')`;
        bgLayer.style.filter = 'none';
        bgLayer.style.backgroundSize = 'cover';
        bgLayer.style.backgroundPosition = 'center';
        bgLayer.style.backgroundRepeat = 'no-repeat';
        
        // Atur skala awal berdasarkan kekuatan Parallax agar ukuran tidak berubah saat mouse digerakkan pertama kali
        const strength = (AppState.bgParallaxStrength !== undefined ? AppState.bgParallaxStrength : 50) / 100;
        const dynamicScale = 1.0 + (strength * 0.20); 
        bgLayer.style.transform = `scale(${dynamicScale}) translate3d(0, 0, 0)`;
        
        document.body.style.backgroundImage = 'none';
      } else {
        bgLayer.style.backgroundImage = 'none';
        bgLayer.style.filter = 'none';
        bgLayer.style.transform = 'scale(1.05)';

        if (currentWallpaperUrl && bgType !== 'none') {
          document.body.style.backgroundImage = `url('${currentWallpaperUrl}')`;
          if (bgType === 'fill') document.body.style.backgroundSize = 'cover';
          else if (bgType === 'fit') document.body.style.backgroundSize = 'contain';
          else if (bgType === 'stretch') document.body.style.backgroundSize = '100% 100%';
          else if (bgType === 'tile') {
            document.body.style.backgroundSize = 'auto';
            document.body.style.backgroundPosition = 'top left';
            document.body.style.backgroundRepeat = 'repeat';
          } else if (bgType === 'center') {
            document.body.style.backgroundSize = 'auto';
            document.body.style.backgroundPosition = 'center';
          }
          if (bgType !== 'tile') document.body.style.backgroundPosition = 'center';
          if (bgType !== 'tile') document.body.style.backgroundRepeat = 'no-repeat';
          document.body.style.backgroundAttachment = 'scroll';
        } else {
          document.body.style.backgroundImage = 'none';
        }
      }
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

// Parallax Effect Smooth
let parallaxCurrentX = 0;
let parallaxCurrentY = 0;
let parallaxTargetX = 0;
let parallaxTargetY = 0;
let parallaxAnimating = false;
let parallaxGpuTimeout = null;
let parallaxTicking = false;

document.addEventListener('mousemove', (e) => {
  if (!parallaxTicking) {
    window.requestAnimationFrame(() => {
      if (AppState.bgType === 'parallax' && AppState.currentWallpaperUrl && !window.matchMedia('(max-width: 768px)').matches) {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        const strength = AppState.bgParallaxStrength / 100;
        
        parallaxTargetX = -x * 75 * strength;
        parallaxTargetY = -y * 75 * strength;

        const bgLayer = document.getElementById('bgImageLayer');
        if (bgLayer) {
          bgLayer.classList.add('parallax-gpu-active');
          clearTimeout(parallaxGpuTimeout);
          parallaxGpuTimeout = setTimeout(() => {
            bgLayer.classList.remove('parallax-gpu-active');
          }, 500);
        }

        if (!parallaxAnimating) {
          parallaxAnimating = true;
          requestAnimationFrame(parallaxLoop);
        }
      }
      parallaxTicking = false;
    });
    parallaxTicking = true;
  }
});

function parallaxLoop() {
  if (AppState.bgType !== 'parallax' || !AppState.currentWallpaperUrl || window.matchMedia('(max-width: 768px)').matches) {
    parallaxAnimating = false;
    return;
  }
  
  const strength = AppState.bgParallaxStrength / 100;
  // Semakin tinggi slider, semakin responsif gerakannya
  const ease = 0.04 + (strength * 0.12);
  
  parallaxCurrentX += (parallaxTargetX - parallaxCurrentX) * ease;
  parallaxCurrentY += (parallaxTargetY - parallaxCurrentY) * ease;
  
  const bgLayer = document.getElementById('bgImageLayer');
  if (bgLayer) {
    // Zoom hingga 1.20x di 100% untuk menutupi pergeseran 75px di segala ukuran layar
    const dynamicScale = 1.0 + (strength * 0.20); 
    bgLayer.style.transform = `scale(${dynamicScale}) translate3d(${parallaxCurrentX}px, ${parallaxCurrentY}px, 0)`;
  }
  
  if (Math.abs(parallaxTargetX - parallaxCurrentX) > 0.01 || Math.abs(parallaxTargetY - parallaxCurrentY) > 0.01) {
    requestAnimationFrame(parallaxLoop);
  } else {
    parallaxAnimating = false;
  }
}

export function applyAccentColor() {
  let styleEl = document.getElementById('dynamicAccent');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicAccent';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    :root { --accent-color: ${AppState.accentColor}; }
    .save-btn { background: var(--accent-color) !important; }
    input:focus, select:focus { border-color: var(--accent-color) !important; outline: none; }
    input[type=range] { accent-color: var(--accent-color) !important; }
    input[type=radio], input[type=checkbox] { accent-color: var(--accent-color) !important; }
    #searchForm button:hover { background: var(--accent-color) !important; border-color: var(--accent-color) !important; }
  `;
}

export function applyIconStyles() {
  let styleEl = document.getElementById('dynamicIconStyles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'dynamicIconStyles';
    document.head.appendChild(styleEl);
  }

  const isPhoneScreen = window.innerWidth <= 767;
  const { iconSize, iconRadius, titlePosition, useCardBg, useIconBg } = AppState;

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
    iconHeightPercent = titlePosition === 'inside' ? '55%' : '75%';
  }

  styleEl.textContent = `
    .elyxora-grid { grid-template-columns: repeat(${gridColumnSize}) !important; }
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

export function applyVisualScales() {
  const clockWidget = document.querySelector('.time-widget');
  const weatherWidget = document.querySelector('.weather-widget');
  const isMobileSize = window.innerWidth <= 1100;

  if (clockWidget) {
    clockWidget.style.setProperty('zoom', `${AppState.clockSize / 100}`, 'important');
  }
  if (weatherWidget) {
    if (isMobileSize) {
      weatherWidget.style.setProperty('zoom', '1', 'important');
    } else {
      weatherWidget.style.setProperty('zoom', `${AppState.weatherSize / 100}`, 'important');
    }
    
    // Apply weather widget transparency
    const wOpacity = AppState.weatherOpacity !== undefined ? AppState.weatherOpacity : 100;
    weatherWidget.style.setProperty('opacity', `${wOpacity / 100}`, 'important');
  }
  applyIconStyles();
}

window.addEventListener('resize', applyVisualScales);

export function applyClockStyle() {
  const timeEl = document.getElementById('time');
  if (!timeEl) return;
  const { clockStyle, customClock } = AppState;

  timeEl.className = `time clock-${clockStyle}`;
  timeEl.removeAttribute('style');

  if (clockStyle === 'custom') {
    const cc = customClock;
    const bdr = parseInt(cc.bdrWidth) > 0 ? `${cc.bdrWidth}px ${cc.bdrStyle} ${cc.bdrColor}` : 'none';
    const shd = (parseInt(cc.shBlur) > 0 || parseInt(cc.shDist) > 0) ? `${cc.shDist}px ${cc.shDist}px ${cc.shBlur}px ${cc.shColor}` : 'none';
    timeEl.style.color               = cc.textColor;
    timeEl.style.webkitTextFillColor = cc.textColor;
    timeEl.style.background          = cc.bgTransp ? 'transparent' : cc.bgColor;
    timeEl.style.webkitBackgroundClip = 'unset';
    timeEl.style.backgroundClip      = 'unset';
    timeEl.style.fontFamily          = cc.fontFamily;
    timeEl.style.fontWeight          = cc.fontWeight;
    timeEl.style.letterSpacing       = cc.spacing + 'px';
    timeEl.style.opacity             = cc.opacity;
    timeEl.style.padding             = `${cc.padding}px ${parseInt(cc.padding) * 2.5}px`;
    timeEl.style.borderRadius        = cc.radius + 'px';
    timeEl.style.border              = bdr;
    timeEl.style.textShadow          = shd;
    timeEl.style.animation           = cc.anim === 'none' ? '' : cc.anim;
  }
}

export function applySearchStyle() {
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const engineIcon = document.getElementById('activeEngineIcon');
  const submitBtn = document.getElementById('searchSubmitBtn');
  const engineDropdown = document.getElementById('engineDropdown');
  
  if (!searchForm || !searchInput) return;

  const { searchStyle = 'default', customSearch = {} } = AppState;

  searchForm.removeAttribute('style');
  searchInput.removeAttribute('style');

  searchForm.className = `search-form-base search-form-style-${searchStyle}`;
  searchInput.className = `search-input-base search-input-style-${searchStyle}`;
  if (engineDropdown) engineDropdown.className = `engine-dropdown-style-${searchStyle}`;

  const iconSvg = engineIcon ? engineIcon.querySelector('svg') : null;
  if (iconSvg) iconSvg.style.color = '';
  
  if (submitBtn) {
    const btnSvg = submitBtn.querySelector('svg');
    if (btnSvg) btnSvg.style.stroke = '';
  } else if (searchStyle === 'custom') {
    const cs = customSearch;
    searchForm.style.background = cs.bgTransp ? 'transparent' : cs.bgColor;
    searchForm.style.backdropFilter = `blur(${cs.blur}px)`;
    
    // Apply opacity by converting hex to rgba or applying opacity to background
    if (!cs.bgTransp && cs.bgColor && cs.bgColor.startsWith('#')) {
      const hex = cs.bgColor.replace('#', '');
      if (hex.length >= 6) {
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        searchForm.style.background = `rgba(${r}, ${g}, ${b}, ${cs.opacity / 100})`;
      }
    }
    
    const bdr = parseInt(cs.bdrWidth) > 0 ? `${cs.bdrWidth}px ${cs.bdrStyle} ${cs.bdrColor}` : 'none';
    searchForm.style.border = bdr;
    
    // For border opacity
    if (parseInt(cs.bdrWidth) > 0 && cs.bdrColor && cs.bdrColor.startsWith('#')) {
       const hex = cs.bdrColor.replace('#', '');
       if (hex.length >= 6) {
         const r = parseInt(hex.substring(0, 2), 16);
         const g = parseInt(hex.substring(2, 4), 16);
         const b = parseInt(hex.substring(4, 6), 16);
         searchForm.style.borderColor = `rgba(${r}, ${g}, ${b}, ${cs.bdrOpacity / 100})`;
       }
    }
    
    searchForm.style.borderRadius = `${cs.radius}px`;
    searchForm.style.padding = `${cs.padding}px ${parseInt(cs.padding) + 12}px`;
    
    const shd = (parseInt(cs.shBlur) > 0 || parseInt(cs.shDist) > 0) ? `${cs.shDist}px ${cs.shDist}px ${cs.shBlur}px ${cs.shColor}` : 'none';
    searchForm.style.boxShadow = shd;
    
    // For shadow opacity
    if ((parseInt(cs.shBlur) > 0 || parseInt(cs.shDist) > 0) && cs.shColor && cs.shColor.startsWith('#')) {
       const hex = cs.shColor.replace('#', '');
       if (hex.length >= 6) {
         const r = parseInt(hex.substring(0, 2), 16);
         const g = parseInt(hex.substring(2, 4), 16);
         const b = parseInt(hex.substring(4, 6), 16);
         searchForm.style.boxShadow = `${cs.shDist}px ${cs.shDist}px ${cs.shBlur}px rgba(${r}, ${g}, ${b}, ${cs.shOpacity / 100})`;
       }
    }

    searchInput.style.color = cs.textColor;
    
    // Icon colors
    if (iconSvg) {
        iconSvg.style.color = cs.iconColor;
        iconSvg.style.fill = 'currentColor'; 
    }
    if (submitBtn) {
      const btnSvg = submitBtn.querySelector('svg');
      if (btnSvg) {
          btnSvg.style.stroke = cs.iconColor;
          btnSvg.style.color = cs.iconColor;
      }
    }

    if (engineDropdown) {
      // In custom mode, make the dropdown match the bar but with a solid background if transparent
      engineDropdown.style.background = searchForm.style.background;
      // if it's transparent, give it some background so we can see the text
      if (cs.bgTransp || cs.opacity < 20) {
          engineDropdown.style.background = 'rgba(var(--overlay-base), 0.9)';
      }
      engineDropdown.style.backdropFilter = searchForm.style.backdropFilter;
      engineDropdown.style.border = searchForm.style.border;
      engineDropdown.style.borderColor = searchForm.style.borderColor;
      engineDropdown.style.borderRadius = '16px';
      engineDropdown.style.boxShadow = searchForm.style.boxShadow;
    }
  }
}
