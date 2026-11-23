// Preset Komposisi Remotion Prosedural: Golden Hour Siluet Senja (golden-hour)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarGoldenHour: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#3C096C', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-golden-hour" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FF9E00" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#3C096C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-golden-hour)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#C77DFF"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#FF9E00"
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
          background: 'linear-gradient(to top, #FF9E0018, transparent)',
          borderTop: '1px solid #FF9E0033',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_golden_hour: StylePreset = {
  nama: 'Golden Hour Siluet Senja',
  slug: 'golden-hour',
  asal: 'claude-30-styles',
  teks: '#7B2CBF',
  redup: '#7B2CBFaa',
  aksen: '#FF9E00',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarGoldenHour,
  avg_pacing_sec: 3.5,
  palette_hex: ["#3C096C", "#7B2CBF", "#C77DFF", "#FF9E00", "#FF6000"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_golden_hour;
