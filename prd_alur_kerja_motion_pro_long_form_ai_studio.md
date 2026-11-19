# Product Requirements Document (PRD): Motion Pro Long-form AI Studio

**Versi Dokumen:** 1.2 (Low-Mid PC Optimization & Storage Management Update)  
**Status:** Updated / Ready for Development  
**Nama Produk:** Cheat Clip & Motion — Modul **Motion Pro Long-form AI Studio**  
**Target Durasi Video:** $\ge 4$ menit ($4 - 15+$ menit)  
**Target Hardware:** PC Spesifikasi *Low-to-Mid* (RAM $\ge 8\text{ GB}$, penyimpanan terbatas)  
**Arsitektur Utama:** Lightweight CLI AI Agent + Memory-Efficient Remotion Engine + Smart Disk Cleanup  

## 1. Ringkasan Produk & Analisis Antarmuka (UI/UX Breakdown)

**Motion Pro Long-form AI Studio** adalah ruang kerja sutradara AI (*AI Director Workspace*) berbasis desktop yang dirancang khusus untuk memproduksi video *motion graphics* berdurasi panjang ($\ge 4$ menit). Aplikasi ini dioptimalkan secara khusus agar tetap ringan, responsif, dan **hemat RAM maupun ruang penyimpanan (*disk space*) pada PC spesifikasi *low-to-mid*** dengan menggabungkan input *User Cards* pada panel kiri dan eksekusi berbasis CLI/kode **Remotion (React)** pada panel kanan tanpa membebani GPU/RAM seperti *video editor* tradisional berbasis GUI berat.

### A. Navigasi & Status Global (Left Sidebar)
* **Menu Utama:** *Beranda*, *Klip* (`Dev`), *Motion*, dan **Motion Pro** (aktif, berlabel `4m+`).
* **Pustaka & Utilitas Penyimpanan:** *Riwayat* proyek, *Pengaturan AI*, serta **Manajer Penyimpanan / Bersihkan Cache** untuk memantau penggunaan ruang *disk*.
* **Indikator Engine & Resource Monitor (Bottom-Left):** Menampilkan status koneksi (`AT: lokal` — Gratis tanpa kunci), informasi ringkas penggunaan memori/disk, pengaturan tema (`Tampilan: otomatis`), dan tombol **`Matikan Studio`** untuk segera membebaskan seluruh alokasi RAM dan proses *background* setelah selesai digunakan.

### B. Header Workspace
* **Metadata & Tagline:** `ai agent workspace · khusus durasi >= 4 menit · cli langganan · low-ram mode`.
* **Kontrol Sesi & Penyimpanan:** Indikator status `Aktif (Terbuka)`, tombol `Kunci Workspace`, serta tombol aksi cepat **`Bersihkan Workspace / Hapus File Sementara`** untuk mengosongkan proyek lama atau *cache render*.

### C. Kolom Kiri: Panel Input Data (4 Kartu Utama / User Cards)
Panel kiri berfungsi sebagai pusat pengumpulan bahan mentah yang dilengkapi kontrol penghapusan individual agar penyimpanan selalu terkendali:
1. **Card Upload Asset (Wadah Utama Aset Media):**
   * **Voice Over:** File rekaman suara/narasi utama berdurasi panjang (`.mp3`, `.wav`, `.m4a`).
   * **Image Asset & Referensi Visual:** Aset gambar pendukung dan referensi gaya visual (`.jpg`, `.png`, `.gif`, `.svg`), dilengkapi kolom opsional **Arahan Gaya Visual**.
   * **Brand Logo / Watermark:** Identitas visual atau logo merek untuk *overlay*.
   * **SFX External:** File efek suara tambahan dari luar sistem.
   * **Font:** Jenis huruf khusus (`.ttf`, `.otf`, `.woff`).
   * *Kontrol Hapus Aset:* Setiap item yang diunggah memiliki tombol **Hapus (`×` / Ikon Sampah)** individual maupun tombol **Kosongkan Semua Aset** untuk langsung menghapus salinan file dari folder kerja.
2. **Card Referensi Contoh Video:**
   * Tempat mengunggah contoh video referensi yang gaya editan, transisi, atau ritmenya ingin ditiru. Dilengkapi tombol **Hapus Video Referensi** (termasuk opsi hapus otomatis setelah AI selesai mengekstrak gaya/metadata video guna menghemat ratusan MB ruang disk).
3. **Card Naskah Markdown (`.md`):**
   * Editor teks langsung dengan tombol `Buka File .md`, `Isi Contoh Naskah`, dan `Reset / Hapus Naskah`, lengkap dengan kalkulator estimasi adegan (`0 kata · Perkiraan ~0 adegan`).
4. **Card Upload Skill / Plugin Eksternal:**
   * Menampilkan daftar *skill* aktif (`isometric-video`, `motion-graphics`, `sound-effects`, `video-making` dengan status `SIAP`), area unggah *skill* eksternal (`.zip`, `.md`, `.txt`), serta tombol **Hapus / Uninstall Skill Eksternal** yang tidak lagi dipakai.

### D. Kolom Kanan: Motion Director Agent (AI Workspace)
* **Header Agent:** Identitas **Motion Director Agent** (*Long-Form Remotion Orchestrator · CLI Reasoning*) dengan dropdown pemilih model LLM (contoh: `Claude 3.7 Sonnet (Claude Code CLI)`) dan tombol *reset* sesi.
* **Thinking Process (Reasoning State):** Kotak log transparan yang menampilkan aktivitas internal agen secara *real-time* (pembacaan `SKILL_LONGFORM.md`, *chunking* memori, dan kompilasi `Video.tsx`).
* **Kontrol Interaktif & Prompt Bar:**
  * Tombol aksi cepat: `Analisis File & Susun Storyboard`, `Samakan Style Referensi`, serta opsi pembersihan pasca-render (`Hapus Cache & File Temp`).
  * *Quick-action chips* & input instruksi bebas.

## 2. Kebutuhan Produk (Product Requirements)

### 2.1 Kebutuhan Fungsional (Functional Requirements)

| ID | Modul / Fitur | Spesifikasi Kebutuhan |
| :--- | :--- | :--- |
| **FR-01** | **Multi-Asset Upload & Individual Delete** | Sistem mendukung unggahan terpadu (*Voice Over*, *Image*, *Brand Logo*, *SFX*, *Font*) sekaligus menyediakan tombol **Hapus per item** dan **Hapus per kartu** untuk langsung menghapus file dari penyimpanan lokal. |
| **FR-02** | **Auto-Folder Structuring** | Mesin aplikasi menganalisis file dari *Card Upload Asset* dan membuat struktur folder terisolasi (`/assets/vo`, `/assets/images`, `/assets/logo`, `/assets/sfx`, `/assets/fonts`). |
| **FR-03** | **Video Reference Analyzer & Auto-Purge** | Sistem memindai *Card Referensi Contoh Video* untuk mengekstrak *pacing*, transisi, dan tata letak. Tersedia opsi **Auto-Delete Video Referensi** setelah ekstraksi selesai agar file video besar tidak menumpuk di disk. |
| **FR-04** | **Markdown Script & Scene Estimator** | Editor `.md` menghitung jumlah kata dan mengestimasi pemecahan segmen berdurasi $4 - 8$ detik per adegan. |
| **FR-05** | **External Skill Loader & Uninstaller** | Sistem memuat *skill* eksternal (`.zip`, `.md`, `.txt`) dan menyediakan fitur **Hapus/Uninstall Skill** serta pembersihan otomatis file arsip `.zip` mentah setelah diekstrak. |
| **FR-06** | **Smart Skill Fallback Mechanism** | Jika *skill* belum tersedia atau dikosongkan pengguna, AI meminta instalasi/template ke pengguna atau mencari referensi *open-source* secara mandiri. |
| **FR-07** | **Smart Disk Cleanup & Project Purge** | Menyediakan fitur penghapusan proyek di menu *Riwayat*, pembersihan *cache* *rendering* (`node_modules/.cache`, *frame* sementara, file *proxy*), dan penghapusan aset proyek lama dalam satu klik untuk menghemat ruang *disk*. |
| **FR-08** | **Low-RAM Chunked Rendering** | *Motion Director Agent* membagi proses *rendering* video panjang ($\ge 4$ menit) ke dalam *chunk* (potongan adegan kecil) secara sekuensial agar konsumsi RAM tetap rendah dan stabil pada PC *low-to-mid*. |

### 2.2 Kebutuhan Non-Fungsional: Optimasi PC Spesifikasi Low-to-Mid (KRITIS)

* **Arsitektur Ultra-Hemat RAM (*Low Memory Footprint*):**
  * **Offload Komputasi via CLI:** Pemrosesan logika *storyboard* dan generasi kode dijalankan melalui *CLI Agent* yang ringan tanpa memuat antarmuka *timeline* grafis berat (*canvas preview* 60fps real-time) di memori.
  * **Chunked & Sequential Processing:** Untuk durasi $\ge 4$ hingga $15+$ menit, audio dan *rendering* Remotion diproses per segmen ($4 - 8$ detik) lalu digabungkan (*stitching*) menggunakan FFmpeg dengan batasan *worker thread* adaptif sesuai kapasitas RAM (aman untuk PC RAM $8\text{ GB}$).
  * **Zero Background Leak:** Tombol **`Matikan Studio`** dan mekanisme *Garbage Collection* otomatis memastikan seluruh proses Chromium/Node/CLI ditutup total setelah sesi atau *render* selesai sehingga RAM kembali lega.
* **Efisiensi Ruang Penyimpanan (*Disk Space Efficiency*):**
  * Menggunakan referensi *path* langsung atau pembersihan otomatis (*auto-purge*) untuk file sementara (*temp frames*, file ekstraksi `.zip`, dan video referensi pasca-analisis).
  * Indikator peringatan jika sisa kapasitas *disk* berada di bawah ambang batas aman sebelum memulai proses *render* video panjang.

## 3. Langkah Kerja Sistem End-to-End (Complete Workflow)

Berikut adalah alur kerja lengkap pembuatan video *motion long-form* yang telah dioptimalkan untuk efisiensi RAM dan penyimpanan:

### Tahap 1: Tahap Input Data (Pengisian User Cards)
Pengguna menyiapkan materi produksi pada 4 kartu (*card*) input utama di panel kiri:
1. **Mengisi Card Upload Asset:** Mengunggah **Voice Over** ($\ge 4$ menit), **Image Asset** (`.jpg/.png/.gif/.svg`), **Brand Logo / Watermark**, **SFX External**, dan **Font** kustom. *(Pengguna dapat langsung menekan tombol hapus pada item jika salah unggah agar tidak memakan ruang disk).*
2. **Mengisi Card Referensi Contoh Video:** Mengunggah contoh video referensi gaya editan.
3. **Mengisi Card Naskah Markdown:** Memasukkan naskah `.md` untuk dihitung estimasi jumlah adegannya.
4. **Mengisi Card Upload Skill / Plugin Eksternal:** Mengunggah *skill* tambahan (`.zip`, `.md`, `.txt`) jika diperlukan.
5. *(Opsional)* Menekan **`Kunci Workspace`** sebelum memproses.

### Tahap 2: Tahap Pemrosesan, Organisasi & Analisis Hemat Memori
Setelah dipicu, **Motion Director Agent** menjalankan pemrosesan secara ringan (terpantau di *Thinking Process*):
1. **Manajemen & Analisis Aset (Auto-Folder):** AI menganalisis metadata file dan menyusun struktur folder terisolasi di dalam mesin aplikasi (`voice_over/`, `images/`, `brand_logo/`, `sfx_external/`, `fonts/`).
2. **Analisis Gaya Referensi & Auto-Purge:** AI memindai pola editing, *pacing*, transisi, dan tata letak dari **Referensi Contoh Video**. Setelah parameter gaya tersimpan dalam bentuk teks/JSON ringan, sistem menawarkan penghapusan file video referensi mentah dari *workspace* untuk menghemat ruang penyimpanan.
3. **Pengecekan Skill & Plugin:** AI memeriksa ketersediaan *skill* (`SKILL_LONGFORM.md` dan *skill* eksternal), serta otomatis menghapus arsip `.zip` mentah setelah diekstrak.

### Tahap 3: Penanganan Kondisi (Fallback Mechanism)
Jika *skill* atau *plugin* untuk gaya editan tertentu tidak ditemukan:
1. **Jika Skill Belum Tersedia:** AI meminta pengguna meng-install *skill* yang dibutuhkan terlebih dahulu, **ATAU** meminta pengguna memberikan *template* tambahan pada *card* yang disediakan.
2. **Jika Card Skill Dikosongkan:** AI mencari *skill* atau pustaka animasi ringan secara mandiri dari sumber terbuka (*open-source*).

### Tahap 4: Orkestrasi Timeline & Chunked Rendering (Hemat RAM)
1. **Audio-Script Alignment:** AI menyinkronkan *timestamp* jeda napas audio *Voice-Over* dengan naskah Markdown tanpa memuat seluruh gelombang audio beresolusi tinggi ke RAM.
2. **Pemecahan Adegan:** Memecah naskah menjadi segmen $4 - 8$ detik per adegan dan menyusun kode React pada `motion/src/Video.tsx`.
3. **Render Bertahap (*Low-RAM Chunk Rendering*):** Video dirender secara bertahap per segmen dengan pembatasan penggunaan memori agar PC spesifikasi *low-to-mid* tidak mengalami *lag* atau *crash*.

### Tahap 5: Pembersihan Pasca-Produksi (Disk & RAM Cleanup)
Setelah video final berhasil diekspor:
1. **Hapus Cache & File Sementara:** Pengguna dapat menekan tombol **`Bersihkan Cache / Hapus Aset Proyek`** (atau mengaktifkan opsi *Auto-Cleanup* di pengaturan) untuk menghapus file *temp frames*, aset mentah di folder kerja, dan proyek lama di menu *Riwayat* guna membebaskan ruang *disk*.
2. **Matikan Studio:** Pengguna menekan **`Matikan Studio`** di pojok kiri bawah untuk menghentikan seluruh *background engine* dan mengembalikan kapasitas RAM PC sepenuhnya.

## 4. Ringkasan Alur Kerja (Unified & Optimized Flowchart)

```
[1. INPUT USER CARDS (Panel Kiri — Dilengkapi Tombol Hapus per Item/Card)]
 ├── Card Upload Asset (VO, Image, Brand Logo, SFX External, Font)
 ├── Card Referensi Contoh Video
 ├── Card Naskah Markdown (.md)
 └── Card Upload Skill / Plugin Eksternal (.zip, .md, .txt)
                          │
                          ▼
[2. MANAJEMEN ASET & ANALISIS HEMAT MEMORI]
 ├── AI Buat Struktur Folder Khusus & Analisis Metadata Aset
 ├── AI Ekstrak Gaya Video Referensi ──► [Opsional: Auto-Hapus File Video Ref]
 └── AI Ekstrak Skill Eksternal ───────► [Auto-Hapus File .zip Mentah]
                          │
                          ▼
[3. PENGECEKAN SKILL & PLUGIN (CLI Reasoning Ringan)]
        ├── Skill Lengkap & Siap ──────────────────────────┐
        └── Skill Tidak Ada / Card Skill Kosong            │
              ├──► Opsi A: Minta User Install Skill /      │
              │            Berikan Template di Card        │
              └──► Opsi B: AI Cari Skill Mandiri dari      │
                           Sumber Terbuka (Open-Source) ───┤
                                                           ▼
                              [4. ORKESTRASI & LOW-RAM CHUNK RENDERING]
                               ├── Alignment Audio VO & Pecah Adegan (4-8 Detik)
                               ├── Susun Kode Video.tsx & Generasi SVG Ringan
                               └── Render Bertahap per Segmen (Aman untuk RAM 8GB)
                                                           │
                                                           ▼
                              [5. PEMBERSIHAN DISK & RAM (POST-PRODUCTION)]
                               ├── Fitur Hapus Aset / Cache Render / Riwayat Proyek
                               └── Klik "Matikan Studio" ──► RAM & CPU Bebas Total
```