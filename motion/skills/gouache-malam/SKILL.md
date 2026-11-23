---
name: gouache-malam
description: Preset gaya visual 'Gouache Malam Matte Sinematik' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#0B132B`, `#1C2541`, `#3A506B`, `#5BC0BE`, `#6FFFE9`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Night Gouache'.
---

# AI Video Skill: Gouache Malam Matte Sinematik (`gouache-malam`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Night Gouache.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#0B132B`
2. **Kontras / Teks Utama:** `#1C2541`
3. **Warna Sekunder / Kartu:** `#3A506B`
4. **Warna Aksen 1:** `#5BC0BE`
5. **Warna Aksen 2:** `#6FFFE9`

## 3. Fitur Visual Kunci
- Warna Solid Matte Tanpa Kilap Refleksi
- Bulan Penuh Besar Berkawah Lembut
- Siluet Gelap Tegas di Depan Terang
- Butiran Kertas Tekstur Halus Alami

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Cat gouache malam hari: bentuk datar dengan warna pekat dan matte, tanpa kilap dan tanpa outline. Palet biru malam, bulan besar krem dengan kawah lembut, bintang kecil berkelip, siluet gelap tegas di depan bulan, butiran kertas tipis.
```
