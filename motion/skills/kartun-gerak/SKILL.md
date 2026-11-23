---
name: kartun-gerak
description: Preset gaya visual diekstrak melalui chunking 6 segmen (@ 6.0s). Rata-rata pacing ~2.25s, palet master: #14427A, #0B0B0B, #FACC15, #38BDF8, #F97316. Wajib gunakan modul skill dan preset ini jika pengguna meminta animasi visual bertema 'Kartun Gerak' atau palet #14427A/#FACC15.
---

# AI Video Skill: Kartun Gerak (`kartun-gerak`)

Preset gaya visual ini digenerasi secara terprogram dari video referensi untuk memproduksi animasi gerak dinamis Remotion berbasis kode React, ilustrasi vektor SVG aman, dan pacing kinetik.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `2.25` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `1.6` hingga `3.1` detik.
- Jangan biarkan ada adegan statis tanpa pergantian visual atau punch in melebihi `3.1` detik.

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
- **Garis & Stroke:** `stroke='#0B0B0B' stroke-width='3.5' stroke-linejoin='round'`
- **Karakter / Elemen Objek:** Kontur tegas, proporsi tebal, cel-shaded solid
- **Latar Ilustrasi:** Latar #14427A dengan aksen #FACC15
- **KEAMANAN KODE SVG (100% Wajib Lolos `motion/svg-aman.mjs`):**
  - DILARANG menggunakan tag `<script>` apa pun.
  - DILARANG menggunakan atribut interaktif/event handler seperti `onload`, `onclick`, `onerror`, `onmouseover`.
  - Gunakan elemen standar SVG: `<svg viewBox="0 0 800 800">`, `<path>`, `<circle>`, `<rect>`, `<polygon>`, `<g>`, `<defs>`, `<linearGradient>`.

## 4. Tipografi & Tata Letak Layar
- **Font Utama:** `Plus Jakarta Sans, sans-serif`
- **Maksimal Kata Judul:** Maksimal `4` kata per adegan (`judul`).
- **Gaya Subtitle:** Mode `word-pop` di posisi `bottom-center` dengan stroke tebal `6px #0B0B0B`.

## 5. Fisika Gerak & Remotion Springs
- **Spring Stiffness:** `180`
- **Spring Damping:** `18`
- **Transisi Antar Adegan:** `zoom-punch`
- **Camera Shake on Impact:** `true`

## 6. Hasil Analisis Multi-Segmen Video Referensi (Chunked 6.0s)
Video referensi telah diiris menjadi 6 segmen waktu (@ ~6.0 detik per langkah) dan disintesis oleh AI Agent:

| Step | Rentang Waktu | Pacing | Scene Cuts | Palet Dominan Segmen |
|:---:|:---:|:---:|:---:|:---|
| **Step 1** | `0.0s - 6.0s` | ~2.0s | 2 cuts | `#14427A` `#0B0B0B` `#FACC15` |
| **Step 2** | `6.0s - 12.0s` | ~2.0s | 2 cuts | `#14427A` `#0B0B0B` `#FACC15` |
| **Step 3** | `12.0s - 18.0s` | ~3.0s | 1 cuts | `#14427A` `#0B0B0B` `#FACC15` |
| **Step 4** | `18.0s - 24.0s` | ~2.0s | 2 cuts | `#14427A` `#0B0B0B` `#FACC15` |
| **Step 5** | `24.0s - 30.0s` | ~3.0s | 1 cuts | `#14427A` `#0B0B0B` `#FACC15` |
| **Step 6** | `30.0s - 31.9s` | ~1.5s | 2 cuts | `#14427A` `#0B0B0B` `#FACC15` |
