---
name: isometric-video
description: Produksi video motion graphic edukasi 3D isometrik dengan motion blur 180° shutter (4 sub-frame), fisika pegas deterministik (closed-form springs), Visual QA mandiri, dan integrasi mulus dengan skill sound-effects (110 SFX CC0 + Voice Over + Auto-Ducking -16 LUFS). Gunakan skill ini untuk memproduksi animasi video berkualitas tinggi dari naskah atau brief.
---

# Isometric Video Motion Graphics Engine

Skill ini menggabungkan mesin animasi berbasis fisika pegas (*closed-form springs*), proyeksi isometrik presisi 30°, *sub-frame motion blur*, dan alur kerja terstruktur untuk Google Antigravity App.

## Struktur & Modul
- `engine/motion.js`: Proyeksi isometrik `M.iso(x,y,z)`, kamera `M.Camera`, kubus 3D `M.drawIsoBox`, platform `M.drawIsoPlatform`, serta interpolasi pegas `M.track` dan `M.S`.
- `engine/render.js`: Renderer Playwright deterministik dengan 4 sub-frame *temporal blending* (`tmix`) FFmpeg untuk motion blur alami tanpa ghosting.
- Integrasi Audio: Menghasilkan `cues.json` otomatis untuk dieksekusi langsung oleh skill `sound-effects` (`sound_pass.py`).

## Alur Kerja Produksi

### 1. Perencanaan & Timing Voice Over
- Ukur durasi file VO dengan `ffprobe`.
- Susun adegan visual mengikuti kalimat naskah secara akurat.

### 2. Implementasi Visual
- Buat file `clip.html` / `scenes.js` menggunakan modul isometrik `M`.
- Gunakan fungsi global `window.seek(t)` murni deterministik.

### 3. Visual QA Frame Uji
- Ambil tangkapan layar di titik krusial tiap adegan ke folder `preview_frames/`.
- Periksa dengan alat vision untuk memastikan tidak ada teks tumpang tindih dan objek terpusat.

### 4. Ekspor Video Bisu & Cues
- Render video bisu `silent.mp4` menggunakan `node engine/render.js`.
- Ekspor daftar waktu aksi ke `cues.json`.

### 5. Sound Design Organik (`sound-effects`)
- Jalankan skrip mixing dengan Voice Over dan auto-ducking:
  `python .agent/skills/sound-effects/scripts/sound_pass.py --video silent.mp4 --vo vo.mp3 --cues cues.json --manifest .agent/skills/sound-effects/sfx/manifest.json --out out_audio`
- Buka `report.html` untuk meninjau kecocokan suara dan waveform.
