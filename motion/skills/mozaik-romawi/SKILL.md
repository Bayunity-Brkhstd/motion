---
name: mozaik-romawi
description: Preset gaya visual 'Mozaik Batu Romawi Kuno' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~4.0s, palet master: `#1C1917`, `#78350F`, `#9A3412`, `#D97706`, `#FEF3C7`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Stone Mosaic'.
---

# AI Video Skill: Mozaik Batu Romawi Kuno (`mozaik-romawi`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Stone Mosaic.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `4.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#1C1917`
2. **Kontras / Teks Utama:** `#78350F`
3. **Warna Sekunder / Kartu:** `#9A3412`
4. **Warna Aksen 1:** `#D97706`
5. **Warna Aksen 2:** `#FEF3C7`

## 3. Fitur Visual Kunci
- Grid Ubin Batu Kotak-Kotak Kecil
- Sela-Sela Semen Nat Gelap Alami
- Warna Terakota Tanah Liat Kuno
- Bingkai Ornamen Geometris Romawi

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Mozaik batu kuno. Gambar adegan dulu di kanvas tersembunyi yang sangat kecil (sekitar 46x82), lalu ubah tiap piksel jadi ubin batu kecil dengan nat gelap di antaranya. Warna tiap ubin sedikit acak dan posisinya sedikit miring. Palet tanah: krem, terakota, biru laut. Bingkai pola ubin coklat-emas di sekeliling.
```
