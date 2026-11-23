---
name: origami
description: Preset gaya visual 'Origami Kertas Lipat Geometris' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#F8F9FA`, `#EF4444`, `#3B82F6`, `#F59E0B`, `#10B981`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Folded Origami'.
---

# AI Video Skill: Origami Kertas Lipat Geometris (`origami`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Folded Origami.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#F8F9FA`
2. **Kontras / Teks Utama:** `#EF4444`
3. **Warna Sekunder / Kartu:** `#3B82F6`
4. **Warna Aksen 1:** `#F59E0B`
5. **Warna Aksen 2:** `#10B981`

## 3. Fitur Visual Kunci
- Geometri Poligon Lipatan Kertas
- Bayangan Halus Tumpukan Kertas (Depth)
- Garis Panduan Lipatan Putus-Putus
- Matahari Lipatan Kertas Berputar

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Semua objek dari kertas lipat: bentuk segitiga bersegi dengan dua nada warna di tiap sisi lipatan, bayangan lembut seperti kertas ditempel, matahari kertas berputar pelan, latar kertas krem dengan garis lipatan tipis, garis putus-putus 'lipat di sini'.
```
