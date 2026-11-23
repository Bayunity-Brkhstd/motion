---
name: pixel-art
description: Preset gaya visual 'Pixel Art 16-Bit Retro' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.0s, palet master: `#181425`, `#3A4466`, `#E43B44`, `#FEE761`, `#63C74D`. Gunakan modul skill ini saat memproduksi animasi bergaya '16-Bit Pixel'.
---

# AI Video Skill: Pixel Art 16-Bit Retro (`pixel-art`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika 16-Bit Pixel.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#181425`
2. **Kontras / Teks Utama:** `#3A4466`
3. **Warna Sekunder / Kartu:** `#E43B44`
4. **Warna Aksen 1:** `#FEE761`
5. **Warna Aksen 2:** `#63C74D`

## 3. Fitur Visual Kunci
- Grid Piksel Murni 16-Bit
- Palet Warna Terbatas (Retro Palette)
- Efek Dither & Langit Bertingkat
- Gerakan Objek Step-by-Step

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Pixel art ala game 16-bit. Gambar di resolusi kecil (sekitar 135x240) lalu perbesar tanpa penghalusan agar kotak-kotak pikselnya terlihat. Palet warna terbatas (16-24 warna), langit senja bergradasi bertingkat, jendela gedung kotak kecil yang menyala.
```
