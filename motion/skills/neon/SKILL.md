---
name: neon
description: Preset gaya visual 'Neon 80s Synthwave Outrun' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.0s, palet master: `#0F051D`, `#F43F5E`, `#06B6D4`, `#FACC15`, `#8B5CF6`. Gunakan modul skill ini saat memproduksi animasi bergaya '80s Synthwave'.
---

# AI Video Skill: Neon 80s Synthwave Outrun (`neon`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika 80s Synthwave.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#0F051D`
2. **Kontras / Teks Utama:** `#F43F5E`
3. **Warna Sekunder / Kartu:** `#06B6D4`
4. **Warna Aksen 1:** `#FACC15`
5. **Warna Aksen 2:** `#8B5CF6`

## 3. Fitur Visual Kunci
- Latar Grid Perspektif Bergerak (Outrun)
- Glow Magenta, Cyan & Kuning Neon
- Matahari Sunset Bergaris Striped
- Partikel Cahaya Bintang Meluncur

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Retro neon tahun 80-an. Latar ungu-biru gelap, matahari besar bergaris, jalan grid perspektif biru muda yang bergerak. Semua garis bercahaya (glow) warna magenta, cyan, dan kuning, dengan inti garis putih tipis.
```
