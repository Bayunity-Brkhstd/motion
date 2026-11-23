---
name: blueprint
description: Preset gaya visual 'Blueprint Desain Teknik' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#0A2540`, `#38BDF8`, `#FFFFFF`, `#1E3A8A`, `#60A5FA`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Cyan Blueprint'.
---

# AI Video Skill: Blueprint Desain Teknik (`blueprint`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Cyan Blueprint.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#0A2540`
2. **Kontras / Teks Utama:** `#38BDF8`
3. **Warna Sekunder / Kartu:** `#FFFFFF`
4. **Warna Aksen 1:** `#1E3A8A`
5. **Warna Aksen 2:** `#60A5FA`

## 3. Fitur Visual Kunci
- Grid Matematika Putih Tipis
- Garis Ukuran Panah Dimensi Teknis
- Label Ukuran Metrik & Anotasi
- Kotak Etiket Judul Arsitektur

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Gambar teknik blueprint. Latar biru tua dengan grid putih tipis, semua objek digambar garis putih seperti rancangan. Ada garis ukuran dengan panah dan label (misalnya '4,50 m'), garis tengah putus-putus, dan kotak judul gambar di pojok.
```
