---
name: anime-pedesaan
description: Preset gaya visual 'Anime Pedesaan Ghibli / Shinkai' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#0284C7`, `#38BDF8`, `#4ADE80`, `#FEF08A`, `#F43F5E`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Ghibli Countryside'.
---

# AI Video Skill: Anime Pedesaan Ghibli / Shinkai (`anime-pedesaan`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Ghibli Countryside.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#0284C7`
2. **Kontras / Teks Utama:** `#38BDF8`
3. **Warna Sekunder / Kartu:** `#4ADE80`
4. **Warna Aksen 1:** `#FEF08A`
5. **Warna Aksen 2:** `#F43F5E`

## 3. Fitur Visual Kunci
- Langit Biru Cerah Jernih Kristal
- Awan Kumulus Raksasa Bervolume Lembut
- Padang Rumput Hijau Berbunga Bergoyang
- Kilauan Cahaya Matahari di Kejauhan

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Anime berlatar pedesaan yang cerah. Langit biru jernih, awan putih besar bervolume dengan bayangan biru lembut, padang hijau penuh bunga kecil, laut berkilau di kejauhan, rumah kecil beratap merah. Warna jenuh dan bersih, karakter dengan garis tipis dan bayangan sederhana.
```
