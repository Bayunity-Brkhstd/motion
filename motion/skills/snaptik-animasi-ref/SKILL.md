---
name: snaptik-animasi-ref
description: Preset gaya visual diekstrak melalui chunking 4 segmen (@ 8.0s). Rata-rata pacing ~3.33s, palet master: #9B937C, #5D5A62, #3F404D, #282836, #F7E2C7. Wajib gunakan modul skill dan preset ini jika pengguna meminta animasi visual bertema 'Snaptik Animasi Ref' atau palet #9B937C/#3F404D.
---

# AI Video Skill: Snaptik Animasi Ref (`snaptik-animasi-ref`)

Preset gaya visual ini digenerasi secara terprogram dari video referensi untuk memproduksi animasi gerak dinamis Remotion berbasis kode React, ilustrasi vektor SVG aman, dan pacing kinetik.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.33` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.3` hingga `4.7` detik.
- Jangan biarkan ada adegan statis tanpa pergantian visual atau punch in melebihi `4.7` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#9B937C`
2. **Kontras / Teks Utama:** `#5D5A62`
3. **Warna Sekunder / Kartu:** `#3F404D`
4. **Warna Aksen 1:** `#282836`
5. **Warna Aksen 2:** `#F7E2C7`

## 3. Standar Baku Ilustrasi SVG (`gambar?: string`)
Seluruh ilustrasi adegan yang dibuat oleh AI Director dan dimasukkan ke properti `gambar` WAJIB mematuhi:
- **Gaya Visual:** 3D cel-shaded toon outline / flat kinetic vector
- **Garis & Stroke:** `stroke='#5D5A62' stroke-width='3.5' stroke-linejoin='round'`
- **Karakter / Elemen Objek:** Kontur tegas, proporsi tebal, cel-shaded solid
- **Latar Ilustrasi:** Latar #9B937C dengan aksen #3F404D
- **KEAMANAN KODE SVG (100% Wajib Lolos `motion/svg-aman.mjs`):**
  - DILARANG menggunakan tag `<script>` apa pun.
  - DILARANG menggunakan atribut interaktif/event handler seperti `onload`, `onclick`, `onerror`, `onmouseover`.
  - Gunakan elemen standar SVG: `<svg viewBox="0 0 800 800">`, `<path>`, `<circle>`, `<rect>`, `<polygon>`, `<g>`, `<defs>`, `<linearGradient>`.

## 4. Tipografi & Tata Letak Layar
- **Font Utama:** `Plus Jakarta Sans, sans-serif`
- **Maksimal Kata Judul:** Maksimal `4` kata per adegan (`judul`).
- **Gaya Subtitle:** Mode `word-pop` di posisi `bottom-center` dengan stroke tebal `6px #5D5A62`.

## 5. Fisika Gerak & Remotion Springs
- **Spring Stiffness:** `180`
- **Spring Damping:** `18`
- **Transisi Antar Adegan:** `zoom-punch`
- **Camera Shake on Impact:** `true`

## 6. Hasil Analisis Multi-Segmen Video Referensi (Chunked 8.0s)
Video referensi telah diiris menjadi 4 segmen waktu (@ ~8.0 detik per langkah) dan disintesis oleh AI Agent:

| Step | Rentang Waktu | Pacing | Scene Cuts | Palet Dominan Segmen |
|:---:|:---:|:---:|:---:|:---|
| **Step 1** | `0.0s - 8.0s` | ~2.67s | 2 cuts | `#9B937C` `#5D5A62` `#3F404D` |
| **Step 2** | `8.0s - 16.0s` | ~4.0s | 1 cuts | `#BDA16C` `#796E66` `#6E4E40` |
| **Step 3** | `16.0s - 24.0s` | ~2.67s | 2 cuts | `#A0896A` `#68554D` `#883E28` |
| **Step 4** | `24.0s - 31.9s` | ~3.97s | 1 cuts | `#F9EED9` `#C0B2A3` `#807774` |
