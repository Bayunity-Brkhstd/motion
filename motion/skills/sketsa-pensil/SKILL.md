---
name: sketsa-pensil
description: Preset gaya visual 'Sketsa Pensil Buku Tulis' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#FDFBF7`, `#334155`, `#64748B`, `#EF4444`, `#94A3B8`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Pencil Sketch'.
---

# AI Video Skill: Sketsa Pensil Buku Tulis (`sketsa-pensil`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Pencil Sketch.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#FDFBF7`
2. **Kontras / Teks Utama:** `#334155`
3. **Warna Sekunder / Kartu:** `#64748B`
4. **Warna Aksen 1:** `#EF4444`
5. **Warna Aksen 2:** `#94A3B8`

## 3. Fitur Visual Kunci
- Garis Buku Tulis Biru & Margin Merah
- Goresan Grafit Pensil Bergetar Dobel
- Arsiran Hatching & Cross-Hatching
- Animasi Ujung Pensil Ikut Bergerak

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Sketsa pensil di kertas buku tulis bergaris biru dengan garis margin merah. Garis abu-abu sedikit bergetar dan digambar dobel seperti coretan tangan, isian arsiran miring, pensil kuning ikut bergerak menggambar, dan tulisan tangan kecil di pojok bawah.
```
