---
name: kartun-jadul
description: Preset gaya visual 'Kartun Jadul 1930s Rubberhose' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~2.5s, palet master: `#1A1A1A`, `#F5F5DC`, `#4A4A4A`, `#808080`, `#E0E0E0`. Gunakan modul skill ini saat memproduksi animasi bergaya '1930s Rubberhose'.
---

# AI Video Skill: Kartun Jadul 1930s Rubberhose (`kartun-jadul`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika 1930s Rubberhose.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `2.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#1A1A1A`
2. **Kontras / Teks Utama:** `#F5F5DC`
3. **Warna Sekunder / Kartu:** `#4A4A4A`
4. **Warna Aksen 1:** `#808080`
5. **Warna Aksen 2:** `#E0E0E0`

## 3. Fitur Visual Kunci
- Mata Pie-Cut & Sarung Tangan Putih
- Efek Seluloid Film Grain & Goresan
- Gerakan Lentur Rubberhose 15 FPS
- Vignette Sudut Gelap Film Bisu

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Kartun hitam-putih tahun 1930-an: karakter hitam pekat dengan wajah krem, mata seperti potongan kue, sarung tangan/kaki putih bulat, matahari tersenyum. Gerak 15 frame per detik, gambar sedikit bergoyang, grain film, goresan vertikal, layar berkedip, vignette gelap, dan kartu judul ala film lama.
```
