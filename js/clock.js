// =============================================
// CLOCK ENGINE (clock.js)
// Mengatur pembaruan waktu, tanggal, dan salam
// =============================================
import { AppState } from './state.js';
import { getMessage, getCurrentLocale } from './i18n.js';
import { escapeHTML } from './utils.js';

let lastHoursStr = '';
let lastMinStr = '';
let lastSecStr = '';
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

  // Precision Typographic Digital Telemetry Clock
  const hoursEl = document.getElementById('telemetryHours');
  const minutesEl = document.getElementById('telemetryMinutes');
  const secondsEl = document.getElementById('telemetrySeconds');
  const ampmEl = document.getElementById('telemetryAmPm');

  if (hoursEl && minutesEl && secondsEl) {
    if (lastHoursStr !== hrStr) { hoursEl.textContent = hrStr; lastHoursStr = hrStr; }
    if (lastMinStr !== m) { minutesEl.textContent = m; lastMinStr = m; }
    if (lastSecStr !== s) { secondsEl.textContent = s; lastSecStr = s; }
    if (ampmEl) {
      if (ampm) {
        ampmEl.textContent = ampm.trim();
        ampmEl.style.display = 'inline-block';
      } else {
        ampmEl.style.display = 'none';
      }
    }
  } else {
    // Fallback standard text
    const newTimeStr = `${hrStr}:${m}${AppState.showSeconds ? ':' + s : ''}${ampm}`;
    if (timeEl.textContent !== newTimeStr) timeEl.textContent = newTimeStr;
  }

  if (AppState.showDate) {
    if (dateEl && dateEl.style.display !== 'block') dateEl.style.display = 'block';
    const locale = getCurrentLocale();
    const formatter = new Intl.DateTimeFormat(locale, { 
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
    const newDateStr = formatter.format(now);

    if (dateEl && lastDateStr !== newDateStr) {
      dateEl.textContent = newDateStr;
      const contextDateEl = document.getElementById('contextDateText');
      if (contextDateEl) contextDateEl.textContent = newDateStr;
      lastDateStr = newDateStr;
    }
  } else {
    if (dateEl && dateEl.style.display !== 'none') dateEl.style.display = 'none';
  }

  // Update Context Zone Ribbon (WIB (UTC+7) • KOTA)
  const contextZoneEl = document.getElementById('contextZoneText');
  if (contextZoneEl) {
    const timeZoneOffset = -now.getTimezoneOffset() / 60;
    const sign = timeZoneOffset >= 0 ? '+' : '';
    let zoneCode = 'WIB';
    if (timeZoneOffset === 8) zoneCode = 'WITA';
    else if (timeZoneOffset === 9) zoneCode = 'WIT';
    else if (timeZoneOffset !== 7) zoneCode = 'UTC';

    const city = (AppState.weatherLocation || 'JAKARTA').toUpperCase();
    contextZoneEl.textContent = `${zoneCode} (UTC${sign}${timeZoneOffset}) • ${city}`;
  }

  // Greeting Humanized Header
  const actualHr = now.getHours();
  let greetingKey = '';
  if (actualHr >= 5 && actualHr < 11) greetingKey = 'greetingMorning';
  else if (actualHr >= 11 && actualHr < 15) greetingKey = 'greetingAfternoon';
  else if (actualHr >= 15 && actualHr < 18) greetingKey = 'greetingEvening';
  else greetingKey = 'greetingNight';

  const greetingI18n = getMessage(greetingKey) || 'Selamat Pagi';
  const userName = AppState.userName || 'Rizkan';
  const newGreetingHtml = `${greetingI18n}, <span class="greeting-user-highlight">${escapeHTML(userName)}</span>`;

  if (greetingEl && lastGreetingStr !== newGreetingHtml) {
    greetingEl.innerHTML = newGreetingHtml;
    lastGreetingStr = newGreetingHtml;
  }

  const userInitialEl = document.getElementById('userAvatarInitial');
  if (userInitialEl) {
    userInitialEl.textContent = (userName || 'R').charAt(0).toUpperCase();
  }
}

// Jalankan jam
setInterval(updateClock, 1000);
