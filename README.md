# 🌟 Elyxora Tab - Personal New Tab Dashboard

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg?logo=google-chrome&logoColor=white)](#)
[![Version](https://img.shields.io/badge/version-1.1.0-green.svg)](#)
[![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-purple.svg)](#)

<p align="center">
  <img src="https://i.ibb.co.com/cKPpZptj/911ec925-a66c-420a-aee2-9392e2ec3069.png" alt="Elyxora Tab Preview" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.3);" />
</p>

Selamat datang di **Elyxora Tab**! 🎉

**Elyxora Tab** adalah ekstensi peramban modern berbasis **Manifest V3** yang dirancang untuk mentransformasi halaman *New Tab* Google Chrome menjadi sebuah *dashboard* personal yang **super estetik, berkecepatan tinggi, responsif di semua perangkat, dan kaya fitur kustomisasi**. Mengusung perpaduan desain *Glassmorphism* mutakhir, efek *blur* transparan, dan akselerasi GPU perangkat keras, Elyxora Tab memberikan kenyamanan visual sekaligus produktivitas harian yang maksimal.

---

## 📑 Daftar Isi
- [✨ Fitur Utama & Kustomisasi](#-fitur-utama--kustomisasi)
  - [1. 🎬 Live Video Wallpaper & Wallpaper Engine](#1--live-video-wallpaper--wallpaper-engine)
  - [2. 🗂️ Manajemen Pintasan & Grup Pintar](#2-️-manajemen-pintasan--grup-pintar)
  - [3. 🔍 Multi-Engine Search Bar & Real-time Suggestions](#3--multi-engine-search-bar--real-time-suggestions)
  - [4. 🕒 Widget Jam Dinamis & Kalender](#4--widget-jam-dinamis--kalender)
  - [5. ⛅ Widget Cuaca Real-Time & Prakiraan](#5--widget-cuaca-real-time--prakiraan)
  - [6. 💾 Manajemen Data (Export / Import Backup)](#6--manajemen-data-export--import-backup)
  - [7. 🌐 Dukungan Multi-Bahasa (i18n)](#7--dukungan-multi-bahasa-i18n)
- [🚀 Performa & Arsitektur "Under the Hood"](#-performa--arsitektur-under-the-hood)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🛠️ Panduan Instalasi](#️-panduan-instalasi)
- [⚙️ Penggunaan & Konfigurasi](#️-penggunaan--konfigurasi)
- [🤝 Kontribusi](#-kontribusi--lisensi)

---

## ✨ Fitur Utama & Kustomisasi

### 1. 🎬 Live Video Wallpaper & Wallpaper Engine
Ubah suasana tab baru Anda dengan latar belakang bergerak maupun gambar berkualitas tinggi tanpa membuat komputer atau laptop menjadi lambat:
* **Dukungan Format Video Dinamis (`.mp4`, `.webm`):** Pasang video beresolusi hingga 4K sebagai *Live Wallpaper*. Video diproses langsung melalui *hardware decoding* GPU.
* **Penyimpanan Berkapasitas Besar via IndexedDB:** File video disimpan langsung di *IndexedDB* lokal sehingga tidak membebani `chrome.storage.local` dan mencegah *tab freeze*.
* **Batas Ukuran Video Fleksibel (Size Limit Selector):** Pilihan pembatasan berkas manual (50MB, 100MB, 200MB, 500MB, hingga **Unlimited**) dengan validasi pintar.
* **Auto-Pause Ramah Sumber Daya:** Saat berpindah tab atau meminimalkan browser, sistem mendeteksi melalui `document.visibilityState` dan otomatis menjeda pemutaran video untuk menghemat penggunaan RAM, CPU, dan baterai.
* **Pengaturan Tipe Wallpaper Lengkap:**
  * `Fill` & `Parallax`: Memenuhi layar secara proporsional (*cover*).
  * `Fit`: Menampilkan seluruh bidang video/gambar tanpa terpotong (*contain*).
  * `Stretch`: Menyesuaikan layar penuh (*fill 100%*).
  * `Center / Tile`: Menampilkan resolusi asli di tengah layar.
  * `No Image / None`: Menonaktifkan latar belakang gambar/video.
* **Efek Latar Belakang Real-Time:** Slider *Blur* (0–50px), *Dark Overlay* (0–100%), dan *Parallax Depth Control* (0–100%).
* **Kompresi Gambar Otomatis:** Unggahan gambar statis dikonversi secara instan ke format *WebP* berkualitas tinggi dengan kompresi cerdas untuk waktu muat instan.

### 2. 🗂️ Manajemen Pintasan & Grup Pintar
Kelola ratusan situs favorit dengan mudah dan rapi:
* **Grup Tab Terkategori:** Pisahkan link berdasarkan kategori (misal: *Kerja*, *Sosial Media*, *Belajar*, *Hiburan*, dll.).
* **Favicon Auto-Fetcher & Custom Icon Upload:** Ambil ikon situs secara otomatis dari web, masukkan URL gambar eksternal, atau unggah ikon kustom dari komputer.
* **Transisi Animasi Grup Mewah:** Pilihan efek animasi saat berganti tab (*Fade Up*, *Cascade Fade In*, *Coming from Left*, *Zoom In*, *Rotate*, *Stretch*).
* **Grid Layout Responsif Konsisten:** Tampilan tata letak kartu pintasan yang proporsional dan memiliki jarak (*gap*) yang konsisten di semua resolusi monitor, laptop, maupun layar *smartphone*.
* **Pengaturan Interaksi:** Opsi membuka link di tab baru atau tab aktif, serta konfirmasi sebelum menghapus pintasan.

### 3. 🔍 Multi-Engine Search Bar & Real-time Suggestions
Pencarian cepat tanpa hambatan:
* **Dukungan Banyak Mesin Pencari:** Beralih instan antara **Google**, **Bing**, **DuckDuckGo**, **Yahoo**, **Ecosia**, **Brave**, **Baidu**, dan **Yandex** cukup dengan mengklik ikon mesin pencari.
* **Search Suggestions Terintegrasi:** Menampilkan rekomendasi kata kunci secara *real-time* saat mengetik dengan optimasi *debounce* agar pencarian hemat kuota dan responsif.
* **Navigasi Keyboard:** Pilih saran pencarian menggunakan tombol panah atas/bawah dan `Enter`.

### 4. 🕒 Widget Jam Dinamis & Kalender
Pusat informasi waktu yang elegan dan dapat disesuaikan:
* **Pilihan Gaya Jam Artistik:**
  * *Swiss & Bold* (Minimalis & Modern)
  * *Glassmorphism* (Efek Kaca Semi-Transparan)
  * *Cyberpunk* (Glow Neon Futuristik)
  * *Retro Digital* (Klasik 7-Segment)
  * *Gradient Rainbow* (Warna Gradasi Hidup)
  * *Flip Clock* (Mekanikal Retro)
  * *Border Tracer* (Animasi Garis Berpendar Mengitari Jam)
* **Pengaturan Format & Skala:** Pilihan format 12-Jam (AM/PM) atau 24-Jam, tampilkan/sembunyikan detik, tampilkan/sembunyikan tanggal, dan penyesuaian ukuran jam (50% hingga 200%).
* **Sapaan Personal Berdasarkan Waktu:** Ucapan salam hangat sesuai waktu (*Selamat Pagi*, *Selamat Siang*, *Selamat Sore*, *Selamat Malam*) dipadukan dengan nama panggilan kustom Anda.

### 5. ⛅ Widget Cuaca Real-Time & Prakiraan
Pantau kondisi atmosfer terkini langsung dari dashboard:
* **Deteksi Lokasi Otomatis & Pencarian Kota:** Menggunakan Geolocation API atau ketik nama kota spesifik dengan fitur *Autocomplete Suggestions*.
* **Data Meteorologi Lengkap:** Suhu saat ini, cuaca (cerah, hujan, berawan, dll.), kelembapan udara, kecepatan angin, dan prakiraan cuaca beberapa hari ke depan.
* **Konversi Unit Suhu:** Mendukung Celsius (°C) dan Fahrenheit (°F) dengan UI yang ringkas dan sejajar rapi.
* **Pengatur Transparansi:** Tingkat visibilitas dan transparansi widget cuaca dapat diatur secara terpisah.

### 6. 💾 Manajemen Data (Export / Import Backup)
Jangan khawatir kehilangan susunan pintasan dan pengaturan favorit Anda:
* **One-Click Export:** Ekspor seluruh konfigurasi, grup, bookmark, dan pengaturan ekstensi ke dalam satu berkas `.json`.
* **Instant Import:** Pulihkan (*restore*) pengaturan kapan saja di peramban atau perangkat baru dalam hitungan detik.

### 7. 🌐 Dukungan Multi-Bahasa (i18n)
* Mendukung penuh Bahasa Indonesia (`id`) dan Bahasa Inggris (`en`), siap menyapa pengguna global dengan mudah.

---

## 🚀 Performa & Arsitektur "Under the Hood"

Elyxora Tab dirancang dengan standar kode modern agar menghasilkan pengalaman pengguna 60+ FPS tanpa hambatan:

| Komponen | Implementasi & Manfaat Teknis |
| :--- | :--- |
| **Penyimpanan Media** | Menggunakan **IndexedDB** (`idb.js`) untuk video/blob berat, menjamin `chrome.storage.local` tetap ringan dan bebas lag sinkronisasi. |
| **Akselerasi GPU** | Memanfaatkan instruksi CSS hardware compositing (`transform: translate3d`, `will-change`, `backface-visibility: hidden`) untuk rendering *glassmorphism* di semua ukuran layar. |
| **Parallax Engine** | Dijalankan melalui `requestAnimationFrame` untuk memastikan pergerakan latar belakang bergerak halus mengikuti *refresh rate* monitor tanpa lonjakan CPU. |
| **Arsitektur Modular** | Mengadopsi **ES Modules (ESM)** native (`import` / `export`) yang membagi logika ke modul-modul independen yang bersih dan mudah dikembangkan. |
| **Keamanan Manifest V3** | Bebas dari `eval()` atau skrip eksternal berbahaya, memenuhi seluruh standar keamanan dan privasi terbaru dari Google Chrome Extension platform. |

---

## 📁 Struktur Proyek

```bash
Elyxora Tap/
├── manifest.json          # Konfigurasi ekstensi Chrome Manifest V3
├── newtab.html            # Markup struktur tampilan dashboard utama & modal
├── style.css              # Styling utama, tema, animasi, & sistem glassmorphism
├── clean_css.js           # Utilitas pembersih/optimasi berkas CSS
├── _locales/              # Skema multi-bahasa internasionalisasi (i18n)
│   ├── en/messages.json   # Terjemahan Bahasa Inggris
│   └── id/messages.json   # Terjemahan Bahasa Indonesia
├── icons/                 # Aset ikon ekstensi (16px, 48px, 128px)
└── js/                    # Modul-modul logika JavaScript (ES6 Modules)
    ├── main.js            # Titik masuk (entry point) inisialisasi aplikasi
    ├── state.js           # State manager pusat & sinkronisasi storage
    ├── theme.js           # Engine tema, visual wallpaper, parallax & GPU effects
    ├── settings.js        # Pengendali modal pengaturan & live preview
    ├── groups.js          # Pengelola grup pintasan, rendering kartu & bookmark
    ├── clock.js           # Logika waktu, sapaan dinamis & format kalender
    ├── weather.js         # Pengambil data cuaca, geolokasi & API Open-Meteo
    ├── modal.js           # Sistem dialog pop-up, form modal & notifikasi
    ├── idb.js             # Abstraksi IndexedDB untuk file video & blob besar
    ├── i18n.js            # Parser & penemu teks terjemahan internasional
    └── utils.js           # Fungsi pembantu (debounce, sanitizer, helpers)
```

---

## 🛠️ Panduan Instalasi

Bagi Anda yang ingin menguji atau memasang Elyxora Tab secara manual di peramban Google Chrome:

1. **Unduh / Clone Repositori:**
   ```bash
   git clone https://github.com/username/elyxora-tab.git
   ```
   *(Atau download file ZIP proyek dan ekstrak ke folder komputer Anda)*.

2. **Buka Halaman Ekstensi Chrome:**
   Ketik alamat berikut di bar URL browser Anda:
   ```text
   chrome://extensions/
   ```

3. **Aktifkan Developer Mode:**
   Nyalakan tombol toggle **Developer mode** (Mode Pengembang) di pojok kanan atas.

4. **Muat Ekstensi:**
   * Klik tombol **Load unpacked** (Muat ekstensi tidak dikemas) di pojok kiri atas.
   * Arahkan dan pilih folder direktori **Elyxora Tap** (folder yang berisi `manifest.json`).

5. **Selesai!** 
   Buka tab baru (**Ctrl + T** atau **Cmd + T**) dan nikmati tampilan baru Elyxora Tab Anda. ✨

---

## ⚙️ Penggunaan & Konfigurasi

1. **Membuka Panel Pengaturan:** Klik ikon gerigi (⚙️) di pojok kanan bawah dashboard.
2. **Mengubah Wallpaper:** Masuk ke tab **Latar Belakang**, pilih mode *Video*, *Unggah Berkas*, atau *URL*, lalu atur batas ukuran dan efek blur/kecerahan.
3. **Mengatur Gaya Jam:** Masuk ke tab **Tampilan & Jam**, pilih tema jam yang disukai, format 12h/24h, serta ukurannya.
4. **Menambah Grup & Bookmark Baru:** Klik tombol **+ Tambah Grup** atau tombol **+** di dalam grup yang aktif untuk menambahkan pintasan situs favorit Anda.
5. **Menyimpan Perubahan:** Klik **Simpan Pengaturan** dan perubahan akan langsung diterapkan seketika tanpa perlu me-reload halaman!

---

## 🤝 Kontribusi

Untuk meningkatkan kenyamanan, estetika, dan produktivitas harian Anda dalam berselancar di dunia web. 

Kontribusi, saran perbaikan, maupun pelaporan *bug* sangat diapresiasi melalui *Pull Request* atau *Issue*.
