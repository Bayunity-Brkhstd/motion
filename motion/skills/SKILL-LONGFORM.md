# Skill: Long-Form Motion Graphics Production (>= 4 Menit)

Panduan operasional dan instruksi pipeline produksi video motion graphics durasi panjang ($\ge$ 4 menit) menggunakan CLI Langganan berbayar (**Claude Code CLI**, **Antigravity CLI**, **OpenAI Codex CLI**, atau **OpenCode**) yang terhubung dengan engine **Remotion** dan **Cheat Motion**.

## Spesifikasi Long-Form Video:
- **Target Durasi:** 4 hingga 15+ menit (240 - 900+ detik).
- **Jumlah Adegan:** Rata-rata 30 - 90 adegan terstruktur (tiap adegan berdurasi 4 - 8 detik).
- **Kebutuhan Engine AI:** Model reasoning berkapasitas konteks tinggi (Claude 3.7 Sonnet / GPT-4.5 / o3) melalui CLI resmi yang login di terminal.

## Struktur Aset Wajib:
1. **Naskah Markdown (`naskah.md`):** Teks narasi lengkap dibagi per babak (*Acts*) dan adegan (*Scenes*).
2. **Audio Narasi Utuh (`audio.mp3` / `audio.wav`):** Rekaman voice-over utuh tanpa potongan.
3. **Aset Gambar Referensi (`/referensi/`):** Karakter, logo, moodboard, dan palet warna yang harus konsisten di seluruh video.

## Alur Eksekusi Agent:
1. **Fase 1: Transkripsi & Audio Alignment:**
   - Jalankan `python analisa.py` untuk menghasilkan word-level timestamp dari audio narasi.
   - Peta-kan setiap babak dan kalimat naskah ke rentang detik aktual.
2. **Fase 2: Storyboard & SVG Generation:**
   - Buat kode SVG per adegan dengan konsistensi visual berdasarkan gambar referensi.
   - Gunakan `svg-aman.mjs` untuk sanitasi elemen SVG sebelum dimasukkan ke Remotion.
3. **Fase 3: Remotion Composition Assembly:**
   - Susun komponen adegan di `motion/src/Video.tsx` menggunakan `Series.Sequence`.
   - Pasang efek transisi, kamera pan/zoom, serta subtitle dinamis per adegan.
4. **Fase 4: Multi-Threaded Video Rendering:**
   - Render video menggunakan FFmpeg dan Remotion CLI dengan preset 1080x1920 30fps.
