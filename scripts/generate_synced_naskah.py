import json

# Load Whisper alignment
segs = json.load(open('motion/temp_audio_align.json', encoding='utf-8'))

# Timing cutoffs based on Whisper transcript:
# Adegan 1: 0.0s to 11.3s (durasi: 11.3s)
# Adegan 2: 11.3s to 21.2s (durasi: 9.9s)
# Adegan 3: 21.2s to 32.6s (durasi: 11.4s)
# Adegan 4: 32.6s to 43.6s (durasi: 11.0s)
# Adegan 5: 43.6s to 53.4s (durasi: 9.8s)
# Adegan 6: 53.4s to 64.36s (durasi: 10.96s)

naskah_manifest = {
    "judul": "Konon, Rumah No. 13 Kosong 10 Tahun",
    "modeCerita": "narator",
    "tampilkanBalon": False,
    "rigDefault": "toon-3d",
    "rasio": "vertikal",
    "gaya": "snaptik-animasi-ref",
    "palet": ["#9B937C", "#5D5A62", "#3F404D", "#282836", "#F7E2C7"],
    "audioNarasi": "audio_rumah_horor.wav",
    "komposisi": "AnimasiBergerak",
    "adegan": [
        {
            "judul": "Adegan 1: Halaman Rumah No. 13",
            "teks": "Pernahkah kalian merasa diawasi dari balik jendela rumah kosong? Malam ini, Andre dan Wulan mencoba membuktikan rumor tentang penampakan bayangan putih di ujung gang yang sepi ini.",
            "speaker": "Andre",
            "tampilkanBalon": False,
            "modeCerita": "narator",
            "durasi_detik": 11.3,
            "rig": "toon-3d",
            "latar": "halaman-rumah-kosong",
            "callout": "📍 HALAMAN RUMAH NO. 13",
            "karakter": {
                "nama": "Andre",
                "aksi": "bicara",
                "benda": "tidak_ada",
                "posisiX": 540,
                "posisiY": 1500,
                "hadap": 1,
                "warnaBaju": "#EA580C"
            }
        },
        {
            "judul": "Adegan 2: Jendela Kamar Atas",
            "teks": "Tiba-tiba, tirai di lantai atas bergerak. Suara ketukan pelan pada kaca membuat bulu kuduk Wulan berdiri seketika. Sesuatu benar-benar ada di sana.",
            "speaker": "Wulan",
            "tampilkanBalon": False,
            "modeCerita": "narator",
            "durasi_detik": 9.9,
            "rig": "toon-3d",
            "latar": "jendela-kamar-atas",
            "callout": "📍 JENDELA KAMAR ATAS",
            "karakter": {
                "nama": "Wulan",
                "aksi": "kaget",
                "benda": "tidak_ada",
                "posisiX": 540,
                "posisiY": 1500,
                "hadap": 1,
                "warnaBaju": "#EA580C"
            }
        },
        {
            "judul": "Adegan 3: Halaman Rumah Kosong",
            "teks": "Andre memberanikan diri. Saat cahaya senter menembus kaca berdebu, bayangan itu tidak menghilang, tapi justru terlihat aneh. Kaku, dan memiliki garis tepi seperti potongan kardus.",
            "speaker": "Andre",
            "tampilkanBalon": False,
            "modeCerita": "narator",
            "durasi_detik": 11.4,
            "rig": "toon-3d",
            "latar": "halaman-rumah-kosong",
            "callout": "📍 HALAMAN RUMAH KOSONG",
            "karakter": {
                "nama": "Andre",
                "aksi": "tunjuk",
                "benda": "tidak_ada",
                "posisiX": 540,
                "posisiY": 1500,
                "hadap": 1,
                "warnaBaju": "#EA580C"
            }
        },
        {
            "judul": "Adegan 4: Samping Bangunan Rumah",
            "teks": "Tiba-tiba terdengar tawa tertahan. Dari balik semak-semak, Seno muncul membawa proyektor dan remote. Ternyata, semua teror ini hanyalah rekayasa buatannya.",
            "speaker": "Seno",
            "tampilkanBalon": False,
            "modeCerita": "narator",
            "durasi_detik": 11.0,
            "rig": "toon-3d",
            "latar": "samping-bangunan-rumah",
            "callout": "📍 SAMPING BANGUNAN RUMAH",
            "karakter": {
                "nama": "Seno",
                "aksi": "bicara",
                "benda": "ponsel",
                "posisiX": 540,
                "posisiY": 1500,
                "hadap": 1,
                "warnaBaju": "#0284C7"
            }
        },
        {
            "judul": "Adegan 5: Samping Bangunan Rumah",
            "teks": "Seno menggunakan proyektor mini, benang pancing, dan rekaman suara untuk menakut-nakuti warga. Tujuannya sederhana, agar tidak ada yang mendekati tempat persembunyiannya ini.",
            "speaker": "Seno",
            "tampilkanBalon": False,
            "modeCerita": "narator",
            "durasi_detik": 9.8,
            "rig": "toon-3d",
            "latar": "samping-bangunan-rumah",
            "callout": "📍 TEMPAT PERSEMBUNYIAN SENO",
            "karakter": {
                "nama": "Seno",
                "aksi": "tunjuk",
                "benda": "tidak_ada",
                "posisiX": 540,
                "posisiY": 1500,
                "hadap": 1,
                "warnaBaju": "#0284C7"
            }
        },
        {
            "judul": "Adegan 6: Pos Ronda",
            "teks": "Ketiganya pun pergi menuju pos ronda untuk menjelaskan fakta sebenarnya. Ingat, tidak semua yang terlihat menyeramkan itu mistis, terkadang itu hanya ulah teman yang terlalu kreatif.",
            "speaker": "Andre",
            "tampilkanBalon": False,
            "modeCerita": "narator",
            "durasi_detik": 10.96,
            "rig": "toon-3d",
            "latar": "pos-ronda",
            "callout": "📍 POS RONDA DESA",
            "karakter": {
                "nama": "Andre",
                "aksi": "bicara",
                "benda": "tidak_ada",
                "posisiX": 540,
                "posisiY": 1500,
                "hadap": 1,
                "warnaBaju": "#EA580C"
            }
        }
    ]
}

with open("motion/naskah/rumah_horor_presisi.json", "w", encoding="utf-8") as f:
    json.dump(naskah_manifest, f, indent=2, ensure_ascii=False)

print("NASKAH_MANIFEST_PREPARED")
