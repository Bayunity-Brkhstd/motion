import json
import os
import shutil
from pathlib import Path

BASE_DIR = Path("d:/berjan/cheat clip motion")
SKILLS_DIR = BASE_DIR / "motion" / "skills"
PRESETS_DIR = BASE_DIR / "motion" / "src" / "presets"
ASET_GAYA_DIR = BASE_DIR / "studio" / "aset" / "gaya"
STUDIO_PY = BASE_DIR / "studio" / "studio.py"

# Import list of 30 styles
from integrate_30_styles import STYLES_30

def clean_ident(s: str) -> str:
    cleaned = "".join(c if c.isalnum() or c == "_" else "_" for c in s.replace("-", "_"))
    if cleaned and cleaned[0].isdigit():
        return f"preset_{cleaned}"
    return f"preset_{cleaned}"

def generate_tsx(style: dict) -> str:
    slug = style["id"]
    ident = clean_ident(slug)
    comp_name = "".join(part.title() for part in slug.split("-"))
    palet = style["palette_hex"]
    bg = palet[0]
    teks = palet[1]
    aksen = style["aksen"]
    sec = palet[2]
    aksen2 = palet[3] if len(palet) > 3 else aksen
    
    return f"""// Preset Komposisi Remotion Prosedural: {style['nama']} ({slug})
import React from 'react';
import {{AbsoluteFill, interpolate}} from 'remotion';
import {{StylePreset}} from './types';

const Latar{comp_name}: React.FC<{{f: number; i: number; n: number; aksen: string; judul: string}}> = ({{f, aksen}}) => {{
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{{{background: '{bg}', overflow: 'hidden'}}}}>
      <svg width="1080" height="1920" style={{{{position: 'absolute', inset: 0, opacity: 0.32}}}}>
        <defs>
          <radialGradient id="grad-{slug}" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="{aksen}" stopOpacity="0.45" />
            <stop offset="100%" stopColor="{bg}" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-{slug})" />
        <circle
          cx={{540}}
          cy={{640}}
          r={{280 + pulse}}
          fill="none"
          stroke="{sec}"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={{`rotate(${{rotasi}} 540 640)`}}
        />
        <circle
          cx={{540}}
          cy={{640}}
          r={{350}}
          fill="none"
          stroke="{aksen2}"
          strokeWidth="2.5"
          opacity="0.35"
        />
      </svg>
      <div
        style={{{{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 380,
          background: 'linear-gradient(to top, {aksen}18, transparent)',
          borderTop: '1px solid {aksen}33',
        }}}}
      />
    </AbsoluteFill>
  );
}};

export const {ident}: StylePreset = {{
  nama: '{style["nama"]}',
  slug: '{slug}',
  asal: 'claude-30-styles',
  teks: '{teks}',
  redup: '{teks}aa',
  aksen: '{aksen}',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: Latar{comp_name},
  avg_pacing_sec: {style.get("pacingSec", 3.5)},
  palette_hex: {json.dumps(palet)},
  physics: {{
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  }},
}};

export default {ident};
"""

def generate_skill_md(style: dict) -> str:
    slug = style["id"]
    palet = style["palette_hex"]
    palet_str = ", ".join(f"`{c}`" for c in palet)
    
    return f"""---
name: {slug}
description: Preset gaya visual '{style["nama"]}' dari katalog 30 gaya animasi Claude (@coretanfery). Rata-rata pacing ~{style.get("pacingSec", 3.5)}s, palet master: {palet_str}. Gunakan modul skill ini saat memproduksi animasi bergaya '{style["badge"]}'.
---

# AI Video Skill: {style["nama"]} (`{slug}`)

Preset gaya visual ini diadaptasi dari panduan kreasi animasi prosedural Claude (@coretanfery) untuk memproduksi animasi HTML5 `<canvas>` dan Remotion dengan estetika {style["badge"]}.

## 1. Aturan Pacing & Durasi Adegan
- **Rata-rata Pacing Adegan:** `{style.get("pacingSec", 3.5)}` detik per adegan.
- Properti `durasi_detik` pada setiap objek `Adegan` di `naskah.json` WAJIB berkisar antara `2.0` hingga `4.5` detik.

## 2. Palet Warna Wajib (5 Kode HEX)
Setiap naskah/komposisi yang menggunakan gaya ini WAJIB memasukkan 5 kode warna berikut ke properti `palet` di `naskah.json`:
1. **Latar Belakang Utama:** `{palet[0]}`
2. **Kontras / Teks Utama:** `{palet[1]}`
3. **Warna Sekunder / Kartu:** `{palet[2]}`
4. **Warna Aksen 1:** `{palet[3] if len(palet) > 3 else palet[0]}`
5. **Warna Aksen 2:** `{palet[4] if len(palet) > 4 else palet[1]}`

## 3. Fitur Visual Kunci
{chr(10).join(f"- {f}" for f in style.get("fiturVisual", []))}

## 4. Master Prompt Blueprint (Claude HTML5 Canvas)
```text
{style.get("prompt_blueprint", "")}
```
"""

def main():
    SKILLS_DIR.mkdir(parents=True, exist_ok=True)
    PRESETS_DIR.mkdir(parents=True, exist_ok=True)
    ASET_GAYA_DIR.mkdir(parents=True, exist_ok=True)
    
    print("Membuat 30 folder skill & SKILL.md...")
    for s in STYLES_30:
        slug = s["id"]
        # 1. Folder skill
        s_folder = SKILLS_DIR / slug
        s_folder.mkdir(parents=True, exist_ok=True)
        (s_folder / "SKILL.md").write_text(generate_skill_md(s), encoding="utf-8")
        
        # 2. Preset TSX
        p_tsx = PRESETS_DIR / f"{slug}.tsx"
        p_tsx.write_text(generate_tsx(s), encoding="utf-8")
        
        # 3. Pastikan thumbnail gambar ada di studio/aset/gaya/
        thumb_name = f"{slug}.jpg"
        thumb_dest = ASET_GAYA_DIR / thumb_name
        if not thumb_dest.exists():
            # Cari dari thumbnail bawaan di objek style
            src_thumb = s.get("thumbnail", "").lstrip("/")
            src_path = BASE_DIR / "studio" / src_thumb
            if src_path.exists():
                shutil.copy2(src_path, thumb_dest)
            else:
                # Fallback ke sinematik.jpg jika ada
                fallback = ASET_GAYA_DIR / "sinematik.jpg"
                if fallback.exists():
                    shutil.copy2(fallback, thumb_dest)

    print(f"30 Skill folder & 30 Preset TSX berhasil dibuat!")
    
    # 4. Sinkronkan presets index di motion/src/presets/index.ts
    import sys
    sys.path.append(str(BASE_DIR / "studio"))
    from studio import sinkronkan_presets_index
    sinkronkan_presets_index()
    print("motion/src/presets/index.ts berhasil disinkronkan otomatis!")

if __name__ == "__main__":
    main()
