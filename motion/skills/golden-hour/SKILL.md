---
name: golden-hour
description: Preset gaya visual 'Golden Hour Siluet Senja' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#3C096C`, `#7B2CBF`, `#C77DFF`, `#FF9E00`, `#FF6000`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Sunset Silhouette'.
---

# AI Video Skill: Golden Hour Siluet Senja (`golden-hour`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Sunset Silhouette.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#3C096C`
2. **Kontras / Teks Utama:** `#7B2CBF`
3. **Warna Sekunder / Kartu:** `#C77DFF`
4. **Warna Aksen 1:** `#FF9E00`
5. **Warna Aksen 2:** `#FF6000`

## 3. Fitur Visual Kunci
- Gradasi Spektakuler Ungu-Pink-Oranye
- Siluet Penuh Objek Hitam-Coklat Pekat
- Matahari Emas Besar Menyentuh Cakrawala
- Ilalang & Dedaunan Bergoyang Angin

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Siluet saat matahari terbenam. Langit bergradasi ungu, merah muda, oranye, lalu kuning, dengan matahari besar bercahaya di cakrawala. Semua objek berupa siluet coklat gelap tanpa detail, pohon akasia berpayung datar, rumput yang bergoyang, butiran halus.
```
