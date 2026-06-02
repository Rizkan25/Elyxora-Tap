// =============================================
// MODAL ENGINE (modal.js)
// Mengelola modal tambah/edit pintasan
// =============================================
import { AppState, savePartialState } from './state.js';
import { renderElyxoras, renderGroups } from './groups.js';
import { fetchIconAsBase64 } from './utils.js';

let editingId = null;
let uploadedBase64 = '';

// Elemen DOM
const modal = document.getElementById('elyxoraModal');
const elyxoraIconInput = document.getElementById('elyxoraIcon');
const elyxoraIconFile = document.getElementById('elyxoraIconFile');
const iconPreview = document.getElementById('iconPreview');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const elyxoraUrlInput = document.getElementById('elyxoraUrl');
const radioAuto = document.querySelector('input[name="iconMode"][value="auto"]');
const radioUrl = document.querySelector('input[name="iconMode"][value="url"]');
const radioFile = document.querySelector('input[name="iconMode"][value="file"]');
const iconInputWrapper = document.getElementById('iconInputWrapper');
const fileInputWrapper = document.getElementById('fileInputWrapper');

// Guard: jika elemen modal tidak ada di halaman, skip
if (!modal) {
  console.warn('[Modal] Elemen #elyxoraModal tidak ditemukan.');
}

// -----------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------
function updateMode() {
  if (!iconInputWrapper || !radioUrl || !radioFile) return;
  iconInputWrapper.style.display = radioUrl.checked ? 'block' : 'none';
  if (fileInputWrapper) fileInputWrapper.style.display = radioFile.checked ? 'block' : 'none';

  if (radioAuto?.checked && elyxoraUrlInput?.value) {
    try {
      const domain = new URL(elyxoraUrlInput.value).hostname;
      updatePreview(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
    } catch (e) {
      updatePreview('');
    }
  } else if (radioUrl?.checked) {
    updatePreview(elyxoraIconInput?.value || '');
  } else if (radioFile?.checked) {
    updatePreview(uploadedBase64);
  }
}

function updatePreview(url) {
  if (!iconPreview) return;
  if (url) {
    iconPreview.src = url;
    iconPreview.style.display = 'block';
    if (previewPlaceholder) previewPlaceholder.style.display = 'none';
  } else {
    iconPreview.style.display = 'none';
    iconPreview.src = '';
    if (previewPlaceholder) previewPlaceholder.style.display = 'block';
  }
}

function resetModal() {
  const titleEl = document.getElementById('elyxoraTitle');
  const urlEl = document.getElementById('elyxoraUrl');
  if (titleEl) titleEl.value = '';
  if (urlEl) urlEl.value = '';
  if (elyxoraIconInput) elyxoraIconInput.value = '';
  if (elyxoraIconFile) elyxoraIconFile.value = '';
  uploadedBase64 = '';
  if (radioAuto) radioAuto.checked = true;
  const sugContainer = document.getElementById('suggestedIconsContainer');
  if (sugContainer) sugContainer.style.display = 'none';
  updateMode();
  updatePreview('');
}

// -----------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------

// Ganti mode ikon
document.querySelectorAll('input[name="iconMode"]').forEach(radio => {
  radio.addEventListener('change', updateMode);
});

// Auto-preview saat URL diketik
let fetchTimer;
if (elyxoraUrlInput) {
  elyxoraUrlInput.addEventListener('input', () => {
    if (radioAuto?.checked) updateMode();
    clearTimeout(fetchTimer);
    fetchTimer = setTimeout(() => fetchSuggestedIcons(elyxoraUrlInput.value), 600);
  });
}

// Preview dari URL ikon
if (elyxoraIconInput) {
  elyxoraIconInput.addEventListener('input', (e) => {
    if (radioUrl?.checked) updatePreview(e.target.value);
  });
}

// Upload file ikon
if (elyxoraIconFile) {
  elyxoraIconFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 128;
        let w = img.width, h = img.height;
        if (w > h && w > max) { h *= max / w; w = max; }
        else if (h > max) { w *= max / h; h = max; }
        canvas.width = Math.round(w);
        canvas.height = Math.round(h);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        uploadedBase64 = canvas.toDataURL('image/png');
        if (radioFile?.checked) updatePreview(uploadedBase64);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Tombol Batal
const cancelBtn = document.getElementById('cancelElyxoraBtn');
if (cancelBtn) {
  cancelBtn.onclick = () => {
    if (modal) modal.style.display = 'none';
    resetModal();
    editingId = null;
  };
}

// Tutup modal saat klik di luar
if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      resetModal();
      editingId = null;
    }
  });
}

// Tombol Simpan
const saveElyxoraBtn = document.getElementById('saveElyxoraBtn');
if (saveElyxoraBtn) {
  saveElyxoraBtn.onclick = async () => {
    const title = document.getElementById('elyxoraTitle')?.value.trim();
    const url = document.getElementById('elyxoraUrl')?.value.trim();
    const group = document.getElementById('elyxoraGroup')?.value;

    if (!title || !url) {
      alert('Judul dan URL wajib diisi!');
      return;
    }

    const iconMode = document.querySelector('input[name="iconMode"]:checked')?.value || 'auto';
    let finalIcon = '';
    let iconData = '';

    if (radioAuto?.checked) {
      try {
        const domain = new URL(url).hostname;
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        const b64 = await fetchIconAsBase64(faviconUrl);
        finalIcon = b64 || faviconUrl;
        iconData = faviconUrl;
      } catch (e) { finalIcon = ''; }
    } else if (radioUrl?.checked) {
      const rawUrl = elyxoraIconInput?.value.trim() || '';
      iconData = rawUrl;
      if (rawUrl) {
        const b64 = await fetchIconAsBase64(rawUrl);
        finalIcon = b64 || rawUrl;
      }
    } else if (radioFile?.checked) {
      finalIcon = uploadedBase64;
      iconData = uploadedBase64;
    }

    if (editingId !== null) {
      const index = AppState.elyxoras.findIndex(d => d.id === editingId);
      if (index !== -1) {
        AppState.elyxoras[index] = { ...AppState.elyxoras[index], title, url, group, icon: finalIcon, iconMode, iconData };
      }
    } else {
      AppState.elyxoras.push({ id: Date.now(), title, url, icon: finalIcon, group, iconMode, iconData });
    }

    await savePartialState({ elyxoras: AppState.elyxoras });
    renderGroups();
    renderElyxoras();
    if (modal) modal.style.display = 'none';
    resetModal();
    editingId = null;
  };
}

// -----------------------------------------------
// SARAN IKON
// -----------------------------------------------
async function fetchSuggestedIcons(url) {
  const container = document.getElementById('suggestedIconsContainer');
  const list = document.getElementById('suggestedIconsList');
  if (!container || !list) return;

  try {
    const domain = new URL(url).hostname;
    if (!domain) throw new Error('domain kosong');

    const titleInput = document.getElementById('elyxoraTitle');
    if (titleInput && !titleInput.value) {
      let siteName = domain.replace('www.', '').split('.')[0];
      titleInput.value = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    }

    list.innerHTML = '';
    const sources = [
      `https://logo.clearbit.com/${domain}`,
      `https://unavatar.io/${domain}`,
      `https://icon.horse/icon/${domain}`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://ui-avatars.com/api/?name=${domain}&background=random&color=fff&size=128&bold=true`
    ];

    sources.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'suggested-icon checkerboard-bg';
      img.onerror = () => img.style.display = 'none';
      img.onclick = () => {
        list.querySelectorAll('img').forEach(i => i.style.outline = 'none');
        img.style.outline = '2px solid #3b82f6';
        if (radioUrl) radioUrl.checked = true;
        updateMode();
        if (elyxoraIconInput) elyxoraIconInput.value = src;
        updatePreview(src);
      };
      list.appendChild(img);
    });

    container.style.display = 'block';
  } catch (e) {
    container.style.display = 'none';
  }
}

// -----------------------------------------------
// EVENT: Buka Modal dari Groups / Context Menu
// -----------------------------------------------
document.addEventListener('openElyxoraModal', (e) => {
  const id = e.detail?.id;

  if (id !== null && id !== undefined) {
    // Mode Edit
    const elyxora = AppState.elyxoras.find(d => d.id == id);
    if (!elyxora || !modal) return;

    const urlEl = document.getElementById('elyxoraUrl');
    const titleEl = document.getElementById('elyxoraTitle');
    const groupEl = document.getElementById('elyxoraGroup');

    if (urlEl) urlEl.value = elyxora.url;
    if (titleEl) titleEl.value = elyxora.title;
    if (groupEl) {
      // Isi pilihan grup dulu
      groupEl.innerHTML = AppState.groups.map(g => `<option value="${g}">${g}</option>`).join('');
      groupEl.value = elyxora.group;
    }
    editingId = elyxora.id;

    const modalTitle = document.getElementById('elyxoraModalTitle');
    if (modalTitle) modalTitle.textContent = 'Edit Pintasan';
    if (saveElyxoraBtn) saveElyxoraBtn.textContent = 'Simpan Perubahan';

    if (elyxora.iconMode) {
      const radio = document.querySelector(`input[name="iconMode"][value="${elyxora.iconMode}"]`);
      if (radio) radio.checked = true;
      if (elyxora.iconMode === 'url' && elyxoraIconInput) {
        elyxoraIconInput.value = elyxora.iconData || '';
      } else if (elyxora.iconMode === 'file') {
        uploadedBase64 = elyxora.iconData || '';
      }
    }
    updateMode();
    if (elyxora.icon) updatePreview(elyxora.icon);
    modal.style.display = 'flex';
  } else {
    // Mode Tambah Baru
    editingId = null;
    resetModal();
    const groupEl = document.getElementById('elyxoraGroup');
    if (groupEl) {
      groupEl.innerHTML = AppState.groups.map(g => `<option value="${g}">${g}</option>`).join('');
      if (AppState.activeGroup && AppState.activeGroup !== 'mostUsed') {
        groupEl.value = AppState.activeGroup;
      }
    }
    const modalTitle = document.getElementById('elyxoraModalTitle');
    if (modalTitle) modalTitle.textContent = 'Tambah di Elyxora Tab';
    if (saveElyxoraBtn) saveElyxoraBtn.textContent = 'Add Elyxora';
    if (modal) modal.style.display = 'flex';
  }
});
