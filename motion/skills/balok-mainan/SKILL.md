---
name: balok-mainan
description: Preset gaya visual 'Balok Mainan Plastik 3D' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.0s, palet master: `#EF4444`, `#3B82F6`, `#EAB308`, `#22C55E`, `#F8FAFC`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Plastic Bricks'.
---

# AI Video Skill: Balok Mainan Plastik 3D (`balok-mainan`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Plastic Bricks.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#EF4444`
2. **Kontras / Teks Utama:** `#3B82F6`
3. **Warna Sekunder / Kartu:** `#EAB308`
4. **Warna Aksen 1:** `#22C55E`
5. **Warna Aksen 2:** `#F8FAFC`

## 3. Fitur Visual Kunci
- Tonjolan Silinder Atas Khas Balok
- Warna Plastik Primer Cerah Berkilau
- Alas Hijau Bertonjolan Grid
- Pencahayaan Studio Bersih

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
3D seperti mainan balok plastik. Semua benda tersusun dari balok berwarna cerah (merah, biru, kuning, hijau) dengan tonjolan bulat kecil di bagian atas balok. Alas hijau bertonjolan, pencahayaan terang dan bersih.
```
