---
name: cat-air
description: Preset gaya visual 'Cat Air Kertas Basah' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.8s, palet master: `#FDFBF7`, `#38BDF8`, `#F472B6`, `#FBBF24`, `#34D399`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Watercolor Art'.
---

# AI Video Skill: Cat Air Kertas Basah (`cat-air`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Watercolor Art.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.8` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#FDFBF7`
2. **Kontras / Teks Utama:** `#38BDF8`
3. **Warna Sekunder / Kartu:** `#F472B6`
4. **Warna Aksen 1:** `#FBBF24`
5. **Warna Aksen 2:** `#34D399`

## 3. Fitur Visual Kunci
- Tekstur Kertas Serat Krem Basah
- Lapisan Warna Tembus Pandang Transparan
- Efek Bleeding & Tepian Pigmen Alami
- Animasi Bernapas Halus 6 FPS

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Lukisan cat air di kertas krem bertekstur. Warna tembus pandang ditumpuk beberapa lapis dengan tepi sedikit tidak rata, garis pensil tipis di tepi objek. Gambar sedikit 'hidup' (berubah halus 6 kali per detik) seperti lukisan tangan.
```
