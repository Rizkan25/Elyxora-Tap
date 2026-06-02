// =============================================
// CLOCK ENGINE (clock.js)
// Mengatur pembaruan waktu, tanggal, dan salam
// =============================================
import { AppState } from './state.js';
import { getMessage, getCurrentLocale } from './i18n.js';

let lastTimeStr = '';
let lastDateStr = '';
let lastGreetingStr = '';

export function updateClock() {
  const timeEl = document.getElementById('time');
  const dateEl = document.getElementById('date');
  const greetingEl = document.getElementById('greeting');
  if (!timeEl) return;

  const now = new Date();

  let hr = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  let ampm = '';
  if (AppState.clockFormat === '12') {
    ampm = hr >= 12 ? ' PM' : ' AM';
    hr = hr % 12;
    if (hr === 0) hr = 12;
  }

  const hrStr = String(hr).padStart(2, '0');
  const newTimeStr = `${hrStr}:${m}${AppState.showSeconds ? ':' + s : ''}${ampm}`;

  if (lastTimeStr !== newTimeStr) {
    timeEl.textContent = newTimeStr;
    lastTimeStr = newTimeStr;
  }

  if (AppState.showDate) {
    if (dateEl && dateEl.style.display !== 'block') dateEl.style.display = 'block';
    // Gunakan Intl.DateTimeFormat agar bahasa tanggal otomatis menyesuaikan dengan locale yang sedang aktif
    const locale = getCurrentLocale();
    const formatter = new Intl.DateTimeFormat(locale, { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
    const newDateStr = formatter.format(now);

    if (dateEl && lastDateStr !== newDateStr) {
      dateEl.textContent = newDateStr;
      lastDateStr = newDateStr;
    }
  } else {
    if (dateEl && dateEl.style.display !== 'none') dateEl.style.display = 'none';
  }

  const actualHr = now.getHours();
  let greetingKey = '';
  if (actualHr >= 5 && actualHr < 11) greetingKey = 'greetingMorning';
  else if (actualHr >= 11 && actualHr < 15) greetingKey = 'greetingAfternoon';
  else if (actualHr >= 15 && actualHr < 18) greetingKey = 'greetingEvening';
  else greetingKey = 'greetingNight';

  const greetingI18n = getMessage(greetingKey) || 'Selamat Pagi';
  const newGreetingStr = `${greetingI18n}, ${AppState.userName}`;

  if (greetingEl && lastGreetingStr !== newGreetingStr) {
    greetingEl.textContent = newGreetingStr;
    lastGreetingStr = newGreetingStr;
  }
}

// Jalankan jam
setInterval(updateClock, 1000);
