// Preset Komposisi Remotion Prosedural: Origami Kertas Lipat Geometris (origami)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarOrigami: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#F8F9FA', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-origami" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F8F9FA" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-origami)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#3B82F6"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#F59E0B"
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
          background: 'linear-gradient(to top, #EF444418, transparent)',
          borderTop: '1px solid #EF444433',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_origami: StylePreset = {
  nama: 'Origami Kertas Lipat Geometris',
  slug: 'origami',
  asal: 'claude-30-styles',
  teks: '#EF4444',
  redup: '#EF4444aa',
  aksen: '#EF4444',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarOrigami,
  avg_pacing_sec: 3.5,
  palette_hex: ["#F8F9FA", "#EF4444", "#3B82F6", "#F59E0B", "#10B981"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_origami;
