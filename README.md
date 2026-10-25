# 🌟 Elyxora Tab - Personal New Tab Dashboard & Bento Speed Dial

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg?logo=google-chrome&logoColor=white)](#)
[![Version](https://img.shields.io/badge/version-1.1.0--v2.5.0-green.svg)](#)
[![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](#)
[![Offline Ready](https://img.shields.io/badge/offline-ready-emerald.svg)](#)
[![Privacy Friendly](https://img.shields.io/badge/privacy-100%25%20local-cyan.svg)](#)

<p align="center">
  <img src="https://i.ibb.co.com/cKPpZptj/911ec925-a66c-420a-aee2-9392e2ec3069.png" alt="Elyxora Tab Preview" width="100%" style="border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,0.4);" />
</p>

Selamat datang di **Elyxora Tab**! 🎉

**Elyxora Tab** adalah ekstensi browser modern berbasis **Google Chrome Manifest V3** yang mentransformasi halaman *New Tab* Anda menjadi sebuah *personal productivity dashboard* yang **futuristik, super estetik, berkecepatan 60+ FPS, dan kaya fitur kustomisasi**. Menggabungkan filosofi desain antarmuka *Bento Grid*, estetika *Glassmorphism* mutakhir, akselerasi perangkat keras GPU, serta integrasi kontrol cepat bergaya Raycast & Arc, Elyxora Tab dirancang untuk meningkatkan fokus, kenyamanan visual, dan efisiensi berselancar di web setiap hari.

---

## 📑 Daftar Isi
- [✨ Fitur Unggulan](#-fitur-unggulan)
  - [1. 🍱 Bento Speed Dial & Matrix Controls](#1--bento-speed-dial--matrix-controls)
  - [2. 🔍 Omnibox Multi-Engine Search & Voice Assistant](#2--omnibox-multi-engine-search--voice-assistant)
  - [3. 🕒 Telemetry Digital Clock & Dynamic Greetings](#3--telemetry-digital-clock--dynamic-greetings)
  - [4. 🧘 Kapsul Mode: Default, Minimal Zen, & Pomodoro Focus](#4--kapsul-mode-default-minimal-zen--pomodoro-focus)
  - [5. ⛅ Widget Cuaca Real-Time & Prakiraan Multi-Hari](#5--widget-cuaca-real-time--prakiraan-multi-hari)
  - [6. 🎧 Precision Bottom Dock & Lo-fi Music Player](#6--precision-bottom-dock--lo-fi-music-player)
  - [7. 📝 Quick Notes & Scratchpad Terintegrasi](#7--quick-notes--scratchpad-terintegrasi)
  - [8. 🎬 Live Video Wallpaper Engine & GPU Parallax](#8--live-video-wallpaper-engine--gpu-parallax)
  - [9. ⚙️ Bento Settings Modal & Kustomisasi Visual](#9-️-bento-settings-modal--kustomisasi-visual)
  - [10. 💾 Manajemen Data (Export / Import Backup)](#10--manajemen-data-export--import-backup)
- [⌨️ Panduan Hotkey & Pintasan Keyboard](#️-panduan-hotkey--pintasan-keyboard)
- [🚀 Arsitektur & Performa "Under the Hood"](#-arsitektur--performa-under-the-hood)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🛠️ Panduan Instalasi (Step-by-Step)](#️-panduan-instalasi-step-by-step)
- [⚙️ Tips Penggunaan Sehari-hari](#️-tips-penggunaan-sehari-hari)
- [🤝 Kontribusi & Lisensi](#-kontribusi--lisensi)

---

## ✨ Fitur Unggulan

### 1. 🍱 Bento Speed Dial & Matrix Controls
Kelola seluruh situs penting dan bookmark harian Anda dengan tampilan kartu bergaya modular Bento:
* **Pilihan Tampilan (View Switcher):** Beralih instan antara mode **Grid View** yang lapang atau **List View** yang padat dan terstruktur.
* **Algoritma Pengurutan Cerdas (Matrix Sort):** Mode otomatis **Sering Dikunjungi** (*Most Visited / Frequency*) yang menampilkan situs yang paling sering Anda buka di urutan teratas, atau beralih ke urutan kustom per kategori.
* **Hotkey Badges Langsung (1–8):** Setiap kartu di urutan teratas dilengkapi badge angka. Tekan tombol angka `1` hingga `8` di keyboard Anda untuk langsung membuka link tanpa perlu mengklik kursor.
* **Grup & Tab Terkategori:** Pisahkan link berdasarkan kebutuhan (*Favorit*, *Kerja & Dev*, *AI Tools*, *Sosial Media*, *Hiburan*, dll.) lengkap dengan badge jumlah item dinamis.
* **Favicon Auto-Fetcher & Custom Logo:** Otomatis mengambil ikon favicon beresolusi tinggi, memasukkan URL logo eksternal, atau mengunggah ikon lokal dari komputer Anda.
* **Bento Add Modal (Hotkey `N`):** Modal pop-up modern untuk menambah pintasan baru dengan live preview ikon, deteksi logo otomatis, dan opsi penempatan grup.

### 2. 🔍 Omnibox Multi-Engine Search & Voice Assistant
Pusat pencarian terpadu yang cepat dan fleksibel layaknya Arc Browser dan Raycast:
* **6 Mesin Pencari Populer Sekali Klik:** Beralih instan antara **Google**, **Bing**, **DuckDuckGo**, **GitHub**, **YouTube**, dan **Perplexity** cukup dengan mengklik kapsul atau menekan `Tab`.
* **Keyboard Hotkey Cepat (`/` atau `Ctrl+K` / `Cmd+K`):** Tekan tombol `/` dari mana saja di layar untuk langsung memfokuskan kursor ke kolom pencarian.
* **Pencarian Suara Terintegrasi (Voice Search):** Didukung oleh *Web Speech API* native, tekan ikon mikrofon untuk mendiktekan kata kunci pencarian tanpa mengetik.
* **Search Suggestions Real-Time:** Rekomendasi kata kunci cerdas saat mengetik dengan optimasi *debounce* agar responsif dan hemat kuota internet.
* **Quick Recent Queries Ribbon:** Tombol *chip* pintasan untuk pencarian terkini dan link dokumentasi populer (misal: repositori GitHub, Tailwind, Next.js, ChatGPT) yang dapat langsung dijalankan dengan sekali klik.

### 3. 🕒 Telemetry Digital Clock & Dynamic Greetings
Pusat waktu berdesain telemetri canggih yang memadukan tipografi modern dan konteks lokal:
* **Precision Telemetry Digital Clock:** Tampilan digit tabular monospace (*Space Grotesk*) yang presisi menampilkan jam, menit, detik, dan indikator AM/PM yang halus.
* **11 Koleksi Gaya Jam Artistik:**
  1. *Minimal* (Tipis, elegan, dan bersih)
  2. *Bold* (Tegas dengan aksen tebal modern)
  3. *Glassmorphism* (Efek frosted glass dengan shimmer animasi)
  4. *Neumorphism* (Bayangan 3D timbul yang estetik)
  5. *Cyberpunk* (Glow neon futuristik ala terminal)
  6. *Swiss* (Tipografi editorial tebal bergaya internasional)
  7. *Retro CRT* (Efek monitor hacker hijau fosfor)
  8. *Rainbow Gradient* (Animasi gradasi spektrum pelangi)
  9. *Flip Clock* (Mekanisme flip retro klasik)
  10. *Border Tracer* (Garis berpendar dinamis yang mengitari jam)
  11. *OLED Pure Black* (Ultra-hemat daya dan kontras tinggi)
* **Localized Context Ribbon:** Menampilkan penanggalan lokal lengkap (Hari, Tanggal, Bulan, Tahun) disertai indikator status *pulse dot* dan zona waktu Anda (misal: `WIB (UTC+7) • JAKARTA`).
* **Humanized Dynamic Greeting:** Sapaan hangat (*Selamat Pagi*, *Selamat Siang*, *Selamat Sore*, *Selamat Malam*) yang otomatis berganti mengikuti jam hari dan disandingkan dengan nama panggilan Anda.

### 4. 🧘 Kapsul Mode: Default, Minimal Zen, & Pomodoro Focus
Sesuaikan suasana dashboard dengan ritme produktivitas harian Anda:
* **Default Mode:** Tampilan dasbor lengkap dengan jam telemetri, omnibox pencarian, speed dial bento, dan dock bawah.
* **Minimal Zen Mode:** Menghilangkan seluruh elemen speed dial dan widget sekunder, menyisakan latar belakang tenang dan jam minimalis untuk kenyamanan mata tanpa distraksi.
* **Pomodoro Focus Mode (Timer 25 Menit):**
  * Penghitung waktu mundur interaktif 25:00 (bisa dikustomisasi) untuk metode kerja terfokus.
  * Dilengkapi tombol Mulai / Jeda / Reset dan indikator sisa waktu di header.
  * Kartu dialog fokus elegan dengan kata-kata motivasi harian.

### 5. ⛅ Widget Cuaca Real-Time & Prakiraan Multi-Hari
Informasi cuaca meteorologi akurat yang didukung oleh Open-Meteo API:
* **Pill Cuaca di Header Atas & Mini Widget:** Pantau suhu dan kondisi langit saat ini langsung dari header tanpa memenuhi ruang layar.
* **Deteksi Geolokasi & Pencarian Kota:** Deteksi lokasi Anda secara otomatis via browser Geolocation atau masukkan kota favorit secara manual.
* **Expanded Weather Popover Modal:** Klik pada indikator cuaca untuk membuka kartu rincian lengkap:
  * Suhu saat ini (°C atau °F) dengan ikon animasi cuaca dinamis.
  * Parameter atmosfer: Persentase kelembaban udara, kecepatan angin, dan indeks UV.
  * Kartu prakiraan cuaca 3 hari ke depan (*Besok*, *Lusa*, *H+3*).

### 6. 🎧 Precision Bottom Dock & Lo-fi Music Player
Kapsul utilitas mengambang di bagian bawah layar untuk melengkapi suasana kerja Anda:
* **Live Lo-fi Radio Stream:** Pemutar musik langsung (stream *Chilled Cow Lo-fi Hip Hop Radio*) dengan visualizer gelombang suara (animasi *EQ bars*) yang dapat dinyalakan/dimatikan dengan menekan tombol `P`.
* **Offline Web Audio API Synth Engine (Cadangan Cerdas):** Jika Anda sedang offline atau koneksi internet audio stream terputus, sistem secara otomatis menghasilkan alunan nada pad sintetis *A-minor 7 warm synth chord* secara native di memori peramban tanpa koneksi internet sama sekali!
* **Canvas Wallpaper Quick Switcher:** Mengganti suasana latar kanvas secara instan dalam 1 klik (*Obsidian Solid*, *Neon Sunset*, *Cyber City*, atau *Live Video*).
* **Indikator Sinkronisasi & Tombol Satu-Klik Export JSON:** Memastikan konfigurasi tersimpan dengan aman di penyimpanan lokal.

### 7. 📝 Quick Notes & Scratchpad Terintegrasi
Tempat mencatat ide kilat, daftar tugas (*to-do list*), atau draf teks tanpa perlu membuka aplikasi terpisah:
* **Akses Cepat dari Navigasi Header:** Klik menu *Notes* di header untuk membuka modal scratchpad mengambang.
* **Penyimpanan Otomatis (Auto-Save):** Setiap ketikan langsung disimpan secara instan ke penyimpanan lokal peramban.
* **Penghitung Karakter & Kata Real-time:** Menampilkan jumlah karakter dan kata secara akurat saat Anda mengetik.
* **Tindakan Satu Klik:** Tombol **Salin** langsung ke papan klip (*clipboard*) dan tombol **Bersihkan** catatan.

### 8. 🎬 Live Video Wallpaper Engine & GPU Parallax
Ubah latar belakang peramban menjadi karya visual hidup berkualitas tinggi:
* **Format Video Dinamis (`.mp4`, `.webm`):** Pasang video hingga resolusi 4K sebagai wallpaper latar bergerak.
* **Arsitektur Penyimpanan IndexedDB (`idb.js`):** File video dan gambar berukuran besar disimpan langsung di IndexedDB lokal browser, sehingga tidak memakan kuota `chrome.storage.local` dan mencegah *tab freeze*.
* **Pengatur Batas Ukuran File (Size Limit Selector):** Pilihan pembatasan berkas fleksibel (50MB, 100MB, 200MB, 500MB, hingga **Unlimited**).
* **Auto-Pause Ramah Baterai & CPU:** Saat tab diminimalkan atau Anda berpindah ke tab lain, video otomatis dijeda (*paused*) melalui `document.visibilityState` untuk menghemat daya dan baterai laptop.
* **Efek Parallax 3D & Slider Pengaturan:** Slider pengatur tingkat *Blur* (0–50px), *Dark Overlay* (0–100%), dan pergerakan Parallax dinamis berbasis `requestAnimationFrame`.

### 9. ⚙️ Bento Settings Modal & Kustomisasi Visual
Pusat kontrol menyeluruh dengan tata letak modal Bento v2.5 yang intuitif dan modern:
* **Tab Tampilan (Appearance):** Mode tema (Terang, Gelap, Sinkronisasi Sistem), 6 palet warna aksen preset (*Electric Blue*, *Emerald Green*, *Crimson Rose*, *Cyber Violet*, *Amber Gold*, *Cyan*) + *Color Picker* kustom bebas, skala jam, dan ukuran ikon.
* **Tab Wallpaper:** Pengaturan video langsung, unggah gambar lokal (otomatis dikonversi ke format WebP), URL gambar web, dan pilihan kanvas preset.
* **Tab Umum (General):** Pengaturan nama pengguna sapaan, mesin pencari default, saran pencarian, dan durasi fokus pomodoro.
* **Tab Grup & Pintasan:** Tambah, edit urutan grup, atur animasi transisi tab, dan kelola daftar situs.
* **Tab Pintasan Keyboard:** Panduan referensi cepat seluruh hotkey aplikasi.

### 10. 💾 Manajemen Data (Export / Import Backup)
* **One-Click Export:** Seluruh data grup, daftar pintasan, catatan, preferensi tema, dan setelan cuaca dapat diekspor menjadi berkas `.json` cadangan.
* **Instant Restore / Import:** Pulihkan seluruh konfigurasi Anda kapan saja di komputer atau profil peramban baru dalam satu klik.
* **100% Privat & Tanpa Pelacakan:** Seluruh data tersimpan sepenuhnya di perangkat lokal Anda. Tidak ada server analitik, tidak ada pelacakan pihak ketiga, dan bebas iklan selamanya.

---

## ⌨️ Panduan Hotkey & Pintasan Keyboard

Tingkatkan kecepatan navigasi Anda dengan daftar pintasan keyboard bawaan:

| Tombol / Hotkey | Tindakan / Fungsi |
| :---: | :--- |
| <kbd>/</kbd> | Fokus instan ke kolom pencarian (*Omnibox*) |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> atau <kbd>Cmd</kbd> + <kbd>K</kbd> | Buka & sorot teks pada kolom pencarian (*Raycast / Arc style*) |
| <kbd>Tab ⇥</kbd> *(saat fokus di search)* | Beralih (*cycle*) ke mesin pencari berikutnya (Google ➔ Bing ➔ DDG ➔ GitHub ➔ YouTube ➔ Perplexity) |
| <kbd>1</kbd> s/d <kbd>8</kbd> | Buka pintasan Speed Dial urutan 1 hingga 8 secara instan |
| <kbd>N</kbd> atau <kbd>n</kbd> | Buka dialog modal **Tambah Pintasan Baru** |
| <kbd>S</kbd> atau <kbd>s</kbd> | Buka modal **Pengaturan Elyxora** (*Settings*) |
| <kbd>P</kbd> atau <kbd>p</kbd> | Nyalakan / Jeda (*Play / Pause*) musik **Lo-fi Radio & Ambient Pad** |
| <kbd>?</kbd> | Buka lembar bantuan & daftar pintasan (*Shortcuts Cheat Sheet*) |
| <kbd>Esc</kbd> | Tutup modal yang sedang terbuka, keluar dari mode fokus, atau lepas fokus input |

---

## 🚀 Arsitektur & Performa "Under the Hood"

Elyxora Tab dibangun dengan fokus pada arsitektur web modern berkinerja tinggi:

```
┌─────────────────────────────────────────────────────────────┐
│                       Elyxora Tab Core                      │
├──────────────────────────────┬──────────────────────────────┤
│  Presentation Layer          │  Business & State Engine     │
│  - Spatial HUD Backdrop      │  - Reactive AppState (Local) │
│  - GPU Composited Layers     │  - IndexedDB Media Engine    │
│  - Vanilla CSS Glassmorphism │  - ESM Modular Architecture  │
├──────────────────────────────┼──────────────────────────────┤
│  Audio & Sensor Engine       │  Chrome MV3 Security         │
│  - Web Audio API (Ambient)   │  - Zero remote eval()        │
│  - Web Speech API (Voice)    │  - Offline-First Architecture│
│  - Geolocation API (Weather) │  - Sandboxed Permissions     │
└──────────────────────────────┴──────────────────────────────┘
```

| Komponen Teknis | Implementasi & Keunggulan |
| :--- | :--- |
| **Penyimpanan Media** | Menggunakan **IndexedDB** (`idb.js`) untuk video/blob besar, menjaga `chrome.storage.local` tetap ringan dan bebas lag sinkronisasi kuota. |
| **Akselerasi GPU** | Memanfaatkan instruksi CSS hardware compositing (`transform: translate3d`, `will-change`, `backface-visibility: hidden`) untuk rendering *glassmorphism* di semua ukuran layar tanpa frame drop. |
| **Parallax Engine** | Dijalankan melalui `requestAnimationFrame` untuk memastikan pergerakan latar belakang bergerak 60+ FPS mengikuti pergerakan kursor tanpa lonjakan konsumsi CPU. |
| **Modular ES6 Modules** | Kode logika dipisahkan secara rapi ke modul-modul independen (`main.js`, `theme.js`, `settings.js`, `groups.js`, dll.) dengan pola *Single Responsibility*. |
| **Ambient Synth Fallback** | Menggunakan *Web Audio API Oscillator & Gain Nodes* untuk mensintesis akord musik ambient hangat secara offline ketika streaming audio tidak tersedia. |
| **Keamanan Manifest V3** | Memenuhi 100% spesifikasi keamanan Google Chrome Web Store Manifest V3 tanpa dependensi skrip eksternal berbahaya. |

---

## 📁 Struktur Proyek

```bash
Elyxora Tap/
├── manifest.json          # Konfigurasi ekstensi Chrome Manifest V3
├── newtab.html            # Struktur markup UI utama, modal bento, & omnibox
├── style.css              # Desain antarmuka, variabel tema, glassmorphism, & animasi
├── clean_css.js           # Utilitas optimasi dan pembersih CSS
├── _locales/              # Skema multi-bahasa internasionalisasi (i18n)
│   ├── en/messages.json   # Terjemahan Bahasa Inggris
│   └── id/messages.json   # Terjemahan Bahasa Indonesia
├── icons/                 # Aset grafis & ikon ekstensi
│   ├── elyxora_logo.png   # Logo resmi Elyxora Tab
│   ├── icon16.png         # Ikon toolbar Chrome 16x16
│   ├── icon48.png         # Ikon manajemen ekstensi 48x48
│   └── icon128.png        # Ikon resolusi tinggi 128x128
├── designs/               # Dokumen desain konsep & mockup
│   ├── elyxora_logo.png   # Aset logo beresolusi tinggi
│   ├── screen_*.html      # Prototipe antarmuka Bento Grid
│   └── screen_*.jpg       # Pratinjau render desain visual
└── js/                    # Modul logika JavaScript (ES6 Modules)
    ├── main.js            # Entry point aplikasi, hotkeys, dock, & event listeners
    ├── state.js           # Pengelola state reaktif pusat & storage persistence
    ├── theme.js           # Engine tema, visual wallpaper, parallax, & GPU effects
    ├── settings.js        # Pengendali modal pengaturan v2.5 Bento & live preview
    ├── groups.js          # Pengelola grup pintasan, speed dial, & drag-and-drop
    ├── clock.js           # Engine waktu, jam telemetri, sapaan, & kalender
    ├── weather.js         # Pengambil data cuaca, geolokasi, & API Open-Meteo
    ├── modal.js           # Pengendali sistem dialog pop-up & form pintasan
    ├── idb.js             # Abstraksi IndexedDB untuk file video & blob besar
    ├── i18n.js            # Parser kamus terjemahan internasional
    └── utils.js           # Utilitas umum (debounce, sanitizer, helpers)
```

---

## 🛠️ Panduan Instalasi (Step-by-Step)

Anda dapat memasang dan menguji **Elyxora Tab** secara manual di browser berbasis Chromium (**Google Chrome**, **Microsoft Edge**, **Brave**, **Opera**, atau **Arc**):

### Langkah 1: Unduh Repositori
Clone repositori ini atau unduh berkas ZIP:
```bash
git clone https://github.com/Rizkan25/Elyxora-Tap.git
```
*(Jika mengunduh file `.zip`, ekstrak folder tersebut ke direktori komputer Anda)*.

### Langkah 2: Buka Halaman Ekstensi Peramban
* **Google Chrome:** Buka `chrome://extensions/`
* **Microsoft Edge:** Buka `edge://extensions/`
* **Brave Browser:** Buka `brave://extensions/`

### Langkah 3: Aktifkan Mode Pengembang (Developer Mode)
Nyalakan toggle sakelar **Developer mode** yang terletak di sudut kanan atas halaman ekstensi.

### Langkah 4: Pasang Ekstensi (Load Unpacked)
1. Klik tombol **Load unpacked** (*Muat ekstensi tidak dikemas*) di pojok kiri atas.
2. Arahkan dan pilih folder direktori utama proyek **Elyxora Tap** (folder yang memuat berkas `manifest.json`).
3. Ekstensi Elyxora Tab akan langsung terpasang dan aktif seketika.

### Langkah 5: Nikmati Tab Baru Anda! ✨
Buka tab baru (**Ctrl + T** di Windows/Linux atau **Cmd + T** di macOS). Halaman New Tab Anda kini telah bertransformasi menjadi Elyxora Tab!

---

## ⚙️ Tips Penggunaan Sehari-hari

1. **Ganti Wallpaper Video Dinamis:**
   * Tekan tombol <kbd>S</kbd> untuk membuka pengaturan ➔ pilih tab **Wallpaper**.
   * Pilih opsi *Video*, unggah video favorit Anda (`.mp4` atau `.webm`), lalu atur tingkat blur dan overlay gelap sesuai selera.
2. **Kustomisasi Gaya Jam & Warna:**
   * Di tab **Tampilan**, pilih gaya jam favorit Anda (misal: *Cyberpunk*, *Glassmorphism*, atau *Swiss*) dan tentukan warna aksen antarmuka.
3. **Mengatur Nama Panggilan di Header:**
   * Klik ikon avatar inisial Anda di pojok kanan atas atau buka tab **Umum**, lalu ganti nama pengguna sesuai keinginan untuk mendapatkan sapaan personal setiap saat.
4. **Fokus Belajar / Bekerja dengan Pomodoro:**
   * Klik kapsul **Focus (25:00)** di bawah jam untuk memulai sesi kerja terfokus dengan pengingat waktu dan kutipan motivasi.
5. **Mendengarkan Musik Lo-Fi Santai:**
   * Tekan tombol <kbd>P</kbd> kapan saja untuk memutar alunan radio lo-fi langsung dari dock bawah dashboard.

---

## 🤝 Kontribusi & Lisensi

Elyxora Tab dikembangkan dengan dedikasi untuk menghadirkan kenyamanan visual dan produktivitas terbaik saat menjelajahi web. 

Kontribusi berupa saran fitur, pelaporan kendala (*bug report*), atau pengajuan *Pull Request* sangat terbuka dan diapresiasi:
1. *Fork* repositori ini.
2. Buat *feature branch* baru (`git checkout -b feature/fitur-keren`).
3. Lakukan *commit* perubahan Anda (`git commit -m "feat: tambahkan fitur keren"`).
4. *Push* ke branch Anda (`git push origin feature/fitur-keren`).
5. Buka **Pull Request** di GitHub.

Proyek ini didistribusikan di bawah lisensi terbuka **[MIT License](LICENSE)**.

---

<p align="center">
  Dibuat dengan ❤️ oleh <a href="https://github.com/Rizkan25"><strong>Rizkan</strong></a> untuk komunitas web produktif di seluruh dunia.
</p>
