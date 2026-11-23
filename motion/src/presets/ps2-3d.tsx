// Preset Komposisi Remotion Prosedural: PS2 3D Low-Poly Retro (ps2-3d)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarPs23D: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#1E293B', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-ps2-3d" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1E293B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-ps2-3d)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#94A3B8"
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
          background: 'linear-gradient(to top, #F59E0B18, transparent)',
          borderTop: '1px solid #F59E0B33',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_ps2_3d: StylePreset = {
  nama: 'PS2 3D Low-Poly Retro',
  slug: 'ps2-3d',
  asal: 'claude-30-styles',
  teks: '#64748B',
  redup: '#64748Baa',
  aksen: '#F59E0B',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarPs23D,
  avg_pacing_sec: 3.5,
  palette_hex: ["#1E293B", "#64748B", "#94A3B8", "#F59E0B", "#0F172A"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_ps2_3d;
