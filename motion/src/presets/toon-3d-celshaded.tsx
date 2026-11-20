// Preset Komposisi Remotion: Toon 3D Celshaded (toon-3d-celshaded)
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {StylePreset} from './types';

const LatarToon3d: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f}) => {
  const rotasi = (f * 0.3) % 360;
  const pulse = Math.sin(f / 20) * 12;
  return (
    <AbsoluteFill style={{background: '#0B1B2B', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-toon" cx="50%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0B1B2B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-toon)" />
        <circle
          cx={540}
          cy={640}
          r={260 + pulse}
          fill="none"
          stroke="#FACC15"
          strokeWidth="6"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={320}
          fill="none"
          stroke="#4FC3F7"
          strokeWidth="3"
          opacity="0.4"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 360,
          background: 'linear-gradient(to top, #4FC3F722, transparent)',
          borderTop: '2px solid #4FC3F744',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_toon_3d_celshaded: StylePreset = {
  nama: 'Toon 3D Celshaded',
  slug: 'toon-3d-celshaded',
  asal: 'video-reference',
  teks: '#FFFFFF',
  redup: '#94A3B8',
  aksen: '#4FC3F7',
  fontJudul: 'Space Grotesk, sans-serif',
  fontTeks: 'Space Grotesk, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarToon3d,
  avg_pacing_sec: 4.5,
  palette_hex: ['#0B1B2B', '#4FC3F7', '#FACC15', '#FFFFFF', '#1E293B'],
  physics: {
    spring_stiffness: 110,
    spring_damping: 14,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: false,
  },
};

export default preset_toon_3d_celshaded;
