---
name: lukisan-botani
description: Preset gaya visual 'Lukisan Botani Antik Ilmiah' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~4.0s, palet master: `#F5EBE0`, `#2D5A27`, `#588157`, `#A3B18A`, `#BC4749`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Botanical Art'.
---

# AI Video Skill: Lukisan Botani Antik Ilmiah (`lukisan-botani`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Botanical Art.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `4.0` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#F5EBE0`
2. **Kontras / Teks Utama:** `#2D5A27`
3. **Warna Sekunder / Kartu:** `#588157`
4. **Warna Aksen 1:** `#A3B18A`
5. **Warna Aksen 2:** `#BC4749`

## 3. Fitur Visual Kunci
- Kertas Perkamen Tua Berbingkai Tipis
- Garis Tinta Botani Sangat Detail
- Label Klasik 'Pl. 07' & Nama Latin
- Serangga Kecil Terbang di Sekitar

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Ilustrasi botani ala buku ilmiah lama. Kertas tua krem dengan bingkai garis tipis, garis tinta halus dengan warna lembut tembus pandang. Label kecil 'Pl. 07' di pojok atas, nama latin bercetak miring di bawah gambar, dan serangga kecil yang terbang di sekitar tanaman.
```
