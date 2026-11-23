import json
import os
from pathlib import Path

# Daftar lengkap 30 gaya visual dari panduan Claude (@coretanfery)
STYLES_30 = [
    {
        "id": "pixel-art",
        "nama": "Pixel Art 16-Bit Retro",
        "badge": "16-Bit Pixel",
        "kategori": "animasi-bergerak",
        "deskripsi": "Pixel art ala game 16-bit retro (resolusi internal 135x240 dinaikkan tanpa penghalusan). Palet terbatas 16-24 warna, langit senja bergradasi bertingkat, jendela gedung kotak kecil menyala.",
        "pacingSec": 3.0,
        "aksen": "#FEE761",
        "thumbnail": "/aset/gaya/piksel.jpg",
        "palette_hex": ["#181425", "#3A4466", "#E43B44", "#FEE761", "#63C74D"],
        "fiturVisual": [
            "Grid Piksel Murni 16-Bit",
            "Palet Warna Terbatas (Retro Palette)",
            "Efek Dither & Langit Bertingkat",
            "Gerakan Objek Step-by-Step"
        ],
        "prompt_blueprint": "Pixel art ala game 16-bit. Gambar di resolusi kecil (sekitar 135x240) lalu perbesar tanpa penghalusan agar kotak-kotak pikselnya terlihat. Palet warna terbatas (16-24 warna), langit senja bergradasi bertingkat, jendela gedung kotak kecil yang menyala."
    },
    {
        "id": "kapur-tulis",
        "nama": "Kapur Tulis Papan Hijau",
        "badge": "Chalkboard",
        "kategori": "animasi-bergerak",
        "deskripsi": "Gambar kapur di papan tulis hijau gelap bertekstur. Garis putih dan kuning sedikit bergetar digambar ulang 8 FPS, isian arsiran miring, dan butiran debu kapur berhamburan.",
        "pacingSec": 3.5,
        "aksen": "#FDE047",
        "thumbnail": "/aset/gaya/kapur.jpg",
        "palette_hex": ["#1E3A2F", "#F8F9FA", "#FDE047", "#2D5A47", "#0E1D17"],
        "fiturVisual": [
            "Tekstur Papan Tulis Hijau Tua",
            "Goresan Kapur Bergetar 8 FPS",
            "Arsiran Miring & Butiran Debu",
            "Warna Kapur Putih & Kuning Lembut"
        ],
        "prompt_blueprint": "Gambar kapur di papan tulis hijau gelap bertekstur. Garis putih dan kuning sedikit bergetar seperti digambar tangan (gambar ulang 8 kali per detik dengan sedikit acak). Isian memakai arsiran miring, ada butiran debu kapur."
    },
    {
        "id": "neon",
        "nama": "Neon 80s Synthwave Outrun",
        "badge": "80s Synthwave",
        "kategori": "animasi-bergerak",
        "deskripsi": "Retro neon tahun 80-an: latar ungu-biru gelap, matahari besar bergaris horizontal, jalan grid perspektif biru muda bergerak, semua garis bercahaya glow magenta, cyan, kuning.",
        "pacingSec": 3.0,
        "aksen": "#06B6D4",
        "thumbnail": "/aset/gaya/neon.jpg",
        "palette_hex": ["#0F051D", "#F43F5E", "#06B6D4", "#FACC15", "#8B5CF6"],
        "fiturVisual": [
            "Latar Grid Perspektif Bergerak (Outrun)",
            "Glow Magenta, Cyan & Kuning Neon",
            "Matahari Sunset Bergaris Striped",
            "Partikel Cahaya Bintang Meluncur"
        ],
        "prompt_blueprint": "Retro neon tahun 80-an. Latar ungu-biru gelap, matahari besar bergaris, jalan grid perspektif biru muda yang bergerak. Semua garis bercahaya (glow) warna magenta, cyan, dan kuning, dengan inti garis putih tipis."
    },
    {
        "id": "ps2-3d",
        "nama": "PS2 3D Low-Poly Retro",
        "badge": "PS2 Low-Poly",
        "kategori": "animasi-bergerak",
        "deskripsi": "3D low-poly ala game PlayStation 2: mesin 3D sederhana dari balok dan silinder bersisi sedikit, pencahayaan flat, kabut tipis, dither buram, dan scanline horizontal CRT.",
        "pacingSec": 3.5,
        "aksen": "#F59E0B",
        "thumbnail": "/aset/gaya/ps2.jpg",
        "palette_hex": ["#1E293B", "#64748B", "#94A3B8", "#F59E0B", "#0F172A"],
        "fiturVisual": [
            "Model Geometri Low-Poly Sederhana",
            "Pencahayaan Flat Directional Shading",
            "Efek Dithering & Scanline CRT Tipis",
            "Kabut Misterius Keabuan (Fog Distance)"
        ],
        "prompt_blueprint": "3D low-poly ala game PlayStation 2. Buat mesin 3D sederhana sendiri di canvas: objek dari kotak dan silinder bersisi sedikit, pencahayaan datar dari satu arah, kabut tipis di kejauhan. Render di seperempat resolusi lalu perbesar agar agak buram, warna dibulatkan dengan sedikit dither, tambahkan garis scanline tipis."
    },
    {
        "id": "komik",
        "nama": "Komik Halftone Pop-Art",
        "badge": "Pop-Art Comic",
        "kategori": "animasi-bergerak",
        "deskripsi": "Gaya buku komik pop-art: outline hitam tebal, warna primer datar (merah, biru, kuning), latar pola titik halftone, garis kecepatan dinamis, balon efek suara besar (VROOM!).",
        "pacingSec": 2.8,
        "aksen": "#DC2626",
        "thumbnail": "/aset/gaya/komik.jpg",
        "palette_hex": ["#DC2626", "#2563EB", "#FACC15", "#111827", "#FFFFFF"],
        "fiturVisual": [
            "Titik-Titik Halftone Screen Ben-Day",
            "Outline Hitam Kontur Tebal Tegas",
            "Balon Onomatopoeia Efek Suara",
            "Garis Kecepatan Aksi Kinetik"
        ],
        "prompt_blueprint": "Gaya buku komik. Outline hitam tebal, warna primer datar (merah, biru, kuning), latar titik-titik halftone, garis kecepatan di belakang objek. Tulisan efek suara besar seperti 'VROOM!' dan 'BRUK!' di dalam balon bergerigi, semuanya di dalam bingkai panel komik."
    },
    {
        "id": "flat-vector",
        "nama": "Flat Vector Pastel Modern",
        "badge": "Modern Pastel",
        "kategori": "animasi-bergerak",
        "deskripsi": "Ilustrasi flat vector modern: warna pastel lembut tanpa outline hitam, bayangan transparan halus bertumpuk, bukit bergelombang, awan bulat bervolume, matahari cerah.",
        "pacingSec": 3.5,
        "aksen": "#38BDF8",
        "thumbnail": "/aset/gaya/flat.jpg",
        "palette_hex": ["#F8FAFC", "#38BDF8", "#FB7185", "#FCD34D", "#4ADE80"],
        "fiturVisual": [
            "Warna Pastel Hangat Tanpa Outline",
            "Bayangan Transparan Minimalis",
            "Kurva Geometris Mulus Modern",
            "Awan Melayang & Bukit Berombak"
        ],
        "prompt_blueprint": "Ilustrasi flat vector modern. Warna pastel lembut tanpa outline, bayangan transparan halus, bukit bergelombang, awan bulat, pohon berbentuk lingkaran, matahari kuning sederhana."
    },
    {
        "id": "garis-minimal",
        "nama": "Garis Minimal Rasi Bintang",
        "badge": "Minimalist Line",
        "kategori": "animasi-bergerak",
        "deskripsi": "Minimalis elegan: latar hitam pekat, garis putih tipis 2-3 px yang tergambar perlahan di awal adegan, titik kecil di setiap sudut menyerupai rasi bintang kosmis berputar halus.",
        "pacingSec": 4.0,
        "aksen": "#FFFFFF",
        "thumbnail": "/aset/gaya/minimal.jpg",
        "palette_hex": ["#000000", "#FFFFFF", "#64748B", "#38BDF8", "#E2E8F0"],
        "fiturVisual": [
            "Latar Hitam Pekat Deep Void",
            "Garis Vektor Putih Tipis 2px",
            "Titik Simpul Rasi Bintang Berkedip",
            "Orbit Lingkaran Kinematik Halus"
        ],
        "prompt_blueprint": "Minimalis elegan. Latar hitam pekat, garis putih tipis 2-3 px yang tergambar perlahan di detik pertama. Titik kecil di setiap sudut bentuk seperti rasi bintang, satu lingkaran orbit tipis dengan titik yang berputar, banyak ruang kosong."
    },
    {
        "id": "balok-mainan",
        "nama": "Balok Mainan Plastik 3D",
        "badge": "Plastic Bricks",
        "kategori": "animasi-bergerak",
        "deskripsi": "3D seperti mainan balok plastik konstruksi: semua benda tersusun dari balok berwarna cerah (merah, biru, kuning, hijau) bertonjolan bulat atas, pencahayaan bersih berkilap.",
        "pacingSec": 3.0,
        "aksen": "#EAB308",
        "thumbnail": "/aset/gaya/bata.jpg",
        "palette_hex": ["#EF4444", "#3B82F6", "#EAB308", "#22C55E", "#F8FAFC"],
        "fiturVisual": [
            "Tonjolan Silinder Atas Khas Balok",
            "Warna Plastik Primer Cerah Berkilau",
            "Alas Hijau Bertonjolan Grid",
            "Pencahayaan Studio Bersih"
        ],
        "prompt_blueprint": "3D seperti mainan balok plastik. Semua benda tersusun dari balok berwarna cerah (merah, biru, kuning, hijau) dengan tonjolan bulat kecil di bagian atas balok. Alas hijau bertonjolan, pencahayaan terang dan bersih."
    },
    {
        "id": "cat-air",
        "nama": "Cat Air Kertas Basah",
        "badge": "Watercolor Art",
        "kategori": "animasi-bergerak",
        "deskripsi": "Lukisan cat air di kertas krem bertekstur basah: warna tembus pandang ditumpuk beberapa lapis dengan tepi pigmen mengendap, garis pensil tipis, berubah halus 6 FPS.",
        "pacingSec": 3.8,
        "aksen": "#F472B6",
        "thumbnail": "/aset/gaya/kolase.jpg",
        "palette_hex": ["#FDFBF7", "#38BDF8", "#F472B6", "#FBBF24", "#34D399"],
        "fiturVisual": [
            "Tekstur Kertas Serat Krem Basah",
            "Lapisan Warna Tembus Pandang Transparan",
            "Efek Bleeding & Tepian Pigmen Alami",
            "Animasi Bernapas Halus 6 FPS"
        ],
        "prompt_blueprint": "Lukisan cat air di kertas krem bertekstur. Warna tembus pandang ditumpuk beberapa lapis dengan tepi sedikit tidak rata, garis pensil tipis di tepi objek. Gambar sedikit 'hidup' (berubah halus 6 kali per detik) seperti lukisan tangan."
    },
    {
        "id": "blueprint",
        "nama": "Blueprint Desain Teknik",
        "badge": "Cyan Blueprint",
        "kategori": "animasi-bergerak",
        "deskripsi": "Gambar teknik blueprint: latar biru tua dengan grid putih tipis, semua objek digambar garis rancangan putih, ada garis dimensi panah ukuran ('4,50 m') dan kotak etiket pojok.",
        "pacingSec": 3.5,
        "aksen": "#38BDF8",
        "thumbnail": "/aset/gaya/tekno.jpg",
        "palette_hex": ["#0A2540", "#38BDF8", "#FFFFFF", "#1E3A8A", "#60A5FA"],
        "fiturVisual": [
            "Grid Matematika Putih Tipis",
            "Garis Ukuran Panah Dimensi Teknis",
            "Label Ukuran Metrik & Anotasi",
            "Kotak Etiket Judul Arsitektur"
        ],
        "prompt_blueprint": "Gambar teknik blueprint. Latar biru tua dengan grid putih tipis, semua objek digambar garis putih seperti rancangan. Ada garis ukuran dengan panah dan label (misalnya '4,50 m'), garis tengah putus-putus, dan kotak judul gambar di pojok."
    },
    {
        "id": "clay",
        "nama": "Claymation Plastisin Stop-Motion",
        "badge": "Stop-Motion Clay",
        "kategori": "animasi-bergerak",
        "deskripsi": "Animasi tanah liat/plastisin ala stop-motion: sudut membulat lembut, kilap atas halus, bayangan tumpul, bintik sidik jari halus, gerakan patah-patah 12 FPS khas tanah liat.",
        "pacingSec": 3.0,
        "aksen": "#F97316",
        "thumbnail": "/aset/gaya/clay.jpg",
        "palette_hex": ["#F97316", "#0284C7", "#16A34A", "#CA8A04", "#FDE047"],
        "fiturVisual": [
            "Sudut Membulat Organik Plastisin",
            "Tekstur Halus Sidik Jari Pengrajin",
            "Gerakan Kinetik Stop-Motion 12 FPS",
            "Pencahayaan Studio Hangat Lembut"
        ],
        "prompt_blueprint": "Animasi clay/plastisin ala stop-motion. Semua objek seperti dibentuk dari plastisin: sudut membulat, kilap lembut di bagian atas, bayangan lembut di bawah, bintik sidik jari halus. Gerakan sengaja patah-patah 12 frame per detik. Warna cerah hangat, langit biru ke krem."
    },
    {
        "id": "boneka-rajut",
        "nama": "Boneka Rajut Benang Wol",
        "badge": "Knitted Wool",
        "kategori": "animasi-bergerak",
        "deskripsi": "Semua objek dirajut dari benang wol: isian pola rajutan V berulang, tepi berjahit putus-putus, mata dari kancing baju, matahari kancing besar, warna pastel hangat.",
        "pacingSec": 3.5,
        "aksen": "#E07A5F",
        "thumbnail": "/aset/gaya/hangat.jpg",
        "palette_hex": ["#FDF4E3", "#E07A5F", "#3D405B", "#81B29A", "#F2CC8F"],
        "fiturVisual": [
            "Pola Anyaman Rajutan V Berulang",
            "Mata & Ornamen dari Kancing Jahit",
            "Jahitan Keliling Putus-Putus",
            "Ujung Serat Benang Wol Lembut"
        ],
        "prompt_blueprint": "Semua objek seperti dirajut dari benang wol: isian memakai pola rajutan V berulang, tepi berjahit putus-putus, mata dari kancing, matahari dari kancing besar. Tambahkan gulungan benang dengan ujung benang terurai. Warna pastel lembut."
    },
    {
        "id": "kartun-jadul",
        "nama": "Kartun Jadul 1930s Rubberhose",
        "badge": "1930s Rubberhose",
        "kategori": "animasi-bergerak",
        "deskripsi": "Kartun monokrom tahun 1930-an: karakter hitam pekat berwajah krem, mata pai pie-eyes, sarung tangan putih bulat, 15 FPS, goresan vertikal film jadul, vignette berkedip.",
        "pacingSec": 2.5,
        "aksen": "#F5F5DC",
        "thumbnail": "/aset/gaya/retro.jpg",
        "palette_hex": ["#1A1A1A", "#F5F5DC", "#4A4A4A", "#808080", "#E0E0E0"],
        "fiturVisual": [
            "Mata Pie-Cut & Sarung Tangan Putih",
            "Efek Seluloid Film Grain & Goresan",
            "Gerakan Lentur Rubberhose 15 FPS",
            "Vignette Sudut Gelap Film Bisu"
        ],
        "prompt_blueprint": "Kartun hitam-putih tahun 1930-an: karakter hitam pekat dengan wajah krem, mata seperti potongan kue, sarung tangan/kaki putih bulat, matahari tersenyum. Gerak 15 frame per detik, gambar sedikit bergoyang, grain film, goresan vertikal, layar berkedip, vignette gelap, dan kartu judul ala film lama."
    },
    {
        "id": "hologram",
        "nama": "Hologram Sci-Fi Proyeksi HUD",
        "badge": "Sci-Fi Hologram",
        "kategori": "animasi-bergerak",
        "deskripsi": "Proyeksi hologram futuristik: latar biru gelap, objek garis cyan glowing tembus pandang berkedip, scanline berjalan, piringan emitter bawah, radar dan panel data HUD berputar.",
        "pacingSec": 3.0,
        "aksen": "#00F0FF",
        "thumbnail": "/aset/gaya/tekno.jpg",
        "palette_hex": ["#020C1B", "#00F0FF", "#0077FE", "#7000FF", "#E0F7FA"],
        "fiturVisual": [
            "Proyeksi Garis Cyan Neon Glowing",
            "Garis Pindai Scanline Bergerak Vertikal",
            "Piringan Emitter Proyektor Lantai",
            "Radar & Kotak Target Pelacak HUD"
        ],
        "prompt_blueprint": "Proyeksi hologram futuristik: latar biru gelap, semua objek garis cyan bercahaya dengan isian tembus pandang yang berkedip halus, scanline bergerak, piringan proyektor bercahaya di lantai, grid perspektif. Tambahkan HUD: kotak siku di sekitar objek utama dengan label, panel data kecil, radar berputar, teks status di pojok."
    },
    {
        "id": "kamera-panas",
        "nama": "Kamera Termal Night Vision",
        "badge": "Thermal Heatmap",
        "kategori": "animasi-bergerak",
        "deskripsi": "Rekaman sensor inframerah termal: lingkungan dingin ungu-biru, objek utama memancarkan gradasi panas merah-oranye-kuning-putih, indikator REC berkedip, crosshair suhu.",
        "pacingSec": 3.0,
        "aksen": "#F48C06",
        "thumbnail": "/aset/gaya/sorot.jpg",
        "palette_hex": ["#03071E", "#6A040F", "#D00000", "#F48C06", "#FFBA08"],
        "fiturVisual": [
            "Gradasi Suhu Tubuh Merah-Kuning-Putih",
            "Latar Lingkungan Dingin Biru-Ungu",
            "Indikator REC Merah & Crosshair Bidik",
            "Skala Termometer Suhu di Sisi Kanan"
        ],
        "prompt_blueprint": "Rekaman kamera termal: lingkungan berwarna dingin (biru tua dan ungu), objek utama bergradasi panas putih-kuning-oranye-merah-ungu. Tambahkan HUD kamera: REC berkedip, jam, kotak merah 'TARGET TERKUNCI', crosshair, angka suhu, dan skala warna vertikal di sisi kanan."
    },
    {
        "id": "origami",
        "nama": "Origami Kertas Lipat Geometris",
        "badge": "Folded Origami",
        "kategori": "animasi-bergerak",
        "deskripsi": "Semua objek terbuat dari kertas lipat: bidang segitiga bersegi dengan perbedaan kontras warna di tiap lipatan, bayangan tumpuk kertas, garis putus-putus pola lipatan origami.",
        "pacingSec": 3.5,
        "aksen": "#EF4444",
        "thumbnail": "/aset/gaya/kertas.jpg",
        "palette_hex": ["#F8F9FA", "#EF4444", "#3B82F6", "#F59E0B", "#10B981"],
        "fiturVisual": [
            "Geometri Poligon Lipatan Kertas",
            "Bayangan Halus Tumpukan Kertas (Depth)",
            "Garis Panduan Lipatan Putus-Putus",
            "Matahari Lipatan Kertas Berputar"
        ],
        "prompt_blueprint": "Semua objek dari kertas lipat: bentuk segitiga bersegi dengan dua nada warna di tiap sisi lipatan, bayangan lembut seperti kertas ditempel, matahari kertas berputar pelan, latar kertas krem dengan garis lipatan tipis, garis putus-putus 'lipat di sini'."
    },
    {
        "id": "ascii",
        "nama": "ASCII Art Terminal Konsol",
        "badge": "ASCII Terminal",
        "kategori": "animasi-bergerak",
        "deskripsi": "Seni karakter teks ASCII di layar terminal hacker: rendering grayscale dikonversi ke karakter monospace hijau (.:-=+*#%@), command line prompt, progress bar, kursor berkedip.",
        "pacingSec": 3.0,
        "aksen": "#00FF66",
        "thumbnail": "/aset/gaya/tekno.jpg",
        "palette_hex": ["#0A0F0D", "#00FF66", "#003B15", "#1B4332", "#D8F3DC"],
        "fiturVisual": [
            "Grid Karakter Monospace Hijau Fosfor",
            "Kepadatan Densitas Simbol Teks",
            "Kursor Terminal Berkedip Khas Linux",
            "Progress Bar Memori di Bagian Bawah"
        ],
        "prompt_blueprint": "Seni ASCII di layar terminal: gambar adegan dulu di kanvas tersembunyi dalam skala abu-abu, lalu ubah jadi karakter monospace hijau (`.:-=+*#%@`) sesuai terang-gelapnya. Tambahkan baris perintah terminal di atas, progress bar di bawah, kursor berkedip, dan scanline tipis."
    },
    {
        "id": "glitch",
        "nama": "Glitch RGB Shift Digital Error",
        "badge": "Digital Glitch",
        "kategori": "animasi-bergerak",
        "deskripsi": "Kerusakan sinyal digital futuristik: channel warna RGB terpisah (merah, cyan, putih), irisan horizontal pergeseran pixel acak, jendela pop-up error retro yang muncul mendadak.",
        "pacingSec": 2.5,
        "aksen": "#FF0055",
        "thumbnail": "/aset/gaya/retro.jpg",
        "palette_hex": ["#050505", "#FF0055", "#00FFFF", "#FFFF00", "#FFFFFF"],
        "fiturVisual": [
            "Pemisahan Channel Warna RGB Aberration",
            "Potongan Garis Horizontal Slicing",
            "Kotak Noise Pixel Acak Digital",
            "Jendela Dialog Error Komputer Retro"
        ],
        "prompt_blueprint": "Glitch digital: semua objek digambar tiga kali (merah, cyan, putih) dengan sedikit pergeseran sehingga warnanya terpisah, irisan horizontal acak yang bergeser, kotak piksel berwarna acak. Tambahkan jendela error ala komputer jadul berisi pesan lucu yang muncul dan hilang."
    },
    {
        "id": "batik",
        "nama": "Batik Nusantara Sogan & Kawung",
        "badge": "Batik Tradisional",
        "kategori": "animasi-bergerak",
        "deskripsi": "Nuansa batik tradisional Indonesia: langit motif kawung, bangunan motif parang, lantai motif truntum, warna klasik sogan (coklat tua, keemasan, krem), garis tepi lilin malam canting.",
        "pacingSec": 3.8,
        "aksen": "#D97706",
        "thumbnail": "/aset/gaya/emas.jpg",
        "palette_hex": ["#2C1810", "#78350F", "#D97706", "#FDE68A", "#451A03"],
        "fiturVisual": [
            "Pola Geometris Kawung & Parang Rusak",
            "Warna Klasik Sogan & Emas Keraton",
            "Tekstur Garis Retakan Lilin Canting",
            "Pita Border Ornamen Batik Atas-Bawah"
        ],
        "prompt_blueprint": "Nuansa batik Indonesia: langit bermotif kawung, bangunan bermotif parang, lantai motif truntum, warna sogan (coklat tua, coklat keemasan, krem). Objek utama oranye dengan tekstur motif tipis dan garis tepi krem, matahari berbentuk bunga kawung, pita batik di atas dan bawah."
    },
    {
        "id": "sketsa-pensil",
        "nama": "Sketsa Pensil Buku Tulis",
        "badge": "Pencil Sketch",
        "kategori": "animasi-bergerak",
        "deskripsi": "Sketsa goresan pensil di buku tulis bergaris biru dan margin merah: garis grafit bergetar dobel tangan, arsiran miring kasar, pensil kayu kuning yang ikut menggambar objek.",
        "pacingSec": 3.5,
        "aksen": "#64748B",
        "thumbnail": "/aset/gaya/kertas.jpg",
        "palette_hex": ["#FDFBF7", "#334155", "#64748B", "#EF4444", "#94A3B8"],
        "fiturVisual": [
            "Garis Buku Tulis Biru & Margin Merah",
            "Goresan Grafit Pensil Bergetar Dobel",
            "Arsiran Hatching & Cross-Hatching",
            "Animasi Ujung Pensil Ikut Bergerak"
        ],
        "prompt_blueprint": "Sketsa pensil di kertas buku tulis bergaris biru dengan garis margin merah. Garis abu-abu sedikit bergetar dan digambar dobel seperti coretan tangan, isian arsiran miring, pensil kuning ikut bergerak menggambar, dan tulisan tangan kecil di pojok bawah."
    },
    {
        "id": "cetak-kayu-jepang",
        "nama": "Cetak Kayu Jepang Ukiyo-e",
        "badge": "Ukiyo-e Wave",
        "kategori": "animasi-bergerak",
        "deskripsi": "Balok cetak kayu klasik Jepang ala Hokusai di kertas krem: warna nila, biru laut, dan merah bata, garis tepi kayu tegas seragam, ombak bergulung dengan buih cakar, stempel merah vertikal.",
        "pacingSec": 3.8,
        "aksen": "#E63946",
        "thumbnail": "/aset/gaya/sinematik.jpg",
        "palette_hex": ["#0F1E36", "#1D3557", "#457B9D", "#E63946", "#F1FAEE"],
        "fiturVisual": [
            "Buih Ombak Melengkung Berbentuk Cakar",
            "Palet Nila Indigo & Biru Laut Klasik",
            "Awan Garis Horizontal Pipih Berlapis",
            "Stempel Hanko Cap Merah di Pojok"
        ],
        "prompt_blueprint": "Cetakan balok kayu ala Jepang klasik di kertas krem bertekstur. Warna terbatas: nila, biru, biru muda, krem, dan merah bata. Garis tepi tegas dengan tebal yang sama, ombak besar bergulung dengan buih putih berbentuk cakar, garis air berlapis, awan berupa garis datar, dan stempel merah vertikal di pojok."
    },
    {
        "id": "mozaik-romawi",
        "nama": "Mozaik Batu Romawi Kuno",
        "badge": "Stone Mosaic",
        "kategori": "animasi-bergerak",
        "deskripsi": "Seni ubin mozaik batu kuno: kanvas dipetakan menjadi ribuan ubin batu kecil (tesserae) dengan nat gelap di sela-selanya, warna alami terakota, krem, dan bingkai pola ubin emas.",
        "pacingSec": 4.0,
        "aksen": "#D97706",
        "thumbnail": "/aset/gaya/bata.jpg",
        "palette_hex": ["#1C1917", "#78350F", "#9A3412", "#D97706", "#FEF3C7"],
        "fiturVisual": [
            "Grid Ubin Batu Kotak-Kotak Kecil",
            "Sela-Sela Semen Nat Gelap Alami",
            "Warna Terakota Tanah Liat Kuno",
            "Bingkai Ornamen Geometris Romawi"
        ],
        "prompt_blueprint": "Mozaik batu kuno. Gambar adegan dulu di kanvas tersembunyi yang sangat kecil (sekitar 46x82), lalu ubah tiap piksel jadi ubin batu kecil dengan nat gelap di antaranya. Warna tiap ubin sedikit acak dan posisinya sedikit miring. Palet tanah: krem, terakota, biru laut. Bingkai pola ubin coklat-emas di sekeliling."
    },
    {
        "id": "tinta-sumie",
        "nama": "Tinta Hitam Sumi-e Kaligrafi",
        "badge": "Sumi-e Ink",
        "kategori": "animasi-bergerak",
        "deskripsi": "Lukisan tinta basah khas Asia Timur di atas kertas beras krem: sapuan kuas tebal menipis elegan, tepi meresap ke serat kertas, ruang kosong luas (Ma), stempel cap merah khas.",
        "pacingSec": 4.0,
        "aksen": "#DC2626",
        "thumbnail": "/aset/gaya/minimal.jpg",
        "palette_hex": ["#FAFAF9", "#1C1917", "#44403C", "#A8A29E", "#DC2626"],
        "fiturVisual": [
            "Sapuan Kuas Kaligrafi Kuat & Mengalir",
            "Resapan Tinta Basah Alami (Ink Bleed)",
            "Ruang Negatif Luas Harmonis (Zen)",
            "Stempel Segel Merah Pojok Layar"
        ],
        "prompt_blueprint": "Lukisan tinta hitam ala Asia Timur di kertas beras krem bertekstur. Sapuan kuas yang tebal di awal lalu menipis di ujung, tepi sedikit buram seperti tinta meresap. Banyak ruang kosong, batang bambu beruas dengan daun dari satu sapuan, dan satu stempel merah kecil di pojok."
    },
    {
        "id": "impasto-minyak",
        "nama": "Impasto Cat Minyak Van Gogh",
        "badge": "Van Gogh Swirl",
        "kategori": "animasi-bergerak",
        "deskripsi": "Lukisan cat minyak tebal bertekstur (Starry Night style): langit tersusun dari ribuan goresan kuas pendek melingkar dinamis, pusaran kuning-biru, bintang berpendar, kanvas kasar.",
        "pacingSec": 3.8,
        "aksen": "#F59E0B",
        "thumbnail": "/aset/gaya/sinematik.jpg",
        "palette_hex": ["#0C1821", "#1E3A8A", "#F59E0B", "#FDE047", "#1E293B"],
        "fiturVisual": [
            "Ribuan Goresan Kuas Pendek Berputar",
            "Pusaran Awan Dinamis Warna Kuning-Biru",
            "Halo Cahaya Bintang Melingkar Hangat",
            "Tekstur Timbul Kanvas Kasar (Impasto)"
        ],
        "prompt_blueprint": "Lukisan cat minyak tebal (impasto). Langit terbuat dari ribuan sapuan kuas pendek yang mengikuti arah pusaran dan berputar pelan, warna biru tua, biru muda, dan kuning. Bintang berpendar berlapis, pohon cemara gelap di depan, tekstur kanvas halus di seluruh layar."
    },
    {
        "id": "gouache-malam",
        "nama": "Gouache Malam Matte Sinematik",
        "badge": "Night Gouache",
        "kategori": "animasi-bergerak",
        "deskripsi": "Cat gouache malam hari pekat: bidang warna solid dan matte tanpa outline, palet biru malam misterius, bulan besar krem berkawah halus, bintang berkelip, siluet tajam.",
        "pacingSec": 3.5,
        "aksen": "#5BC0BE",
        "thumbnail": "/aset/gaya/sinematik.jpg",
        "palette_hex": ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#6FFFE9"],
        "fiturVisual": [
            "Warna Solid Matte Tanpa Kilap Refleksi",
            "Bulan Penuh Besar Berkawah Lembut",
            "Siluet Gelap Tegas di Depan Terang",
            "Butiran Kertas Tekstur Halus Alami"
        ],
        "prompt_blueprint": "Cat gouache malam hari: bentuk datar dengan warna pekat dan matte, tanpa kilap dan tanpa outline. Palet biru malam, bulan besar krem dengan kawah lembut, bintang kecil berkelip, siluet gelap tegas di depan bulan, butiran kertas tipis."
    },
    {
        "id": "lukisan-botani",
        "nama": "Lukisan Botani Antik Ilmiah",
        "badge": "Botanical Art",
        "kategori": "animasi-bergerak",
        "deskripsi": "Ilustrasi botani ensiklopedia ilmiah lama: kertas perkamen tua krem, garis tinta sangat halus dengan pewarnaan lembut transparan, label nomor pelat 'Pl. 07', nama latin miring.",
        "pacingSec": 4.0,
        "aksen": "#2D5A27",
        "thumbnail": "/aset/gaya/hangat.jpg",
        "palette_hex": ["#F5EBE0", "#2D5A27", "#588157", "#A3B18A", "#BC4749"],
        "fiturVisual": [
            "Kertas Perkamen Tua Berbingkai Tipis",
            "Garis Tinta Botani Sangat Detail",
            "Label Klasik 'Pl. 07' & Nama Latin",
            "Serangga Kecil Terbang di Sekitar"
        ],
        "prompt_blueprint": "Ilustrasi botani ala buku ilmiah lama. Kertas tua krem dengan bingkai garis tipis, garis tinta halus dengan warna lembut tembus pandang. Label kecil 'Pl. 07' di pojok atas, nama latin bercetak miring di bawah gambar, dan serangga kecil yang terbang di sekitar tanaman."
    },
    {
        "id": "kertas-potong",
        "nama": "Kertas Potong Berlapis Papercut",
        "badge": "Layered Papercut",
        "kategori": "animasi-bergerak",
        "deskripsi": "Seni kertas potong berlapis (multi-layer papercraft): tiap lapisan potongan kertas memberi bayangan jatuh lembut ke lapisan di belakangnya, bukit bergelombang, gradasi senja.",
        "pacingSec": 3.5,
        "aksen": "#F4A261",
        "thumbnail": "/aset/gaya/kertas.jpg",
        "palette_hex": ["#1B263B", "#415A77", "#778DA9", "#E0E1DD", "#F4A261"],
        "fiturVisual": [
            "Lapisan Kertas Tumpuk Bertingkat",
            "Bayangan Jatuh Lembut Antar Kertas",
            "Bukit Bergelombang Gradasi Terang-Gelap",
            "Matahari Lingkaran Tumpuk Berlapis"
        ],
        "prompt_blueprint": "Seni kertas potong berlapis (papercut). Setiap lapisan kertas berwarna memberi bayangan lembut ke lapisan di belakangnya. Bukit bergelombang berlapis dari terang ke gelap, matahari dari lingkaran bertumpuk, awan kertas putih, gradasi langit senja merah muda ke oranye."
    },
    {
        "id": "art-nouveau",
        "nama": "Art Nouveau Poster Dekoratif",
        "badge": "Art Nouveau",
        "kategori": "animasi-bergerak",
        "deskripsi": "Poster dekoratif Art Nouveau awal 1900-an ala Alphonse Mucha: bingkai lengkung ornamen emas dan hijau daun, garis kontur melengkung mengalir bebas, sinar matahari berjari di belakang.",
        "pacingSec": 4.0,
        "aksen": "#D4AF37",
        "thumbnail": "/aset/gaya/emas.jpg",
        "palette_hex": ["#1F2421", "#D4AF37", "#3A5A40", "#588157", "#F2E8CF"],
        "fiturVisual": [
            "Bingkai Lengkung Ornamen Emas Mengalir",
            "Sinar Matahari Berjari Radiating Rays",
            "Garis Kontur Halus Gaya Mucha",
            "Panel Medallion Dekoratif Melingkar"
        ],
        "prompt_blueprint": "Poster dekoratif gaya Art Nouveau awal 1900-an. Bingkai lengkung hias dengan garis emas dan hijau tua, sinar matahari berjari di belakang objek utama, garis kontur melengkung yang mengalir. Palet emas, hijau toska, biru, dan krem, dengan panel ornamen bulat di bagian bawah."
    },
    {
        "id": "golden-hour",
        "nama": "Golden Hour Siluet Senja",
        "badge": "Sunset Silhouette",
        "kategori": "animasi-bergerak",
        "deskripsi": "Siluet senja magis matahari terbenam: langit bergradasi spektakuler ungu-merah muda-oranye-kuning, matahari besar di cakrawala, semua objek siluet coklat gelap tanpa detail, rumput bergoyang.",
        "pacingSec": 3.5,
        "aksen": "#FF9E00",
        "thumbnail": "/aset/gaya/sinematik.jpg",
        "palette_hex": ["#3C096C", "#7B2CBF", "#C77DFF", "#FF9E00", "#FF6000"],
        "fiturVisual": [
            "Gradasi Spektakuler Ungu-Pink-Oranye",
            "Siluet Penuh Objek Hitam-Coklat Pekat",
            "Matahari Emas Besar Menyentuh Cakrawala",
            "Ilalang & Dedaunan Bergoyang Angin"
        ],
        "prompt_blueprint": "Siluet saat matahari terbenam. Langit bergradasi ungu, merah muda, oranye, lalu kuning, dengan matahari besar bercahaya di cakrawala. Semua objek berupa siluet coklat gelap tanpa detail, pohon akasia berpayung datar, rumput yang bergoyang, butiran halus."
    },
    {
        "id": "anime-pedesaan",
        "nama": "Anime Pedesaan Ghibli / Shinkai",
        "badge": "Ghibli Countryside",
        "kategori": "animasi-bergerak",
        "deskripsi": "Anime berlatar alam pedesaan cerah ala Studio Ghibli / Makoto Shinkai: langit biru kristal jernih, awan kumulus bervolume bayangan lembut, padang rumput bunga bermekaran, laut berkilau.",
        "pacingSec": 3.5,
        "aksen": "#38BDF8",
        "thumbnail": "/aset/gaya/sinematik.jpg",
        "palette_hex": ["#0284C7", "#38BDF8", "#4ADE80", "#FEF08A", "#F43F5E"],
        "fiturVisual": [
            "Langit Biru Cerah Jernih Kristal",
            "Awan Kumulus Raksasa Bervolume Lembut",
            "Padang Rumput Hijau Berbunga Bergoyang",
            "Kilauan Cahaya Matahari di Kejauhan"
        ],
        "prompt_blueprint": "Anime berlatar pedesaan yang cerah. Langit biru jernih, awan putih besar bervolume dengan bayangan biru lembut, padang hijau penuh bunga kecil, laut berkilau di kejauhan, rumah kecil beratap merah. Warna jenuh dan bersih, karakter dengan garis tipis dan bayangan sederhana."
    }
]

def main():
    base_dir = Path("d:/berjan/cheat clip motion")
    anim_dir = base_dir / "motion" / "skills" / "animasi"
    anim_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Tulis 30 file JSON ke motion/skills/animasi/
    print("Menulis 30 preset JSON ke motion/skills/animasi/...")
    for s in STYLES_30:
        p_json = anim_dir / f"{s['id']}.json"
        p_json.write_text(json.dumps(s, ensure_ascii=False, indent=2), encoding="utf-8")
        
    print(f"Berhasil membuat {len(STYLES_30)} file JSON di motion/skills/animasi/.")
    
    # 2. Update motion/skills/registry.json
    reg_file = base_dir / "motion" / "skills" / "registry.json"
    registry_data = []
    if reg_file.exists():
        try:
            registry_data = json.loads(reg_file.read_text(encoding="utf-8"))
        except Exception:
            registry_data = []
            
    existing_slugs = {item.get("slug") for item in registry_data}
    
    for s in STYLES_30:
        if s["id"] not in existing_slugs:
            registry_data.append({
                "slug": s["id"],
                "name": s["nama"],
                "description": s["deskripsi"],
                "palette_hex": s["palette_hex"],
                "avg_pacing_sec": s["pacingSec"],
                "thumbnail": s["thumbnail"],
                "created_at": "2026-11-23T20:20:00.000000+00:00",
                "inti": False
            })
            existing_slugs.add(s["id"])
            
    reg_file.write_text(json.dumps(registry_data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"registry.json diperbarui dengan total {len(registry_data)} skills!")
    
    # 3. Update motion/src/presets_animasi/index.ts
    presets_animasi_ts = base_dir / "motion" / "src" / "presets_animasi" / "index.ts"
    
    ts_code = '''// Pustaka Template Khusus Animasi Bergerak (Kinetic Rig & Canvas Engine)
// Mengintegrasikan 30 Gaya Animasi Prosedural Claude (@coretanfery) + Preset Inti

export interface AnimationPreset {
  id: string;
  nama: string;
  kategori: 'animasi-bergerak';
  deskripsi: string;
  rigDefault: 'toon-3d' | 'stickman' | 'isometric' | 'custom' | string;
  latarDefault: string;
  pacingSec: number;
  aksen: string;
  badge: string;
  thumbnail: string;
  palette_hex: string[];
  fiturVisual: string[];
  prompt_blueprint?: string;
}

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
'''
    for s in STYLES_30:
        ts_code += f"""  '{s["id"]}': {json.dumps(s, ensure_ascii=False, indent=4)},\n"""

    ts_code += '''};

export const getAnimationPreset = (id?: string): AnimationPreset => {
  if (id && ANIMATION_PRESETS[id]) {
    return ANIMATION_PRESETS[id];
  }
  return ANIMATION_PRESETS['flat-vector'] || Object.values(ANIMATION_PRESETS)[0];
};
'''
    presets_animasi_ts.write_text(ts_code, encoding="utf-8")
    print("motion/src/presets_animasi/index.ts berhasil diperbarui!")

    # 4. Sinkronkan ke studio.py
    print("Menjalankan sinkronkan_presets_index() lewat python...")
    import sys
    sys.path.append(str(base_dir / "studio"))
    try:
        from studio import sinkronkan_presets_index
        sinkronkan_presets_index()
        print("sinkronkan_presets_index() berhasil dijalankan!")
    except Exception as e:
        print(f"Catatan sinkronisasi studio.py: {e}")

if __name__ == "__main__":
    main()
