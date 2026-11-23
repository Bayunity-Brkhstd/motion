---
name: kertas-potong
description: Preset gaya visual 'Kertas Potong Berlapis Papercut' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#1B263B`, `#415A77`, `#778DA9`, `#E0E1DD`, `#F4A261`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Layered Papercut'.
---

# AI Video Skill: Kertas Potong Berlapis Papercut (`kertas-potong`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Layered Papercut.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#1B263B`
2. **Kontras / Teks Utama:** `#415A77`
3. **Warna Sekunder / Kartu:** `#778DA9`
4. **Warna Aksen 1:** `#E0E1DD`
5. **Warna Aksen 2:** `#F4A261`

## 3. Fitur Visual Kunci
- Lapisan Kertas Tumpuk Bertingkat
- Bayangan Jatuh Lembut Antar Kertas
- Bukit Bergelombang Gradasi Terang-Gelap
- Matahari Lingkaran Tumpuk Berlapis

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Seni kertas potong berlapis (papercut). Setiap lapisan kertas berwarna memberi bayangan lembut ke lapisan di belakangnya. Bukit bergelombang berlapis dari terang ke gelap, matahari dari lingkaran bertumpuk, awan kertas putih, gradasi langit senja merah muda ke oranye.
```
