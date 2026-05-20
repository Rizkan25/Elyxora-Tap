# 🌟 Elyxora Tab - Personal New Tab Dashboard

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg?logo=google-chrome&logoColor=white)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](#)
[![Manifest](https://img.shields.io/badge/manifest-v3-orange.svg)](#)

**Elyxora Tab** adalah ekstensi Google Chrome kustomisasi halaman Tab Baru (*New Tab Page*) dengan tampilan dashboard modern, estetis, dan kaya fitur. Dirancang dengan gaya *glassmorphism* dan *neumorphism* premium untuk mempermudah navigasi harian Anda sambil memberikan visualisasi workspace yang memanjakan mata.

---

## ✨ Fitur Utama

### 1. 🗂️ Bookmark Visual Berbasis Grup (Tabbed Shortcuts)
*   Mengelompokkan pintasan link favorit Anda ke dalam tab kategori yang rapi.
*   Kemudahan untuk menambah, mengedit, menghapus, serta menyusun ulang posisi pintasan secara langsung.
*   Mendukung logo kustom via URL gambar maupun file galeri lokal.

### 2. 🔍 Multi-Search Engine & Suggestions
*   Kotak pencarian pintar yang terintegrasi dengan berbagai mesin pencari populer: **Google, Bing, Yahoo, dan DuckDuckGo**.
*   Saran pencarian (*Search Suggestions*) otomatis saat Anda mengetik untuk mempercepat proses pencarian.

### 3. 🕒 Widget Jam Kreatif & Dinamis
*   Personalisasi penuh ukuran jam (50% - 200%).
*   Berbagai macam pilihan gaya jam yang dapat disesuaikan dengan tema workspace Anda:
    *   *Swiss & Bold* (Klasik)
    *   *Glassmorphism* (Efek Kaca)
    *   *Cyberpunk* (Neon Berwarna)
    *   *Retro Digital* (Jam 7-Segment)
    *   *Gradient Rainbow* (Warna Pelangi)
    *   *Flip Clock* (Gaya Mekanis)
    *   *Border Tracer* (Jam dengan Efek Animasi Garis)

### 4. ⛅ Widget Prakiraan Cuaca Lokal
*   Menampilkan suhu dan cuaca di area lokal secara real-time.
*   Dilengkapi dengan prakiraan cuaca jangka pendek (forecast).
*   Mendukung pencarian kota spesifik atau pelacakan otomatis, serta konversi unit Celsius (°C) / Fahrenheit (°F).

### 5. 🎨 Wallpaper Engine & Efek Latar Belakang
*   Pilih latar belakang dari Galeri Bawaan, URL gambar eksternal, atau Unggah Wallpaper Anda sendiri.
*   Pengaturan efek visual real-time untuk **Blur** dan **Kecerahan (Brightness/Opacity)** latar belakang agar teks dan ikon tetap terbaca jelas.

---

## 🛠️ Cara Instalasi (Load Unpacked)

Karena ekstensi ini belum dipublikasikan di Chrome Web Store, Anda dapat menginstalnya secara manual menggunakan mode pengembang:

1.  **Unduh / Clone** repositori ini ke komputer Anda.
2.  Buka browser **Google Chrome** dan navigasikan ke alamat:
    ```txt
    chrome://extensions/
    ```
3.  Aktifkan **Mode pengembang (Developer mode)** di pojok kanan atas layar.
4.  Klik tombol **Muat ekstensi tidak dikemas (Load unpacked)** di pojok kiri atas.
5.  Pilih folder **Elyxora Tap** (folder yang berisi file `manifest.json`).
6.  Selesai! Sekarang buka tab baru di Chrome untuk melihat **Elyxora Tab** beraksi. 🎉

---

## 📁 Struktur Berkas

Berikut adalah gambaran struktur kode dari ekstensi ini:

```bash
Elyxora Tap/
├── manifest.json       # Konfigurasi utama ekstensi (Manifest V3)
├── newtab.html         # Struktur layout utama dashboard New Tab
├── style.css           # Desain visual, tema, dan animasi glassmorphism
├── newtab.js           # Logika core, jam dinamis, sapaan, dan integrasi cuaca
├── settings.js         # Pengelolaan panel pengaturan umum
├── groups.js           # Logika penataan grup dan pintasan bookmark
├── modal.js            # Manajemen transisi pop-up modal input
└── icons/              # Aset ikon logo ekstensi (16px, 48px, 128px)
```

---

## ⚙️ Cara Penggunaan & Kustomisasi

1.  **Membuka Pengaturan**: Klik ikon **Roda Gigi ⚙️** di pojok kanan bawah untuk masuk ke menu setelan.
2.  **Menambahkan Bookmark**: Klik tombol **Tambah Pintasan ➕** di pojok kanan bawah, masukkan URL, judul, dan atur grupnya.
3.  **Mengubah Wallpaper**: Di menu Pengaturan, pilih tab *Wallpaper* untuk mengunggah gambar baru dan gunakan slider *Blur* untuk memberikan efek estetik.
4.  **Mengubah Tampilan Jam**: Pilih tab *Tampilan* di menu Pengaturan untuk mengganti model jam dan ukuran elemen.

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan pembelajaran dan penggunaan pribadi. Anda bebas melakukan fork, memodifikasi, dan mendistribusikannya kembali.

*Dibuat untuk produktivitas yang lebih indah😉.*
