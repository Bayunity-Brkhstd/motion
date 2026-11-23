---
name: batik
description: Preset gaya visual 'Batik Nusantara Sogan & Kawung' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.8s, palet master: `#2C1810`, `#78350F`, `#D97706`, `#FDE68A`, `#451A03`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Batik Tradisional'.
---

# AI Video Skill: Batik Nusantara Sogan & Kawung (`batik`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Batik Tradisional.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.8` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#2C1810`
2. **Kontras / Teks Utama:** `#78350F`
3. **Warna Sekunder / Kartu:** `#D97706`
4. **Warna Aksen 1:** `#FDE68A`
5. **Warna Aksen 2:** `#451A03`

## 3. Fitur Visual Kunci
- Pola Geometris Kawung & Parang Rusak
- Warna Klasik Sogan & Emas Keraton
- Tekstur Garis Retakan Lilin Canting
- Pita Border Ornamen Batik Atas-Bawah

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Nuansa batik Indonesia: langit bermotif kawung, bangunan bermotif parang, lantai motif truntum, warna sogan (coklat tua, coklat keemasan, krem). Objek utama oranye dengan tekstur motif tipis dan garis tepi krem, matahari berbentuk bunga kawung, pita batik di atas dan bawah.
```
