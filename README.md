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
