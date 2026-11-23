// Preset Komposisi Remotion Prosedural: Gouache Malam Matte Sinematik (gouache-malam)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarGouacheMalam: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#0B132B', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-gouache-malam" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#5BC0BE" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0B132B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-gouache-malam)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#3A506B"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#5BC0BE"
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
          background: 'linear-gradient(to top, #5BC0BE18, transparent)',
          borderTop: '1px solid #5BC0BE33',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_gouache_malam: StylePreset = {
  nama: 'Gouache Malam Matte Sinematik',
  slug: 'gouache-malam',
  asal: 'claude-30-styles',
  teks: '#1C2541',
  redup: '#1C2541aa',
  aksen: '#5BC0BE',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarGouacheMalam,
  avg_pacing_sec: 3.5,
  palette_hex: ["#0B132B", "#1C2541", "#3A506B", "#5BC0BE", "#6FFFE9"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_gouache_malam;
