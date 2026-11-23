---
name: impasto-minyak
description: Preset gaya visual 'Impasto Cat Minyak Van Gogh' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~3.8s, palet master: `#0C1821`, `#1E3A8A`, `#F59E0B`, `#FDE047`, `#1E293B`. Gunakan modul skill ini saat memproduksi animasi bergaya 'Van Gogh Swirl'.
---

# AI Video Skill: Impasto Cat Minyak Van Gogh (`impasto-minyak`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika Van Gogh Swirl.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `3.8` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `#0C1821`
2. **Kontras / Teks Utama:** `#1E3A8A`
3. **Warna Sekunder / Kartu:** `#F59E0B`
4. **Warna Aksen 1:** `#FDE047`
5. **Warna Aksen 2:** `#1E293B`

## 3. Fitur Visual Kunci
- Ribuan Goresan Kuas Pendek Berputar
- Pusaran Awan Dinamis Warna Kuning-Biru
- Halo Cahaya Bintang Melingkar Hangat
- Tekstur Timbul Kanvas Kasar (Impasto)

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
Lukisan cat minyak tebal (impasto). Langit terbuat dari ribuan sapuan kuas pendek yang mengikuti arah pusaran dan berputar pelan, warna biru tua, biru muda, dan kuning. Bintang berpendar berlapis, pohon cemara gelap di depan, tekstur kanvas halus di seluruh layar.
```
