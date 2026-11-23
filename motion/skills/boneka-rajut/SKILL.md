---
name: boneka-rajut
description: Preset gaya visual 'Boneka Rajut Benang Wol' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#FDF4E3`, `#E07A5F`, `#3D405B`, `#81B29A`, `#F2CC8F`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Knitted Wool'.
---

# AI Video Skill: Boneka Rajut Benang Wol (`boneka-rajut`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Knitted Wool.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#FDF4E3`
2. **Kontras / Teks Utama:** `#E07A5F`
3. **Warna Sekunder / Kartu:** `#3D405B`
4. **Warna Aksen 1:** `#81B29A`
5. **Warna Aksen 2:** `#F2CC8F`

## 3. Fitur Visual Kunci
- Pola Anyaman Rajutan V Berulang
- Mata & Ornamen dari Kancing Jahit
- Jahitan Keliling Putus-Putus
- Ujung Serat Benang Wol Lembut

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Semua objek seperti dirajut dari benang wol: isian memakai pola rajutan V berulang, tepi berjahit putus-putus, mata dari kancing, matahari dari kancing besar. Tambahkan gulungan benang dengan ujung benang terurai. Warna pastel lembut.
```
