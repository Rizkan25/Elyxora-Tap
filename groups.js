// =============================================
// ELYXORA TAB — MODUL GROUPS (groups.js)
// Elyxoras, groups, context menus, group manager
// =============================================

async function loadElyxoras() {
  const result = await chrome.storage.local.get(['elyxoras', 'groups', 'clickStats', 'defaultGroupBehavior', 'lastActiveGroup', 'showGroupItemCount', 'openInNewTab']);
  
  elyxoras = result.elyxoras || [
    { id: 1, title: 'Google', url: 'https://google.com', icon: '', iconMode: 'auto', group: 'Default' },
    { id: 3, title: 'YouTube', url: 'https://youtube.com', icon: '', iconMode: 'auto', group: 'Default' }
  ];
  groups = result.groups || ['Default'];
  clickStats = result.clickStats || {};
  if (result.showGroupItemCount !== undefined) showGroupItemCount = result.showGroupItemCount;
  if (result.openInNewTab !== undefined) openInNewTab = result.openInNewTab;

  // Resolve activeGroup sinkron sebelum render (mencegah race condition dengan newtab.js)
  const behavior = result.defaultGroupBehavior || 'lastUsed';
  if (behavior === 'lastUsed') {
    activeGroup = result.lastActiveGroup || 'mostUsed';
  } else {
    activeGroup = 'mostUsed';
  }

  renderGroups();
  renderElyxoras();
  initGroupDrop();
  // Upgrade ikon lama (URL eksternal) ke Base64 saat online
  upgradeIconsToBase64();
}

// Catat klik pada pintasan untuk algoritma 'Teratas'
async function trackClick(elyxoraId) {
  clickStats[elyxoraId] = (clickStats[elyxoraId] || 0) + 1;
  await chrome.storage.local.set({ clickStats });
}

// Hitung pintasan 'Teratas' berdasarkan statistik klik
function getMostUsedElyxoras(limit = 12) {
  const sorted = [...elyxoras].sort((a, b) => {
    const clickA = clickStats[a.id] || 0;
    const clickB = clickStats[b.id] || 0;
    if (clickB !== clickA) return clickB - clickA;
    return elyxoras.indexOf(a) - elyxoras.indexOf(b);
  });
  return sorted.slice(0, limit);
}

// Render group tabs dengan Smart Tabs
function renderGroups() {
  const container = document.getElementById('groupTabs');
  
  // Hitung jumlah pintasan di setiap grup
  const counts = {};
  groups.forEach(g => counts[g] = 0);
  elyxoras.forEach(d => {
    if (counts[d.group] !== undefined) counts[d.group]++;
  });
  counts['mostUsed'] = getMostUsedElyxoras(12).length;

  const getBadgeHtml = (count) => {
    return showGroupItemCount ? `<span class="group-count-badge">${count}</span>` : '';
  };
  
  const smartTabHtml = `
    <button type="button" class="group-tab smart-tab ${activeGroup === 'mostUsed' ? 'active' : ''}" data-group="mostUsed">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
      Teratas ${getBadgeHtml(counts['mostUsed'])}
    </button>
  `;

  const groupTabsHtml = groups.map(group => `
    <button type="button" class="group-tab ${activeGroup === group ? 'active' : ''}" data-group="${group}" data-name="${group}">
      ${group} ${getBadgeHtml(counts[group])}
    </button>
  `).join('');

  const addGroupHtml = `
    <button type="button" class="group-tab group-manage-btn" id="addGroupBtn" title="Kelola Group">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  `;

  container.innerHTML = smartTabHtml + groupTabsHtml + addGroupHtml;

  // Listener klik tab
  container.querySelectorAll('.group-tab:not(.group-manage-btn)').forEach(btn => {
    btn.addEventListener('click', () => {
      activeGroup = btn.dataset.group;
      lastActiveGroup = activeGroup;
      chrome.storage.local.set({ lastActiveGroup });
      renderGroups();
      renderElyxoras();
    });
  });

  // Klik kanan pada tab grup untuk edit/hapus
  container.querySelectorAll('.group-tab[data-name]').forEach(btn => {
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showGroupContextMenu(e.pageX, e.pageY, btn.dataset.name);
    });
  });

  // Tombol kelola group
  const addBtn = document.getElementById('addGroupBtn');
  if (addBtn) addBtn.addEventListener('click', () => showGroupManagerModal());

  // Isi dropdown group di modal Add/Edit secara dinamis
  const elyxoraGroupSelect = document.getElementById('elyxoraGroup');
  if (elyxoraGroupSelect) {
    const currentVal = elyxoraGroupSelect.value;
    elyxoraGroupSelect.innerHTML = groups.map(g => `<option value="${g}">${g}</option>`).join('');
    if (groups.includes(currentVal)) elyxoraGroupSelect.value = currentVal;
    else if (groups.length > 0) elyxoraGroupSelect.value = groups[0];
  }
}

// AbortController untuk drag listener container — dibersihkan tiap render
let _gridDragController = null;

// Render elyxora grid
function renderElyxoras() {
  const container = document.getElementById('elyxoraGrid');
  let filtered;

  if (activeGroup === 'mostUsed') {
    filtered = getMostUsedElyxoras(12);
  } else {
    filtered = elyxoras.filter(d => d.group === activeGroup);
  }

  const transClass = `transition-${typeof groupTransitionEffect !== 'undefined' ? groupTransitionEffect : 'fadeUp'}`;
  const target = (typeof openInNewTab !== 'undefined' && openInNewTab) ? '_blank' : '_self';

  // Set innerHTML sekali — lebih cepat dari append satu-satu
  container.innerHTML = filtered.map((elyxora, index) => {
    const iconSrc = elyxora.icon || OFFLINE_ICON_SVG;
    return `
      <a href="${elyxora.url}" target="${target}" class="elyxora-item ${transClass}"
         data-id="${elyxora.id}"
         ${activeGroup !== 'mostUsed' ? 'draggable="true"' : ''}
         style="animation-delay: ${index * 0.04}s; --anim-delay: ${index * 0.04}s; animation-fill-mode: both;">
        <div class="elyxora-icon">
          <img src="${iconSrc}" alt="${elyxora.title}" draggable="false"
               onerror="this.src='${OFFLINE_ICON_SVG}'">
        </div>
        <div class="elyxora-title">${elyxora.title}</div>
      </a>
    `;
  }).join('');

  // --- EVENT DELEGATION: 1 listener di container untuk semua item ---
  // Lebih ringan & tidak menumpuk dibanding listener per-item

  // Batalkan listener drag lama sebelum attach baru
  if (_gridDragController) _gridDragController.abort();
  _gridDragController = new AbortController();
  const { signal } = _gridDragController;

  let draggedItem = null;

  // Click: catat statistik (klik link <a> tetap berfungsi normal)
  container.addEventListener('click', (e) => {
    const item = e.target.closest('.elyxora-item');
    if (item) trackClick(item.dataset.id);
  }, { signal });

  // Klik Kanan: menu konteks
  container.addEventListener('contextmenu', (e) => {
    const item = e.target.closest('.elyxora-item');
    if (item) {
      e.preventDefault();
      showContextMenu(e.pageX, e.pageY, item.dataset.id);
    }
  }, { signal });

  // Drag & Drop hanya untuk grup biasa (bukan 'mostUsed')
  if (activeGroup !== 'mostUsed') {
    container.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.elyxora-item');
      if (!item) return;
      draggedItem = item;
      e.dataTransfer.setData('text/plain', item.dataset.id);
      setTimeout(() => item.classList.add('dragging-placeholder'), 0);
    }, { signal });

    container.addEventListener('dragend', () => {
      if (draggedItem) {
        draggedItem.classList.remove('dragging-placeholder');
        draggedItem = null;
      }
    }, { signal });

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      const targetItem = e.target.closest('.elyxora-item');
      if (!targetItem || targetItem === draggedItem || !draggedItem) return;
      const rect = targetItem.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      container.insertBefore(draggedItem, e.clientX < mid ? targetItem : targetItem.nextSibling);
    }, { signal });

    container.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (!draggedItem) return;
      draggedItem.classList.remove('dragging-placeholder');

      const ids = Array.from(container.querySelectorAll('.elyxora-item')).map(el => parseInt(el.dataset.id));
      let inGroup = elyxoras.filter(d => ids.includes(d.id));
      inGroup.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
      elyxoras = [...elyxoras.filter(d => !ids.includes(d.id)), ...inGroup];

      await chrome.storage.local.set({ elyxoras });
      renderElyxoras();
    }, { signal });
  }

  // Grid selesai di-render
}


// AbortController untuk drop listener pada group tabs — dibersihkan tiap render
let _groupDropController = null;

// Tambahkan Drop ke Tab Grup
function initGroupDrop() {
  // Batalkan listener lama agar tidak menumpuk
  if (_groupDropController) _groupDropController.abort();
  _groupDropController = new AbortController();
  const { signal } = _groupDropController;

  document.querySelectorAll('.group-tab').forEach(tab => {
    tab.addEventListener('dragover', (e) => {
      e.preventDefault();
      tab.classList.add('drag-over');
    }, { signal });
    tab.addEventListener('dragleave', () => tab.classList.remove('drag-over'), { signal });
    tab.addEventListener('drop', async (e) => {
      e.preventDefault();
      tab.classList.remove('drag-over');
      const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
      const targetGroup = tab.dataset.group;

      const idx = elyxoras.findIndex(d => d.id === draggedId);
      if (idx !== -1) {
        elyxoras[idx].group = targetGroup;
        await chrome.storage.local.set({ elyxoras });
        renderGroups();
        renderElyxoras();
      }
    }, { signal });
  });
}

// ---- Pusat Kendali Menu Klik Kanan ----
function closeAllMenus() {
  const menuIds = ['customContextMenu', 'groupContextMenu'];
  menuIds.forEach(id => {
    const m = document.getElementById(id);
    if (m) m.style.display = 'none';
  });
}

function showContextMenu(x, y, id) {
  closeAllMenus();
  let menu = document.getElementById('customContextMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'customContextMenu';
    menu.className = 'glass-card custom-menu';
    menu.style.position = 'fixed';
    menu.style.zIndex = '10000';
    document.body.appendChild(menu);
  }

  if (id) {
    const availableGroups = groups.filter(g => g !== 'mostUsed' && g !== 'Smart');
    const groupMenuHtml = availableGroups.length > 0 ? `
      <div style="padding: 6px 12px 2px; font-size: 0.75rem; color: #888; text-transform: uppercase; margin-top: 5px;">Pindah Group</div>
      ${availableGroups.map(g => `
        <div class="menu-item move-to-group" data-group="${g}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          ${g}
        </div>
      `).join('')}
      <div style="height: 1px; background: var(--glass-border); margin: 5px 0;"></div>
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
      <div style="height: 1px; background: var(--glass-border); margin: 5px 0;"></div>
      <div class="menu-item" id="menuEdit">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Pintasan
      </div>
      ${groupMenuHtml}
      <div class="menu-item" id="menuDelete" style="color: #ff4d4d;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        Hapus
      </div>
    `;
  } else {
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
  }

  menu.style.display = 'block';
  menu.style.left = Math.min(x, window.innerWidth - 180) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - 150) + 'px';

  if (id) {
    document.getElementById('menuOpen').onclick = () => {
      const elyxora = elyxoras.find(d => d.id == id);
      if (elyxora) window.location.href = elyxora.url;
      menu.style.display = 'none';
    };

    document.getElementById('menuOpenNewTab').onclick = () => {
      const elyxora = elyxoras.find(d => d.id == id);
      if (elyxora) window.open(elyxora.url, '_blank');
      menu.style.display = 'none';
    };

    document.getElementById('menuCopyLink').onclick = async () => {
      const elyxora = elyxoras.find(d => d.id == id);
      if (elyxora) {
        try {
          await navigator.clipboard.writeText(elyxora.url);
          // Optional: bisa tambahkan notifikasi kecil di sini jika mau
        } catch (err) {
          console.error("Gagal menyalin tautan:", err);
        }
      }
      menu.style.display = 'none';
    };

    document.getElementById('menuEdit').onclick = () => {
      const elyxora = elyxoras.find(d => d.id == id);
      if (elyxora) {
        document.getElementById('elyxoraUrl').value = elyxora.url;
        document.getElementById('elyxoraTitle').value = elyxora.title;
        document.getElementById('elyxoraGroup').value = elyxora.group;
        editingId = elyxora.id;
        
        document.getElementById('elyxoraModalTitle').textContent = 'Edit Pintasan';
        document.getElementById('saveElyxoraBtn').textContent = 'Simpan Perubahan';
        
        if (elyxora.iconMode) {
          const radio = document.querySelector(`input[name="iconMode"][value="${elyxora.iconMode}"]`);
          if (radio) radio.checked = true;
          
          if (elyxora.iconMode === 'url') {
            elyxoraIconInput.value = elyxora.iconData || '';
          } else if (elyxora.iconMode === 'file') {
            uploadedBase64 = elyxora.iconData || '';
          }
        }
        
        updateMode();
        document.getElementById('elyxoraModal').style.display = 'flex';
      }
      menu.style.display = 'none';
    };

    document.getElementById('menuDelete').onclick = async () => {
      if (typeof confirmDelete !== 'undefined' && confirmDelete) {
        const elyxora = elyxoras.find(d => d.id == id);
        if (!confirm(`Hapus pintasan "${elyxora ? elyxora.title : 'ini'}"?`)) return;
      }
      elyxoras = elyxoras.filter(d => d.id != id);
      await chrome.storage.local.set({ elyxoras });
      renderGroups();
      renderElyxoras();
      menu.style.display = 'none';
    };

    document.querySelectorAll('.move-to-group').forEach(btn => {
      btn.onclick = async () => {
        const targetGroup = btn.dataset.group;
        const idx = elyxoras.findIndex(d => d.id == id);
        if (idx !== -1) {
          elyxoras[idx].group = targetGroup;
          await chrome.storage.local.set({ elyxoras });
          renderGroups();
          renderElyxoras();
        }
        menu.style.display = 'none';
      };
    });
  } else {
    document.getElementById('menuAdd').onclick = () => {
      editingId = null;
      if (typeof resetModal === 'function') resetModal();
      document.getElementById('elyxoraModalTitle').textContent = 'Tambah di Elyxora Tab';
      document.getElementById('saveElyxoraBtn').textContent = 'Add Elyxora';
      document.getElementById('elyxoraModal').style.display = 'flex';
      menu.style.display = 'none';
    };
    document.getElementById('menuBg').onclick = () => {
      document.getElementById('wallpaperModal').style.display = 'flex';
      menu.style.display = 'none';
    };
    document.getElementById('menuSettings').onclick = () => {
      document.getElementById('settingsModal').style.display = 'flex';
      menu.style.display = 'none';
    };
  }

  setTimeout(() => {
    document.addEventListener('click', closeAllMenus, { once: true });
  }, 10);
}

// Context Menu khusus untuk Group Tab
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
    <div class="menu-label" style="padding:8px 12px;font-size:0.75rem;opacity:0.5;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${groupName}</div>
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
  menu.style.left = Math.min(x, window.innerWidth - 190) + 'px';
  menu.style.top = Math.min(y, window.innerHeight - 160) + 'px';

  document.getElementById('gcMenuRename').onclick = () => {
    menu.style.display = 'none';
    const newName = prompt(`Ganti nama group "${groupName}" menjadi:`, groupName);
    if (newName && newName.trim() && newName.trim() !== groupName) {
      const trimmed = newName.trim();
      elyxoras.forEach(d => { if (d.group === groupName) d.group = trimmed; });
      const idx = groups.indexOf(groupName);
      if (idx !== -1) groups[idx] = trimmed;
      if (activeGroup === groupName) activeGroup = trimmed;
      chrome.storage.local.set({ elyxoras, groups });
      renderGroups();
      renderElyxoras();
    }
  };

  document.getElementById('gcMenuMove').onclick = () => {
    menu.style.display = 'none';
    showGroupManagerModal();
  };

  document.getElementById('gcMenuDelete').onclick = async () => {
    menu.style.display = 'none';
    const count = elyxoras.filter(d => d.group === groupName).length;
    const confirmMsg = count > 0
      ? `Group "${groupName}" memiliki ${count} pintasan. Pintasan akan dipindah ke group pertama lainnya. Hapus group?`
      : `Hapus group "${groupName}"?`;
    if (!confirm(confirmMsg)) return;

    const remaining = groups.filter(g => g !== groupName);
    const fallback = remaining[0] || null;
    elyxoras.forEach(d => { if (d.group === groupName) d.group = fallback || d.group; });
    groups = remaining;
    if (activeGroup === groupName) activeGroup = 'mostUsed';

    await chrome.storage.local.set({ elyxoras, groups });
    renderGroups();
    renderElyxoras();
  };

  setTimeout(() => {
    document.addEventListener('click', closeAllMenus, { once: true });
  }, 10);
}

// Modal Pengelola Group
function showGroupManagerModal() {
  const old = document.getElementById('groupManagerModal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'groupManagerModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:2000;display:flex;align-items:center;justify-content:center;';

  modal.innerHTML = `
    <div style="background:var(--modal-bg);border:1px solid var(--modal-border);border-radius:24px;width:90%;max-width:420px;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
      <div style="padding:20px 24px;border-bottom:1px solid var(--modal-border);display:flex;justify-content:space-between;align-items:center;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:32px;height:32px;background:var(--accent-color);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <h3 style="margin:0;font-size:1.1rem;font-weight:700;">Kelola Group</h3>
        </div>
        <button id="closeGMModal" style="background:var(--glass-bg);border:none;color:var(--text-dim);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1.1rem;">✕</button>
      </div>

      <div style="padding:16px 24px;border-bottom:1px solid var(--modal-border);flex-shrink:0;">
        <p style="font-size:0.8rem;color:var(--text-dim);margin-bottom:12px;">Drag untuk mengubah urutan. Klik ikon untuk edit atau hapus.</p>
        <div id="groupManagerList" style="display:flex;flex-direction:column;gap:8px;max-height:280px;overflow-y:auto;padding-right:4px;"></div>
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
    list.innerHTML = groups.map((g, i) => {
      const count = elyxoras.filter(d => d.group === g).length;
      return `
        <div class="gm-item" draggable="true" data-group="${g}" data-index="${i}"
          style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:var(--glass-bg);border:1px solid var(--glass-border);cursor:grab;user-select:none;">
          <span style="font-size:1rem;opacity:0.4;cursor:grab;">⠿</span>
          <span style="flex:1;font-weight:600;">${g}</span>
          <span style="font-size:0.75rem;opacity:0.5;background:var(--input-bg);padding:2px 8px;border-radius:20px;">${count} tab</span>
          <button class="gm-rename-btn" data-group="${g}" title="Ganti Nama" style="background:none;border:none;cursor:pointer;opacity:0.6;padding:4px;color:var(--text-color);display:flex;align-items:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="gm-delete-btn" data-group="${g}" title="Hapus" style="background:none;border:none;cursor:pointer;opacity:0.7;padding:4px;color:#ff4d4d;display:flex;align-items:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      `;
    }).join('');

    let dragIndex = null;
    list.querySelectorAll('.gm-item').forEach(item => {
      item.addEventListener('dragstart', () => {
        dragIndex = parseInt(item.dataset.index);
        setTimeout(() => item.style.opacity = '0.4', 0);
      });
      item.addEventListener('dragend', () => { item.style.opacity = '1'; });
      item.addEventListener('dragover', (e) => { e.preventDefault(); });
      item.addEventListener('drop', async () => {
        const dropIndex = parseInt(item.dataset.index);
        if (dragIndex === null || dragIndex === dropIndex) return;
        const [moved] = groups.splice(dragIndex, 1);
        groups.splice(dropIndex, 0, moved);
        await chrome.storage.local.set({ groups });
        renderGroupList();
        renderGroups();
      });

      // Rename
      item.querySelector('.gm-rename-btn').addEventListener('click', () => {
        const gName = item.dataset.group;
        const newName = prompt(`Ganti nama "${gName}" menjadi:`, gName);
        if (newName && newName.trim() && newName.trim() !== gName) {
          const trimmed = newName.trim();
          elyxoras.forEach(d => { if (d.group === gName) d.group = trimmed; });
          const idx = groups.indexOf(gName);
          if (idx !== -1) groups[idx] = trimmed;
          if (activeGroup === gName) activeGroup = trimmed;
          chrome.storage.local.set({ elyxoras, groups });
          renderGroupList();
          renderGroups();
          renderElyxoras();
        }
      });

      // Delete
      item.querySelector('.gm-delete-btn').addEventListener('click', async () => {
        const gName = item.dataset.group;
        const count = elyxoras.filter(d => d.group === gName).length;
        const msg = count > 0 ? `Group "${gName}" punya ${count} pintasan. Pintasan dipindah ke group lain. Lanjutkan?` : `Hapus group "${gName}"?`;
        if (!confirm(msg)) return;
        const remaining = groups.filter(g => g !== gName);
        const fallback = remaining[0] || null;
        elyxoras.forEach(d => { if (d.group === gName) d.group = fallback || d.group; });
        groups = remaining;
        if (activeGroup === gName) activeGroup = 'mostUsed';
        await chrome.storage.local.set({ elyxoras, groups });
        renderGroupList();
        renderGroups();
        renderElyxoras();
      });
    });
  }

  renderGroupList();

  document.getElementById('addGroupConfirmBtn').addEventListener('click', async () => {
    const input = document.getElementById('newGroupNameInput');
    const name = input.value.trim();
    if (!name) return;
    if (groups.includes(name)) { alert('Nama group sudah ada!'); return; }
    groups.push(name);
    await chrome.storage.local.set({ groups });
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

// Global Context Menu
document.addEventListener('contextmenu', (e) => {
  if (
    !e.target.closest('.elyxora-item') &&
    !e.target.closest('.modal-content') &&
    !e.target.closest('#searchForm') &&
    !e.target.closest('.group-tab')
  ) {
    e.preventDefault();
    showContextMenu(e.pageX, e.pageY, null);
  }
});

// Floating Action Button (FAB)
const fabAddBtn = document.getElementById('fabAddBtn');
if (fabAddBtn) {
  fabAddBtn.addEventListener('click', () => {
    editingId = null;
    if (typeof resetModal === 'function') resetModal();
    document.getElementById('elyxoraModalTitle').textContent = 'Tambah di Elyxora Tab';
    document.getElementById('saveElyxoraBtn').textContent = 'Add Elyxora';
    document.getElementById('elyxoraModal').style.display = 'flex';
  });
}

// Save data
async function saveElyxoras() {
  await chrome.storage.local.set({ elyxoras, groups });
}

// Upgrade ikon lama (URL eksternal) ke Base64 agar bisa tampil offline
async function upgradeIconsToBase64() {
  if (!navigator.onLine) return; // Hanya jalan saat online
  let hasChanges = false;

  for (let i = 0; i < elyxoras.length; i++) {
    const elyxora = elyxoras[i];
    // Cek apakah ikon masih URL eksternal (bukan Base64 dan bukan kosong)
    if (elyxora.icon && !elyxora.icon.startsWith('data:')) {
      try {
        const b64 = await fetchIconAsBase64(elyxora.icon);
        if (b64) {
          elyxoras[i].icon = b64;
          hasChanges = true;
        }
      } catch(e) { /* lewati jika gagal */ }
    }
    // Jika ikon kosong dan mode auto, ambil favicon dan simpan sebagai Base64
    if (!elyxora.icon && elyxora.iconMode === 'auto' && elyxora.url) {
      try {
        const domain = new URL(elyxora.url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        const b64 = await fetchIconAsBase64(faviconUrl);
        if (b64) {
          elyxoras[i].icon = b64;
          hasChanges = true;
        }
      } catch(e) { /* lewati jika gagal */ }
    }
  }

  if (hasChanges) {
    await chrome.storage.local.set({ elyxoras });
    renderElyxoras(); // Re-render dengan ikon yang sudah di-cache
    console.log('[Elyxora] Ikon berhasil di-cache sebagai Base64 untuk mode offline.');
  }
}

// Load initial data
loadElyxoras().catch(error => {
  console.error("Gagal memuat:", error);
});
