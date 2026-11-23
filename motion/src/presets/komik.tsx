// Preset Komposisi Remotion Prosedural: Komik Halftone Pop-Art (komik)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarKomik: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#DC2626', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-komik" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-komik)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#FACC15"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#111827"
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
          background: 'linear-gradient(to top, #DC262618, transparent)',
          borderTop: '1px solid #DC262633',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_komik: StylePreset = {
  nama: 'Komik Halftone Pop-Art',
  slug: 'komik',
  asal: 'claude-30-styles',
  teks: '#2563EB',
  redup: '#2563EBaa',
  aksen: '#DC2626',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarKomik,
  avg_pacing_sec: 2.8,
  palette_hex: ["#DC2626", "#2563EB", "#FACC15", "#111827", "#FFFFFF"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_komik;
