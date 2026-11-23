// Preset Komposisi Remotion Otomatis: Snaptik Animasi Ref (snaptik-animasi-ref)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const LatarSnaptikAnimasiRef: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.4) % 360;
  const pulse = Math.sin(f / 18) * 14;
  return (
    <AbsoluteFill style={{background: '#9B937C', overflow: 'hidden'}}>
      {/* Elemen Latar Dinamis Berbasis Palet Ekstraksi */}
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.28}}>
        <defs>
          <radialGradient id="grad-snaptik-animasi-ref" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#282836" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#9B937C" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-snaptik-animasi-ref)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#3F404D"
          strokeWidth="4"
          strokeDasharray="12 16"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={340}
          fill="none"
          stroke="#F7E2C7"
          strokeWidth="2"
          opacity="0.3"
        />
      </svg>
      {/* Garis Grid Kinetik */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 380,
          background: 'linear-gradient(to top, #28283618, transparent)',
          borderTop: '1px solid #28283633',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_snaptik_animasi_ref: StylePreset = {
  nama: 'Snaptik Animasi Ref',
  slug: 'snaptik-animasi-ref',
  asal: 'video-reference',
  teks: '#5D5A62',
  redup: '#5D5A62aa',
  aksen: '#282836',
  fontJudul: 'Plus Jakarta Sans, sans-serif',
  fontTeks: 'Plus Jakarta Sans, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: LatarSnaptikAnimasiRef,
  avg_pacing_sec: 3.33,
  palette_hex: ["#9B937C", "#5D5A62", "#3F404D", "#282836", "#F7E2C7"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_snaptik_animasi_ref;
