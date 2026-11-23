// Preset Komposisi Remotion Prosedural: Hologram Sci-Fi Proyeksi HUD (hologram)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarHologram: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#020C1B', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-hologram" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#020C1B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-hologram)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#0077FE"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#7000FF"
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
          background: 'linear-gradient(to top, #00F0FF18, transparent)',
          borderTop: '1px solid #00F0FF33',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_hologram: StylePreset = {
  nama: 'Hologram Sci-Fi Proyeksi HUD',
  slug: 'hologram',
  asal: 'claude-30-styles',
  teks: '#00F0FF',
  redup: '#00F0FFaa',
  aksen: '#00F0FF',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarHologram,
  avg_pacing_sec: 3.0,
  palette_hex: ["#020C1B", "#00F0FF", "#0077FE", "#7000FF", "#E0F7FA"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_hologram;
