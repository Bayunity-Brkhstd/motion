---
name: motion-graphics
description: Produksi motion graphics dan video berbasis kode deterministik (HTML, Canvas 2D, SVG, Three.js) dengan 17 gaya visual, motion blur 180° shutter, Visual QA otomatis, dan mixing audio terukur -16 LUFS. Gunakan saat pengguna meminta pembuatan video promosi, edukasi, explainer, atau animasi kinetik.
---

# Pipeline Produksi Motion Graphics as Code di Antigravity

Ikuti 5 fase rekayasa berikut secara berurutan:

## Fase 1: Analisis Brief, Penentuan Gaya & Storyboard
1. Baca naskah pengguna dan periksa durasi file Voice Over (jika ada) menggunakan `ffprobe` sebagai patokan waktu mutlak.
2. Pilih 1 dari 17 gaya visual resmi (atau sesuaikan dengan permintaan pengguna).
3. Buat rancangan shot list / storyboard yang memetakan setiap aksi dan teks yang harus dibaca penonton ke dalam timecode presisi.

## Fase 2: Arsitektur Kode Animasi Deterministik
1. Bangun proyek di `./build_video/` dengan berkas `lib.js`, `scenes.js`, dan `index.html`.
2. Gunakan fungsi kontrol waktu global `window.seekTo(timeInSeconds)` atau `window.seek(t)`. Dilarang keras menggunakan `performance.now()` atau `Date.now()` di dalam logika animasi utama.
3. Terapkan rumus pegas tertutup (*closed-form springs* `M.track` / `M.S`) atau kurva `cubic-bezier` numerik sesuai aturan gaya yang dipilih.
4. Pastikan `await document.fonts.ready` terpenuhi dan seluruh teks berada di dalam margin aman (minimal 4% dari tepi layar).

## Fase 3: Visual QA Mandiri (Inspeksi Keyframe)
1. Render tangkapan layar keyframe pada titik krusial setiap adegan ke folder `./preview_frames/` (misalnya `f_8.png`, `f_25.png`, `f_50.png`).
2. Buka dan analisis file gambar tersebut menggunakan alat pembaca gambar (*vision*):
   - Periksa apakah ada teks atau label yang saling menumpuk (*overlap*) atau terpotong tepi layar.
   - Periksa apakah objek utama berada di titik fokus kamera (*camera framing*).
   - Pastikan hierarki visual dan keterbacaan (*readability*) optimal.
3. Perbaiki kode visual jika ditemukan kecacatan sebelum melangkah ke proses render penuh.

## Fase 4: Sound Design Organik CC0 & Mastering Terukur (-16 LUFS)
1. Buat daftar penanda aksi ke dalam file `cues.json`.
2. Jalankan skrip `sound_pass.py` dari skill `sound-effects`:
   `python .agent/skills/sound-effects/scripts/sound_pass.py --video ./build_video/silent.mp4 --vo ./vo.mp3 --cues ./build_video/cues.json --manifest .agent/skills/sound-effects/sfx/manifest.json --out ./out_sound_pass`
3. Pastikan audio terukur secara otomatis mencapai target siaran **-16 LUFS** (True Peak < -2 dBFS) dengan fitur *auto-ducking* musik di bawah narasi narator.
4. Sediakan tautan file `report.html` untuk memverifikasi kecocokan penempatan suara.

## Fase 5: Parallel Background Rendering & Final Assembly
1. Render urutan frame menggunakan worker paralel Playwright headless (`scripts/render-parallel.js`) atau stream langsung dengan *temporal blending motion blur* 4 sub-frame (`engine/render.js`).
2. Gabungkan urutan gambar dengan master audio menggunakan FFmpeg (`libx264`, `yuv420p`, `-crf 18`, audio AAC 192k) menjadi berkas video final beresolusi penuh.
