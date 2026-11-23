// Preset Komposisi Remotion Prosedural: Batik Nusantara Sogan & Kawung (batik)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarBatik: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#2C1810', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-batik" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#D97706" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#2C1810" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-batik)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#D97706"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#FDE68A"
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

export const preset_batik: StylePreset = {
  nama: 'Batik Nusantara Sogan & Kawung',
  slug: 'batik',
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
  Latar: LatarBatik,
  avg_pacing_sec: 3.8,
  palette_hex: ["#2C1810", "#78350F", "#D97706", "#FDE68A", "#451A03"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_batik;
