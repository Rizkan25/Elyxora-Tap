// =============================================
// UTILITIES (utils.js)
// Fungsi-fungsi pembantu global
// =============================================

// --- DEBOUNCE ---
// Mencegah fungsi dipanggil terlalu sering (berguna untuk event input/slider)
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// --- ESCAPE HTML ---
// Mencegah XSS saat merender nama grup/pintasan
export function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// --- GENERATE ID ---
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// --- FETCH ICON SEBAGAI BASE64 ---
// Mengunduh gambar dari URL dan menyimpannya sebagai Base64
// agar ikon bisa tampil tanpa koneksi internet (offline)
export async function fetchIconAsBase64(imageUrl) {
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

// SVG fallback global untuk ikon yang tidak bisa dimuat
export const OFFLINE_ICON_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='2' y1='12' x2='22' y2='12'/%3E%3Cpath d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'/%3E%3C/svg%3E`;
