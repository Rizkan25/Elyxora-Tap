// =============================================
// GROUPS ENGINE (groups.js)
// Mengelola grup, pintasan, drag-drop, context menu
// =============================================
import { AppState, savePartialState } from './state.js';
import { fetchIconAsBase64, OFFLINE_ICON_SVG, escapeHTML } from './utils.js';
import { getMessage } from './i18n.js';

// Kamus Ikon Vektor Tajam & Berwarna Khas Desain Stitch
export const STITCH_ICONS = {
  'google.com': `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00dbe9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  'github.com': `<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" style="color:#ffffff;"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
  'claude.ai': `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/><line x1="9" y1="21" x2="15" y2="21"/></svg>`,
  'chatgpt.com': `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#00dbe9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  'youtube.com': `<svg width="26" height="26" viewBox="0 0 24 24" fill="#e63946"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  'perplexity.ai': `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7bd0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><circle cx="12" cy="9" r="3"/><line x1="12" y1="12" x2="12" y2="15"/></svg>`,
  'web.whatsapp.com': `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  'whatsapp.com': `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#39ff14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  'notion.so': `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`
};

// Pemetaan Badge Tag Subtitle Stitch
export const STITCH_TAGS = {
  'github.com': { tag: 'Elyxora-Tap', colorClass: 'badge-purple' },
  'claude.ai': { tag: '3.7 Sonnet', colorClass: 'badge-amber' },
  'chatgpt.com': { tag: 'GPT-4o', colorClass: 'badge-cyan' },
  'youtube.com': { tag: 'Lofi Focus', colorClass: 'badge-crimson' },
  'perplexity.ai': { tag: 'Deep Research', colorClass: 'badge-blue' },
  'notion.so': { tag: 'Roadmap Q4', colorClass: 'badge-slate' }
};

// -----------------------------------------------
// RENDER GRUP TABS
// -----------------------------------------------
export function renderGroups() {
  const container = document.getElementById('groupTabs');
  if (!container) return;

  const counts = {};
  AppState.groups.forEach(g => counts[g] = 0);
  AppState.elyxoras.forEach(d => {
    if (counts[d.group] !== undefined) counts[d.group]++;
  });

  const mostUsedItems = getMostUsedElyxoras(12);
  counts['mostUsed'] = mostUsedItems.length;

  const getBadgeHtml = (count) =>
    AppState.showGroupItemCount ? `<span class="group-count-badge">${count}</span>` : '';

  // Jika grup yang aktif saat ini memiliki 0 item sedangkan Favorit memiliki item, otomatis jadikan Favorit aktif
  if (counts[AppState.activeGroup] === 0 && (counts['Favorit'] > 0 || AppState.elyxoras.length > 0)) {
    AppState.activeGroup = 'Favorit';
  }

  // Tab pertama dengan bintang amber khas Stitch: Favorit
  const isMostUsedActive = AppState.activeGroup === 'mostUsed' || AppState.activeGroup === 'Favorit';

  const smartTabHtml = `
    <button type="button" class="group-tab smart-tab ${isMostUsedActive ? 'active' : ''}" data-group="mostUsed">
      <span class="tab-star-amber">★</span>
      <span>Favorit</span>
      ${getBadgeHtml(counts['mostUsed'] || counts['Favorit'] || 8)}
    </button>
  `;

  // Filter agar jika grup 'Favorit' sudah ada di smart tab, tidak diduplikasi
  const otherGroups = AppState.groups.filter(g => g !== 'Favorit');

  const groupTabsHtml = otherGroups.map(group => `
    <button type="button" class="group-tab ${AppState.activeGroup === group ? 'active' : ''}" data-group="${escapeHTML(group)}" data-name="${escapeHTML(group)}">
      <span>${escapeHTML(group)}</span>
      ${getBadgeHtml(counts[group])}
    </button>
  `).join('');

  const addGroupHtml = `
    <button type="button" class="group-tab group-manage-btn" id="addGroupBtn" title="${getMessage('addGroupBtnTitle') || 'Tambah Kategori'}">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>
  `;

  container.innerHTML = smartTabHtml + groupTabsHtml + addGroupHtml;

  // Event: klik tab
  container.querySelectorAll('.group-tab:not(.group-manage-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
      AppState.activeGroup = btn.dataset.group;
      AppState.lastActiveGroup = AppState.activeGroup;
      savePartialState({ lastActiveGroup: AppState.lastActiveGroup });
      renderGroups();
      renderElyxoras();
    });
  });

  // Event: klik kanan pada tab untuk edit/hapus
  container.querySelectorAll('.group-tab[data-name]').forEach(btn => {
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showGroupContextMenu(e.pageX, e.pageY, btn.dataset.name);
    });
  });

  // Event: tombol kelola grup
  const addBtn = document.getElementById('addGroupBtn');
  if (addBtn) addBtn.addEventListener('click', () => showGroupManagerModal());

  // Inisialisasi ulang event drag & drop untuk tab grup yang baru dirender
  initGroupDrop();

  // Sync dropdown grup di modal tambah/edit
  updateGroupDropdown();
}

function updateGroupDropdown() {
  const elyxoraGroupSelect = document.getElementById('elyxoraGroup');
  if (!elyxoraGroupSelect) return;
  const currentVal = elyxoraGroupSelect.value;
  elyxoraGroupSelect.innerHTML = AppState.groups.map(g => `<option value="${escapeHTML(g)}">${escapeHTML(g)}</option>`).join('');
  if (AppState.groups.includes(currentVal)) elyxoraGroupSelect.value = currentVal;
  else if (AppState.groups.length > 0) elyxoraGroupSelect.value = AppState.groups[0];
}

// -----------------------------------------------
// STATISTIK KLIK
// -----------------------------------------------
async function trackClick(elyxoraId) {
  const id = parseInt(elyxoraId);
  AppState.clickStats[id] = (AppState.clickStats[id] || 0) + 1;
  await savePartialState({ clickStats: AppState.clickStats });
}

function getMostUsedElyxoras(limit = 12) {
  return [...AppState.elyxoras]
    .sort((a, b) => {
      const ca = AppState.clickStats[a.id] || 0;
      const cb = AppState.clickStats[b.id] || 0;
      if (cb !== ca) return cb - ca;
      return AppState.elyxoras.indexOf(a) - AppState.elyxoras.indexOf(b);
    })
    .slice(0, limit);
}

// -----------------------------------------------
// RENDER ELYXORAS (GRID)
// -----------------------------------------------
let _gridDragController = null;

export function renderElyxoras() {
  const container = document.getElementById('elyxoraGrid');
  if (!container) return;

  // Pastikan jika AppState.elyxoras kosong, isi dengan 8 pintasan bawaan Stitch
  if (!AppState.elyxoras || AppState.elyxoras.length === 0) {
    AppState.elyxoras = [
      { id: 1, title: 'Google', url: 'https://google.com', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 2, title: 'GitHub', url: 'https://github.com/Rizkan25', icon: '', iconMode: 'auto', group: 'Favorit', tag: 'Elyxora-Tap', tagColor: 'purple' },
      { id: 3, title: 'Claude AI', url: 'https://claude.ai', icon: '', iconMode: 'auto', group: 'Favorit', tag: '3.7 Sonnet', tagColor: 'amber' },
      { id: 4, title: 'ChatGPT', url: 'https://chatgpt.com', icon: '', iconMode: 'auto', group: 'Favorit', tag: 'GPT-4o', tagColor: 'cyan' },
      { id: 5, title: 'YouTube', url: 'https://youtube.com', icon: '', iconMode: 'auto', group: 'Favorit', tag: 'Lofi Focus', tagColor: 'crimson' },
      { id: 6, title: 'Perplexity', url: 'https://perplexity.ai', icon: '', iconMode: 'auto', group: 'Favorit', tag: 'Deep Research', tagColor: 'blue' },
      { id: 7, title: 'WhatsApp', url: 'https://web.whatsapp.com', icon: '', iconMode: 'auto', group: 'Favorit' },
      { id: 8, title: 'Notion', url: 'https://notion.so', icon: '', iconMode: 'auto', group: 'Favorit', tag: 'Roadmap Q4', tagColor: 'slate' }
    ];
  }

  let filtered = [];
  const currentGrp = AppState.activeGroup;

  if (currentGrp === 'mostUsed' || currentGrp === 'Favorit') {
    filtered = AppState.elyxoras.filter(d => d.group === 'Favorit');
    if (filtered.length === 0) filtered = getMostUsedElyxoras(12);
    if (filtered.length === 0 && AppState.elyxoras.length > 0) filtered = AppState.elyxoras.slice(0, 12);
  } else {
    filtered = AppState.elyxoras.filter(d => d.group === currentGrp);
  }

  // Jika grup terpilih kosong tapi pengguna baru pertama buka, default ke Favorit
  if (filtered.length === 0 && (currentGrp === 'mostUsed' || currentGrp === 'Favorit' || AppState.elyxoras.length > 0)) {
    if (AppState.elyxoras.length > 0 && currentGrp !== 'mostUsed' && currentGrp !== 'Favorit') {
      // Biarkan pesan kosong jika memang grup kustom kosong
    } else {
      filtered = AppState.elyxoras.slice(0, 12);
    }
  }

  const transClass = `transition-${AppState.groupTransitionEffect || 'fadeUp'}`;
  const target = AppState.openInNewTab ? '_blank' : '_self';

  const speedDialPillCount = document.getElementById('speedDialPillCount');
  if (speedDialPillCount) {
    speedDialPillCount.textContent = (AppState.elyxoras && AppState.elyxoras.length) || 16;
  }

  // Sinkronkan class list-view jika viewMode adalah 'list'
  if (AppState.viewMode === 'list') {
    container.classList.add('list-view');
  } else {
    container.classList.remove('list-view');
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 36px 20px; color: var(--text-dim); text-align: center; gap: 8px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <span style="font-size: 0.88rem; font-weight: 600;">Belum ada pintasan di grup ini</span>
        <span style="font-size: 0.75rem; opacity: 0.7;">Klik tombol di bawah atau tekan [N] untuk menambahkan pintasan</span>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((elyxora, index) => {
    let domain = '';
    try {
      const parsed = new URL(elyxora.url);
      domain = parsed.hostname.replace(/^www\./, '');
    } catch (e) {
      domain = '';
    }

    // Cek apakah ada ikon SVG Stitch bawaan
    const stitchSvg = STITCH_ICONS[domain] || (elyxora.title === 'Google' ? STITCH_ICONS['google.com'] : null);
    let iconContent = '';
    if (stitchSvg && (!elyxora.icon || elyxora.icon.startsWith('data:image/svg+xml') || elyxora.iconMode === 'auto')) {
      iconContent = stitchSvg;
    } else {
      const iconSrc = elyxora.icon || OFFLINE_ICON_SVG;
      iconContent = `<img src="${iconSrc}" alt="${escapeHTML(elyxora.title)}" draggable="false" onerror="this.src='${OFFLINE_ICON_SVG}'">`;
    }

    // Cek Tag Badge atau Status Dot Stitch
    const stitchMeta = STITCH_TAGS[domain] || {};
    const tagText = elyxora.tag || stitchMeta.tag || '';
    const colorClass = elyxora.tagColor ? `badge-${elyxora.tagColor}` : (stitchMeta.colorClass || 'badge-cyan');
    const isOnline = elyxora.isOnline || stitchMeta.isOnline;

    let subtitleHtml = '';
    if (tagText) {
      subtitleHtml = `
        <div class="elyxora-tag-wrap">
          <span class="elyxora-badge-tag ${colorClass}">${escapeHTML(tagText)}</span>
        </div>`;
    } else if (domain) {
      subtitleHtml = `<span class="elyxora-domain">${escapeHTML(domain)}</span>`;
    }

    const hotkeyBadge = index < 8 ? `<kbd class="elyxora-hotkey">${index + 1}</kbd>` : '';

    return `
      <a href="${elyxora.url}" target="${target}" class="elyxora-item ${transClass}"
         data-id="${elyxora.id}"
         data-index="${index}"
         data-hotkey="${index < 8 ? index + 1 : ''}"
         ${AppState.activeGroup !== 'mostUsed' ? 'draggable="true"' : ''}
         style="animation-delay:${index * 0.04}s; --anim-delay:${index * 0.04}s; animation-fill-mode:both;">
        <div class="elyxora-icon">
          ${iconContent}
        </div>
        <div class="elyxora-info">
          <div class="elyxora-title-row">
            <span class="elyxora-title">${escapeHTML(elyxora.title)}</span>
          </div>
          ${subtitleHtml}
        </div>
        ${hotkeyBadge}
      </a>
    `;
  }).join('');

  // Batalkan listener drag lama
  if (_gridDragController) _gridDragController.abort();
  _gridDragController = new AbortController();
  const { signal } = _gridDragController;

  let draggedItem = null;

  // Klik — catat statistik
  container.addEventListener('click', (e) => {
    const item = e.target.closest('.elyxora-item');
    if (item) trackClick(item.dataset.id);
  }, { signal });

  // Klik kanan — context menu
  container.addEventListener('contextmenu', (e) => {
    const item = e.target.closest('.elyxora-item');
    if (item) {
      e.preventDefault();
      showContextMenu(e.pageX, e.pageY, item.dataset.id);
    }
  }, { signal });

  // Drag & Drop (hanya untuk grup biasa)
  if (AppState.activeGroup !== 'mostUsed') {
    container.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.elyxora-item');
      if (!item) return;
      draggedItem = item;
      e.dataTransfer.setData('text/plain', item.dataset.id);
      setTimeout(() => item.classList.add('dragging-placeholder'), 0);
    }, { signal });

    container.addEventListener('dragend', () => {
      if (draggedItem) { draggedItem.classList.remove('dragging-placeholder'); draggedItem = null; }
    }, { signal });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const targetItem = e.target.closest('.elyxora-item');
      if (!targetItem || targetItem === draggedItem || !draggedItem) return;
      const rect = targetItem.getBoundingClientRect();
      container.insertBefore(draggedItem, e.clientX < rect.left + rect.width / 2 ? targetItem : targetItem.nextSibling);
    }, { signal });

    container.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (!draggedItem) return;
      draggedItem.classList.remove('dragging-placeholder');
      const ids = [...container.querySelectorAll('.elyxora-item')].map(el => parseInt(el.dataset.id));
      const inGroup = AppState.elyxoras.filter(d => ids.includes(d.id));
      inGroup.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      AppState.elyxoras = [...AppState.elyxoras.filter(d => !ids.includes(d.id)), ...inGroup];
      await savePartialState({ elyxoras: AppState.elyxoras });
      renderElyxoras();
    }, { signal });
  }
}

// -----------------------------------------------
// DRAG & DROP ANTAR GRUP (TABS)
// -----------------------------------------------
let _groupDropController = null;

export function initGroupDrop() {
  if (_groupDropController) _groupDropController.abort();
  _groupDropController = new AbortController();
  const { signal } = _groupDropController;

  document.querySelectorAll('.group-tab').forEach(tab => {
    tab.addEventListener('dragover', (e) => { e.preventDefault(); tab.classList.add('drag-over'); }, { signal });
    tab.addEventListener('dragleave', () => tab.classList.remove('drag-over'), { signal });
    tab.addEventListener('drop', async (e) => {
      e.preventDefault();
      tab.classList.remove('drag-over');
      const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
      const targetGroup = tab.dataset.group;
      if (!targetGroup || targetGroup === 'mostUsed') return;
      const idx = AppState.elyxoras.findIndex(d => d.id === draggedId);
      if (idx !== -1) {
        AppState.elyxoras[idx].group = targetGroup;
        await savePartialState({ elyxoras: AppState.elyxoras });
        renderGroups();
        renderElyxoras();
      }
    }, { signal });
  });
}

// -----------------------------------------------
// FAB (Floating Action Button)
// -----------------------------------------------
export function initFAB() {
  const fabAddBtn = document.getElementById('fabAddBtn');
  if (fabAddBtn) {
    fabAddBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('openElyxoraModal', { detail: { id: null } }));
    });
  }
}

// -----------------------------------------------
// CONTEXT MENUS
// -----------------------------------------------
function closeAllMenus() {
  ['customContextMenu', 'groupContextMenu'].forEach(id => {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
  });
}

export function showContextMenu(x, y, id) {
  closeAllMenus();

  let menu = document.getElementById('customContextMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'customContextMenu';
    menu.className = 'glass-card custom-menu';
    menu.style.cssText = 'position:fixed;z-index:10000;';
    document.body.appendChild(menu);
  }

  if (id) {
    const elyxora = AppState.elyxoras.find(d => d.id == id);
    const availableGroups = AppState.groups.filter(g => elyxora && g !== elyxora.group);
    const moveGroupHtml = availableGroups.length > 0 ? `
      <div style="padding:6px 12px 2px;font-size:0.75rem;color:#888;text-transform:uppercase;margin-top:5px;">Pindah Grup</div>
      ${availableGroups.map(g => `
        <div class="menu-item move-to-group" data-group="${escapeHTML(g)}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          ${escapeHTML(g)}
        </div>
      `).join('')}
      <div style="height:1px;background:var(--glass-border);margin:5px 0;"></div>
    ` : '';

    menu.innerHTML = `
      <div class="menu-item" id="menuOpen">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Buka
      </div>
      <div class="menu-item" id="menuOpenNewTab">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
        Buka di Tab Baru
      </div>
      <div class="menu-item" id="menuCopyLink">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        Salin Tautan
      </div>
      <div style="height:1px;background:var(--glass-border);margin:5px 0;"></div>
      <div class="menu-item" id="menuEdit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Pintasan
      </div>
      ${moveGroupHtml}
      <div class="menu-item" id="menuDelete" style="color:#ff4d4d;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        Hapus
      </div>
    `;

    document.getElementById('menuOpen').onclick = () => {
      if (elyxora) window.location.href = elyxora.url;
      menu.style.display = 'none';
    };
    document.getElementById('menuOpenNewTab').onclick = () => {
      if (elyxora) window.open(elyxora.url, '_blank');
      menu.style.display = 'none';
    };
    document.getElementById('menuCopyLink').onclick = async () => {
      if (elyxora) {
        try { await navigator.clipboard.writeText(elyxora.url); } catch (e) {}
      }
      menu.style.display = 'none';
    };
    document.getElementById('menuEdit').onclick = () => {
      document.dispatchEvent(new CustomEvent('openElyxoraModal', { detail: { id: id } }));
      menu.style.display = 'none';
    };
    document.getElementById('menuDelete').onclick = async () => {
      if (AppState.confirmDelete) {
        const name = elyxora ? elyxora.title : 'pintasan ini';
        if (!confirm(`Hapus pintasan "${name}"?`)) return;
      }
      AppState.elyxoras = AppState.elyxoras.filter(d => d.id != id);
      await savePartialState({ elyxoras: AppState.elyxoras });
      renderGroups();
      renderElyxoras();
      menu.style.display = 'none';
    };

    menu.querySelectorAll('.move-to-group').forEach(btn => {
      btn.onclick = async () => {
        const targetGroup = btn.dataset.group;
        const idx = AppState.elyxoras.findIndex(d => d.id == id);
        if (idx !== -1) {
          AppState.elyxoras[idx].group = targetGroup;
          await savePartialState({ elyxoras: AppState.elyxoras });
          renderGroups();
          renderElyxoras();
        }
        menu.style.display = 'none';
      };
    });
  } else {
    // Menu kosong (klik kanan di area kosong)
    menu.innerHTML = `
      <div class="menu-item" id="menuAdd">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Tambah Pintasan
      </div>
      <div class="menu-item" id="menuBg">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9l4-4 4 4 4-4 4 4"/><path d="M3 15l4 4 4-4 4 4 4-4"/></svg>
        Ganti Wallpaper
      </div>
      <div class="menu-item" id="menuSettings">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Pengaturan
      </div>
    `;
    document.getElementById('menuAdd').onclick = () => {
      document.dispatchEvent(new CustomEvent('openElyxoraModal', { detail: { id: null } }));
      menu.style.display = 'none';
    };
    document.getElementById('menuBg').onclick = () => {
      const wm = document.getElementById('wallpaperModal');
      if (wm) wm.style.display = 'flex';
      menu.style.display = 'none';
    };
    document.getElementById('menuSettings').onclick = () => {
      const sm = document.getElementById('settingsModal');
      if (sm) {
        // Trigger tombol settings agar snapshot diambil dengan benar
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) settingsBtn.click();
        else sm.style.display = 'flex';
      }
      menu.style.display = 'none';
    };
  }

  menu.style.display = 'block';
  menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';

  setTimeout(() => document.addEventListener('click', closeAllMenus, { once: true }), 10);
}

function showGroupContextMenu(x, y, groupName) {
  closeAllMenus();
  let menu = document.getElementById('groupContextMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'groupContextMenu';
    menu.className = 'glass-card custom-menu';
    menu.style.cssText = 'position:fixed;z-index:10001;min-width:160px;';
    document.body.appendChild(menu);
  }

  menu.innerHTML = `
    <div class="menu-label" style="padding:8px 12px;font-size:0.75rem;opacity:0.5;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${escapeHTML(groupName)}</div>
    <div class="menu-item" id="gcMenuRename">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Ganti Nama
    </div>
    <div class="menu-item" id="gcMenuMove">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><polyline points="8 7 3 12 8 17"/><polyline points="16 7 21 12 16 17"/></svg>
      Atur Urutan
    </div>
    <div class="menu-item" id="gcMenuDelete" style="color:#ff4d4d;">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      Hapus Group
    </div>
  `;

  menu.style.display = 'block';
  menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - 180) + 'px';

  document.getElementById('gcMenuRename').onclick = () => {
    menu.style.display = 'none';
    const newName = prompt(`Ganti nama group "${groupName}" menjadi:`, groupName);
    if (newName && newName.trim() && newName.trim() !== groupName) {
      const trimmed = newName.trim();
      AppState.elyxoras.forEach(d => { if (d.group === groupName) d.group = trimmed; });
      const idx = AppState.groups.indexOf(groupName);
      if (idx !== -1) AppState.groups[idx] = trimmed;
      if (AppState.activeGroup === groupName) AppState.activeGroup = trimmed;
      savePartialState({ elyxoras: AppState.elyxoras, groups: AppState.groups });
      renderGroups();
      renderElyxoras();
    }
  };
  document.getElementById('gcMenuMove').onclick = () => { menu.style.display = 'none'; showGroupManagerModal(); };
  document.getElementById('gcMenuDelete').onclick = async () => {
    menu.style.display = 'none';
    const count = AppState.elyxoras.filter(d => d.group === groupName).length;
    const msg = count > 0
      ? `Group "${groupName}" memiliki ${count} pintasan. Pintasan akan dipindah ke group pertama lainnya. Hapus?`
      : `Hapus group "${groupName}"?`;
    if (!confirm(msg)) return;
    const remaining = AppState.groups.filter(g => g !== groupName);
    const fallback = remaining[0] || null;
    AppState.elyxoras.forEach(d => { if (d.group === groupName && fallback) d.group = fallback; });
    AppState.groups = remaining;
    if (AppState.activeGroup === groupName) AppState.activeGroup = 'mostUsed';
    await savePartialState({ elyxoras: AppState.elyxoras, groups: AppState.groups });
    renderGroups();
    renderElyxoras();
  };

  setTimeout(() => document.addEventListener('click', closeAllMenus, { once: true }), 10);
}

// -----------------------------------------------
// MODAL KELOLA GROUP
// -----------------------------------------------
export function showGroupManagerModal() {
  const old = document.getElementById('groupManagerModal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'groupManagerModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;';

  modal.innerHTML = `
    <div style="background:var(--modal-bg);border:1px solid var(--modal-border);border-radius:24px;width:90%;max-width:420px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
      <div style="padding:20px 24px;border-bottom:1px solid var(--modal-border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;background:var(--accent-color);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
          <h3 style="margin:0;font-size:1.1rem;font-weight:700;">Kelola Group</h3>
        </div>
        <button id="closeGMModal" style="background:var(--glass-bg);border:none;color:var(--text-dim);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.1rem;">✕</button>
      </div>
      <div style="padding:16px 24px;border-bottom:1px solid var(--modal-border);flex:1;overflow:hidden;display:flex;flex-direction:column;">
        <p style="font-size:0.8rem;color:var(--text-dim);margin:0 0 12px;">Drag untuk mengubah urutan.</p>
        <div id="groupManagerList" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding-right:4px;"></div>
      </div>
      <div style="padding:16px 24px;flex-shrink:0;">
        <label style="font-size:0.85rem;font-weight:600;color:var(--text-dim);display:block;margin-bottom:8px;">Tambah Group Baru</label>
        <div style="display:flex;gap:8px;">
          <input id="newGroupNameInput" type="text" placeholder="Nama group..." style="flex:1;padding:10px 14px;border-radius:12px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-color);font-size:0.9rem;outline:none;">
          <button id="addGroupConfirmBtn" style="padding:10px 16px;border-radius:12px;background:var(--accent-color);border:none;color:white;font-weight:700;cursor:pointer;white-space:nowrap;">Tambah</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  function renderGroupList() {
    const list = document.getElementById('groupManagerList');
    if (!list) return;
    list.innerHTML = AppState.groups.map((g, i) => {
      const count = AppState.elyxoras.filter(d => d.group === g).length;
      return `
        <div class="gm-item" draggable="true" data-group="${escapeHTML(g)}" data-index="${i}"
          style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:var(--glass-bg);border:1px solid var(--glass-border);cursor:grab;user-select:none;">
          <span style="font-size:1rem;opacity:0.4;cursor:grab;">⠿</span>
          <span style="flex:1;font-weight:600;" title="${escapeHTML(g)}">${escapeHTML(g)}</span>
          <span style="font-size:0.75rem;opacity:0.5;background:var(--input-bg);padding:2px 8px;border-radius:20px;">${count} tab</span>
          <button class="gm-rename-btn" data-group="${escapeHTML(g)}" title="Ganti Nama" style="background:none;border:none;cursor:pointer;opacity:0.6;padding:4px;color:var(--text-color);display:flex;align-items:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="gm-delete-btn" data-group="${escapeHTML(g)}" title="Hapus" style="background:none;border:none;cursor:pointer;opacity:0.7;padding:4px;color:#ff4d4d;display:flex;align-items:center;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
        </div>
      `;
    }).join('');

    let dragIndex = null;
    list.querySelectorAll('.gm-item').forEach(item => {
      item.addEventListener('dragstart', () => { dragIndex = parseInt(item.dataset.index); setTimeout(() => item.style.opacity = '0.4', 0); });
      item.addEventListener('dragend', () => { item.style.opacity = '1'; });
      item.addEventListener('dragover', (e) => e.preventDefault());
      item.addEventListener('drop', async () => {
        const dropIndex = parseInt(item.dataset.index);
        if (dragIndex === null || dragIndex === dropIndex) return;
        const [moved] = AppState.groups.splice(dragIndex, 1);
        AppState.groups.splice(dropIndex, 0, moved);
        await savePartialState({ groups: AppState.groups });
        renderGroupList();
        renderGroups();
      });
      item.querySelector('.gm-rename-btn').addEventListener('click', () => {
        const gName = item.dataset.group;
        const newName = prompt(`Ganti nama "${gName}" menjadi:`, gName);
        if (newName && newName.trim() && newName.trim() !== gName) {
          const trimmed = newName.trim();
          
          // Check for duplicate group name
          if (AppState.groups.some(g => g.toLowerCase() === trimmed.toLowerCase())) {
            alert('Nama group sudah ada!');
            return;
          }

          AppState.elyxoras.forEach(d => { if (d.group === gName) d.group = trimmed; });
          const idx = AppState.groups.indexOf(gName);
          if (idx !== -1) AppState.groups[idx] = trimmed;
          if (AppState.activeGroup === gName) AppState.activeGroup = trimmed;
          savePartialState({ elyxoras: AppState.elyxoras, groups: AppState.groups });
          renderGroupList(); renderGroups(); renderElyxoras();
        }
      });
      item.querySelector('.gm-delete-btn').addEventListener('click', async () => {
        const gName = item.dataset.group;
        const count = AppState.elyxoras.filter(d => d.group === gName).length;
        const msg = count > 0 ? `Group "${gName}" punya ${count} pintasan. Pintasan dipindah ke group lain.` : `Hapus group "${gName}"?`;
        if (!confirm(msg)) return;
        const remaining = AppState.groups.filter(g => g !== gName);
        const fallback = remaining[0] || null;
        AppState.elyxoras.forEach(d => { if (d.group === gName && fallback) d.group = fallback; });
        AppState.groups = remaining;
        if (AppState.activeGroup === gName) AppState.activeGroup = 'mostUsed';
        await savePartialState({ elyxoras: AppState.elyxoras, groups: AppState.groups });
        renderGroupList(); renderGroups(); renderElyxoras();
      });
    });
  }

  renderGroupList();

  document.getElementById('addGroupConfirmBtn').addEventListener('click', async () => {
    const input = document.getElementById('newGroupNameInput');
    const name = input.value.trim();
    if (!name) return;
    if (AppState.groups.includes(name)) { alert('Nama group sudah ada!'); return; }
    AppState.groups.push(name);
    await savePartialState({ groups: AppState.groups });
    input.value = '';
    renderGroupList();
    renderGroups();
  });

  document.getElementById('newGroupNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addGroupConfirmBtn').click();
  });

  document.getElementById('closeGMModal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// -----------------------------------------------
// UPGRADE IKON KE BASE64
// -----------------------------------------------
export async function upgradeIconsToBase64() {
  if (!navigator.onLine) return;
  let hasChanges = false;

  for (let i = 0; i < AppState.elyxoras.length; i++) {
    const elyxora = AppState.elyxoras[i];
    if (elyxora.icon && !elyxora.icon.startsWith('data:')) {
      try {
        const b64 = await fetchIconAsBase64(elyxora.icon);
        if (b64) { AppState.elyxoras[i].icon = b64; hasChanges = true; }
      } catch (e) {}
    }
    if (!elyxora.icon && elyxora.iconMode === 'auto' && elyxora.url) {
      try {
        const domain = new URL(elyxora.url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        const b64 = await fetchIconAsBase64(faviconUrl);
        if (b64) { AppState.elyxoras[i].icon = b64; hasChanges = true; }
      } catch (e) {}
    }
  }

  if (hasChanges) {
    await savePartialState({ elyxoras: AppState.elyxoras });
    renderElyxoras();
  }
}

// -----------------------------------------------
// GLOBAL CONTEXT MENU (area kosong)
// -----------------------------------------------
document.addEventListener('contextmenu', (e) => {
  if (
    !e.target.closest('.elyxora-item') &&
    !e.target.closest('.modal-content') &&
    !e.target.closest('.glass-card') &&
    !e.target.closest('#searchForm') &&
    !e.target.closest('.group-tab') &&
    !e.target.closest('[id$="Modal"]')
  ) {
    e.preventDefault();
    showContextMenu(e.pageX, e.pageY, null);
  }
});
