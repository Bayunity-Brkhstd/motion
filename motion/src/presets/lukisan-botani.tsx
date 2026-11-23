// Preset Komposisi Remotion Prosedural: Lukisan Botani Antik Ilmiah (lukisan-botani)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarLukisanBotani: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#F5EBE0', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-lukisan-botani" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#2D5A27" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#F5EBE0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-lukisan-botani)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#588157"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#A3B18A"
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
          background: 'linear-gradient(to top, #2D5A2718, transparent)',
          borderTop: '1px solid #2D5A2733',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_lukisan_botani: StylePreset = {
  nama: 'Lukisan Botani Antik Ilmiah',
  slug: 'lukisan-botani',
  asal: 'claude-30-styles',
  teks: '#2D5A27',
  redup: '#2D5A27aa',
  aksen: '#2D5A27',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarLukisanBotani,
  avg_pacing_sec: 4.0,
  palette_hex: ["#F5EBE0", "#2D5A27", "#588157", "#A3B18A", "#BC4749"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_lukisan_botani;
