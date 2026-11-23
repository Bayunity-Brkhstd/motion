---
name: garis-minimal
description: Preset gaya visual 'Garis Minimal Rasi Bintang' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~4.0s, palet master: `#000000`, `#FFFFFF`, `#64748B`, `#38BDF8`, `#E2E8F0`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Minimalist Line'.
---

# AI Video Skill: Garis Minimal Rasi Bintang (`garis-minimal`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Minimalist Line.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `4.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#000000`
2. **Kontras / Teks Utama:** `#FFFFFF`
3. **Warna Sekunder / Kartu:** `#64748B`
4. **Warna Aksen 1:** `#38BDF8`
5. **Warna Aksen 2:** `#E2E8F0`

## 3. Fitur Visual Kunci
- Latar Hitam Pekat Deep Void
- Garis Vektor Putih Tipis 2px
- Titik Simpul Rasi Bintang Berkedip
- Orbit Lingkaran Kinematik Halus

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Minimalis elegan. Latar hitam pekat, garis putih tipis 2-3 px yang tergambar perlahan di detik pertama. Titik kecil di setiap sudut bentuk seperti rasi bintang, satu lingkaran orbit tipis dengan titik yang berputar, banyak ruang kosong.
```
