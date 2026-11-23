// Preset Komposisi Remotion Prosedural: Kartun Jadul 1930s Rubberhose (kartun-jadul)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarKartunJadul: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#1A1A1A', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-kartun-jadul" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#F5F5DC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-kartun-jadul)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#4A4A4A"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#808080"
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
          background: 'linear-gradient(to top, #F5F5DC18, transparent)',
          borderTop: '1px solid #F5F5DC33',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_kartun_jadul: StylePreset = {
  nama: 'Kartun Jadul 1930s Rubberhose',
  slug: 'kartun-jadul',
  asal: 'claude-30-styles',
  teks: '#F5F5DC',
  redup: '#F5F5DCaa',
  aksen: '#F5F5DC',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarKartunJadul,
  avg_pacing_sec: 2.5,
  palette_hex: ["#1A1A1A", "#F5F5DC", "#4A4A4A", "#808080", "#E0E0E0"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_kartun_jadul;
