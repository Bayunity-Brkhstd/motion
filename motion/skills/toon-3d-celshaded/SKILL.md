---
name: toon-3d-celshaded
description: Preset gaya visual dinamis diekstrak dari video referensi dengan pacing 3.2s dan palet warna #14427A, #0B0B0B, #FACC15, #38BDF8, #F97316. Wajib gunakan modul skill dan preset ini jika pengguna meminta animasi visual bertema 'Toon 3D Celshaded' atau palet #14427A/#FACC15.
---

# AI Video Skill: Toon 3D Celshaded (`toon-3d-celshaded`)

Preset gaya visual ini digenerasi secara terprogram dari video referensi untuk memproduksi animasi gerak dinamis Remotion berbasis kode React, ilustrasi vektor SVG aman, dan pacing kinetik.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.2` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.2` hingga `4.5` detik.
- Jangan biarkan ada adegan statis tanpa pergantian visual atau punch in melebihi `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#14427A`
2. **Kontras / Teks Utama:** `#0B0B0B`
3. **Warna Sekunder / Kartu:** `#FACC15`
4. **Warna Aksen 1:** `#38BDF8`
5. **Warna Aksen 2:** `#F97316`

## 3. Standar Baku Ilustrasi SVG (`gambar?: string`)
Seluruh ilustrasi adegan yang dibuat oleh AI Director dan dimasukkan ke properti `gambar` WAJIB mematuhi:
- **Gaya Visual:** 3D cel-shaded toon outline / flat kinetic vector
- **Garis & Stroke:** `stroke='#0B0B0B' stroke-width='3.5' stroke-linejoin='round' stroke-linecap='round'`
- **Karakter / Elemen Objek:** Proporsi tebal, kontur tegas, highlight warna aksen, bayangan solid tanpa gradasi buram
- **Latar Ilustrasi:** Latar #14427A dengan elemen aksen #FACC15 dan kisi berjarak dinamis
- **KEAMANAN KODE SVG (100% Wajib Lolos `motion/svg-aman.mjs`):**
  - DILARANG menggunakan tag `<script>` apa pun.
  - DILARANG menggunakan atribut interaktif/event handler seperti `onload`, `onclick`, `onerror`, `onmouseover`.
  - Gunakan elemen standar SVG: `<svg viewBox="0 0 800 800">`, `<path>`, `<circle>`, `<rect>`, `<polygon>`, `<g>`, `<defs>`, `<linearGradient>`.

## 4. Tipografi & Tata Letak Layar
- **Font Utama:** `Plus Jakarta Sans, Montserrat, sans-serif`
- **Maksimal Kata Judul:** Maksimal `4` kata per adegan (`judul`).
- **Gaya Subtitle:** Mode `word-pop` di posisi `bottom-center` dengan stroke tebal `6px #0B0B0B`.

## 5. Fisika Gerak & Remotion Springs
- **Spring Stiffness:** `180`
- **Spring Damping:** `18`
- **Transisi Antar Adegan:** `zoom-punch`
- **Camera Shake on Impact:** `true`
