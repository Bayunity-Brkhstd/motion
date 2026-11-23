// Preset Komposisi Remotion Prosedural: Boneka Rajut Benang Wol (boneka-rajut)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarBonekaRajut: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#FDF4E3', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-boneka-rajut" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#E07A5F" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FDF4E3" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-boneka-rajut)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#3D405B"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#81B29A"
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
          background: 'linear-gradient(to top, #E07A5F18, transparent)',
          borderTop: '1px solid #E07A5F33',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_boneka_rajut: StylePreset = {
  nama: 'Boneka Rajut Benang Wol',
  slug: 'boneka-rajut',
  asal: 'claude-30-styles',
  teks: '#E07A5F',
  redup: '#E07A5Faa',
  aksen: '#E07A5F',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarBonekaRajut,
  avg_pacing_sec: 3.5,
  palette_hex: ["#FDF4E3", "#E07A5F", "#3D405B", "#81B29A", "#F2CC8F"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_boneka_rajut;
