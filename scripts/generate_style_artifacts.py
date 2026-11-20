#!/usr/bin/env python3
"""
scripts/generate_style_artifacts.py
Menerima JSON metrics hasil ekstraksi gaya video dan menghasilkan:
1. Global Skill: motion/skills/<slug>/SKILL.md (dan sinkronisasi ke .agent/skills/<slug>/ jika ada)
2. Remotion Preset: motion/src/presets/<slug>.tsx
3. Memperbarui Dynamic Registry: motion/src/presets/index.ts
4. Memperbarui Global Skill Manifest: motion/skills/registry.json
"""

import os
import sys
import json
import re
import shutil
import argparse
from datetime import datetime, timezone
from pathlib import Path


def slug_to_pascal(slug: str) -> str:
    parts = re.split(r"[-_]+", slug)
    return "".join(p.capitalize() for p in parts if p)


def slug_to_ident(slug: str) -> str:
    clean = re.sub(r"[^a-zA-Z0-9_]", "_", slug)
    if clean and clean[0].isdigit():
        clean = "preset_" + clean
    return clean


def generate_skill_md(metrics: dict, target_path: Path):
    slug = metrics.get("slug", "custom-style")
    display_name = metrics.get("display_name", slug.replace("-", " ").title())
    description = metrics.get("description", "")
    avg_pacing = metrics.get("avg_pacing_sec", 3.5)
    palette = metrics.get("palette_hex", ["#14427A", "#0B0B0B", "#FACC15", "#38BDF8", "#F97316"])
    vg = metrics.get("visual_grammar", {})
    typo = metrics.get("typography_and_subtitle", {})
    physics = metrics.get("motion_physics", {})

    min_pacing = max(1.5, round(avg_pacing * 0.7, 1))
    max_pacing = round(avg_pacing * 1.4, 1)

    content = f"""---
name: {slug}
description: {description} Wajib gunakan modul skill dan preset ini jika pengguna meminta animasi visual bertema '{display_name}' atau palet {palette[0]}/{palette[2]}.
---

# AI Video Skill: {display_name} (`{slug}`)

Preset gaya visual ini digenerasi secara terprogram dari video referensi untuk memproduksi animasi gerak dinamis Remotion berbasis kode React, ilustrasi vektor SVG aman, dan pacing kinetik.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `{avg_pacing}` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `{min_pacing}` hingga `{max_pacing}` detik.
- Jangan biarkan ada adegan statis tanpa pergantian visual atau punch in melebihi `{max_pacing}` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `{palette[0]}`
2. **Kontras / Teks Utama:** `{palette[1]}`
3. **Warna Sekunder / Kartu:** `{palette[2]}`
4. **Warna Aksen 1:** `{palette[3]}`
5. **Warna Aksen 2:** `{palette[4]}`

## 3. Standar Baku Ilustrasi SVG (`gambar?: string`)
Seluruh ilustrasi adegan yang dibuat oleh AI Director dan dimasukkan ke properti `gambar` WAJIB mematuhi:
- **Gaya Visual:** {vg.get('rendering_style', 'Toon vector illustration')}
- **Garis & Stroke:** `{vg.get('stroke_rule', "stroke='#0B0B0B' stroke-width='3.5' stroke-linejoin='round'")}`
- **Karakter / Elemen Objek:** {vg.get('character_or_object_rules', 'Bentuk ikonik, proporsi ekspresif, bayangan solid')}
- **Latar Ilustrasi:** {vg.get('background_style', f'Latar selaras {palette[0]} dengan aksen {palette[2]}')}
- **KEAMANAN KODE SVG (100% Wajib Lolos `motion/svg-aman.mjs`):**
  - DILARANG menggunakan tag `<script>` apa pun.
  - DILARANG menggunakan atribut interaktif/event handler seperti `onload`, `onclick`, `onerror`, `onmouseover`.
  - Gunakan elemen standar SVG: `<svg viewBox="0 0 800 800">`, `<path>`, `<circle>`, `<rect>`, `<polygon>`, `<g>`, `<defs>`, `<linearGradient>`.

## 4. Tipografi & Tata Letak Layar
- **Font Utama:** `{typo.get('font_family', 'Plus Jakarta Sans, sans-serif')}`
- **Maksimal Kata Judul:** Maksimal `{typo.get('title_max_words', 4)}` kata per adegan (`judul`).
- **Gaya Subtitle:** Mode `{typo.get('subtitle_mode', 'word-pop')}` di posisi `{typo.get('subtitle_position', 'bottom-center')}` dengan stroke tebal `{typo.get('subtitle_stroke', '6px #000')}`.

## 5. Fisika Gerak & Remotion Springs
- **Spring Stiffness:** `{physics.get('spring_stiffness', 180)}`
- **Spring Damping:** `{physics.get('spring_damping', 18)}`
- **Transisi Antar Adegan:** `{physics.get('dominant_transition', 'zoom-punch')}`
- **Camera Shake on Impact:** `{str(physics.get('camera_shake_on_impact', True)).lower()}`
"""
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(content, encoding="utf-8")


def generate_preset_tsx(metrics: dict, target_path: Path):
    slug = metrics.get("slug", "custom-style")
    display_name = metrics.get("display_name", slug.replace("-", " ").title())
    palette = metrics.get("palette_hex", ["#14427A", "#0B0B0B", "#FACC15", "#38BDF8", "#F97316"])
    avg_pacing = metrics.get("avg_pacing_sec", 3.5)
    physics = metrics.get("motion_physics", {})
    typo = metrics.get("typography_and_subtitle", {})

    bg_hex = palette[0]
    teks_hex = palette[1]
    sec_hex = palette[2]
    aksen_hex = palette[3]
    aksen2_hex = palette[4]

    pascal = slug_to_pascal(slug)

    tsx_content = f"""// Preset Komposisi Remotion Otomatis: {display_name} ({slug})
import React from 'react';
import {{AbsoluteFill, interpolate}} from 'remotion';
import {{StylePreset}} from './types';

const Latar{pascal}: React.FC<{{f: number; i: number; n: number; aksen: string; judul: string}}> = ({{f, aksen}}) => {{
  const rotasi = (f * 0.4) % 360;
  const pulse = Math.sin(f / 18) * 14;
  return (
    <AbsoluteFill style={{{{background: '{bg_hex}', overflow: 'hidden'}}}}>
      {{/* Elemen Latar Dinamis Berbasis Palet Ekstraksi */}}
      <svg width="1080" height="1920" style={{{{position: 'absolute', inset: 0, opacity: 0.28}}}}>
        <defs>
          <radialGradient id="grad-{slug}" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="{aksen_hex}" stopOpacity="0.45" />
            <stop offset="100%" stopColor="{bg_hex}" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-{slug})" />
        <circle
          cx={{540}}
          cy={{640}}
          r={{280 + pulse}}
          fill="none"
          stroke="{sec_hex}"
          strokeWidth="4"
          strokeDasharray="12 16"
          transform={{`rotate(${{rotasi}} 540 640)`}}
        />
        <circle
          cx={{540}}
          cy={{640}}
          r={{340}}
          fill="none"
          stroke="{aksen2_hex}"
          strokeWidth="2"
          opacity="0.3"
        />
      </svg>
      {{/* Garis Grid Kinetik */}}
      <div
        style={{{{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 380,
          background: 'linear-gradient(to top, {aksen_hex}18, transparent)',
          borderTop: '1px solid {aksen_hex}33',
        }}}}
      />
    </AbsoluteFill>
  );
}};

export const preset_{slug_to_ident(slug)}: StylePreset = {{
  nama: '{display_name}',
  slug: '{slug}',
  asal: 'video-reference',
  teks: '{teks_hex}',
  redup: '{teks_hex}aa',
  aksen: '{aksen_hex}',
  fontJudul: '{typo.get("font_family", "Plus Jakarta Sans, Montserrat, sans-serif")}',
  fontTeks: '{typo.get("font_family", "Plus Jakarta Sans, sans-serif")}',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: Latar{pascal},
  avg_pacing_sec: {avg_pacing},
  palette_hex: {json.dumps(palette)},
  physics: {{
    spring_stiffness: {physics.get("spring_stiffness", 180)},
    spring_damping: {physics.get("spring_damping", 18)},
    dominant_transition: '{physics.get("dominant_transition", "zoom-punch")}',
    camera_shake_on_impact: {str(physics.get("camera_shake_on_impact", True)).lower()},
  }},
}};

export default preset_{slug_to_ident(slug)};
"""
    target_path.parent.mkdir(parents=True, exist_ok=True)
    target_path.write_text(tsx_content, encoding="utf-8")


def update_presets_index(slug: str, index_path: Path):
    if not index_path.exists():
        return

    content = index_path.read_text(encoding="utf-8")
    ident = slug_to_ident(slug)
    import_stmt = f"import {{ preset_{ident} }} from './{slug}';"
    dict_entry = f"  '{slug}': preset_{ident},"

    # Cek apakah sudah di-import
    if import_stmt in content:
        return

    # Sisipkan import di penanda CUSTOM_PRESETS_START atau sebelum STYLE_PRESETS
    if "// CUSTOM_PRESETS_START" in content and "// CUSTOM_PRESETS_END" in content:
        pattern = r"// CUSTOM_PRESETS_START\r?\n([\s\S]*?)// CUSTOM_PRESETS_END"
        m = re.search(pattern, content)
        if m:
            existing_imports = m.group(1)
            new_imports = existing_imports + f"{import_stmt}\n"
            content = content.replace(m.group(0), f"// CUSTOM_PRESETS_START\n{new_imports}// CUSTOM_PRESETS_END")
    else:
        # Fallback sisipkan sebelum export const STYLE_PRESETS
        content = f"{import_stmt}\n" + content

    # Sisipkan entry ke STYLE_PRESETS
    if f"'{slug}':" not in content and f'"{slug}":' not in content:
        dict_pattern = r"(export const STYLE_PRESETS: Record<string, StylePreset> = \{\s*\.\.\.builtInPresets,)"
        replacement = f"\\1\n{dict_entry}"
        content = re.sub(dict_pattern, replacement, content)

    index_path.write_text(content, encoding="utf-8")


def update_skills_registry(metrics: dict, registry_path: Path):
    registry = []
    if registry_path.exists():
        try:
            registry = json.loads(registry_path.read_text(encoding="utf-8"))
            if not isinstance(registry, list):
                registry = []
        except Exception:
            registry = []

    slug = metrics.get("slug")
    now_iso = datetime.now(timezone.utc).isoformat()

    new_item = {
        "slug": slug,
        "name": metrics.get("display_name", slug.replace("-", " ").title()),
        "description": metrics.get("description", ""),
        "palette_hex": metrics.get("palette_hex", []),
        "avg_pacing_sec": metrics.get("avg_pacing_sec", 3.5),
        "created_at": now_iso,
        "inti": False
    }

    # Cek apakah slug sudah ada, jika ya timpa, jika tidak tambahkan
    found = False
    for idx, item in enumerate(registry):
        if item.get("slug") == slug:
            registry[idx] = new_item
            found = True
            break

    if not found:
        registry.append(new_item)

    registry_path.parent.mkdir(parents=True, exist_ok=True)
    registry_path.write_text(json.dumps(registry, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Generator Skill & Template dari metrics video.")
    parser.add_argument("--metrics", help="Path ke file metrics.json")
    parser.add_argument("--slug", help="Nama slug gaya jika metrics ada di tmp_style_frames/<slug>/metrics.json")
    parser.add_argument("--purge-frames", action="store_true", help="Bersihkan folder frame sementara setelah generasi selesai")

    args = parser.parse_args()

    metrics_file = None
    if args.metrics:
        metrics_file = Path(args.metrics)
    elif args.slug:
        metrics_file = Path("tmp_style_frames") / args.slug / "metrics.json"

    if not metrics_file or not metrics_file.exists():
        sys.stderr.write(f"[ERROR] File metrics '{metrics_file}' tidak ditemukan.\n")
        sys.exit(1)

    metrics = json.loads(metrics_file.read_text(encoding="utf-8"))
    slug = metrics.get("slug")
    if not slug:
        sys.stderr.write("[ERROR] Objek metrics tidak memiliki atribut 'slug'.\n")
        sys.exit(1)

    # 1. Generate Global Skill: motion/skills/<slug>/SKILL.md
    skill_md_path = Path("motion") / "skills" / slug / "SKILL.md"
    generate_skill_md(metrics, skill_md_path)

    # Sinkronisasi ke .agent/skills/<slug>/SKILL.md jika folder .agent/skills ada
    agent_skills_dir = Path(".agent") / "skills"
    if agent_skills_dir.exists():
        agent_skill_path = agent_skills_dir / slug / "SKILL.md"
        generate_skill_md(metrics, agent_skill_path)

    # 2. Generate Preset Remotion: motion/src/presets/<slug>.tsx
    preset_tsx_path = Path("motion") / "src" / "presets" / f"{slug}.tsx"
    generate_preset_tsx(metrics, preset_tsx_path)

    # 3. Update Preset Registry: motion/src/presets/index.ts
    presets_index_path = Path("motion") / "src" / "presets" / "index.ts"
    update_presets_index(slug, presets_index_path)

    # 4. Update Global Skills Manifest: motion/skills/registry.json
    registry_path = Path("motion") / "skills" / "registry.json"
    update_skills_registry(metrics, registry_path)

    # 5. Purge frames jika diminta
    if args.purge_frames:
        frames_dir = Path("tmp_style_frames") / slug
        if frames_dir.exists():
            shutil.rmtree(frames_dir, ignore_errors=True)

    result = {
        "ok": True,
        "slug": slug,
        "display_name": metrics.get("display_name"),
        "skill_md": str(skill_md_path).replace("\\", "/"),
        "preset_tsx": str(preset_tsx_path).replace("\\", "/"),
        "registry_updated": True
    }
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
