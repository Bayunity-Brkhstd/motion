// Preset Komposisi Remotion Prosedural: Balok Mainan Plastik 3D (balok-mainan)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarBalokMainan: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#EF4444', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-balok-mainan" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#EAB308" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-balok-mainan)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#EAB308"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#22C55E"
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
          background: 'linear-gradient(to top, #EAB30818, transparent)',
          borderTop: '1px solid #EAB30833',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_balok_mainan: StylePreset = {
  nama: 'Balok Mainan Plastik 3D',
  slug: 'balok-mainan',
  asal: 'claude-30-styles',
  teks: '#3B82F6',
  redup: '#3B82F6aa',
  aksen: '#EAB308',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarBalokMainan,
  avg_pacing_sec: 3.0,
  palette_hex: ["#EF4444", "#3B82F6", "#EAB308", "#22C55E", "#F8FAFC"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_balok_mainan;
