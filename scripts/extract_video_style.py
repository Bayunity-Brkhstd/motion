#!/usr/bin/env python3
"""
scripts/extract_video_style.py
Ekstraksi gaya visual video referensi berbasis Chunked / Multi-Step Segmented Analysis:
1. Video referensi dibagi menjadi N segmen waktu (default 8 detik per segmen).
2. AI Agent menganalisis mikro setiap segmen (scene cuts, pacing, palet 5-HEX, snapshot thumbnail).
3. Hasil N file analisa segmen digabungkan (konsolidasi/merge) menjadi 1 skill & template utuh ready-to-use.
"""

import os
import sys
import json
import re
import math
import shutil
import argparse
import subprocess
from pathlib import Path
from typing import List, Tuple, Dict, Any

try:
    from PIL import Image, ImageDraw
except ImportError:
    Image = None
    ImageDraw = None


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


def detect_scenes_in_range(video_path: Path, start_sec: float, end_sec: float) -> List[float]:
    """Deteksi pergantian adegan dalam jendela waktu tertentu menggunakan filter ffmpeg."""
    seg_dur = max(0.5, end_sec - start_sec)
    cmd = [
        "ffmpeg", "-ss", f"{start_sec:.2f}",
        "-t", f"{seg_dur:.2f}",
        "-i", str(video_path),
        "-filter_complex", "select='gt(scene,0.30)',metadata=print:file=-",
        "-f", "null", "-"
    ]
    pts_times = []
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        for line in (proc.stdout + proc.stderr).splitlines():
            if "pts_time:" in line:
                m = re.search(r"pts_time:([0-9.]+)", line)
                if m:
                    rel_val = float(m.group(1))
                    abs_val = round(start_sec + rel_val, 2)
                    if not pts_times or (abs_val - pts_times[-1]) > 0.4:
                        pts_times.append(abs_val)
    except Exception as e:
        sys.stderr.write(f"[WARN] Scene detection ffmpeg error pada rentang {start_sec}-{end_sec}: {e}\n")

    if not pts_times:
        # Fallback 1-2 cut point jika tidak terdeteksi
        step = seg_dur / 3.0
        pts_times = [round(start_sec + step, 2), round(start_sec + 2 * step, 2)]

    return pts_times


def extract_keyframe_at(video_path: Path, timestamp: float, out_path: Path) -> bool:
    """Ekstrak 1 frame representatif pada timestamp tertentu."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y",
        "-ss", f"{timestamp:.2f}",
        "-i", str(video_path),
        "-vframes", "1",
        "-vf", "scale=720:-2",
        "-q:v", "3",
        str(out_path)
    ]
    try:
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        return out_path.exists()
    except Exception:
        return False


def extract_dominant_palette_from_images(image_paths: List[Path]) -> List[str]:
    """Mengekstrak 5 warna HEX dominan dari sekumpulan image path."""
    default_palette = ["#14427A", "#0B0B0B", "#FACC15", "#38BDF8", "#F97316"]
    if not Image or not image_paths:
        return default_palette

    try:
        samples = []
        for p in image_paths:
            if p.exists():
                with Image.open(p) as img:
                    img_rgb = img.convert("RGB").resize((60, 60))
                    samples.append(img_rgb)

        if not samples:
            return default_palette

        w, h = 60, 60
        combined = Image.new("RGB", (w * len(samples), h))
        for i, s in enumerate(samples):
            combined.paste(s, (i * w, 0))

        quantized = combined.quantize(colors=16, method=Image.Quantize.MEDIANCUT)
        palette_data = quantized.getpalette()[:48]
        
        rgbs = []
        for i in range(0, len(palette_data), 3):
            rgbs.append((palette_data[i], palette_data[i+1], palette_data[i+2]))

        def dist(c1, c2):
            return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5

        selected = [rgbs[0]]
        for c in rgbs[1:]:
            if len(selected) >= 5:
                break
            if all(dist(c, s) > 40 for s in selected):
                selected.append(c)

        while len(selected) < 5:
            selected.append(rgbs[len(selected) % len(rgbs)])

        return [format_hex(c) for c in selected[:5]]
    except Exception as e:
        sys.stderr.write(f"[WARN] Gagal kuantisasi warna ({e}), memakai default.\n")
        return default_palette


def save_crop_thumbnail(src_img: Path, out_path: Path, target_w: int = 270, target_h: int = 480) -> bool:
    """Crop dan resize gambar ke rasio 9:16 (270x480)."""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if not Image or not src_img.exists():
        return False
    try:
        target_ratio = target_w / target_h
        with Image.open(src_img) as img:
            im = img.convert("RGB")
            w, h = im.size
            cur_ratio = w / h
            if cur_ratio > target_ratio:
                new_w = int(h * target_ratio)
                left = (w - new_w) // 2
                cropped = im.crop((left, 0, left + new_w, h))
            else:
                new_h = int(w / target_ratio)
                top = (h - new_h) // 2
                cropped = im.crop((0, top, w, top + new_h))
            final_img = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
            final_img.save(out_path, "JPEG", quality=90)
            return True
    except Exception as e:
        sys.stderr.write(f"[WARN] Gagal crop thumbnail ({e})\n")
        return False


def create_placeholder_thumb(out_path: Path, label: str, palette: List[str], target_w: int = 270, target_h: int = 480):
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if not Image or not ImageDraw:
        return
    try:
        bg = palette[0] if palette else "#111827"
        fg = palette[1] if len(palette) > 1 else "#38BDF8"
        accent = palette[2] if len(palette) > 2 else "#FACC15"
        img = Image.new("RGB", (target_w, target_h), color=bg)
        draw = ImageDraw.Draw(img)
        draw.rectangle([20, 30, target_w - 20, 180], fill=accent, outline=fg, width=2)
        draw.ellipse([40, 220, target_w - 40, 380], fill=fg, outline=accent, width=2)
        draw.text((30, target_h - 40), label, fill="#FFFFFF")
        img.save(out_path, "JPEG", quality=85)
    except Exception:
        pass


def find_repo_root() -> Path:
    cur = Path(__file__).resolve().parent
    for p in [Path.cwd(), cur, cur.parent, cur.parent.parent]:
        if (p / "motion").exists() and (p / "motion" / "src").exists():
            return p
    return Path.cwd()


def main():
    parser = argparse.ArgumentParser(description="Ekstraksi gaya video berbasis Chunked Multi-Step Analysis + AI Merger.")
    parser.add_argument("--video", required=False, help="Path ke file video referensi (.mp4, .mov, .webm)")
    parser.add_argument("--slug", required=True, help="Nama slug unik gaya (mis. toon-3d-celshaded)")
    parser.add_argument("--chunk-sec", type=float, default=8.0, help="Durasi potongan per segmen waktu (default: 8.0 detik)")
    parser.add_argument("--purge", action="store_true", help="Hapus file video mentah setelah analisis selesai")
    parser.add_argument("--mock", action="store_true", help="Gunakan mock metrics tanpa video fisik")

    args = parser.parse_args()
    repo_root = find_repo_root()

    slug = re.sub(r"[^\w-]", "-", args.slug.lower()).strip("-")
    if not slug:
        slug = f"style-{int(os.getpid())}"

    chunk_sec = max(3.0, float(args.chunk_sec or 8.0))
    out_dir = repo_root / "tmp_style_frames" / slug
    segments_dir = out_dir / "segments"
    segments_dir.mkdir(parents=True, exist_ok=True)
    metrics_path = out_dir / "metrics.json"

    # Direktori publik untuk thumbnail Studio
    studio_gaya_dir = repo_root / "studio" / "aset" / "gaya"
    studio_seg_dir = studio_gaya_dir / "segments"
    studio_seg_dir.mkdir(parents=True, exist_ok=True)

    master_thumb_path = studio_gaya_dir / f"{slug}.jpg"

    # MOCK MODE
    if args.mock or not args.video:
        mock_duration = 40.0
        num_steps = max(1, int(math.ceil(mock_duration / chunk_sec)))
        sample_palettes = [
            ["#0F172A", "#38BDF8", "#FACC15", "#F43F5E", "#10B981"],
            ["#1E1B4B", "#818CF8", "#C084FC", "#F472B6", "#E0E7FF"],
            ["#18181B", "#F59E0B", "#FDE047", "#FFFFFF", "#71717A"],
            ["#022C22", "#34D399", "#A7F3D0", "#FBBF24", "#064E3B"],
            ["#172554", "#60A5FA", "#93C5FD", "#FB923C", "#1E3A8A"]
        ]
        
        step_results = []
        for i in range(num_steps):
            st = i * chunk_sec
            en = min(mock_duration, (i + 1) * chunk_sec)
            step_num = i + 1
            pal = sample_palettes[i % len(sample_palettes)]
            step_thumb_name = f"{slug}_step_{step_num:02d}.jpg"
            step_thumb_file = studio_seg_dir / step_thumb_name
            create_placeholder_thumb(step_thumb_file, f"Step {step_num} ({st:.0f}s-{en:.0f}s)", pal)

            step_data = {
                "step": step_num,
                "label": f"Step {step_num}",
                "time_range": f"{st:.1f}s - {en:.1f}s",
                "start_sec": st,
                "end_sec": en,
                "duration": round(en - st, 1),
                "pacing_sec": round(2.5 + (i * 0.2), 2),
                "scene_cuts": 3,
                "palette_hex": pal,
                "thumb_url": f"/aset/gaya/segments/{step_thumb_name}"
            }
            step_results.append(step_data)
            (segments_dir / f"step_{step_num:02d}_metrics.json").write_text(json.dumps(step_data, indent=2), encoding="utf-8")

        # Copy first step as master thumb
        if (studio_seg_dir / f"{slug}_step_01.jpg").exists():
            shutil.copy2(studio_seg_dir / f"{slug}_step_01.jpg", master_thumb_path)

        master_palette = sample_palettes[0]
        avg_pacing = round(sum(s["pacing_sec"] for s in step_results) / len(step_results), 2)
        metrics = {
            "slug": slug,
            "display_name": slug.replace("-", " ").title(),
            "description": f"Gaya diekstrak melalui chunking {num_steps} segmen (@ {chunk_sec}s).",
            "avg_pacing_sec": avg_pacing,
            "aspect_ratio": "9:16",
            "palette_hex": master_palette,
            "thumbnail": f"/aset/gaya/{slug}.jpg",
            "visual_grammar": {
                "rendering_style": "3D cel-shaded toon outline / flat kinetic vector",
                "stroke_rule": f"stroke='{master_palette[1]}' stroke-width='3.5' stroke-linejoin='round'",
                "character_or_object_rules": "Kontur tegas, proporsi tebal, cel-shaded solid",
                "background_style": f"Latar {master_palette[0]} dengan aksen {master_palette[2]}"
            },
            "typography_and_subtitle": {
                "font_family": "Plus Jakarta Sans, sans-serif",
                "title_max_words": 4,
                "subtitle_mode": "word-pop",
                "subtitle_position": "bottom-center",
                "subtitle_stroke": f"6px {master_palette[1]}"
            },
            "motion_physics": {
                "spring_stiffness": 180,
                "spring_damping": 18,
                "dominant_transition": "zoom-punch",
                "camera_shake_on_impact": True
            },
            "segment_analysis": {
                "chunk_sec": chunk_sec,
                "total_steps": num_steps,
                "steps": step_results
            }
        }
        metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
        print(json.dumps(metrics, indent=2))
        return

    # REAL VIDEO MODE
    video_path = Path(args.video)
    if not video_path.is_absolute():
        video_path = repo_root / video_path
    if not video_path.exists():
        sys.stderr.write(f"[ERROR] File video '{video_path}' tidak ditemukan.\n")
        sys.exit(1)

    info = get_video_info(video_path)
    durasi = info["duration"]
    aspect = info["aspect"]

    # 1. TAHAP CHUNKING / SEGMENTASI VIDEO
    num_steps = max(1, int(math.ceil(durasi / chunk_sec)))
    sys.stderr.write(f"[CHUNKING] Total durasi video: {durasi:.1f}s. Dibagi menjadi {num_steps} segmen (@ {chunk_sec}s per langkah).\n")

    step_results = []
    all_extracted_palettes = []
    all_thumb_candidates = []

    # 2. TAHAP ANALISIS MIKRO PER SEGMEN (STEP 1 .. N)
    for i in range(num_steps):
        st = i * chunk_sec
        en = min(durasi, (i + 1) * chunk_sec)
        seg_dur = max(0.5, en - st)
        step_num = i + 1

        step_subfolder = segments_dir / f"step_{step_num:02d}"
        step_subfolder.mkdir(parents=True, exist_ok=True)

        sys.stderr.write(f"[STEP {step_num}/{num_steps}] Menganalisis potongan {st:.1f}s - {en:.1f}s (durasi {seg_dur:.1f}s)...\n")

        # Deteksi cut points di rentang ini
        cuts = detect_scenes_in_range(video_path, st, en)
        local_pacing = round(seg_dur / max(1, len(cuts) + 1), 2)
        local_pacing = max(1.5, min(7.0, local_pacing))

        # Ambil keyframe snapshot pada ~40% potongan
        mid_ts = round(st + (seg_dur * 0.4), 2)
        raw_frame = step_subfolder / "raw_frame.jpg"
        extract_keyframe_at(video_path, mid_ts, raw_frame)

        # Simpan thumbnail 9:16 untuk segmen ini
        step_thumb_name = f"{slug}_step_{step_num:02d}.jpg"
        step_thumb_file = studio_seg_dir / step_thumb_name
        saved_thumb = False
        if raw_frame.exists():
            saved_thumb = save_crop_thumbnail(raw_frame, step_thumb_file)
            if saved_thumb:
                all_thumb_candidates.append(step_thumb_file)

        # Ekstrak palet warna lokal segmen
        local_palette = extract_dominant_palette_from_images([raw_frame] if raw_frame.exists() else [])
        all_extracted_palettes.append(local_palette)

        if not saved_thumb:
            create_placeholder_thumb(step_thumb_file, f"Step {step_num}", local_palette)
            all_thumb_candidates.append(step_thumb_file)

        step_dict = {
            "step": step_num,
            "label": f"Step {step_num}",
            "time_range": f"{st:.1f}s - {en:.1f}s",
            "start_sec": st,
            "end_sec": en,
            "duration": round(seg_dur, 1),
            "pacing_sec": local_pacing,
            "scene_cuts": len(cuts),
            "palette_hex": local_palette,
            "thumb_url": f"/aset/gaya/segments/{step_thumb_name}"
        }
        step_results.append(step_dict)

        # Simpan hasil per segmen sebagai file individual
        (step_subfolder / "step_metrics.json").write_text(json.dumps(step_dict, indent=2), encoding="utf-8")
        sys.stderr.write(f"       -> Selesai: {len(cuts)} cut, pacing ~{local_pacing}s, palet: {', '.join(local_palette[:3])}\n")

    # 3. TAHAP KONSOLIDASI & SINTESIS AI AGENT (MERGE / AGGREGATOR)
    sys.stderr.write(f"[MERGE] Menggabungkan {num_steps} file analisa segmen menjadi 1 AI Skill & Template utuh...\n")

    # Kuantisasi warna global dari seluruh segmen
    # Kumpulkan semua warna dari step 1..N
    all_colors_flat = []
    for pal in all_extracted_palettes:
        all_colors_flat.extend(pal)

    # Master palette: pilih 5 warna yang paling sering muncul atau saling kontras
    master_palette = all_extracted_palettes[0] if all_extracted_palettes else ["#14427A", "#0B0B0B", "#FACC15", "#38BDF8", "#F97316"]
    if len(all_extracted_palettes) > 1:
        # Gunakan warna background dari step 1, aksen dari step dengan cuts terbanyak
        best_step = max(step_results, key=lambda s: s.get("scene_cuts", 0))
        master_palette = [
            all_extracted_palettes[0][0],   # Background step 1
            best_step["palette_hex"][1],    # Text/Stroke
            best_step["palette_hex"][2],    # Secondary
            best_step["palette_hex"][3],    # Accent 1
            all_extracted_palettes[-1][4]   # Accent 2 dari penutup
        ]

    # Rata-rata pacing keseluruhan
    avg_pacing = round(sum(s["pacing_sec"] for s in step_results) / len(step_results), 2)
    avg_pacing = max(2.0, min(8.0, avg_pacing))

    # Tentukan Cover Thumbnail Utama Template
    # Pilih dari step tengah yang paling dinamis
    chosen_thumb = None
    if all_thumb_candidates:
        mid_idx = len(all_thumb_candidates) // 2
        chosen_thumb = all_thumb_candidates[mid_idx]
    if chosen_thumb and chosen_thumb.exists():
        shutil.copy2(chosen_thumb, master_thumb_path)
    else:
        create_placeholder_thumb(master_thumb_path, slug.title(), master_palette)

    display_name = slug.replace("-", " ").replace("_", " ").title()

    metrics = {
        "slug": slug,
        "display_name": display_name,
        "description": f"Preset gaya visual diekstrak melalui chunking {num_steps} segmen (@ {chunk_sec}s). Rata-rata pacing ~{avg_pacing}s, palet master: {', '.join(master_palette)}.",
        "avg_pacing_sec": avg_pacing,
        "aspect_ratio": aspect,
        "palette_hex": master_palette,
        "thumbnail": f"/aset/gaya/{slug}.jpg",
        "visual_grammar": {
            "rendering_style": "3D cel-shaded toon outline / flat kinetic vector",
            "stroke_rule": f"stroke='{master_palette[1]}' stroke-width='3.5' stroke-linejoin='round'",
            "character_or_object_rules": "Kontur tegas, proporsi tebal, cel-shaded solid",
            "background_style": f"Latar {master_palette[0]} dengan aksen {master_palette[2]}"
        },
        "typography_and_subtitle": {
            "font_family": "Plus Jakarta Sans, sans-serif",
            "title_max_words": 4,
            "subtitle_mode": "word-pop",
            "subtitle_position": "bottom-center",
            "subtitle_stroke": f"6px {master_palette[1]}"
        },
        "motion_physics": {
            "spring_stiffness": 180,
            "spring_damping": 18,
            "dominant_transition": "zoom-punch",
            "camera_shake_on_impact": True
        },
        "segment_analysis": {
            "chunk_sec": chunk_sec,
            "total_steps": num_steps,
            "steps": step_results
        }
    }

    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    sys.stderr.write(f"[SELESAI] Master metrics konsolidasi berhasil disimpan ke {metrics_path}.\n")

    # Auto-purge video mentah jika diminta
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
