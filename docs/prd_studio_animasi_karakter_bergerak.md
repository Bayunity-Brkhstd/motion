# PRD: Studio Animasi Karakter Bergerak (Native Remotion Engine)
> **Product Requirement Document (PRD)**  
> **Status:** Draft untuk Peninjauan (*Review & Input*)  
> **Target Rilis:** Cheat Clip & Motion Pro  
> **Arsitektur:** Plan B — Native Remotion Kinetic Canvas (`motion/src/VideoAnimasi.tsx`)  
> **Akses:** Khusus AI Berlangganan (Antigravity CLI / Claude Code CLI)

---

## 1. Latar Belakang & Masalah (*Problem Statement*)

### 1.1 Masalah Saat Ini
1. **Visual Terbatas pada Objek Statis:**  
   Komposisi utama saat ini (`motion/src/Video.tsx`) hanya memuat objek grafis SVG atau ilustrasi statis yang digerakkan posisinya (*translasi, rotasi, scale, wiggle*) menggunakan fisika pegas (`spring`). Objek atau karakternya sendiri tidak berubah bentuk, tidak melangkah, tidak mengayunkan tangan, dan ekspresi wajahnya tidak hidup.
2. **Section "Tempel Naskah JSON" Terlalu Kaku & Teknis:**  
   Pengguna diwajibkan menyusun dan menempelkan struktur data JSON yang rumit (`adegan: [{ judul, teks, gambar }]`). Hal ini membingungkan bagi kreator non-programmer dan memicu banyak *syntax error*.
3. **Risiko Boros RAM jika Memakai Playwright Multi-Browser (Plan A):**  
   Membuka 4 instance browser Chromium *headless* Playwright untuk memotret 6.000+ frame PNG ke harddisk memakan RAM hingga 3.5 GB dan mengotori SSD pengguna dengan ribuan file temporer.

### 1.2 Solusi yang Diajukan (Plan B)
Membangun **Studio Animasi Karakter Bergerak** yang terintegrasi secara *native* di dalam Remotion (`VideoAnimasi.tsx`):
- **Ringan & Hemat RAM (< 600 MB):** Memanfaatkan engine internal Remotion yang merender frame langsung di memori dan mengalirkannya langsung (*pipe*) ke FFmpeg tanpa menyimpan ribuan file PNG di SSD.
- **Karakter Benar-Benar Bergerak:** Memanfaatkan canvas matematika deterministik (`useCurrentFrame()`) yang menghitung siklus langkah kaki (*walk cycle*), ayunan tangan (*arm swing*), kedipan mata (*eye blink*), serta ekspresi wajah (*smile, shock, speak*).
- **Eksklusif AI Berlangganan (AGY CLI / Claude CLI):** Menghubungkan antarmuka ke AI Agent langganan untuk menyusun logika adegan dan matematika gerak secara otomatis dari naskah teks polos (tanpa perlu ketik JSON).

---

## 2. Profil Pengguna & Pembagian Akses (*Tiering*)

| Tier Pengguna | Akses ke Studio Animasi Bergerak | Pengalaman Pengguna (UX) |
|---|---|---|
| **Akun Gratisan / AI Lokal** | 🔒 **Terkunci (*Protected*)** | Ditampilkan banner edukatif elegan: *"Fitur Animasi Karakter Bergerak membutuhkan AI Berlangganan (Antigravity CLI atau Claude Code). Hubungkan akun di Pengaturan AI."* |
| **Langganan Antigravity CLI (`agy`)** | ✅ **Akses Terbuka Penuh** | Menggunakan model Gemini 3.8 Flash High / Claude via Antigravity Engine untuk menyusun kode gerak dan adegan. |
| **Langganan Claude Code CLI (`claude`)** | ✅ **Akses Terbuka Penuh** | Menggunakan model Claude 3.7 Sonnet Thinking untuk orkestrasi karakter dan adegan kinetik. |

> **Mengapa Wajib Berlangganan CLI?**  
> Menyusun timecode adegan yang presisi, menghitung ritme pergantian pose karakter, dan memastikan tidak ada cacat visual membutuhkan kemampuan penalaran kode (*coding reasoning*) tingkat frontier. Model gratisan atau model lokal kecil memiliki *context window* terbatas dan rentan halusinasi.

---

## 3. Spesifikasi Fungsional (*Functional Requirements*)

### FR-01: Rombak Tab "Tempel Naskah JSON" di UI Studio
- Menggantikan kotak teks textarea JSON di tab Motion dengan antarmuka **"🎬 Studio Animasi Karakter"**.
- Input utama:
  - **Naskah Cerita (Teks Polos / Markdown):** User cukup mengetik cerita per paragraf.
  - **Audio Narasi Voice-Over:** Pilihan menggunakan suara sistem SAPI/VoxCPM atau upload MP3/WAV sendiri.
  - **Pilihan Rig Karakter:** Kartu visual untuk memilih jenis karakter animasi.

### FR-02: Koleksi Rig Karakter Bawaan & Hasil Ekstraksi
1. 🎭 **Toon 3D Explainer:** Karakter kartun cel-shaded (lingkungan blueprint, ekspresi wajah, gestur tangan mitten, dolly zoom kamera).
2. 🏃 **2D Stickman Action:** Karakter stickman kinetik dinamis di latar perkotaan/kantor dengan siklus jalan dan lari.
3. 📐 **3D Isometric Engine:** Animasi balok isometrik, conveyor belt, server jaringan, dan infografis teknologi.
4. ⭐ **Custom Video Extracted Rig:** Setiap video referensi animasi baru yang diunggah di menu *Ekstrak Gaya* otomatis melahirkan template rig karakter baru di menu ini.

### FR-03: Visual QA Inspector (Pengganti Tinjauan JSON)
- Sebelum render video MP4 penuh yang memakan waktu, pengguna disajikan **Strip Snapshot Keyframe (4–6 pose kunci)**:
  - Menampilkan pratinjau gambar karakter di adegan pembuka, adegan tengah, dan adegan klimaks.
  - Pengguna dapat memastikan pose karakter dan komposisi sudah pas tanpa harus membaca struktur kode JSON.

### FR-04: Komposisi Remotion Native (`motion/src/VideoAnimasi.tsx`)
- Didaftarkan sebagai komposisi kedua di `motion/src/Akar.tsx`:
  ```tsx
  <Composition
    id="AnimasiBergerak"
    component={VideoAnimasi}
    fps={30}
    width={1080}
    height={1920}
    defaultProps={defaultAnimasiProps}
  />
  ```
- Di setiap frame (`t = frame / fps`), fungsi rig karakter menghitung:
  - Rotasi sendi lutut & engkel: `Math.sin(t * speed) * amplitude`
  - Rotasi pundak & ayunan siku tangan: `Math.cos(t * speed) * amplitude`
  - Bentuk mulut buka-tutup sinkron narasi: `Math.abs(Math.sin(t * 12))`
  - Pergerakan mata dan ekspresi wajah sesuai mood adegan.

### FR-05: Auto-Sync Presets & Zero Dead-Imports
- Mempertahankan sistem *self-healing* yang sudah dibuat: Jika pengguna menghapus salah satu rig/template, sistem otomatis membersihkan `index.ts` sehingga proses compile Remotion tidak pernah crash.

---

## 4. Spesifikasi Non-Fungsional (*Non-Functional Requirements*)

1. **Konsumsi RAM:** Maksimal **600 MB** selama proses rendering berlangsung di background.
2. **Kebersihan Disk:** 0 temporary PNG files (semua frame dialirkan langsung dari memori browser internal Remotion ke encoder video).
3. **Resolusi & Frame Rate:** 1080×1920 (9:16 Vertikal TikTok/Shorts) & 1920×1080 (16:9 Landscape YouTube), 30 FPS deterministik.
4. **Kecepatan Render:** Rata-rata 1–2 menit untuk video berdurasi 60 detik di laptop standar (tanpa perlu GPU NVIDIA monster).

---

## 5. Pertanyaan Kunci untuk Masukan Pengguna (*Open Questions*)
1. *Apakah rasio video default ingin diutamakan vertikal 9:16 (Shorts/Reels) atau tersedia toggle switch cepat ke 16:9?*
2. *Apakah tab naskah ingin tetap memiliki opsi "Mode Lanjutan (JSON)" tersembunyi (accordion) bagi user yang ingin modifikasi manual, atau dihapus total demi kesederhanaan UI?*




# Catatan Perbaikan Performa & Efisiensi (Native Remotion)

Ringkasan perbaikan teknis murni untuk menurunkan konsumsi RAM, mempercepat proses render, dan mencegah *crash* pada implementasi `motion/src/VideoAnimasi.tsx` (Plan B):

## 1. Manajemen Memori & Proses Rendering
* **Batasi Concurrency Render (`--concurrency=2`):** Mencegah Remotion membuka terlalu banyak *tab* Chromium paralel saat render, sehingga konsumsi RAM tetap aman di bawah **1.2 GB** pada laptop standar.
* **Zero Disk I/O Temporer:** Render frame langsung dari memori ke *pipe* FFmpeg tanpa menulis ribuan file gambar `.png` sementara ke SSD.
* **Cleanup Bundle Otomatis:** Hapus folder sementara hasil *bundling* Webpack/Rspack setelah proses render MP4 selesai agar tidak menumpuk di disk.

## 2. Optimasi Komponen & Animasi (`VideoAnimasi.tsx`)
* **Lip-Sync Berbasis Amplitudo Audio (`@remotion/media-utils`):** Gunakan data gelombang suara asli (`visualizeAudio`) untuk bukaan mulut karakter—lebih ringan daripada kalkulasi *loop* buta dan otomatis berhenti merender gerakan mulut saat narator jeda.
* **Memoization Komponen Latar (`React.memo`):** Bungkus elemen latar statis (seperti *grid blueprint* atau gedung kota) dengan `React.memo` agar Remotion tidak menghitung ulang DOM SVG latar di setiap *frame* (30x per detik).
* **Pratinjau Cepat (`npx remotion still`):** Gunakan render *still image* berskala kecil (`--scale=0.35`) untuk *Visual QA Inspector* (4–6 *keyframe*), memangkas waktu pengecekan dari hitungan menit menjadi **2–3 detik**.

## 3. Keandalan Pipeline & Error Handling
* **Auto-Prune Registry (`index.ts`):** Hapus otomatis baris `import` di `motion/src/presets/index.ts` saat preset/rig dihapus agar *bundler* Remotion tidak gagal *compile* (*zero dead-imports*).
* **Pertahankan Accordion JSON Mentah:** Sediakan `<details>` tersembunyi untuk edit JSON langsung demi mempercepat *debugging* tanpa harus melewati ulang proses *generate* AI CLI.