// =============================================
// WEATHER ENGINE (weather.js)
// Menarik data cuaca dari wttr.in dan Open-Meteo
// =============================================
import { AppState } from './state.js';
import { getMessage, getCurrentLocale } from './i18n.js';

function getWeatherEmoji(code) {
  if (code === 0) return '☀️';
  if (code === 1 || code === 2 || code === 3) return '⛅';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌧️';
  if (code >= 85 && code <= 86) return '❄️';
  if (code >= 95) return '⛈️';
  return '⛅';
}

function getWeatherDesc(code) {
  if (code === 0) return 'Cerah';
  if (code === 1 || code === 2 || code === 3) return 'Berawan';
  if (code === 45 || code === 48) return 'Berkabut';
  if (code >= 51 && code <= 67) return 'Hujan Ringan';
  if (code >= 71 && code <= 77) return 'Salju';
  if (code >= 80 && code <= 82) return 'Hujan Deras';
  if (code >= 95) return 'Badai Petir';
  return 'Berawan';
}

export async function fetchWeather() {
  const wWidget = document.getElementById('weatherWidget');
  if (!wWidget) return;
  if (!AppState.enableWeather) {
    wWidget.style.display = 'none';
    return;
  }
  wWidget.style.display = 'block';
  document.getElementById('wDesc').textContent = getMessage('loadingWeather') || 'Memuat Cuaca...';

  try {
    let cityName = AppState.weatherLocation.trim();

    // Gunakan wttr.in sebagai sumber utama karena seringkali lebih akurat (mirip Google)
    const wttrUrl = `https://wttr.in/${cityName ? encodeURIComponent(cityName) : ''}?format=j1`;
    const wttrRes = await fetch(wttrUrl);

    if (wttrRes.ok) {
      const data = await wttrRes.json();
      const curr = data.current_condition[0];
      const nearest = data.nearest_area[0];

      const tempC = curr.temp_C;
      const tempF = curr.temp_F;
      const displayTemp = AppState.weatherUnit === 'fahrenheit' ? tempF : tempC;
      const desc = curr.lang_id ? curr.lang_id[0].value : curr.weatherDesc[0].value;
      const finalCity = cityName || (nearest ? nearest.areaName[0].value : 'Lokasi Anda');

      // Mapping WeatherCode wttr.in (WWO codes) ke Emoji
      const wwoEmoji = (code) => {
        code = parseInt(code);
        if (code === 113) return '☀️'; // Sunny
        if (code === 116) return '⛅'; // Partly Cloudy
        if (code === 119 || code === 122) return '☁️'; // Cloudy/Overcast
        if (code === 143 || code === 248 || code === 260) return '🌫️'; // Fog
        if (code >= 176 && code <= 308) return '🌧️'; // Rain
        if (code >= 311 && code <= 377) return '❄️'; // Snow
        if (code >= 386) return '⛈️'; // Thunder
        return '⛅';
      };

      document.getElementById('wIcon').textContent = wwoEmoji(curr.weatherCode);
      document.getElementById('wTemp').textContent = `${displayTemp}°${AppState.weatherUnit === 'fahrenheit' ? 'F' : 'C'}`;
      document.getElementById('wDesc').textContent = `${desc} - ${finalCity}`;

      // Forecast 3 hari
      if (AppState.weatherForecast && data.weather) {
        const box = document.getElementById('forecastData');
        let html = '';
        for (let i = 1; i <= 3; i++) {
          const d = data.weather[i];
          const dDate = new Date(d.date);
          const locale = getCurrentLocale();
          const dName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dDate);
          const e = wwoEmoji(d.hourly[4].weatherCode); // Ambil tengah hari
          const minT = AppState.weatherUnit === 'fahrenheit' ? d.mintempF : d.mintempC;
          const maxT = AppState.weatherUnit === 'fahrenheit' ? d.maxtempF : d.maxtempC;
          html += `<div><div style="font-weight:bold;">${dName}</div><div style="font-size: 1.5rem; margin:4px 0;">${e}</div><div>${minT}°/${maxT}°</div></div>`;
        }
        box.innerHTML = html;

        wWidget.onclick = () => {
          const fbox = document.getElementById('weatherForecastBox');
          fbox.style.display = fbox.style.display === 'none' ? 'block' : 'none';
        };
        wWidget.style.cursor = 'pointer';
      } else {
        wWidget.onclick = null;
        wWidget.style.cursor = 'default';
        document.getElementById('weatherForecastBox').style.display = 'none';
      }
      return; // Berhasil menggunakan wttr.in, keluar dari fungsi
    }
  } catch (err) {
    console.warn("wttr.in failed, falling back to Open-Meteo", err);
  }

  // FALLBACK KE OPEN-METEO (Jika wttr.in gagal)
  try {
    let lat = null, lon = null, cityName = AppState.weatherLocation.trim();
    if (!cityName) {
      const ipRes = await fetch('http://ip-api.com/json/');
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        lat = ipData.lat; lon = ipData.lon; cityName = ipData.city;
      }
    } else {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1`);
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          lat = geoData.results[0].latitude; lon = geoData.results[0].longitude; cityName = geoData.results[0].name;
        }
      }
    }

    if (lat && lon) {
      const unitQ = AppState.weatherUnit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : '';
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto${unitQ}`);

      if (weatherRes.ok) {
        const data = await weatherRes.json();
        const curr = data.current;
        document.getElementById('wIcon').textContent = getWeatherEmoji(curr.weather_code);
        document.getElementById('wTemp').textContent = `${Math.round(curr.temperature_2m)}°${AppState.weatherUnit === 'fahrenheit' ? 'F' : 'C'}`;
        document.getElementById('wDesc').textContent = `${getWeatherDesc(curr.weather_code)} - ${cityName}`;

        // Forecast 3 hari Open-Meteo
        if (AppState.weatherForecast && data.daily) {
          const box = document.getElementById('forecastData');
          let html = '';
          for (let i = 1; i <= 3; i++) {
            if (!data.daily.time[i]) continue;
            const dDate = new Date(data.daily.time[i]);
            const locale = getCurrentLocale();
            const dName = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(dDate);
            const e = getWeatherEmoji(data.daily.weather_code[i]);
            const minT = Math.round(data.daily.temperature_2m_min[i]);
            const maxT = Math.round(data.daily.temperature_2m_max[i]);
            html += `<div><div style="font-weight:bold;">${dName}</div><div style="font-size: 1.5rem; margin:4px 0;">${e}</div><div>${minT}°/${maxT}°</div></div>`;
          }
          box.innerHTML = html;

          wWidget.onclick = () => {
            const fbox = document.getElementById('weatherForecastBox');
            fbox.style.display = fbox.style.display === 'none' ? 'block' : 'none';
          };
          wWidget.style.cursor = 'pointer';
        } else {
          wWidget.onclick = null;
          wWidget.style.cursor = 'default';
          document.getElementById('weatherForecastBox').style.display = 'none';
        }
      }
    }
  } catch (err) {
    document.getElementById('wDesc').textContent = getMessage('weatherError') || 'Gagal memuat cuaca';
  }
}
