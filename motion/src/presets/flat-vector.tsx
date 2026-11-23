// Preset Komposisi Remotion Prosedural: Flat Vector Pastel Modern (flat-vector)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarFlatVector: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#F8FAFC', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-flat-vector" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-flat-vector)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#FB7185"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#FCD34D"
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
          background: 'linear-gradient(to top, #38BDF818, transparent)',
          borderTop: '1px solid #38BDF833',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_flat_vector: StylePreset = {
  nama: 'Flat Vector Pastel Modern',
  slug: 'flat-vector',
  asal: 'claude-30-styles',
  teks: '#38BDF8',
  redup: '#38BDF8aa',
  aksen: '#38BDF8',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarFlatVector,
  avg_pacing_sec: 3.5,
  palette_hex: ["#F8FAFC", "#38BDF8", "#FB7185", "#FCD34D", "#4ADE80"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_flat_vector;
