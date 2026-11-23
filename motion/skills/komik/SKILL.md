---
name: komik
description: Preset gaya visual 'Komik Halftone Pop-Art' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~2.8s, palet master: `#DC2626`, `#2563EB`, `#FACC15`, `#111827`, `#FFFFFF`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Pop-Art Comic'.
---

# AI Video Skill: Komik Halftone Pop-Art (`komik`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Pop-Art Comic.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `2.8` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#DC2626`
2. **Kontras / Teks Utama:** `#2563EB`
3. **Warna Sekunder / Kartu:** `#FACC15`
4. **Warna Aksen 1:** `#111827`
5. **Warna Aksen 2:** `#FFFFFF`

## 3. Fitur Visual Kunci
- Titik-Titik Halftone Screen Ben-Day
- Outline Hitam Kontur Tebal Tegas
- Balon Onomatopoeia Efek Suara
- Garis Kecepatan Aksi Kinetik

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Gaya buku komik. Outline hitam tebal, warna primer datar (merah, biru, kuning), latar titik-titik halftone, garis kecepatan di belakang objek. Tulisan efek suara besar seperti 'VROOM!' dan 'BRUK!' di dalam balon bergerigi, semuanya di dalam bingkai panel komik.
```
