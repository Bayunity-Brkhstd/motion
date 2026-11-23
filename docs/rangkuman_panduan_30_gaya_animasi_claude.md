# Panduan 30 Gaya Animasi Claude (@coretanfery)

Panduan ini berisi kumpulan *prompt* siap pakai untuk membuat animasi berbasis kode HTML5 `<canvas>` secara langsung di Claude (melalui fitur *Artifacts*) tanpa perlu keahlian *coding* maupun aplikasi edit video tambahan.

## 1. Persiapan & Cara Pakai

### Kebutuhan Dasar
1. **Akun Claude** (`claude.ai` atau aplikasi Claude di HP/laptop).
2. **Fitur Artifacts Aktif** (cek di *Settings / Pengaturan* bagian fitur).
3. **Aplikasi Perekam Layar** (*Screen Recorder*) bawaan HP atau laptop untuk menyimpan hasil animasi menjadi video.

### Langkah Penggunaan (3 Langkah)
1. **Salin Prompt Utama** di bawah ini.
2. **Ganti dua variabel:** `[ADEGAN]` dengan ide ceritamu, dan `[GAYA]` dengan salah satu deskripsi dari 30 gaya yang tersedia.
3. **Kirim ke Claude:** Animasi akan langsung muncul dan bergerak. Jika belum sesuai, minta revisi menggunakan bahasa sehari-hari (contoh: *"mobilnya lebih besar"* atau *"warnanya lebih cerah"*).

> **Tips:** Mulai dari satu gaya terlebih dahulu. Setelah mendapatkan gerakan adegan yang pas, minta Claude membuat ulang adegan yang sama menggunakan gaya lainnya.

---

## 2. Prompt Utama (Master Prompt)

Salin seluruh teks di dalam kotak berikut dan ganti bagian di dalam tanda kurung siku:

```text
Buatkan animasi dalam satu file HTML (HTML + CSS + JavaScript, gambar memakai <canvas>).
Format: vertikal 9:16 (1080 x 1920), durasi 4 detik, berputar otomatis (loop), langsung jalan saat dibuka.
Adegan: [ADEGAN]
Gaya visual: [GAYA]
Aturan:
Semua gambar dibuat dengan kode, tanpa gambar dari internet.
Gerakan halus memakai easing, tidak kaku.
Kamera diam; latar bergerak berlapis (parallax) supaya terasa hidup.
Objek utama besar dan jelas di tengah layar.
Jangan ada tombol, teks petunjuk, atau tampilan lain di layar.
Bagian atas dan bawah layar dibiarkan lega (tidak ada objek penting di 10% paling atas dan 20% paling bawah).
Tampilkan hasilnya langsung sebagai artifact yang bisa diputar.
```

### Contoh Pengisian `[ADEGAN]`
* **Contoh 1:** *"Sebuah van retro kuning melaju dari kiri ke kanan di jalan kota. Gedung-gedung bergerak ke belakang. Di detik 2,5 van melompat kecil karena polisi tidur, lalu mendarat dengan kepulan debu."*
* **Contoh 2:** *"Kucing oren berjalan santai di atap genteng kota, ada antena, cerobong berasap, dan menara air. Ikan digantung dengan tali dari atas; di detik 2,3 kucing melompat dan menangkap ikan dengan mulutnya."*
* **Contoh 3:** *"Karyawan berbaju oren berjalan ke kantor di trotoar kota sambil membawa kopi panas yang berasap. Ada gedung-gedung tinggi, lampu jalan, dan pohon. Kartu ID tergantung di dadanya."*
* **Contoh 4:** *"Gadis bertopi jerami bersepeda di jalan desa tepi laut, keranjang di depan berisi roti. Rambutnya berkibar; di detik 2 sepedanya melewati gundukan kecil dan topinya hampir terbang."*
* **Contoh 5:** *"Burung hantu terbang pelan di depan bulan besar, sayapnya mengepak lebar. Di detik 2,5 ia hinggap di dahan pohon dan menoleh ke arah kamera."*

---

## 3. Panduan Memilih Gaya Berdasarkan Nuansa

* **Lucu dan Hangat:** Pixel Art, Flat Vector, Balok Mainan, Clay, Boneka Rajut, Kertas Potong, Anime Pedesaan.
* **Keren dan Teknologi:** Neon, PS2 3D, Hologram, Kamera Panas, Glitch, ASCII.
* **Artistik:** Kapur Tulis, Cat Air, Garis Minimal, Origami, Batik, Sketsa Pensil, Tinta Sumi-e, Impasto Minyak, Gouache Malam.
* **Klasik dan Mewah:** Cetak Kayu Jepang, Mozaik Romawi, Lukisan Botani, Art Nouveau.
* **Retro:** Komik, Kartun Jadul, Blueprint.
* **Dramatis:** Golden Hour, Gouache Malam.

---

## 4. Daftar Lengkap 30 Gaya Visual

### Part 1: Gaya 1 – 10

1. **Pixel Art**
   > Pixel art ala game 16-bit. Gambar di resolusi kecil (sekitar $135 \times 240$) lalu perbesar tanpa penghalusan agar kotak-kotak pikselnya terlihat. Palet warna terbatas (16-24 warna), langit senja bergradasi bertingkat, jendela gedung kotak kecil yang menyala.
2. **Kapur Tulis**
   > Gambar kapur di papan tulis hijau gelap bertekstur. Garis putih dan kuning sedikit bergetar seperti digambar tangan (gambar ulang 8 kali per detik dengan sedikit acak). Isian memakai arsiran miring, ada butiran debu kapur.
3. **Neon**
   > Retro neon tahun 80-an. Latar ungu-biru gelap, matahari besar bergaris, jalan grid perspektif biru muda yang bergerak. Semua garis bercahaya (glow) warna magenta, cyan, dan kuning, dengan inti garis putih tipis.
4. **PS2 3D**
   > 3D low-poly ala game PlayStation 2. Buat mesin 3D sederhana sendiri di canvas: objek dari kotak dan silinder bersisi sedikit, pencahayaan datar dari satu arah, kabut tipis di kejauhan. Render di seperempat resolusi lalu perbesar agar agak buram, warna dibulatkan dengan sedikit dither, tambahkan garis scanline tipis.
5. **Komik**
   > Gaya buku komik. Outline hitam tebal, warna primer datar (merah, biru, kuning), latar titik-titik halftone, garis kecepatan di belakang objek. Tulisan efek suara besar seperti "VROOM!" dan "BRUK!" di dalam balon bergerigi, semuanya di dalam bingkai panel komik.
6. **Flat Vector**
   > Ilustrasi flat vector modern. Warna pastel lembut tanpa outline, bayangan transparan halus, bukit bergelombang, awan bulat, pohon berbentuk lingkaran, matahari kuning sederhana.
7. **Garis Minimal**
   > Minimalis elegan. Latar hitam pekat, garis putih tipis 2-3 px yang tergambar perlahan di detik pertama. Titik kecil di setiap sudut bentuk seperti rasi bintang, satu lingkaran orbit tipis dengan titik yang berputar, banyak ruang kosong.
8. **Balok Mainan**
   > 3D seperti mainan balok plastik. Semua benda tersusun dari balok berwarna cerah (merah, biru, kuning, hijau) dengan tonjolan bulat kecil di bagian atas balok. Alas hijau bertonjolan, pencahayaan terang dan bersih.
9. **Cat Air**
   > Lukisan cat air di kertas krem bertekstur. Warna tembus pandang ditumpuk beberapa lapis dengan tepi sedikit tidak rata, garis pensil tipis di tepi objek. Gambar sedikit "hidup" (berubah halus 6 kali per detik) seperti lukisan tangan.
10. **Blueprint**
    > Gambar teknik blueprint. Latar biru tua dengan grid putih tipis, semua objek digambar garis putih seperti rancangan. Ada garis ukuran dengan panah dan label (misalnya "4,50 m"), garis tengah putus-putus, dan kotak judul gambar di pojok.

### Part 2: Gaya 11 – 20 (Cocok untuk Adegan Ramai Detail)

11. **Clay**
    > Animasi clay/plastisin ala stop-motion. Semua objek seperti dibentuk dari plastisin: sudut membulat, kilap lembut di bagian atas, bayangan lembut di bawah, bintik sidik jari halus. Gerakan sengaja patah-patah 12 frame per detik. Warna cerah hangat, langit biru ke krem.
12. **Boneka Rajut**
    > Semua objek seperti dirajut dari benang wol: isian memakai pola rajutan V berulang, tepi berjahit putus-putus, mata dari kancing, matahari dari kancing besar. Tambahkan gulungan benang dengan ujung benang terurai. Warna pastel lembut.
13. **Kartun Jadul**
    > Kartun hitam-putih tahun 1930-an: karakter hitam pekat dengan wajah krem, mata seperti potongan kue, sarung tangan/kaki putih bulat, matahari tersenyum. Gerak 15 frame per detik, gambar sedikit bergoyang, grain film, goresan vertikal, layar berkedip, vignette gelap, dan kartu judul ala film lama.
14. **Hologram**
    > Proyeksi hologram futuristik: latar biru gelap, semua objek garis cyan bercahaya dengan isian tembus pandang yang berkedip halus, scanline bergerak, piringan proyektor bercahaya di lantai, grid perspektif. Tambahkan HUD: kotak siku di sekitar objek utama dengan label, panel data kecil, radar berputar, teks status di pojok.
15. **Kamera Panas**
    > Rekaman kamera termal: lingkungan berwarna dingin (biru tua dan ungu), objek utama bergradasi panas putih-kuning-oranye-merah-ungu. Tambahkan HUD kamera: REC berkedip, jam, kotak merah 'TARGET TERKUNCI', crosshair, angka suhu, dan skala warna vertikal di sisi kanan.
16. **Origami**
    > Semua objek dari kertas lipat: bentuk segitiga bersegi dengan dua nada warna di tiap sisi lipatan, bayangan lembut seperti kertas ditempel, matahari kertas berputar pelan, latar kertas krem dengan garis lipatan tipis, garis putus-putus 'lipat di sini'.
17. **ASCII**
    > Seni ASCII di layar terminal: gambar adegan dulu di kanvas tersembunyi dalam skala abu-abu, lalu ubah jadi karakter monospace hijau (`.:-=+*#%@`) sesuai terang-gelapnya. Tambahkan baris perintah terminal di atas, progress bar di bawah, kursor berkedip, dan scanline tipis.
18. **Glitch**
    > Glitch digital: semua objek digambar tiga kali (merah, cyan, putih) dengan sedikit pergeseran sehingga warnanya terpisah, irisan horizontal acak yang bergeser, kotak piksel berwarna acak. Tambahkan jendela error ala komputer jadul berisi pesan lucu yang muncul dan hilang.
19. **Batik**
    > Nuansa batik Indonesia: langit bermotif kawung, bangunan bermotif parang, lantai motif truntum, warna sogan (coklat tua, coklat keemasan, krem). Objek utama oranye dengan tekstur motif tipis dan garis tepi krem, matahari berbentuk bunga kawung, pita batik di atas dan bawah.
20. **Sketsa Pensil**
    > Sketsa pensil di kertas buku tulis bergaris biru dengan garis margin merah. Garis abu-abu sedikit bergetar dan digambar dobel seperti coretan tangan, isian arsiran miring, pensil kuning ikut bergerak menggambar, dan tulisan tangan kecil di pojok bawah.

### Part 3: Gaya 21 – 30 (Cocok untuk Adegan Tenang & Indah)

21. **Cetak Kayu Jepang**
    > Cetakan balok kayu ala Jepang klasik di kertas krem bertekstur. Warna terbatas: nila, biru, biru muda, krem, dan merah bata. Garis tepi tegas dengan tebal yang sama, ombak besar bergulung dengan buih putih berbentuk cakar, garis air berlapis, awan berupa garis datar, dan stempel merah vertikal di pojok.
22. **Mozaik Romawi**
    > Mozaik batu kuno. Gambar adegan dulu di kanvas tersembunyi yang sangat kecil (sekitar $46 \times 82$), lalu ubah tiap piksel jadi ubin batu kecil dengan nat gelap di antaranya. Warna tiap ubin sedikit acak dan posisinya sedikit miring. Palet tanah: krem, terakota, biru laut. Bingkai pola ubin coklat-emas di sekeliling.
23. **Tinta Sumi-e**
    > Lukisan tinta hitam ala Asia Timur di kertas beras krem bertekstur. Sapuan kuas yang tebal di awal lalu menipis di ujung, tepi sedikit buram seperti tinta meresap. Banyak ruang kosong, batang bambu beruas dengan daun dari satu sapuan, dan satu stempel merah kecil di pojok.
24. **Impasto Minyak**
    > Lukisan cat minyak tebal (impasto). Langit terbuat dari ribuan sapuan kuas pendek yang mengikuti arah pusaran dan berputar pelan, warna biru tua, biru muda, dan kuning. Bintang berpendar berlapis, pohon cemara gelap di depan, tekstur kanvas halus di seluruh layar.
25. **Gouache Malam**
    > Cat gouache malam hari: bentuk datar dengan warna pekat dan matte, tanpa kilap dan tanpa outline. Palet biru malam, bulan besar krem dengan kawah lembut, bintang kecil berkelip, siluet gelap tegas di depan bulan, butiran kertas tipis.
26. **Lukisan Botani**
    > Ilustrasi botani ala buku ilmiah lama. Kertas tua krem dengan bingkai garis tipis, garis tinta halus dengan warna lembut tembus pandang. Label kecil 'Pl. 07' di pojok atas, nama latin bercetak miring di bawah gambar, dan serangga kecil yang terbang di sekitar tanaman.
27. **Kertas Potong**
    > Seni kertas potong berlapis (papercut). Setiap lapisan kertas berwarna memberi bayangan lembut ke lapisan di belakangnya. Bukit bergelombang berlapis dari terang ke gelap, matahari dari lingkaran bertumpuk, awan kertas putih, gradasi langit senja merah muda ke oranye.
28. **Art Nouveau**
    > Poster dekoratif gaya Art Nouveau awal 1900-an. Bingkai lengkung hias dengan garis emas dan hijau tua, sinar matahari berjari di belakang objek utama, garis kontur melengkung yang mengalir. Palet emas, hijau toska, biru, dan krem, dengan panel ornamen bulat di bagian bawah.
29. **Golden Hour**
    > Siluet saat matahari terbenam. Langit bergradasi ungu, merah muda, oranye, lalu kuning, dengan matahari besar bercahaya di cakrawala. Semua objek berupa siluet coklat gelap tanpa detail, pohon akasia berpayung datar, rumput yang bergoyang, butiran halus.
30. **Anime Pedesaan**
    > Anime berlatar pedesaan yang cerah. Langit biru jernih, awan putih besar bervolume dengan bayangan biru lembut, padang hijau penuh bunga kecil, laut berkilau di kejauhan, rumah kecil beratap merah. Warna jenuh dan bersih, karakter dengan garis tipis dan bayangan sederhana.

---

## 5. Bonus: Prompt Gabungkan Gaya Jadi Satu Video

Setelah beberapa gaya selesai dibuat dalam satu ruang obrolan yang sama, kirim *prompt* berikut untuk menggabungkannya menjadi satu video kompilasi berdurasi ±19 detik:

```text
Gabungkan gaya-gaya yang sudah kita buat menjadi satu animasi vertikal 9:16 (1080 x 1920), sekitar 19 detik, dengan satu gaya tiap 1,3 detik:
- Latar gelap berbintang yang berkelip pelan.
- Atas: judul "[JUMLAH] Gaya Animasi Claude", kata "Claude" merah dan miring.
- Kiri: daftar nomor gaya muncul satu per satu. Nomor yang sedang tampil berwarna oranye dan tebal dengan kotak sorot; nomor sebelumnya tetap terlihat abu-abu.
- Kanan: kartu vertikal bersudut membulat berisi animasi gaya yang sedang tampil. Tiap ganti gaya ada kilatan putih singkat dan kartu sedikit membesar.
- 3 detik terakhir: kisi 6 gambar (3 atas, 3 bawah) dengan teks ajakan di tengah, misalnya "Komen GAYA untuk prompt-nya".
Tampilkan sebagai artifact yang bisa diputar.
```

> **Tips Adegan Ramai:** Tambahkan kalimat *"beri detail latar khas gaya ini: tulisan, panel, properti kecil, dan gerakan latar"* pada *prompt* utama agar hasil visual tidak terlihat polos.

---

## 6. Cara Menyimpan Video & Troubleshooting

### Menyimpan Jadi Video
1. Buka hasil animasi dalam mode layar penuh (klik tombol perbesar di sudut *Artifact*).
2. Aktifkan perekam layar (*Screen Recorder*) di HP atau laptop, lalu putar animasi dari awal.
3. Potong bagian awal dan akhir video, lalu tambahkan musik atau efek suara di aplikasi edit video (opsional).

### Kalimat Perbaikan Jika Hasil Kurang Pas
* **Kosong atau error:** *"animasinya tidak muncul, tolong perbaiki"*
* **Terlalu sederhana:** *"tambahkan detail latar dan gerakan kecil di objek"*
* **Gerakan patah-patah:** *"buat gerakannya lebih halus pakai easing"*
* **Gaya kurang terasa:** *"pertegas ciri gaya [nama gaya] di semua objek, bukan cuma warnanya"*