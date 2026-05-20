// =============================================
// ELYXORA TAB — MODUL MODAL (modal.js)
// Modal tambah/edit pintasan, icon suggestions, file upload
// =============================================

const modal = document.getElementById('elyxoraModal');
document.getElementById('cancelElyxoraBtn').onclick = () => {
  modal.style.display = 'none';
  resetModal();
};

const elyxoraIconInput = document.getElementById('elyxoraIcon');
const elyxoraIconFile = document.getElementById('elyxoraIconFile');
const iconPreview = document.getElementById('iconPreview');
const previewPlaceholder = document.getElementById('previewPlaceholder');
const elyxoraUrlInput = document.getElementById('elyxoraUrl');

const radioAuto = document.querySelector('input[value="auto"]');
const radioUrl = document.querySelector('input[value="url"]');
const radioFile = document.querySelector('input[value="file"]');
const iconInputWrapper = document.getElementById('iconInputWrapper');
const fileInputWrapper = document.getElementById('fileInputWrapper');

let uploadedBase64 = '';

function updateMode() {
  iconInputWrapper.style.display = radioUrl.checked ? 'block' : 'none';
  fileInputWrapper.style.display = radioFile.checked ? 'block' : 'none';
  
  if (radioAuto.checked) {
    if (elyxoraUrlInput.value) {
      try {
        const domain = new URL(elyxoraUrlInput.value).hostname;
        updatePreview(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      } catch(e) {
        updatePreview('');
      }
    } else {
      updatePreview('');
    }
  } else if (radioUrl.checked) {
    updatePreview(elyxoraIconInput.value);
  } else if (radioFile.checked) {
    updatePreview(uploadedBase64);
  }
}

document.querySelectorAll('input[name="iconMode"]').forEach(radio => {
  radio.addEventListener('change', updateMode);
});

function updatePreview(url) {
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

// Auto deteksi ikon dan saran saat mengetik URL
let fetchTimer;
elyxoraUrlInput.addEventListener('input', () => {
  if (radioAuto.checked) updateMode();
  
  clearTimeout(fetchTimer);
  fetchTimer = setTimeout(() => {
    fetchSuggestedIcons(elyxoraUrlInput.value);
  }, 500);
});

async function fetchSuggestedIcons(url) {
  const container = document.getElementById('suggestedIconsContainer');
  const list = document.getElementById('suggestedIconsList');
  
  if (!container || !list) return;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    if (!domain) throw new Error("Invalid domain");
    
    list.innerHTML = '';
    
    const titleInput = document.getElementById('elyxoraTitle');
    if (!titleInput.value) {
      let siteName = domain.replace('www.', '').split('.')[0];
      titleInput.value = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    }
    
    // Sumber ikon dari API logo yang reliable (tidak butuh fetch HTML/CORS)
    const suggestions = [
      `https://logo.clearbit.com/${domain}`,
      `https://unavatar.io/${domain}`,
      `https://icon.horse/icon/${domain}`,
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://ui-avatars.com/api/?name=${domain}&background=random&color=fff&size=128&bold=true`
    ];

    suggestions.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'suggested-icon checkerboard-bg';
      
      img.onerror = () => {
        img.style.display = 'none';
      };

      img.onclick = () => {
        Array.from(list.children).forEach(child => child.style.borderColor = 'transparent');
        img.style.borderColor = '#3b82f6';
        
        radioUrl.checked = true;
        updateMode();
        elyxoraIconInput.value = src;
        updatePreview(src);
      };

      list.appendChild(img);
    });

    container.style.display = 'block';
  } catch (e) {
    container.style.display = 'none';
  }
}

elyxoraIconInput.addEventListener('input', (e) => {
  if (radioUrl.checked) updatePreview(e.target.value);
});

// Handle file upload dan resize gambar
elyxoraIconFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 128;
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
        
        const base64String = canvas.toDataURL('image/png');
        uploadedBase64 = base64String;
        if (radioFile.checked) updatePreview(base64String);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

function resetModal() {
  document.getElementById('elyxoraTitle').value = '';
  document.getElementById('elyxoraUrl').value = '';
  elyxoraIconInput.value = '';
  elyxoraIconFile.value = '';
  uploadedBase64 = '';
  if (radioAuto) radioAuto.checked = true;
  const container = document.getElementById('suggestedIconsContainer');
  if (container) container.style.display = 'none';
  updateMode();
}

document.getElementById('saveElyxoraBtn').onclick = async () => {
  const title = document.getElementById('elyxoraTitle').value;
  const url = document.getElementById('elyxoraUrl').value;
  const group = document.getElementById('elyxoraGroup').value;

  let finalIcon = '';
  let iconData = '';
  const iconMode = document.querySelector('input[name="iconMode"]:checked').value;

  if (radioAuto.checked) {
    try {
      const domain = new URL(url).hostname;
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      // Coba unduh dan konversi ke Base64 (bekerja saat online)
      // Jika offline, simpan URL asli sebagai fallback
      const b64 = await fetchIconAsBase64(faviconUrl);
      finalIcon = b64 || faviconUrl;
      iconData = faviconUrl; // Simpan URL asli sebagai referensi
    } catch (e) {
      finalIcon = '';
    }
  } else if (radioUrl.checked) {
    const rawUrl = elyxoraIconInput.value;
    iconData = rawUrl;
    // Konversi URL gambar ke Base64 untuk penyimpanan offline
    const b64 = await fetchIconAsBase64(rawUrl);
    finalIcon = b64 || rawUrl; // Fallback ke URL jika konversi gagal
  } else if (radioFile.checked) {
    finalIcon = uploadedBase64; // Sudah Base64 dari file upload
    iconData = uploadedBase64;
  }

  if (title && url) {
    if (editingId) {
      const index = elyxoras.findIndex(d => d.id === editingId);
      if (index !== -1) {
        elyxoras[index].title = title;
        elyxoras[index].url = url;
        elyxoras[index].group = group;
        elyxoras[index].icon = finalIcon;
        elyxoras[index].iconMode = iconMode;
        elyxoras[index].iconData = iconData;
      }
    } else {
      elyxoras.push({
        id: Date.now(),
        title,
        url,
        icon: finalIcon,
        group,
        iconMode,
        iconData
      });
    }

    await saveElyxoras();
    renderElyxoras();
    modal.style.display = 'none';
    resetModal();
    editingId = null;
  }
};
