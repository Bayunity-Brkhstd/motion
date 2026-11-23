---
name: kapur-tulis
description: Preset gaya visual 'Kapur Tulis Papan Hijau' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#1E3A2F`, `#F8F9FA`, `#FDE047`, `#2D5A47`, `#0E1D17`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Chalkboard'.
---

# AI Video Skill: Kapur Tulis Papan Hijau (`kapur-tulis`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Chalkboard.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#1E3A2F`
2. **Kontras / Teks Utama:** `#F8F9FA`
3. **Warna Sekunder / Kartu:** `#FDE047`
4. **Warna Aksen 1:** `#2D5A47`
5. **Warna Aksen 2:** `#0E1D17`

## 3. Fitur Visual Kunci
- Tekstur Papan Tulis Hijau Tua
- Goresan Kapur Bergetar 8 FPS
- Arsiran Miring & Butiran Debu
- Warna Kapur Putih & Kuning Lembut

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Gambar kapur di papan tulis hijau gelap bertekstur. Garis putih dan kuning sedikit bergetar seperti digambar tangan (gambar ulang 8 kali per detik dengan sedikit acak). Isian memakai arsiran miring, ada butiran debu kapur.
```
