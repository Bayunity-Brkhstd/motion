// Preset Komposisi Remotion Prosedural: Kertas Potong Berlapis Papercut (kertas-potong)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarKertasPotong: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#1B263B', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-kertas-potong" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#F4A261" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1B263B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-kertas-potong)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#778DA9"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#E0E1DD"
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
          background: 'linear-gradient(to top, #F4A26118, transparent)',
          borderTop: '1px solid #F4A26133',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_kertas_potong: StylePreset = {
  nama: 'Kertas Potong Berlapis Papercut',
  slug: 'kertas-potong',
  asal: 'claude-30-styles',
  teks: '#415A77',
  redup: '#415A77aa',
  aksen: '#F4A261',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarKertasPotong,
  avg_pacing_sec: 3.5,
  palette_hex: ["#1B263B", "#415A77", "#778DA9", "#E0E1DD", "#F4A261"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_kertas_potong;
