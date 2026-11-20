#!/usr/bin/env python3
"""
scripts/extract_video_style.py
Ekstraksi gaya visual, pacing, dan palet warna dari video referensi.
Menerima: --video <path>, --slug <nama_gaya>, --purge (opsional)
Menghasilkan: tmp_style_frames/<slug>/metrics.json & keyframe representatif.
"""

import os
import sys
import json
import re
import shutil
import argparse
import subprocess
from pathlib import Path
from typing import List, Tuple, Dict, Any

try:
    from PIL import Image
except ImportError:
    Image = None


def format_hex(rgb: Tuple[int, int, int]) -> str:
    return f"#{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}"


def get_video_info(video_path: Path) -> Dict[str, Any]:
    cmd = [
        "ffprobe", "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration",
        "-show_entries", "format=duration",
        "-of", "json",
        str(video_path)
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        data = json.loads(res.stdout)
        stream = data.get("streams", [{}])[0]
        fmt = data.get("format", {})
        
        width = int(stream.get("width") or 1080)
        height = int(stream.get("height") or 1920)
        durasi = float(stream.get("duration") or fmt.get("duration") or 15.0)
        
        aspect = "9:16" if height > width else ("16:9" if width > height else "1:1")
        return {"width": width, "height": height, "duration": durasi, "aspect": aspect}
    except Exception as e:
        sys.stderr.write(f"[WARN] Gagal ffprobe ({e}), memakai fallback default.\n")
        return {"width": 1080, "height": 1920, "duration": 15.0, "aspect": "9:16"}


def detect_scenes(video_path: Path, durasi: float) -> List[float]:
    """Deteksi pergantian adegan menggunakan filter ffmpeg select='gt(scene,0.35)'."""
    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-filter_complex", "select='gt(scene,0.35)',metadata=print:file=-",
        "-f", "null", "-"
    ]
    pts_times = []
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        # Cari pts_time di output metadata ffmpeg
        for line in (proc.stdout + proc.stderr).splitlines():
            if "pts_time:" in line:
                m = re.search(r"pts_time:([0-9.]+)", line)
                if m:
                    val = float(m.group(1))
                    if not pts_times or (val - pts_times[-1]) > 0.5:
                        pts_times.append(val)
    except Exception as e:
        sys.stderr.write(f"[WARN] Scene detection ffmpeg error: {e}\n")

    # Fallback jika tidak ada scene terdeteksi atau terlalu sedikit
    if len(pts_times) < 3:
        target_cuts = max(3, min(10, int(durasi / 3.0)))
        step = durasi / (target_cuts + 1)
        pts_times = [round((i + 1) * step, 2) for i in range(target_cuts)]

    return pts_times


def extract_keyframes(video_path: Path, timestamps: List[float], out_dir: Path) -> List[Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    frames = []
    
    # Ambil maksimal 12 titik representatif
    if len(timestamps) > 12:
        step = len(timestamps) / 12.0
        chosen = [timestamps[int(i * step)] for i in range(12)]
    else:
        chosen = timestamps

    for idx, ts in enumerate(chosen):
        frame_file = out_dir / f"frame_{idx + 1:02d}.jpg"
        cmd = [
            "ffmpeg", "-y",
            "-ss", f"{ts:.2f}",
            "-i", str(video_path),
            "-vframes", "1",
            "-vf", "scale=720:-2",
            "-q:v", "3",
            str(frame_file)
        ]
        try:
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            if frame_file.exists():
                frames.append(frame_file)
        except Exception:
            continue

    return frames


def extract_dominant_palette(frame_paths: List[Path]) -> List[str]:
    """Mengekstrak 5 warna HEX dominan dari sekumpulan keyframe."""
    default_palette = ["#14427A", "#0B0B0B", "#FACC15", "#38BDF8", "#F97316"]
    if not Image or not frame_paths:
        return default_palette

    try:
        samples = []
        for p in frame_paths:
            with Image.open(p) as img:
                img_rgb = img.convert("RGB").resize((60, 60))
                samples.append(img_rgb)

        # Gabungkan semua sampel ke satu kanvas untuk kuantisasi warna
        w, h = 60, 60
        combined = Image.new("RGB", (w * len(samples), h))
        for i, s in enumerate(samples):
            combined.paste(s, (i * w, 0))

        # Kuantisasi warna menjadi 16 warna mayoritas
        quantized = combined.quantize(colors=16, method=Image.Quantize.MEDIANCUT)
        palette_data = quantized.getpalette()[:48] # 16 RGB tuples
        
        rgbs = []
        for i in range(0, len(palette_data), 3):
            rgbs.append((palette_data[i], palette_data[i+1], palette_data[i+2]))

        # Urutkan berdasarkan luminance: background (gelap/terang ekstrim), teks, aksen
        def lum(c):
            return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]

        def dist(c1, c2):
            return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5

        # Pilih 5 warna yang cukup berbeda
        selected = [rgbs[0]]
        for c in rgbs[1:]:
            if len(selected) >= 5:
                break
            if all(dist(c, s) > 45 for s in selected):
                selected.append(c)

        while len(selected) < 5:
            selected.append(rgbs[len(selected) % len(rgbs)])

        # Pastikan 5 hex valid
        palette_hex = [format_hex(c) for c in selected[:5]]
        return palette_hex
    except Exception as e:
        sys.stderr.write(f"[WARN] Gagal kuantisasi warna ({e}), memakai palet default.\n")
        return default_palette


def generate_metrics(slug: str, durasi: float, scene_count: int, aspect: str, palette_hex: List[str]) -> Dict[str, Any]:
    avg_pacing = round(durasi / max(1, scene_count), 2)
    avg_pacing = max(2.0, min(8.0, avg_pacing))

    display_name = slug.replace("-", " ").replace("_", " ").title()

    # Tentukan style visual grammar berdasarkan nama / palet
    is_dark = True
    try:
        r = int(palette_hex[0][1:3], 16)
        g = int(palette_hex[0][3:5], 16)
        b = int(palette_hex[0][5:7], 16)
        is_dark = (0.299*r + 0.587*g + 0.114*b) < 128
    except Exception:
        pass

    bg_color = palette_hex[0]
    fg_color = palette_hex[1] if not is_dark else "#FFFFFF"
    accent_1 = palette_hex[2]
    accent_2 = palette_hex[3]

    metrics = {
        "slug": slug,
        "display_name": display_name,
        "description": f"Preset gaya visual dinamis diekstrak dari video referensi dengan pacing {avg_pacing}s dan palet warna {', '.join(palette_hex)}.",
        "avg_pacing_sec": avg_pacing,
        "aspect_ratio": aspect,
        "palette_hex": palette_hex,
        "visual_grammar": {
            "rendering_style": "3D cel-shaded toon outline / flat kinetic vector",
            "stroke_rule": f"stroke='{palette_hex[1]}' stroke-width='3.5' stroke-linejoin='round' stroke-linecap='round'",
            "character_or_object_rules": "Proporsi tebal, kontur tegas, highlight warna aksen, bayangan solid tanpa gradasi buram",
            "background_style": f"Latar {bg_color} dengan elemen aksen {accent_1} dan kisi berjarak dinamis"
        },
        "typography_and_subtitle": {
            "font_family": "Plus Jakarta Sans, Montserrat, sans-serif",
            "title_max_words": 4,
            "subtitle_mode": "word-pop",
            "subtitle_position": "bottom-center",
            "subtitle_stroke": f"6px {palette_hex[1]}"
        },
        "motion_physics": {
            "spring_stiffness": 180,
            "spring_damping": 18,
            "dominant_transition": "zoom-punch",
            "camera_shake_on_impact": True
        }
    }
    return metrics


def main():
    parser = argparse.ArgumentParser(description="Ekstraksi DNA visual dan pacing dari video referensi.")
    parser.add_argument("--video", required=False, help="Path ke file video referensi (.mp4, .mov, .webm)")
    parser.add_argument("--slug", required=True, help="Nama slug unik gaya (mis. toon-3d-celshaded)")
    parser.add_argument("--purge", action="store_true", help="Hapus file video mentah setelah analisis selesai")
    parser.add_argument("--mock", action="store_true", help="Gunakan mock metrics tanpa video fisik")

    args = parser.parse_args()
    slug = re.sub(r"[^\w-]", "-", args.slug.lower()).strip("-")
    if not slug:
        slug = "style-custom"

    out_dir = Path("tmp_style_frames") / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    metrics_path = out_dir / "metrics.json"

    if args.mock or not args.video:
        # Mock mode
        palette = ["#14427A", "#0B0B0B", "#FACC15", "#38BDF8", "#F97316"]
        metrics = generate_metrics(slug, 32.0, 10, "9:16", palette)
        metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
        print(json.dumps(metrics, indent=2))
        return

    video_path = Path(args.video)
    if not video_path.exists():
        sys.stderr.write(f"[ERROR] File video '{video_path}' tidak ditemukan.\n")
        sys.exit(1)

    # 1. Info video
    info = get_video_info(video_path)
    durasi = info["duration"]
    aspect = info["aspect"]

    # 2. Scene detection
    scene_cuts = detect_scenes(video_path, durasi)
    scene_count = len(scene_cuts) + 1

    # 3. Keyframes extraction
    keyframes = extract_keyframes(video_path, scene_cuts, out_dir)

    # 4. Dominant color extraction
    palette_hex = extract_dominant_palette(keyframes)

    # 5. Build metrics
    metrics = generate_metrics(slug, durasi, scene_count, aspect, palette_hex)
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    # 6. Auto-purge if requested
    if args.purge:
        try:
            if video_path.is_file():
                video_path.unlink()
                sys.stderr.write(f"[INFO] Auto-purge: Video mentah '{video_path}' berhasil dihapus.\n")
        except Exception as e:
            sys.stderr.write(f"[WARN] Gagal menghapus video mentah: {e}\n")

    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
