// Preset Komposisi Remotion Prosedural: ASCII Art Terminal Konsol (ascii)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarAscii: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#0A0F0D', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-ascii" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#00FF66" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0A0F0D" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-ascii)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#003B15"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#1B4332"
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
          background: 'linear-gradient(to top, #00FF6618, transparent)',
          borderTop: '1px solid #00FF6633',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_ascii: StylePreset = {
  nama: 'ASCII Art Terminal Konsol',
  slug: 'ascii',
  asal: 'claude-30-styles',
  teks: '#00FF66',
  redup: '#00FF66aa',
  aksen: '#00FF66',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarAscii,
  avg_pacing_sec: 3.0,
  palette_hex: ["#0A0F0D", "#00FF66", "#003B15", "#1B4332", "#D8F3DC"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_ascii;
