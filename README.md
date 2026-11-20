# Cheat Clip and Motion

> Studio pembuatan video animasi & klip berbasis kode deterministik (React Remotion), AI CLI Agent, dan generator template otomatis. Semua proses berjalan 100% lokal di laptop Anda.

---

## 📚 Dokumentasi Lengkap

Seluruh dokumentasi proyek, panduan teknis, PRD, dan diagram alur pipeline telah dikelompokkan di folder [`docs/`](docs/):

1. **[Alur Kerja Pipeline & Arsitektur Lengkap (`docs/workflow.md`)](docs/workflow.md)**  
   *Panduan mendalam cara kerja Motion Standar, Motion Pro (Long-form $\ge 4$ menit), dan Tools Ekstrak Gaya Video dari A sampai Z beserta diagram alur.*
2. **[Dokumentasi Teknis Studio (`docs/DOKUMENTASI.md`)](docs/DOKUMENTASI.md)**  
   *Spesifikasi lengkap fitur Studio, integrasi AI lokal & langganan CLI, mesin suara VoxCPM, serta sistem tema.*
3. **[PRD Motion Pro Long-Form AI Studio (`docs/prd_alur_kerja_motion_pro_long_form_ai_studio.md`)](docs/prd_alur_kerja_motion_pro_long_form_ai_studio.md)**  
   *Product Requirement Document untuk orkestrasi video berdurasi panjang berbasis AI Director Agent.*
4. **[Dokumentasi Proyek Asli (`docs/README.md`)](docs/README.md)**  
   *Petunjuk instalasi awal, dependensi sistem, dan konfigurasi lingkungan.*

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
