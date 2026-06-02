# 🌟 Elyxora Tab - Personal New Tab Dashboard

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg?logo=google-chrome&logoColor=white)](#)
[![Version](https://img.shields.io/badge/version-1.1.0-green.svg)](#)
[![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)](#)

<p align="center">
  <img src="https://i.ibb.co.com/cKPpZptj/911ec925-a66c-420a-aee2-9392e2ec3069.png" alt="Elyxora Tab Preview" width="100%" style="border-radius: 8px;" />
</p>

Halo teman-teman! 👋 Selamat datang di **Elyxora Tab**.

Ekstensi ini dibuat khusus untuk mengubah tab baru kamu menjadi sebuah dashboard personal yang **super estetik, minimalis, dan fungsional**. Dengan perpaduan gaya _glassmorphism_ (efek kaca transparan) dan _neumorphism_ modern, dijamin mata kamu bakal dimanjakan setiap kali membuka tab baru!

---

## ✨ Fitur-Fitur Keren (Apa aja sih fiturnya?)

Berikut beberapa fitur seru yang bisa kamu nikmati dan kustomisasi sesuka hati:

### 1. 🗂️ Kelompokkan Link Favoritmu (Tabbed Shortcuts)

- Biar gak berantakan, kamu bisa membagi pintasan situs web (_bookmark_) favorit ke dalam berbagai kategori grup (misalnya: "Kerjaan", "Sosmed", "Hiburan", "Kuliah").
- Tinggal klik, kamu bisa tambah, edit, atau hapus pintasan secara langsung.
- Bisa pasang ikon kustom menggunakan URL gambar dari internet maupun mengunggah file gambar langsung dari komputermu.

### 2. 🔍 Cari Apa Saja, Bebas Pilih Engine! (Multi-Search Engine)

- Bisa ganti-ganti mesin pencari (Google, Bing, Yahoo, dan DuckDuckGo) dengan sekali klik pada ikon di sebelah kiri kolom pencarian.
- Dilengkapi fitur **Search Suggestions** (saran kata kunci) otomatis saat kamu mulai mengetik biar pencarian makin cepat dan _sat-set_!

### 3. 🕒 Jam Dinamis dengan Berbagai Gaya Keren

Bosan dengan tampilan jam digital yang standar? Sesuaikan gaya jamnya dengan kepribadian kamu:

- _Swiss & Bold_ (Bergaya minimalis eropa)
- _Glassmorphism_ (Efek kaca blur transparan yang elegan)
- _Cyberpunk_ (Glow neon yang futuristik)
- _Retro Digital_ (Jam klasik 7-segment)
- _Gradient Rainbow_ (Warna gradasi pelangi yang hidup)
- _Flip Clock_ (Gaya jam mekanis klasik)
- _Border Tracer_ (Animasi garis berjalan mengelilingi jam)
- _Ukuran Jam_: Bisa diperbesar atau diperkecil sesuka hati (dari 50% hingga 200%).

### 4. ⛅ Widget Cuaca Real-Time

- Pantau suhu dan kondisi cuaca di lokasi kamu saat ini secara langsung di pojok kanan atas.
- Bisa menampilkan prakiraan cuaca jangka pendek (_weather forecast_).
- Mendukung pencarian kota tertentu dan konversi unit suhu antara Celsius (°C) dan Fahrenheit (°F).

### 5. 🎨 Wallpaper Engine & Pengatur Efek Latar Belakang

- Bisa pakai wallpaper default yang disediakan, menempelkan link gambar eksternal, atau **unggah foto kamu sendiri**.
- Ada slider untuk mengatur tingkat **Blur** dan **Kecerahan (Brightness/Opacity)** gambar latar belakang secara _real-time_ agar tulisan di tab baru kamu tetap terbaca dengan jelas.

### 6. 👋 Sapaan Personal yang Ramah

- Kamu bisa memasukkan nama panggilanmu di panel pengaturan.
- Setiap kali kamu membuka tab baru, dashboard akan menyapamu secara hangat (contoh: _"Selamat Pagi, Kak Rizkan"_ atau _"Selamat Malam, Kak"_).

---

## 🚀 Performa & Teknologi Under the Hood

Kami juga baru saja merombak ulang (_refactor_) sisi performa agar ekstensi ini berjalan sangat ringan (bahkan di perangkat kentang sekalipun):

- **Parallax GPU Acceleration:** Animasi pergerakan _background_ saat mouse digerakkan (efek parallax) kini berjalan disinkronkan penuh dengan _refresh rate_ layar menggunakan `requestAnimationFrame`. Hal ini menghemat CPU dan RAM secara drastis serta memberikan efek **60+ FPS** yang ekstra mulus anti-patah!
- **Zero-Jank CSS Rendering:** Peralihan tema jam dan form pencarian kini memanfaatkan _CSS Class Injection_ secara native ketimbang mengubah atribut `style` lewat JavaScript. Meringankan kerja _engine browser_ (minim _Repaint & Reflow_) dan mempercepat _load-time_.
- **Clean & Responsive Mobile CSS:** Pengaturan gaya secara dinamis akan langsung menyesuaikan dengan sangat proporsional ketika jendela browser dikecilkan.

---

## 🛠️ Cara Pasang di Browser Kamu (Gampang Banget!)

Karena ekstensi ini masih dalam tahap pengembangan mandiri (belum dipublikasikan ke Chrome Web Store), kamu bisa memasangnya secara manual dengan cara berikut:

1.  **Download / Clone** repositori ini ke dalam komputermu.
2.  Buka browser **Google Chrome**, lalu masuk ke halaman ekstensi dengan mengetik alamat berikut pada URL bar:
    ```txt
    chrome://extensions/
    ```
3.  Aktifkan opsi **Mode pengembang (Developer mode)** di pojok kanan atas layar.
4.  Klik tombol **Muat ekstensi tidak dikemas (Load unpacked)** di pojok kiri atas.
5.  Pilih folder proyek **Elyxora Tap** (pilih folder induk yang langsung berisi file `manifest.json`).
6.  Selesai! Sekarang coba buka tab baru di Chrome kamu. Selamat menikmati dashboard barumu! 🎉

---

## 📁 Struktur Berkas Proyek

Bagi kamu yang penasaran dengan isi di balik layar, berikut struktur berkasnya:

```bash
Elyxora Tap/
├── manifest.json       # Otak ekstensi (konfigurasi Manifest V3 untuk Chrome)
├── newtab.html         # Struktur layout utama dashboard tab baru
├── style.css           # Bumbu rahasia kecantikan visual & kelas CSS
├── clean_css.js        # Script Node.js buatan untuk membersihkan & meminifikasi CSS
├── js/                 # Folder logika inti Javascript
│   ├── theme.js        # Mengendalikan tema dinamis, parallax, & UI Engine
│   ├── settings.js     # Pengelola panel kustomisasi/setelan dashboard
│   ├── groups.js       # Logika pembuatan grup tab & kelola link bookmark
│   └── modal.js        # Pengatur animasi pop-up (dialog box)
├── _locales/           # Berisi file translasi multi-bahasa (i18n)
└── icons/              # Berbagai ukuran ikon resmi Elyxora Tab (16px, 48px, 128px)
```

---

_Dibuat untuk produktivitas yang lebih baik dan indah 😉._
