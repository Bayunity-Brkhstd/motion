---
name: clay
description: Preset gaya visual 'Claymation Plastisin Stop-Motion' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.0s, palet master: `#F97316`, `#0284C7`, `#16A34A`, `#CA8A04`, `#FDE047`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Stop-Motion Clay'.
---

# AI Video Skill: Claymation Plastisin Stop-Motion (`clay`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Stop-Motion Clay.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#F97316`
2. **Kontras / Teks Utama:** `#0284C7`
3. **Warna Sekunder / Kartu:** `#16A34A`
4. **Warna Aksen 1:** `#CA8A04`
5. **Warna Aksen 2:** `#FDE047`

## 3. Fitur Visual Kunci
- Sudut Membulat Organik Plastisin
- Tekstur Halus Sidik Jari Pengrajin
- Gerakan Kinetik Stop-Motion 12 FPS
- Pencahayaan Studio Hangat Lembut

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Animasi clay/plastisin ala stop-motion. Semua objek seperti dibentuk dari plastisin: sudut membulat, kilap lembut di bagian atas, bayangan lembut di bawah, bintik sidik jari halus. Gerakan sengaja patah-patah 12 frame per detik. Warna cerah hangat, langit biru ke krem.
```
