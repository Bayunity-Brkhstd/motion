// Preset Komposisi Remotion Otomatis: 3D Custom (3d-custom)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

const Latar3dCustom: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  const rotasi = (f * 0.4) % 360;
  const pulse = Math.sin(f / 18) * 14;
  return (
    <AbsoluteFill style={{background: '#14427A', overflow: 'hidden'}}>
      {/* Elemen Latar Dinamis Berbasis Palet Ekstraksi */}
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.28}}>
        <defs>
          <radialGradient id="grad-3d-custom" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#14427A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad-3d-custom)" />
        <circle
          cx={540}
          cy={640}
          r={280 + pulse}
          fill="none"
          stroke="#FACC15"
          strokeWidth="4"
          strokeDasharray="12 16"
          transform={`rotate(${rotasi} 540 640)`}
        />
        <circle
          cx={540}
          cy={640}
          r={340}
          fill="none"
          stroke="#F97316"
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
          background: 'linear-gradient(to top, #38BDF818, transparent)',
          borderTop: '1px solid #38BDF833',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_preset_3d_custom: StylePreset = {
  nama: '3D Custom',
  slug: '3d-custom',
  asal: 'video-reference',
  teks: '#0B0B0B',
  redup: '#0B0B0Baa',
  aksen: '#38BDF8',
  fontJudul: 'Plus Jakarta Sans, Montserrat, sans-serif',
  fontTeks: 'Plus Jakarta Sans, Montserrat, sans-serif',
  fontLabel: 'monospace',
  bobot: 800,
  kapital: false,
  judul: 'zoom',
  ikon: 'kartu',
  sub: 'kotak',
  label: 'progres',
  Latar: Latar3dCustom,
  avg_pacing_sec: 8.0,
  palette_hex: ["#14427A", "#0B0B0B", "#FACC15", "#38BDF8", "#F97316"],
  physics: {
    spring_stiffness: 180,
    spring_damping: 18,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_preset_3d_custom;
