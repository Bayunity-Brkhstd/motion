---
name: toon-3d-explainer
description: Produksi video explainer teknis, militer, teknik mesin, dan sains bergaya animasi 3D cel-shaded toon-outline (perspektif 3D penuh dengan karakter kartun bergaya South Park/Rick & Morty, meja blueprint interaktif, panah vektor fisika, tampilan X-ray mesin/kokpit, dan subtitle pop-up sinkron per frasa) dengan motion blur 180° shutter (4 sub-frame), fisika pegas deterministik, Visual QA mandiri, dan integrasi audio sound-effects (-16 LUFS). Gunakan skill ini untuk memproduksi video animasi edukasi bergaya 3D toon-shaded dari naskah atau brief.
---

# 3D Cel-Shaded Toon Explainer Engine (Perspective & Character Driven)

Skill ini dirancang khusus untuk menghasilkan video explainer teknis bergaya animasi 3D *cel-shaded* (*toon-outline*) dengan kamera perspektif dinamis, karakter kartun satiris-edukatif di dalam lingkungan 3D (ruang insinyur, hanggar, gurun uji coba, langit senja), infografis *blueprint* teknis, panah vektor gaya fisika, mode *X-ray* komponen internal, dan subtitle *pop-up* berketukan cepat.

## Arsitektur & Modul (`engine/`)
- `engine/toon3d.js`:
  - **Kamera Perspektif 3D & Rig Gerak (`T3.Cam3D`)**: Mendukung *dolly zoom*, *whip-pan*, *camera shake* saat tembakan/ledakan, dan proyeksi perspektif 3D (`project(x, y, z)`).
  - **Shader Cel-Shaded & Garis Tepi (`T3.drawCelBox`)**: Merender bentuk 3D dengan 3 tingkat bayangan *cel-shading* (*highlight, midtone, shadow*) serta garis tepi tinta hitam (`#0B0B0B`) tajam.
  - **Karakter Kartun 2.5D (`T3.drawCharacter`)**: Karakter insinyur berkacamata, teknisi hanggar bertopi/rompi oranye, dan pilot berhelm tempur dengan mata putih besar bersentuhan, tangan bulat (*mitten hands*), serta ekspresi dinamis (`neutral`, `worried`, `scheming`, `confident`, `shocked`).
  - **Latar & Visual Teknis**:
    - `T3.drawBlueprintView`: Tampilan atas meja gambar biru tua berpetak dengan garis teknik putih, sumbu tengah merah, dan animasi tangan menggambar.
    - `T3.drawSunsetSky`: Langit senja gradasi ungu-magenta-oranye dengan awan *toon* bergaya *cel-shaded*.
    - `T3.drawXrayHousing`: Efek *cutaway* transparan biru *cyan* (`#38BDF8`) untuk memperlihatkan ruang bakar mesin, percikan pemantik listrik, atau struktur pelindung dalam.
    - `T3.drawForceVector`: Panah vektor fisika tebal (biru/oranye).
- `engine/base.css`: Layout kanvas vertikal (`1080x1920`) maupun horizontal (`1920x1080`), tipografi tebal, kelas `.toon-word-sub` untuk subtitle *pop-up* putih dengan *stroke* hitam pekat di tengah-bawah layar, serta `.callout-box`.
- `engine/build.py`: Merakit fragmen HTML klip, CSS, dan `toon3d.js` menjadi satu berkas HTML mandiri (`dist/clip.html`).
- `engine/render.js`: Renderer Playwright deterministik dengan 4 *sub-frame temporal blending* (`tmix` FFmpeg) untuk *motion blur* alami pada gerakan cepat.
- `engine/beats.js`: Generator *contact sheet* PNG untuk inspeksi Visual QA di setiap titik perubahan adegan.

## Alur Kerja Produksi

### 1. Pemetaan Ritme & Sub-Adegan (Pacing 2-4 Detik)
- Ukur durasi file Voice Over menggunakan `ffprobe` (misalnya `116.0` detik).
- Bagi naskah menjadi 6-8 babak utama, lalu pecah setiap kalimat menjadi potongan visual berdurasi **2 hingga 4 detik** agar retensi visual tetap tinggi.

### 2. Implementasi Kode Visual (`clip.html`)
- Gunakan fungsi global deterministik `window.seek(t)` (tanpa `setTimeout` atau transisi CSS).
- Sinkronkan kemunculan **Subtitle Pop-Up** (`.toon-word-sub`) per 1-3 kata agar terasa hidup mengikuti intonasi narator.

### 3. Visual QA Mandiri
- Jalankan `node engine/beats.js dist/clip.html out/qa_sheet.png t1 t2 t3 ...` untuk memeriksa komposisi frame.

### 4. Render Video & Integrasi Audio (`sound-effects`)
- Rakit HTML: `python3 engine/build.py dist clips/01-explainer.html`
- Render video bisu: `node engine/render.js dist/01-explainer.html out/silent.mp4 30`
- Ekspor `cues.json` berisi penanda waktu efek suara lalu jalankan mixing audio:
  `python .agent/skills/sound-effects/scripts/sound_pass.py --video out/silent.mp4 --vo vo.wav --cues cues.json --manifest .agent/skills/sound-effects/sfx/manifest.json --out out_audio`
