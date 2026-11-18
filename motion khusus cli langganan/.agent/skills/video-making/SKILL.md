---
name: video-making
description: Produksi video motion graphic edukasi bergaya ilustrasi isometrik flat-3D secara terprogram menggunakan HTML/SVG/Canvas, Playwright headless browser, sintesis audio prosedural, dan FFmpeg parallel rendering. Gunakan skill ini ketika pengguna meminta eksekusi pembuatan/render video dari file brief atau naskah.
---

# Pipeline Produksi Video Motion Graphic Isometrik

Ikuti alur kerja rekayasa perangkat lunak dan produksi visual berikut secara berurutan setiap kali diminta mengeksekusi pembuatan video:

## Fase 1: Analisis Brief & Sinkronisasi Audio
1. Baca file brief `.md` yang diberikan pengguna beserta file audio Voice Over (VO) yang ada di workspace (jika tersedia).
2. Periksa durasi pasti file audio VO menggunakan `ffprobe` agar total durasi video dan pembagian *timecode* per adegan akurat 100%.
3. Petakan *beat* animasi ke kata kunci spesifik di naskah VO.

## Fase 2: Arsitektur Kode Animasi Modular
Bangun proyek animasi berbasis web deterministik (1920x1080, 30fps atau 60fps) di folder kerja `./build_video/`:
1. **`lib.js` (Core Isometric & Camera Engine):**
   - Buat fungsi utilitas proyeksi isometrik (`isoX`, `isoY`), kubus/balok/silinder 3D SVG/Canvas, kurva Bézier untuk selang/kabel/aliran data, fungsi *easing* halus (`easeOutCubic`, `easeInOutQuint`), dan kontrol kamera (*pan*, *zoom*, *shake*).
   - **Wajib Deterministik:** Jangan gunakan `Date.now()` atau `performance.now()` untuk animasi. Gunakan fungsi global `window.seekTo(timeInSeconds)` yang dipanggil oleh Playwright untuk setiap frame agar hasil render tidak pernah patah-patah (*frame drop*).
2. **`scenes.js`, `scenes2.js`, `scenes3.js`, dst.:**
   - Pisahkan logika penggambaran adegan ke dalam beberapa file modular (misalnya 2–3 adegan per file) agar kode mudah dikelola dan di-debug.
   - Pastikan seluruh teks label, *callout*, dan kartu UI memiliki kontras tinggi, margin aman, dan tidak saling bertumpuk.

## Fase 3: Visual QA Loop (Inspeksi Frame Uji Mandiri)
Sebelum melakukan render video penuh yang memakan waktu lama, **wajib lakukan pengujian visual**:
1. Render tangkapan layar (*keyframe*) pada titik waktu krusial setiap adegan (contoh: `f_8.png`, `f_25.png`, `f_50.png`, `f_120.png`) ke folder `./preview_frames/`.
2. Buka dan baca file `.png` tersebut menggunakan alat pembaca gambar (*vision*) untuk memeriksa:
   - Apakah objek utama berada tepat di tengah kamera (*camera offset*)?
   - Apakah ada teks label atau ikon yang saling menumpuk (*overlap*) atau terpotong tepi layar?
   - Apakah urutan kemunculan elemen sesuai dengan *beat* naskah VO?
3. Jika ditemukan cacat visual sekecil apa pun, perbaiki kode pada `lib.js` atau `scenes*.js`, lalu render ulang frame uji tersebut hingga seluruh adegan lolos inspeksi visual.

## Fase 4: Sintesis SFX, Musik Latar & Audio Mixing
1. Buat file `./build_video/audio_cues.json` yang berisi daftar penempatan SFX (`pop`, `whoosh`, `click`, `hum`, `pulse`, `chime`) lengkap dengan `time` (detik) dan posisi stereo `pan` (`-1.0` sampai `1.0`) yang selaras dengan gerakan visual di setiap adegan.
2. Jalankan skrip generator dan mixer audio bawaan skill:
   `node .agent/skills/video-making/scripts/audio-synth-mix.js ./build_video/audio_cues.json <path_file_vo> ./build_video/master_audio.wav`
3. Verifikasi bahwa file `./build_video/master_audio.wav` berhasil terbuat dan durasinya sesuai dengan total durasi animasi.

## Fase 5: Parallel Background Rendering & Final Assembly
1. Gunakan skrip render paralel (`scripts/render-parallel.js` atau skrip kustom) yang membagi total frame ke dalam 2 hingga 4 *worker* browser *headless* Playwright secara bersamaan di latar belakang.
2. Pantau progres render menggunakan *background polling* (cek log dan jumlah frame secara berkala) tanpa memblokir proses.
3. Setelah semua frame selesai dirender, gabungkan urutan frame PNG dan `master_audio.wav` menggunakan `ffmpeg` (`libx264`, `-pix_fmt yuv420p`, `-crf 18`, `aac 192k`) menjadi file output akhir `final_video.mp4`.
