// Preset Komposisi Remotion Prosedural: Mozaik Batu Romawi Kuno (mozaik-romawi)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarMozaikRomawi: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#1C1917', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-mozaik-romawi" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1C1917" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-mozaik-romawi)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#9A3412"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#D97706"
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
          background: 'linear-gradient(to top, #D9770618, transparent)',
          borderTop: '1px solid #D9770633',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_mozaik_romawi: StylePreset = {
  nama: 'Mozaik Batu Romawi Kuno',
  slug: 'mozaik-romawi',
  asal: 'claude-30-styles',
  teks: '#78350F',
  redup: '#78350Faa',
  aksen: '#D97706',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarMozaikRomawi,
  avg_pacing_sec: 4.0,
  palette_hex: ["#1C1917", "#78350F", "#9A3412", "#D97706", "#FEF3C7"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_mozaik_romawi;
