---
name: glitch
description: Preset gaya visual 'Glitch RGB Shift Digital Error' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~2.5s, palet master: `#050505`, `#FF0055`, `#00FFFF`, `#FFFF00`, `#FFFFFF`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Digital Glitch'.
---

# AI Video Skill: Glitch RGB Shift Digital Error (`glitch`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Digital Glitch.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `2.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#050505`
2. **Kontras / Teks Utama:** `#FF0055`
3. **Warna Sekunder / Kartu:** `#00FFFF`
4. **Warna Aksen 1:** `#FFFF00`
5. **Warna Aksen 2:** `#FFFFFF`

## 3. Fitur Visual Kunci
- Pemisahan Channel Warna RGB Aberration
- Potongan Garis Horizontal Slicing
- Kotak Noise Pixel Acak Digital
- Jendela Dialog Error Komputer Retro

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Glitch digital: semua objek digambar tiga kali (merah, cyan, putih) dengan sedikit pergeseran sehingga warnanya terpisah, irisan horizontal acak yang bergeser, kotak piksel berwarna acak. Tambahkan jendela error ala komputer jadul berisi pesan lucu yang muncul dan hilang.
```
