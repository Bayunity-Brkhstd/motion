---
name: ps2-3d
description: Preset gaya visual 'PS2 3D Low-Poly Retro' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.5s, palet master: `#1E293B`, `#64748B`, `#94A3B8`, `#F59E0B`, `#0F172A`. Gunakan modul skill ini saat memproduksi animasi bergaya 'PS2 Low-Poly'.
---

# AI Video Skill: PS2 3D Low-Poly Retro (`ps2-3d`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika PS2 Low-Poly.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.5` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#1E293B`
2. **Kontras / Teks Utama:** `#64748B`
3. **Warna Sekunder / Kartu:** `#94A3B8`
4. **Warna Aksen 1:** `#F59E0B`
5. **Warna Aksen 2:** `#0F172A`

## 3. Fitur Visual Kunci
- Model Geometri Low-Poly Sederhana
- Pencahayaan Flat Directional Shading
- Efek Dithering & Scanline CRT Tipis
- Kabut Misterius Keabuan (Fog Distance)

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
3D low-poly ala game PlayStation 2. Buat mesin 3D sederhana sendiri di canvas: objek dari kotak dan silinder bersisi sedikit, pencahayaan datar dari satu arah, kabut tipis di kejauhan. Render di seperempat resolusi lalu perbesar agar agak buram, warna dibulatkan dengan sedikit dither, tambahkan garis scanline tipis.
```
