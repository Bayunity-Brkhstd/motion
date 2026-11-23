---
name: tinta-sumie
description: Preset gaya visual 'Tinta Hitam Sumi-e Kaligrafi' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~4.0s, palet master: `#FAFAF9`, `#1C1917`, `#44403C`, `#A8A29E`, `#DC2626`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Sumi-e Ink'.
---

# AI Video Skill: Tinta Hitam Sumi-e Kaligrafi (`tinta-sumie`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Sumi-e Ink.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `4.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#FAFAF9`
2. **Kontras / Teks Utama:** `#1C1917`
3. **Warna Sekunder / Kartu:** `#44403C`
4. **Warna Aksen 1:** `#A8A29E`
5. **Warna Aksen 2:** `#DC2626`

## 3. Fitur Visual Kunci
- Sapuan Kuas Kaligrafi Kuat & Mengalir
- Resapan Tinta Basah Alami (Ink Bleed)
- Ruang Negatif Luas Harmonis (Zen)
- Stempel Segel Merah Pojok Layar

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Lukisan tinta hitam ala Asia Timur di kertas beras krem bertekstur. Sapuan kuas yang tebal di awal lalu menipis di ujung, tepi sedikit buram seperti tinta meresap. Banyak ruang kosong, batang bambu beruas dengan daun dari satu sapuan, dan satu stempel merah kecil di pojok.
```
