# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = [
#   "imageio-ffmpeg>=0.6.0",
#   "faster-whisper>=1.1.0",
#   "numpy>=1.26",
# ]
# ///
"""Modul Analisa Keselarasan Audio & Naskah (Audio-Script Alignment) untuk Cheat Motion.
Memanfaatkan faster-whisper untuk transkripsi per kata dan difflib.SequenceMatcher
untuk perataan segmen naskah terhadap rekaman audio narasi.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path
import numpy as np


def bersihkan(teks: str) -> str:
    return re.sub(r"[^\w\s]", "", teks.lower()).strip()


def tokenkan(teks: str) -> list[str]:
    return [w for w in re.split(r"\s+", bersihkan(teks)) if w]


def decode_audio(jalur_audio: Path) -> tuple[float, np.ndarray]:
    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    sr = 16000
    cmd = [
        ffmpeg, "-v", "error", "-i", str(jalur_audio),
        "-ac", "1", "-ar", str(sr), "-f", "s16le", "-"
    ]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    durasi_total = len(audio) / sr
    return durasi_total, audio


def kata_cocok(w1: str, w2: str) -> bool:
    if w1 == w2:
        return True
    if len(w1) >= 3 and len(w2) >= 3:
        return difflib.SequenceMatcher(None, w1, w2).ratio() >= 0.65
    return False


def transkrip_audio(audio: np.ndarray, model_name: str = "base", bahasa: str | None = "id") -> list[dict]:
    from faster_whisper import WhisperModel
    m = WhisperModel(model_name, device="cpu", compute_type="int8")
    segs, info = m.transcribe(audio, language=bahasa, word_timestamps=True, vad_filter=True)
    kata_list = []
    for s in segs:
        for w in (s.words or []):
            txt = w.word.strip()
            clean = bersihkan(txt)
            if clean:
                kata_list.append({
                    "start": float(w.start),
                    "end": float(w.end),
                    "word": txt,
                    "clean": clean
                })
    return kata_list


def selaraskan(audio_file: Path, naskah: dict, model_whisper: str = "base") -> dict:
    durasi_total, audio_data = decode_audio(audio_file)
    if durasi_total <= 0:
        raise ValueError("File audio kosong atau tidak dapat dibaca.")

    words = transkrip_audio(audio_data, model_name=model_whisper)

    judul = (naskah.get("judul") or "").strip()
    narasi_hook = (naskah.get("narasi_hook") or "").strip()
    adegan_list = naskah.get("adegan") or []

    # Segmen yang akan dicocokkan
    # Segmen 0: Hook / Intro (jika ada narasi hook)
    ada_narasi_hook = bool(narasi_hook)
    segmen_target = []
    if ada_narasi_hook:
        segmen_target.append({
            "jenis": "intro",
            "no": 0,
            "judul": judul or "Pembuka",
            "teks": narasi_hook
        })

    for i, a in enumerate(adegan_list):
        segmen_target.append({
            "jenis": "adegan",
            "no": i + 1,
            "judul": (a.get("judul") or f"Adegan {i+1}").strip(),
            "teks": (a.get("teks") or "").strip()
        })

    total_kata_audio = len(words)
    cur_idx = 0
    hasil_segmen = []

    for seg in segmen_target:
        target_tokens = tokenkan(seg["teks"])
        target_str = " ".join(target_tokens)
        if not target_tokens or total_kata_audio == 0:
            hasil_segmen.append({
                **seg,
                "terdeteksi": False,
                "skor": 0.0,
                "w_start_idx": cur_idx,
                "w_end_idx": cur_idx,
                "start": None,
                "end": None,
                "target_len": len(target_tokens)
            })
            continue

        L = len(target_tokens)
        best_ratio = 0.0
        best_i = cur_idx
        best_k = min(L, total_kata_audio - cur_idx)

        # Cari window terbaik di sekitar cur_idx
        max_start = min(cur_idx + max(12, L), total_kata_audio)
        for i in range(cur_idx, max_start):
            min_k = max(1, L - 6)
            max_k = min(total_kata_audio - i + 1, L + 10)
            for k in range(min_k, max_k):
                cand_str = " ".join(w["clean"] for w in words[i : i + k])
                ratio = difflib.SequenceMatcher(None, target_str, cand_str).ratio()
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_i = i
                    best_k = k

        skor = round(best_ratio * 100, 1)

        # Ambang deteksi: skor minimal 35%
        if best_ratio >= 0.35 and best_k > 0:
            first_idx = best_i
            last_idx = best_i + best_k - 1
            start_t = words[first_idx]["start"]
            end_t = words[last_idx]["end"]
            hasil_segmen.append({
                **seg,
                "terdeteksi": True,
                "skor": min(100.0, skor),
                "w_start_idx": first_idx,
                "w_end_idx": last_idx,
                "start": start_t,
                "end": end_t,
                "target_len": L
            })
            cur_idx = min(last_idx + 1, total_kata_audio)
        else:
            hasil_segmen.append({
                **seg,
                "terdeteksi": False,
                "skor": skor,
                "w_start_idx": cur_idx,
                "w_end_idx": cur_idx,
                "start": None,
                "end": None,
                "target_len": L
            })
            cur_idx = min(cur_idx + max(1, L), total_kata_audio)

    # Menghitung batas waktu yang halus dan berkesinambungan
    # Jika intro tidak dinarasikan (narasi_hook kosong):
    # Cek jeda awal sebelum kata pertama adegan 1
    durasi_intro = 0.0
    intro_seg = next((s for s in hasil_segmen if s["jenis"] == "intro"), None)

    adegan_segs = [s for s in hasil_segmen if s["jenis"] == "adegan"]

    if intro_seg and intro_seg["terdeteksi"]:
        # Narasi hook terdeteksi di awal audio
        t_intro_start = 0.0
        # Waktu selesai intro adalah awal adegan 1 atau end intro
        pertama_adegan = next((s for s in adegan_segs if s["start"] is not None), None)
        if pertama_adegan and pertama_adegan["start"] > intro_seg["end"]:
            split_intro = (intro_seg["end"] + pertama_adegan["start"]) / 2.0
        else:
            split_intro = intro_seg["end"]
        durasi_intro = round(max(1.0, split_intro), 2)
        intro_seg["start"] = 0.0
        intro_seg["end"] = durasi_intro
        intro_seg["durasi"] = durasi_intro
    elif not ada_narasi_hook:
        # Judul tidak dinarasikan: berikan intro singkat sesuai jeda awal atau default
        pertama_adegan = next((s for s in adegan_segs if s["start"] is not None), None)
        jeda_awal = pertama_adegan["start"] if pertama_adegan else 0.0
        if jeda_awal >= 1.2:
            durasi_intro = round(min(2.5, jeda_awal), 2)
        else:
            durasi_intro = 0.0  # Langsung mulai adegan 1 agar teks selaras dengan audio

    # Sinkronisasi batas adegan berurutan
    # Waktu mulai adegan pertama = durasi_intro
    waktu_saat_ini = durasi_intro
    sisa_total = durasi_total - durasi_intro
    if sisa_total <= 0:
        sisa_total = durasi_total

    for i, seg in enumerate(adegan_segs):
        seg["start_final"] = waktu_saat_ini
        is_last = (i == len(adegan_segs) - 1)
        if is_last:
            seg["end_final"] = durasi_total
        else:
            next_seg = adegan_segs[i + 1]
            if seg["terdeteksi"] and next_seg["terdeteksi"]:
                if next_seg["start"] > seg["end"]:
                    split = (seg["end"] + next_seg["start"]) / 2.0
                else:
                    split = seg["end"]
                seg["end_final"] = max(waktu_saat_ini + 0.5, split)
            elif seg["terdeteksi"]:
                seg["end_final"] = max(waktu_saat_ini + 0.5, seg["end"])
            else:
                # Estimasi proporsional
                bobot = max(1, seg["target_len"])
                bobot_sisa = sum(max(1, s["target_len"]) for s in adegan_segs[i:])
                durasi_est = (durasi_total - waktu_saat_ini) * (bobot / max(1, bobot_sisa))
                seg["end_final"] = waktu_saat_ini + max(1.0, durasi_est)

        seg["durasi"] = round(seg["end_final"] - seg["start_final"], 2)
        waktu_saat_ini = seg["end_final"]

    # Pastikan total durasi pas dengan durasi_total
    selisih = durasi_total - waktu_saat_ini
    if adegan_segs and abs(selisih) > 0.01:
        adegan_segs[-1]["end_final"] = durasi_total
        adegan_segs[-1]["durasi"] = round(durasi_total - adegan_segs[-1]["start_final"], 2)

    # Hitung skor total keseluruhan
    semua_bobot = sum(s["target_len"] for s in hasil_segmen) or 1
    skor_total = round(sum(s["skor"] * s["target_len"] for s in hasil_segmen) / semua_bobot, 1)

    if skor_total >= 80:
        status_teks = "Cocok"
        status_kode = "cocok"
    elif skor_total >= 50:
        status_teks = "Ada Improvisasi"
        status_kode = "improvisasi"
    else:
        status_teks = "Tidak Cocok"
        status_kode = "tidak_cocok"

    # Rincian untuk frontend UI
    rincian = []
    if intro_seg:
        rincian.append({
            "jenis": "intro",
            "no": 0,
            "label": "Adegan Pembuka (Judul / Hook)",
            "judul": intro_seg["judul"],
            "teks": intro_seg["teks"],
            "mulai": 0.0,
            "selesai": intro_seg["durasi"],
            "durasi": intro_seg["durasi"],
            "skor": intro_seg["skor"],
            "terdeteksi": intro_seg["terdeteksi"]
        })
    elif durasi_intro > 0:
        rincian.append({
            "jenis": "intro",
            "no": 0,
            "label": "Adegan Pembuka (Intro Jeda)",
            "judul": judul or "Intro",
            "teks": "",
            "mulai": 0.0,
            "selesai": durasi_intro,
            "durasi": durasi_intro,
            "skor": 100.0,
            "terdeteksi": True
        })

    for s in adegan_segs:
        rincian.append({
            "jenis": "adegan",
            "no": s["no"],
            "label": f"Adegan {s['no']}",
            "judul": s["judul"],
            "teks": s["teks"],
            "mulai": round(s["start_final"], 2),
            "selesai": round(s["end_final"], 2),
            "durasi": s["durasi"],
            "skor": s["skor"],
            "terdeteksi": s["terdeteksi"]
        })

    return {
        "ok": True,
        "durasi_total": round(durasi_total, 2),
        "durasi_intro": durasi_intro,
        "skor_total": skor_total,
        "status": status_teks,
        "status_kode": status_kode,
        "transkrip_kata_count": len(words),
        "rincian": rincian
    }


def main():
    parser = argparse.ArgumentParser(description="Analisa keselarasan audio dan naskah untuk Cheat Motion.")
    parser.add_argument("--audio", required=True, help="Jalur file audio")
    parser.add_argument("--naskah", required=True, help="Jalur file JSON naskah atau string JSON")
    parser.add_argument("--model", default="base", help="Model faster-whisper (tiny/base/small)")
    args = parser.parse_args()

    audio_path = Path(args.audio).resolve()
    if not audio_path.exists():
        sys.exit(f"File audio tidak ditemukan: {audio_path}")

    naskah_p = Path(args.naskah)
    if naskah_p.exists():
        naskah_data = json.loads(naskah_p.read_text(encoding="utf-8-sig"))
    else:
        naskah_data = json.loads(args.naskah)

    hasil = selaraskan(audio_path, naskah_data, model_whisper=args.model)
    print(json.dumps(hasil, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
