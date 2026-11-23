// Preset Komposisi Remotion Prosedural: Cat Air Kertas Basah (cat-air)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarCatAir: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#FDFBF7', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-cat-air" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FDFBF7" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-cat-air)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#F472B6"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#FBBF24"
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
          background: 'linear-gradient(to top, #F472B618, transparent)',
          borderTop: '1px solid #F472B633',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_cat_air: StylePreset = {
  nama: 'Cat Air Kertas Basah',
  slug: 'cat-air',
  asal: 'claude-30-styles',
  teks: '#38BDF8',
  redup: '#38BDF8aa',
  aksen: '#F472B6',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarCatAir,
  avg_pacing_sec: 3.8,
  palette_hex: ["#FDFBF7", "#38BDF8", "#F472B6", "#FBBF24", "#34D399"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_cat_air;
