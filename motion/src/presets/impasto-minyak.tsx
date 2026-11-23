// Preset Komposisi Remotion Prosedural: Impasto Cat Minyak Van Gogh (impasto-minyak)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarImpastoMinyak: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.35) % 360;
  const pulse = Math.sin(f / 16) * 12;
  return (
    <AbsoluteFill style={{background: '#0C1821', overflow: 'hidden'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.32}}>
        <defs>
          <radialGradient id="grad-impasto-minyak" cx="50%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0C1821" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-impasto-minyak)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="4"
          strokeDasharray="14 18"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={350}
          fill="none"
          stroke="#FDE047"
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
          background: 'linear-gradient(to top, #F59E0B18, transparent)',
          borderTop: '1px solid #F59E0B33',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_impasto_minyak: StylePreset = {
  nama: 'Impasto Cat Minyak Van Gogh',
  slug: 'impasto-minyak',
  asal: 'claude-30-styles',
  teks: '#1E3A8A',
  redup: '#1E3A8Aaa',
  aksen: '#F59E0B',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarImpastoMinyak,
  avg_pacing_sec: 3.8,
  palette_hex: ["#0C1821", "#1E3A8A", "#F59E0B", "#FDE047", "#1E293B"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_impasto_minyak;
