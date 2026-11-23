// Preset Komposisi Remotion Prosedural: Pixel Art 16-Bit Retro (pixel-art)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarPixelArt: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#181425', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-pixel-art" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FEE761" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#181425" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-pixel-art)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#E43B44"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#FEE761"
          strokeWidth="2.5"
          opacity="0.35"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 380,
          background: 'linear-gradient(to top, #FEE76118, transparent)',
          borderTop: '1px solid #FEE76133',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_pixel_art: StylePreset = {
  nama: 'Pixel Art 16-Bit Retro',
  slug: 'pixel-art',
  asal: 'claude-30-styles',
  teks: '#3A4466',
  redup: '#3A4466aa',
  aksen: '#FEE761',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarPixelArt,
  avg_pacing_sec: 3.0,
  palette_hex: ["#181425", "#3A4466", "#E43B44", "#FEE761", "#63C74D"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_pixel_art;
