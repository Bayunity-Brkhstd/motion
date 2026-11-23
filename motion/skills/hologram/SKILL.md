---
name: hologram
description: Preset gaya visual 'Hologram Sci-Fi Proyeksi HUD' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.0s, palet master: `#020C1B`, `#00F0FF`, `#0077FE`, `#7000FF`, `#E0F7FA`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Sci-Fi Hologram'.
---

# AI Video Skill: Hologram Sci-Fi Proyeksi HUD (`hologram`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Sci-Fi Hologram.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#020C1B`
2. **Kontras / Teks Utama:** `#00F0FF`
3. **Warna Sekunder / Kartu:** `#0077FE`
4. **Warna Aksen 1:** `#7000FF`
5. **Warna Aksen 2:** `#E0F7FA`

## 3. Fitur Visual Kunci
- Proyeksi Garis Cyan Neon Glowing
- Garis Pindai Scanline Bergerak Vertikal
- Piringan Emitter Proyektor Lantai
- Radar & Kotak Target Pelacak HUD

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Proyeksi hologram futuristik: latar biru gelap, semua objek garis cyan bercahaya dengan isian tembus pandang yang berkedip halus, scanline bergerak, piringan proyektor bercahaya di lantai, grid perspektif. Tambahkan HUD: kotak siku di sekitar objek utama dengan label, panel data kecil, radar berputar, teks status di pojok.
```
