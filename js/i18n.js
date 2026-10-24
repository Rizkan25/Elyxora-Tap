// =============================================
// I18N ENGINE (i18n.js)
// Mengatur pemuatan kamus bahasa secara asinkron (via Fetch)
// sehingga bahasa dapat diganti dinamis tanpa reload/restart.
// =============================================

let dictionary = {};
let currentLang = 'id';

// Memuat JSON bahasa dari folder _locales
export async function loadTranslations(langPreference) {
  let lang = langPreference;
  
  if (!lang || lang === 'auto') {
    // Ambil bahasa browser, biasanya seperti "id" atau "en-US"
    if (typeof chrome !== 'undefined' && chrome.i18n && chrome.i18n.getUILanguage) {
      lang = chrome.i18n.getUILanguage().split('-')[0];
    } else if (navigator && navigator.language) {
      lang = navigator.language.split('-')[0];
    } else {
      lang = 'id';
    }
    if (lang !== 'id' && lang !== 'en') {
      lang = 'id'; // Fallback default
    }
  }

  currentLang = lang;

  const getLocaleUrl = (l) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      return chrome.runtime.getURL(`_locales/${l}/messages.json`);
    }
    return `_locales/${l}/messages.json`;
  };

  try {
    const res = await fetch(getLocaleUrl(lang));
    if (!res.ok) throw new Error('File not found');
    dictionary = await res.json();
  } catch (err) {
    console.warn(`Failed to load ${lang} locale. Falling back to id.`, err);
    try {
      const fb = await fetch(getLocaleUrl('id'));
      dictionary = await fb.json();
      currentLang = 'id';
    } catch (e) {
      console.error("Critical: Could not load any translations.", e);
      dictionary = {};
    }
  }
}

// Mendapatkan nilai string berdasarkan kunci (key)
export function getMessage(key) {
  if (dictionary && dictionary[key]) {
    return dictionary[key].message;
  }
  return '';
}

// Mengambil locale saat ini yang sedang aktif (misal untuk Date Format)
export function getCurrentLocale() {
  return currentLang === 'id' ? 'id-ID' : 'en-US';
}

// Menerapkan terjemahan ke semua elemen HTML dengan atribut data-i18n
export function applyI18n() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const msg = getMessage(el.getAttribute('data-i18n'));
    if (msg) {
      if (el.hasAttribute('data-i18n-attr')) {
        el.setAttribute(el.getAttribute('data-i18n-attr'), msg);
      } else if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search' || el.type === 'url')) {
        el.placeholder = msg;
      } else {
        el.innerText = msg;
      }
    }
  });
}
