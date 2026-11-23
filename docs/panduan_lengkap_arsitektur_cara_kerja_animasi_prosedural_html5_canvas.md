# Arsitektur & Cara Kerja Pembuatan Video Animasi Prosedural Menggunakan HTML5 `<canvas>`

Panduan ini membedah secara teknis bagaimana LLM (seperti Claude atau Gemini) dapat digunakan sebagai **mesin render animasi prosedural** berbasis kode web (`HTML + CSS + JavaScript`), sekaligus cara mengekspornya secara otomatis menjadi file video `.mp4` beresolusi tinggi tanpa menggunakan generator video AI berbasis difusi.

---

## 1. Paradigma Dasar: Generative Canvas Coding vs. Diffusion Video AI

| Aspek Teknis | Diffusion Video AI (Sora, Kling, Runway) | Generative Canvas Coding (HTML5 `<canvas>`) |
| :--- | :--- | :--- |
| **Cara Kerja** | Memprediksi piksel frame demi frame menggunakan jaringan saraf tiruan (*latent diffusion*). | Menulis logika matematika, vektor, dan algoritma grafis untuk menggambar bentuk di atas kanvas. |
| **Konsistensi Objek** | Rentan mengalami *morphing* (bentuk karakter/latar berubah antar-detik). | **100% Konsisten** karena posisi, warna (HEX), dan ukuran dikunci dalam variabel kode. |
| **Kontrol Waktu & Gerak** | Sulit dikontrol secara presisi per milidetik. | Presisi absolut hingga satuan milidetik menggunakan fungsi waktu deterministik `t`. |
| **Kebutuhan Komputasi** | Membutuhkan GPU berat di server penyedia AI (berbayar/kredit terbatas). | Berjalan ringan langsung di peramban (*browser*) klien menggunakan CPU/GPU lokal. |
| **Kelemahan Utama** | Biaya render mahal dan terkadang menghasilkan artefak visual aneh. | Tidak cocok untuk anatomi wajah manusia yang hiper-realistis atau gerakan organik rumit. |

---

## 2. Anatomi Prompt Utama (Prompt Engineering Blueprint)

Agar LLM menghasilkan kode animasi yang siap pakai untuk konten vertikal (TikTok, Reels, YouTube Shorts), struktur *prompt* harus mengunci empat lapisan aturan teknis:

### A. Spesifikasi Kanvas & Viewport
* **Resolusi Fisik:** `1080 x 1920` piksel (rasio aspek `9:16`).
* **Responsive Scaling (CSS):** Menggunakan aturan CSS (`width: 100vw; height: 100vh; object-fit: contain;`) agar kanvas tetap proporsional saat dipratinjau di layar kecil maupun dirender dalam ukuran penuh.
* **Zero UI Clutter:** Melarang pembuatan tombol (*Play/Pause*), *slider*, atau teks petunjuk di atas kanvas agar hasil rekaman bersih.

### B. Safe-Zone Layout (Zona Aman Media Sosial)
Platform video vertikal menutupi bagian tepi layar dengan elemen antarmuka (tombol *like*, komentar, profil, dan *caption*). Kode diinstruksikan untuk menerapkan batas koordinat:
* **Margin Atas (`0% - 10%`):** Bebas dari objek krusial.
* **Area Fokus Utama (`10% - 80%`):** Tempat objek utama, karakter, dan teks *headline* berada.
* **Margin Bawah (`80% - 100%`):** Dikosongkan untuk ruang *caption* dan tombol navigasi platform.

### C. Sistem Kedalaman & Pergerakan (Motion & Parallax)
* **Kamera Statis dengan Multi-Layer Parallax:** Alih-alih menggerakkan kamera secara rumit, latar belakang dibagi menjadi beberapa lapisan (langit, gunung/gedung jauh, pepohonan dekat, tanah) yang digeser secara horizontal dengan kecepatan berbeda ($v_{\text{dekat}} > v_{\text{jauh}}$).
* **Easing Functions:** Pergerakan objek tidak menggunakan kecepatan linear yang kaku, melainkan fungsi matematika *easing* (seperti `easeInOutCubic` atau `easeOutBounce`) agar akselerasi dan deselerasi terlihat alami.

---

## 3. Teknik Penerjemahan Gaya Artistik ke Algoritma Kode

Kekuatan utama dari metode ini adalah kemampuan menerjemahkan estetika visual menjadi manipulasi piksel dan geometri secara matematis:

1. **Teknik Downsampling & Upscaling (Pixel Art, PS2 3D, Mozaik Romawi):**
   * Kanvas utama tidak digambar langsung di `1080x1920`, melainkan digambar di *offscreen canvas* berukuran sangat kecil (misalnya `135x240` untuk Pixel Art atau `46x82` untuk Mozaik).
   * Kanvas kecil tersebut kemudian diperbesar ke `1080x1920` dengan mematikan penghalusan piksel (`ctx.imageSmoothingEnabled = false`) sehingga menghasilkan efek kotak piksel tajam secara otomatis.
2. **Teknik Jitter & Frame-Rate Throttling (Kapur Tulis, Sketsa Pensil, Clay, Kartun Jadul):**
   * Alih-alih merender 60 frame per detik (fps) yang mulus, pembaruan bentuk dibatasi menjadi `8 fps` hingga `15 fps` untuk meniru efek animasi *stop-motion*.
   * Koordinat titik garis diberi nilai acak kecil (`Math.random() * 2`) setiap kali digambar ulang untuk menciptakan ilusi goresan tangan yang hidup.
3. **Teknik Chromatic Aberration & Pixel Slicing (Glitch & Hologram):**
   * Objek yang sama digambar tiga kali secara bertumpuk menggunakan mode pencampuran warna (`globalCompositeOperation = 'screen'`) dengan saluran warna Merah (`#FF0000`), Cyan (`#00FFFF`), dan Putih, lalu digeser beberapa piksel secara horizontal.
4. **Teknik Grayscale-to-Character Mapping (Seni ASCII):**
   * Adegan dirender secara tersembunyi dalam skala abu-abu (*grayscale*). Kode kemudian membaca nilai kecerahan tiap blok piksel (`getImageData`) dan menggantinya dengan karakter teks monospace (`.:-=+*#%@`) sesuai tingkat kegelapannya.

---

## 4. Arsitektur Render Otomatis ke MP4 (Deterministic Rendering Pipeline)

Pada umumnya, animasi HTML5 menggunakan `requestAnimationFrame()`, yang bergantung pada kecepatan layar pengguna dan rentan mengalami *frame drop* jika direkam manual. Untuk menghasilkan file video `.mp4` yang mulus langsung dari lingkungan *sandbox* AI, digunakan alur kerja berikut:

### Tahap 1: Eksposur Fungsi Waktu Deterministik (`window.__draw(t)`)
Kode animasi tidak boleh mengandalkan waktu nyata jam komputer (`Date.now()`). Seluruh posisi, rotasi, dan kemunculan teks harus dihitung murni sebagai fungsi dari parameter waktu `t` (dalam detik), yang diekspos secara global:

```javascript
// Contoh struktur fungsi deterministik di dalam file HTML
window.__draw = function(t) {
    // 1. Bersihkan kanvas
    ctx.clearRect(0, 0, 1080, 1920);
    
    // 2. Gambar latar berdasarkan waktu t
    drawParallaxBackground(t);
    
    // 3. Animasi tokoh berdasarkan waktu t
    const bounceY = Math.sin(t * 4) * 15;
    drawCharacter(540, 1200 + bounceY, t);
    
    // 4. Munculkan teks/UI sesuai timeline detik
    if (t >= 0.3) drawHeadline();
    if (t >= 7.8) drawPollingBox(t - 7.8);
};
```

### Tahap 2: Frame-by-Frame Capture via Headless Browser (Playwright)
Saat pengguna meminta ekspor ke video MP4, skrip Python/Node.js di dalam *container* server menjalankan browser tanpa tampilan (*headless Chromium*) menggunakan **Playwright**:
1. Browser membuka file `animasi.html` dengan ukuran *viewport* tepat `1080 x 1920`.
2. Untuk video berdurasi `11,5 detik` pada `30 fps`, skrip melakukan perulangan sebanyak $11,5 \times 30 = 345$ kali.
3. Pada setiap iterasi `i`, skrip menghitung $t = i / 30$, mengeksekusi perintah `page.evaluate(f"window.__draw({t})")`, lalu mengambil tangkapan layar berurutan (`frame_0001.png` hingga `frame_0345.png`).

### Tahap 3: Penggabungan Frame Menjadi Video (FFmpeg)
Setelah seluruh gambar PNG tersimpan di penyimpanan sementara, **FFmpeg** dijalankan untuk mengompilasi urutan gambar tersebut menjadi file video standar:

```bash
ffmpeg -framerate 30 -i frame_%04d.png -c:v libx264 -pix_fmt yuv420p -crf 18 output_video.mp4
```
* `-framerate 30`: Mengunci kecepatan putar pada 30 frame per detik.
* `-pix_fmt yuv420p`: Memastikan file MP4 kompatibel diputar di semua perangkat HP (iOS/Android) dan aplikasi editor seperti CapCut.
* `-crf 18`: Menjaga kualitas visual tetap tajam dengan ukuran file yang efisien.

---

## 5. Alur Kerja Produksi Konten (End-to-End Workflow)

1. **Perancangan Konsep & Gaya:** Menentukan jenis video (animasi *loop* pendek 4 detik atau narasi interaktif berseri 11,5 detik) beserta gaya visualnya.
2. **Generasi Kode & Pratinjau:** Mengirimkan *prompt* ke LLM untuk menghasilkan file HTML mandiri dan memverifikasi gerakan serta tata letak melalui pratinjau langsung (*Artifacts/Canvas*).
3. **Iterasi & Penyempurnaan:** Melakukan revisi berbasis bahasa alami (mengubah skala objek, menyesuaikan palet warna, atau menambah detail latar).
4. **Ekspor Visual:** Menjalankan skrip render Playwright + FFmpeg untuk mengunduh file `.mp4` bersih (atau menggunakan perekam layar penuh sebagai alternatif hemat kuota).
5. **Pasca-Produksi Audio:** Mengimpor file `.mp4` ke aplikasi penyunting video (seperti CapCut) untuk menambahkan sulih suara (*Text-to-Speech* / *Voice Over*), efek suara (*SFX*) yang sinkron dengan *timeline* detik, serta musik latar.