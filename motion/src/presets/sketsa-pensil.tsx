// Preset Komposisi Remotion Prosedural: Sketsa Pensil Buku Tulis (sketsa-pensil)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarSketsaPensil: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#FDFBF7', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-sketsa-pensil" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FDFBF7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-sketsa-pensil)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#64748B"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#EF4444"
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
          background: 'linear-gradient(to top, #64748B18, transparent)',
          borderTop: '1px solid #64748B33',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_sketsa_pensil: StylePreset = {
  nama: 'Sketsa Pensil Buku Tulis',
  slug: 'sketsa-pensil',
  asal: 'claude-30-styles',
  teks: '#334155',
  redup: '#334155aa',
  aksen: '#64748B',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarSketsaPensil,
  avg_pacing_sec: 3.5,
  palette_hex: ["#FDFBF7", "#334155", "#64748B", "#EF4444", "#94A3B8"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_sketsa_pensil;
