---
name: kamera-panas
description: Preset gaya visual 'Kamera Termal Night Vision' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.0s, palet master: `#03071E`, `#6A040F`, `#D00000`, `#F48C06`, `#FFBA08`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Thermal Heatmap'.
---

# AI Video Skill: Kamera Termal Night Vision (`kamera-panas`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Thermal Heatmap.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#03071E`
2. **Kontras / Teks Utama:** `#6A040F`
3. **Warna Sekunder / Kartu:** `#D00000`
4. **Warna Aksen 1:** `#F48C06`
5. **Warna Aksen 2:** `#FFBA08`

## 3. Fitur Visual Kunci
- Gradasi Suhu Tubuh Merah-Kuning-Putih
- Latar Lingkungan Dingin Biru-Ungu
- Indikator REC Merah & Crosshair Bidik
- Skala Termometer Suhu di Sisi Kanan

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Rekaman kamera termal: lingkungan berwarna dingin (biru tua dan ungu), objek utama bergradasi panas putih-kuning-oranye-merah-ungu. Tambahkan HUD kamera: REC berkedip, jam, kotak merah 'TARGET TERKUNCI', crosshair, angka suhu, dan skala warna vertikal di sisi kanan.
```
