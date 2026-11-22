# Cheat Clip and Motion

> Studio pembuatan video animasi & klip berbasis kode deterministik (React Remotion), AI CLI Agent, dan generator template otomatis. Semua proses berjalan 100% lokal di laptop Anda.

---

## 📚 Dokumentasi Lengkap

Seluruh dokumentasi proyek, panduan teknis, PRD, dan diagram alur pipeline telah dikelompokkan di folder [`docs/`](docs/):

1. **[Buku Manual & Tutorial Lengkap Penggunaan (`docs/TUTORIAL_PENGGUNAAN.md`)](docs/TUTORIAL_PENGGUNAAN.md)**  
   *Panduan langkah demi langkah menggunakan seluruh fitur: Klip (download via GitHub), Motion (Ide AI, Naskah Manual, Animasi Karakter Storyboard), Motion Pro (Long-Form 4m+), Ekstrak Gaya Video (Chunking 8s & AI Merger), Ekosistem Gemini Canvas (Naskah & SEO Viral), serta Setup Pengaturan AI lengkap.*
2. **[Alur Kerja Pipeline & Arsitektur Lengkap (`docs/workflow.md`)](docs/workflow.md)**  
   *Panduan mendalam arsitektur sistem hulu-ke-hilir: Motion Standar, Studio Animasi Bergerak, Motion Pro ($\ge 4$ menit), Tools Ekstrak Gaya Video 2 Kategori, serta Monitor Kuota Token Realtime.*
3. **[Workflow: Studio Animasi Bergerak Plan B (`docs/workflow_animasi_karakter_bergerak.md`)](docs/workflow_animasi_karakter_bergerak.md)**  
   *Panduan teknis eksekusi karakter animasi bergerak berbasis React Remotion Native Canvas, matematika sendi periodik, procedural lip-sync, dan visual QA keyframes dengan memori sangat hemat (< 600 MB RAM).*
4. **[Dokumentasi Teknis Studio (`docs/DOKUMENTASI.md`)](docs/DOKUMENTASI.md)**  
   *Spesifikasi lengkap fitur Studio, integrasi AI lokal & langganan CLI, widget kuota realtime Antigravity, mesin suara VoxCPM, serta sistem tema.*
5. **[PRD Motion Pro Long-Form AI Studio (`docs/prd_alur_kerja_motion_pro_long_form_ai_studio.md`)](docs/prd_alur_kerja_motion_pro_long_form_ai_studio.md)**  
   *Product Requirement Document untuk orkestrasi video berdurasi panjang berbasis AI Director Agent.*
6. **[Dokumentasi Penggunaan Singkat (`docs/README.md`)](docs/README.md)**  
   *Petunjuk instalasi awal macOS & Windows, dependensi sistem, tabel fitur antarmuka, dan konfigurasi lingkungan.*

---

## 🚀 Memulai Cepat

Pastikan Node.js (≥ 18) dan Python (≥ 3.10) sudah terpasang, lalu jalankan studio:

```bash
# Jalankan Studio lokal (jendela aplikasi)
uv run studio.py

# Atau jalankan di browser
uv run studio.py --browser
```

Studio akan berjalan di `http://127.0.0.1:8787`.

---

## ⚖️ Lisensi & Atribusi

Project **Cheat Clip and Motion** ini adalah proyek kelanjutan (*fork* / pengembangan lanjutan) dari rangka proyek asli karya **Maliki Saputra (@malikisaputra)** — https://malikisaputra.biz.id, dengan modifikasi, penambahan fitur (*Motion Pro Long-Form*, *Dynamic Agent Engine*, *Ekstraksi Gaya Video*, *Slash Skill Command*, dsb.) serta pengembangan yang dilakukan oleh **Bayunity** (BRKH Studio).

Proyek ini tetap menyertakan kredit utuh sesuai ketentuan dari pemilik asli rangka proyek di bawah **Lisensi Nonkomersial Maliki Studio 1.0**:
- Boleh dipakai untuk belajar, keperluan pribadi, atau kebutuhan operasional internal usaha/organisasi sendiri.
- Boleh diubah dan dibagikan secara gratis dengan kredit utuh pemilik asli tetap disertakan.
- **Dilarang keras dijual, dijual ulang, disewakan, diunggah ke marketplace komersial, atau dipakai untuk jasa berbayar ke pihak lain**.
- Teks lisensi lengkap: [`LISENSI.md`](LISENSI.md). Pustaka pihak ketiga (Remotion, faster-whisper, VoxCPM2, font OFL, dll.) tetap mengikuti lisensinya masing-masing.
