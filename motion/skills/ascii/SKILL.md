---
name: ascii
description: Preset gaya visual 'ASCII Art Terminal Konsol' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.0s, palet master: `#0A0F0D`, `#00FF66`, `#003B15`, `#1B4332`, `#D8F3DC`. Gunakan modul skill ini saat memproduksi animasi bergaya 'ASCII Terminal'.
---

# AI Video Skill: ASCII Art Terminal Konsol (`ascii`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika ASCII Terminal.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#0A0F0D`
2. **Kontras / Teks Utama:** `#00FF66`
3. **Warna Sekunder / Kartu:** `#003B15`
4. **Warna Aksen 1:** `#1B4332`
5. **Warna Aksen 2:** `#D8F3DC`

## 3. Fitur Visual Kunci
- Grid Karakter Monospace Hijau Fosfor
- Kepadatan Densitas Simbol Teks
- Kursor Terminal Berkedip Khas Linux
- Progress Bar Memori di Bagian Bawah

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Seni ASCII di layar terminal: gambar adegan dulu di kanvas tersembunyi dalam skala abu-abu, lalu ubah jadi karakter monospace hijau (`.:-=+*#%@`) sesuai terang-gelapnya. Tambahkan baris perintah terminal di atas, progress bar di bawah, kursor berkedip, dan scanline tipis.
```
