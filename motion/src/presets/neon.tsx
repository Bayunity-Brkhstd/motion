// Preset Komposisi Remotion Prosedural: Neon 80s Synthwave Outrun (neon)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarNeon: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#0F051D', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-neon" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0F051D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-neon)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#06B6D4"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#FACC15"
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
          background: 'linear-gradient(to top, #06B6D418, transparent)',
          borderTop: '1px solid #06B6D433',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_neon: StylePreset = {
  nama: 'Neon 80s Synthwave Outrun',
  slug: 'neon',
  asal: 'claude-30-styles',
  teks: '#F43F5E',
  redup: '#F43F5Eaa',
  aksen: '#06B6D4',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarNeon,
  avg_pacing_sec: 3.0,
  palette_hex: ["#0F051D", "#F43F5E", "#06B6D4", "#FACC15", "#8B5CF6"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_neon;
