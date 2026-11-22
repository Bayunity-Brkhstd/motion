Salin dan tempel *Master Prompt* di bawah ini langsung ke **AI Agent / Coding Agent** di aplikasi studio Anda (Antigravity CLI / Claude Code / OpenCode) agar agen tersebut mengeksekusi pembangunan pipeline *Video-to-Skill & Template Generator* secara menyeluruh dan terstruktur:

```markdown
# TASK: Implementasi Sistem Otomatis "Video Referensi -> Global Skill & Remotion Template Generator"

## Konteks Arsitektur Proyek
Aplikasi ini menggunakan mesin rendering video berbasis kode React + Remotion (`motion/src/Video.tsx`) yang menerima kontrak data JSON (`Props` dan `Adegan`), validasi grafis SVG (`motion/svg-aman.mjs`), serta modul keahlian AI di direktori `motion/skills/` (dan direktori global `.agent/skills/`).

Saat ini, pengguna dapat mengunggah video referensi (`.mp4` / `.mov` / `.webm`) di panel "2. Referensi Contoh Video" dengan opsi "Auto-Hapus video mentah setelah gaya diekstrak". Tugas Anda adalah membangun pipeline otomatis end-to-end agar setiap video referensi yang diunggah langsung dianalisis secara visual, diterjemahkan menjadi **Preset Template Remotion baru** dan **Skill AI baru**, lalu didaftarkan secara global agar langsung terbaca oleh UI Studio maupun AI Director Agent.

---

## Spesifikasi Teknis & Langkah Eksekusi

### 1. Buat Pipeline Ekstraksi Visual (`scripts/extract_video_style.py`)
Buat skrip Python yang menerima argumen `--video <path_video>`, `--slug <nama_gaya>`, dan `--purge` (opsional untuk menghapus video mentah setelah selesai):
- **Deteksi Pergantian Adegan & Pacing:** Gunakan `ffprobe` / `ffmpeg` (`select='gt(scene,0.35)'`) untuk menghitung total durasi, jumlah potongan adegan, dan rata-rata durasi per adegan (`avg_pacing_sec`).
- **Ekstraksi Keyframe:** Ekstrak maksimal 8–12 frame representatif (resolusi lebar 720px) dari titik perubahan adegan ke direktori sementara `tmp_style_frames/<slug>/`.
- **Ekstraksi Palet Warna Dominan:** Gunakan K-Means clustering (atau kuantisasi warna Pillow/NumPy) pada seluruh keyframe untuk mengekstrak **5 kode warna HEX** paling dominan (urut dari background utama, warna sekunder, hingga warna aksen kontras).
- **Output Analisis Mentah:** Simpan hasil metrik ke `tmp_style_frames/<slug>/metrics.json` dan jalankan Vision AI analyzer untuk memetakan DNA visual video ke skema JSON berikut:
  ```json
  {
    "slug": "nama-gaya-unik",
    "display_name": "Nama Gaya Visual",
    "description": "Deskripsi pemicu kapan AI harus memakai gaya ini",
    "avg_pacing_sec": 3.2,
    "aspect_ratio": "9:16",
    "palette_hex": ["#14427A", "#0B0B0B", "#FACC15", "#38BDF8", "#F97316"],
    "visual_grammar": {
      "rendering_style": "3D cel-shaded toon outline / flat isometric / kinetic typography",
      "stroke_rule": "stroke='#0B0B0B' stroke-width='3' stroke-linejoin='round'",
      "character_or_object_rules": "Aturan proporsi karakter, ikon, diagram blueprint, atau panah vektor",
      "background_style": "Aturan warna latar, grid, atau gradasi langit"
    },
    "typography_and_subtitle": {
      "font_family": "Montserrat ExtraBold",
      "title_max_words": 4,
      "subtitle_mode": "word-pop | phrase | sentence",
      "subtitle_position": "bottom-center",
      "subtitle_stroke": "8px #0B0B0B"
    },
    "motion_physics": {
      "spring_stiffness": 180,
      "spring_damping": 18,
      "dominant_transition": "whip-pan | zoom-punch | slide-up | crossfade",
      "camera_shake_on_impact": true
    }
  }

```

* **Auto-Purge:** Jika flag `--purge` aktif, hapus file video mentah dan folder `tmp_style_frames/<slug>/` segera setelah proses generasi file selesai.

### 2. Buat Generator Skill & Template (`scripts/generate_style_artifacts.py`)

Berdasarkan JSON hasil ekstraksi tahap 1, buat generator yang otomatis menghasilkan dan memperbarui file-file berikut:

#### A. Generate Skill Global (`motion/skills/<slug>/SKILL.md`)

Buat folder `motion/skills/<slug>/` (dan sinkronkan salinannya ke `.agent/skills/<slug>/` jika folder tersebut ada) berisi `SKILL.md` dengan frontmatter YAML valid:

* `name: <slug>`
* `description: <description> + instruksi eksplisit agar AI memilih preset gaya ini saat diminta.`
* **Body `SKILL.md` wajib memuat:**
1. Batasan *pacing* (`durasi_detik` tiap objek `Adegan` harus berkisar pada `avg_pacing_sec`).
2. Wajib mengisi properti `palet` di `naskah.json` dengan 5 kode HEX hasil ekstraksi.
3. Standar baku penulisan kode SVG pada properti `gambar?: string` untuk tiap adegan (wajib mematuhi `visual_grammar`, tanpa tag `<script>` atau atribut `on*` agar 100% lolos validasi `motion/svg-aman.mjs`).
4. Aturan teks layar (`judul` maksimal `title_max_words` kata) dan gaya narasi.



#### B. Generate Preset Komposisi Remotion (`motion/src/presets/<slug>.tsx`)

Buat komponen/konfigurasi preset TypeScript yang mengekspor objek bertipe `StylePreset`:

* Mengatur rendering latar belakang, *layout* posisi judul, *styling* kotak label industri/callout, konfigurasi fisika pegas Remotion (`spring({ stiffness, damping })`), efek transisi antar-`<Sequence>`, dan gaya subtitle (`toon-word-sub` / stroke tebal).

### 3. Ubah Arsitektur Template Menjadi Dynamic Global Registry

Refaktor `motion/src/Video.tsx` dan sistem registry skill agar tidak lagi terbatas pada 17 preset statis:

1. **Preset Registry (`motion/src/presets/index.ts`):** Buat file indeks yang secara otomatis mengekspor seluruh preset (17 preset bawaan + seluruh preset baru di `motion/src/presets/*.tsx`). Pastikan `generate_style_artifacts.py` otomatis menambahkan import dan entry baru ke `STYLE_PRESETS` setiap kali ada video referensi baru yang diproses.
2. **Dynamic Lookup di `motion/src/Video.tsx`:** Ubah `Props.gaya` agar mendukung string dinamis apa pun dan merender komponen menggunakan `const preset = STYLE_PRESETS[props.gaya] ?? STYLE_PRESETS['default']`.
3. **Global Skill Manifest (`motion/skills/registry.json`):** Perbarui `registry.json` setiap kali skill baru tercipta, berisi daftar `{ slug, name, description, palette_hex, avg_pacing_sec, created_at }` agar:
* Panel UI **"4. Skills & Plugin Eksternal"** langsung menampilkan chip skill baru tersebut tanpa perlu restart manual.
* **AI Director Agent** otomatis membaca `registry.json` dan memuat isi `motion/skills/<slug>/SKILL.md` saat user mengaktifkan skill tersebut.



### 4. Validasi & Pengujian Mandiri

Setelah seluruh kode selesai dibuat:

1. Jalankan pengujian end-to-end dengan membuat 1 sampel gaya dari video referensi (atau mock metrics JSON) bernama `toon-3d-celshaded`.
2. Pastikan `motion/skills/toon-3d-celshaded/SKILL.md`, `motion/src/presets/toon-3d-celshaded.tsx`, `motion/src/presets/index.ts`, dan `motion/skills/registry.json` terbuat dengan sintaks valid.
3. Jalankan typecheck TypeScript (`npx tsc --noEmit`) untuk memastikan `Video.tsx` dan preset baru bebas dari error kompilasi.
4. Laporkan daftar file yang dibuat/dimodifikasi beserta cara memanggil endpoint/CLI ekstraksi video referensi dari UI.

```

---

### Cara Menggunakan Prompt Ini:
1. Tempelkan seluruh blok prompt di atas ke terminal **AI Agent** di dalam direktori root proyek studio video Anda.
2. Agen akan langsung memindai struktur `motion/src/Video.tsx`, `motion/svg-aman.mjs`, dan `motion/skills/`, lalu menulis skrip ekstraksi video, generator `SKILL.md` + `preset.tsx`, serta mengubah `Video.tsx` menjadi dinamis.
3. Setelah selesai, setiap kali Anda mengunggah video TikTok baru di kolom **Referensi Contoh Video**, sistem akan otomatis melahirkan **Skill baru** di daftar chip panel 4 dan **Template Remotion baru** yang siap langsung dipakai untuk proyek video berikutnya.

Apakah Anda juga ingin saya buatkan contoh `metrics.json` hasil ekstraksi dari video A-10 Warthog tadi agar bisa langsung Anda pakai untuk menguji sistem baru ini begitu agen selesai bekerja?

```

its done
