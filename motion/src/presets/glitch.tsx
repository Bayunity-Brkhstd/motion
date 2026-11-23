// Preset Komposisi Remotion Prosedural: Glitch RGB Shift Digital Error (glitch)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarGlitch: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#050505', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-glitch" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FF0055" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-glitch)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#00FFFF"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#FFFF00"
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
          background: 'linear-gradient(to top, #FF005518, transparent)',
          borderTop: '1px solid #FF005533',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_glitch: StylePreset = {
  nama: 'Glitch RGB Shift Digital Error',
  slug: 'glitch',
  asal: 'claude-30-styles',
  teks: '#FF0055',
  redup: '#FF0055aa',
  aksen: '#FF0055',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarGlitch,
  avg_pacing_sec: 2.5,
  palette_hex: ["#050505", "#FF0055", "#00FFFF", "#FFFF00", "#FFFFFF"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_glitch;
