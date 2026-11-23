---
name: flat-vector
description: Preset gaya visual 'Flat Vector Pastel Modern' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#F8FAFC`, `#38BDF8`, `#FB7185`, `#FCD34D`, `#4ADE80`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Modern Pastel'.
---

# AI Video Skill: Flat Vector Pastel Modern (`flat-vector`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Modern Pastel.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#F8FAFC`
2. **Kontras / Teks Utama:** `#38BDF8`
3. **Warna Sekunder / Kartu:** `#FB7185`
4. **Warna Aksen 1:** `#FCD34D`
5. **Warna Aksen 2:** `#4ADE80`

## 3. Fitur Visual Kunci
- Warna Pastel Hangat Tanpa Outline
- Bayangan Transparan Minimalis
- Kurva Geometris Mulus Modern
- Awan Melayang & Bukit Berombak

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Ilustrasi flat vector modern. Warna pastel lembut tanpa outline, bayangan transparan halus, bukit bergelombang, awan bulat, pohon berbentuk lingkaran, matahari kuning sederhana.
```
