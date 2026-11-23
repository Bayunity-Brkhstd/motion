---
name: cetak-kayu-jepang
description: Preset gaya visual 'Cetak Kayu Jepang Ukiyo-e' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.8s, palet master: `#0F1E36`, `#1D3557`, `#457B9D`, `#E63946`, `#F1FAEE`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Ukiyo-e Wave'.
---

# AI Video Skill: Cetak Kayu Jepang Ukiyo-e (`cetak-kayu-jepang`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Ukiyo-e Wave.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.8` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#0F1E36`
2. **Kontras / Teks Utama:** `#1D3557`
3. **Warna Sekunder / Kartu:** `#457B9D`
4. **Warna Aksen 1:** `#E63946`
5. **Warna Aksen 2:** `#F1FAEE`

## 3. Fitur Visual Kunci
- Buih Ombak Melengkung Berbentuk Cakar
- Palet Nila Indigo & Biru Laut Klasik
- Awan Garis Horizontal Pipih Berlapis
- Stempel Hanko Cap Merah di Pojok

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Cetakan balok kayu ala Jepang klasik di kertas krem bertekstur. Warna terbatas: nila, biru, biru muda, krem, dan merah bata. Garis tepi tegas dengan tebal yang sama, ombak besar bergulung dengan buih putih berbentuk cakar, garis air berlapis, awan berupa garis datar, dan stempel merah vertikal di pojok.
```
