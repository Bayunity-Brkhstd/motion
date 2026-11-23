// Preset Komposisi Remotion Prosedural: Kartun Jadul 1930s Rubberhose (kartun-jadul)
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import {StylePreset} from './types';

export const LatarKartunJadul: React.FC<{f: number; i: number; n: number; aksen: string; judul: string}> = ({f, aksen}) => {
  // Gerak patah-patah 15 FPS khas kartun 1930-an (2 frame Remotion per frame animasi)
  const f15 = Math.floor(f / 2) * 2;
  
  // Film gate weave / getaran proyektor vintage
  const jitterX = f15 % 4 === 0 ? ((f15 * 17) % 7) - 3 : ((f15 * 11) % 5) - 2;
  const jitterY = f15 % 6 === 0 ? ((f15 * 23) % 7) - 3 : 0;
  
  // Kedipan proyektor film (flicker)
  const flicker = 0.94 + Math.sin(f * 2.3) * 0.05 + ((f15 % 8 === 0) ? 0.03 : -0.02);
  
  // Posisi goresan vertikal (film scratches) bergerak acak
  const scratchX1 = ((f15 * 97) % 980) + 50;
  const scratchX2 = ((f15 * 163) % 940) + 70;
  const scratchAda1 = f15 % 3 !== 0;
  const scratchAda2 = f15 % 5 === 0;

  // Pantulan karet (rubberhose squash & stretch bounce)
  const bounce = Math.sin(f15 * 0.35);
  const rotasiMatahari = (f15 * 0.4) % 360;

  return (
    <AbsoluteFill
      style={{
        background: '#161412',
        overflow: 'hidden',
        opacity: flicker,
        transform: `translate(${jitterX}px, ${jitterY}px)`,
      }}
    >
      {/* 1. Tekstur Kertas Sepia / Parchment Tua */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 50% 45%, #EDE5CE 0%, #D4C9AD 45%, #2B261F 85%, #141210 100%)',
          opacity: 0.95,
        }}
      />

      {/* 2. Sinar Sunburst Berputar & Matahari Senyum Rubberhose 1930s */}
      <svg
        width="1080"
        height="1920"
        style={{position: 'absolute', inset: 0, opacity: 0.45}}
      >
        <g transform={`translate(540, 520) rotate(${rotasiMatahari})`}>
          {Array.from({length: 16}).map((_, idx) => {
            const sudut = (idx * 360) / 16;
            return (
              <polygon
                key={idx}
                points="0,0 -40,-680 40,-680"
                fill="#24201A"
                opacity={idx % 2 === 0 ? 0.35 : 0.15}
                transform={`rotate(${sudut})`}
              />
            );
          })}
        </g>
      </svg>

      {/* 3. Karakter Maskot Rubberhose Animasi Bouncing (Squash & Stretch 15 FPS) */}
      <div
        style={{
          position: 'absolute',
          top: 360,
          left: '50%',
          transform: `translateX(-50%) translateY(${bounce * 14}px) scale(${1 + bounce * 0.04}, ${1 - bounce * 0.04})`,
          width: 320,
          height: 320,
        }}
      >
        <svg viewBox="0 0 320 320" width="320" height="320">
          {/* Awan retro pijakan kaki */}
          <ellipse cx="160" cy="300" rx="90" ry="16" fill="#1A1815" opacity="0.4" />
          
          {/* Tangan Kiri Rubberhose (Lengan elastis melengkung + Sarung tangan putih) */}
          <path
            d={`M 110 170 Q ${70 + bounce * 8} ${140 - bounce * 12} ${50} ${130 + bounce * 15}`}
            fill="none"
            stroke="#161412"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Sarung tangan putih bulat 3 garis */}
          <g transform={`translate(46, ${126 + bounce * 15}) rotate(${-15 + bounce * 10})`}>
            <circle cx="0" cy="0" r="22" fill="#EDE5CE" stroke="#161412" strokeWidth="6" />
            <circle cx="-12" cy="-4" r="9" fill="#EDE5CE" stroke="#161412" strokeWidth="5" />
            {/* 3 garis jahitan vintage */}
            <line x1="-6" y1="-8" x2="-6" y2="6" stroke="#161412" strokeWidth="3" />
            <line x1="1" y1="-9" x2="1" y2="7" stroke="#161412" strokeWidth="3" />
            <line x1="8" y1="-8" x2="8" y2="6" stroke="#161412" strokeWidth="3" />
          </g>

          {/* Tangan Kanan Rubberhose (Melambai) */}
          <path
            d={`M 210 170 Q ${250 - bounce * 8} ${130 + bounce * 12} ${270} ${120 - bounce * 15}`}
            fill="none"
            stroke="#161412"
            strokeWidth="14"
            strokeLinecap="round"
          />
          {/* Sarung tangan kanan */}
          <g transform={`translate(274, ${116 - bounce * 15}) rotate(${20 - bounce * 15})`}>
            <circle cx="0" cy="0" r="22" fill="#EDE5CE" stroke="#161412" strokeWidth="6" />
            <circle cx="12" cy="-4" r="9" fill="#EDE5CE" stroke="#161412" strokeWidth="5" />
            <line x1="-8" y1="-8" x2="-8" y2="6" stroke="#161412" strokeWidth="3" />
            <line x1="-1" y1="-9" x2="-1" y2="7" stroke="#161412" strokeWidth="3" />
            <line x1="6" y1="-8" x2="6" y2="6" stroke="#161412" strokeWidth="3" />
          </g>

          {/* Kaki Kiri & Kanan Elastis */}
          <path d="M 135 240 Q 120 270 120 290" fill="none" stroke="#161412" strokeWidth="13" strokeLinecap="round" />
          <path d="M 185 240 Q 200 270 200 290" fill="none" stroke="#161412" strokeWidth="13" strokeLinecap="round" />
          {/* Sepatu bulat vintage */}
          <ellipse cx="110" cy="296" rx="24" ry="14" fill="#EDE5CE" stroke="#161412" strokeWidth="6" />
          <ellipse cx="210" cy="296" rx="24" ry="14" fill="#EDE5CE" stroke="#161412" strokeWidth="6" />

          {/* Badan Bulat Hitam Pekat */}
          <ellipse cx="160" cy="205" rx="56" ry="52" fill="#161412" />

          {/* Kepala Maskot Bulat */}
          <circle cx="160" cy="115" r="66" fill="#161412" />
          
          {/* Telinga / Topi Retro */}
          <ellipse cx="106" cy="62" rx="20" ry="24" fill="#161412" transform="rotate(-20 106 62)" />
          <ellipse cx="214" cy="62" rx="20" ry="24" fill="#161412" transform="rotate(20 214 62)" />

          {/* Wajah Krem Bentuk Hati / Ginjal Klasik 1930s */}
          <path
            d="M 160 85 C 135 70, 115 88, 115 116 C 115 142, 138 160, 160 162 C 182 160, 205 142, 205 116 C 205 88, 185 70, 160 85 Z"
            fill="#EDE5CE"
            stroke="#161412"
            strokeWidth="4"
          />

          {/* Mata Pie-Cut (Potongan Kue Segitiga Khas 1930-an Rubberhose) */}
          {/* Mata Kiri */}
          <g transform="translate(142, 112)">
            <ellipse cx="0" cy="0" rx="10" ry="15" fill="#161412" />
            {/* Notch Segitiga Pie-Cut */}
            <polygon points="0,0 -8,-7 -11,4" fill="#EDE5CE" />
          </g>
          {/* Mata Kanan */}
          <g transform="translate(178, 112)">
            <ellipse cx="0" cy="0" rx="10" ry="15" fill="#161412" />
            <polygon points="0,0 8,-7 11,4" fill="#EDE5CE" />
          </g>

          {/* Hidung Bulat Hitam */}
          <ellipse cx="160" cy="128" rx="8" ry="6" fill="#161412" />

          {/* Senyum Lebar Retro dengan Sudut Pipi */}
          <path
            d="M 132 135 Q 160 166 188 135"
            fill="none"
            stroke="#161412"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Lekukan Pipi */}
          <path d="M 128 132 Q 132 137 136 134" fill="none" stroke="#161412" strokeWidth="4" strokeLinecap="round" />
          <path d="M 192 132 Q 188 137 184 134" fill="none" stroke="#161412" strokeWidth="4" strokeLinecap="round" />
          {/* Lidah */}
          <path d="M 152 153 Q 160 146 168 153" fill="none" stroke="#161412" strokeWidth="3" />
        </svg>
      </div>

      {/* 4. Bingkai Ornamen Silent Movie 1930s (Art Deco Double Border & Corner Flourishes) */}
      <svg
        width="1080"
        height="1920"
        style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
      >
        {/* Garis Border Luar Tebal */}
        <rect
          x="36"
          y="36"
          width="1008"
          height="1848"
          rx="12"
          fill="none"
          stroke="#161412"
          strokeWidth="10"
        />
        {/* Garis Border Tengah Halus */}
        <rect
          x="50"
          y="50"
          width="980"
          height="1820"
          rx="8"
          fill="none"
          stroke="#EDE5CE"
          strokeWidth="4"
        />
        {/* Garis Border Dalam Putus-Putus / Scalloped */}
        <rect
          x="62"
          y="62"
          width="956"
          height="1796"
          rx="4"
          fill="none"
          stroke="#161412"
          strokeWidth="3"
          strokeDasharray="14 8"
        />

        {/* Ornamen Sudut Art-Deco Kiri Atas */}
        <g transform="translate(62, 62)">
          <path d="M 0 0 L 70 0 L 70 12 L 12 12 L 12 70 L 0 70 Z" fill="#161412" />
          <polygon points="26,26 40,16 54,26 40,36" fill="#161412" />
        </g>
        {/* Sudut Kanan Atas */}
        <g transform="translate(1018, 62) scale(-1, 1)">
          <path d="M 0 0 L 70 0 L 70 12 L 12 12 L 12 70 L 0 70 Z" fill="#161412" />
          <polygon points="26,26 40,16 54,26 40,36" fill="#161412" />
        </g>
        {/* Sudut Kiri Bawah */}
        <g transform="translate(62, 1858) scale(1, -1)">
          <path d="M 0 0 L 70 0 L 70 12 L 12 12 L 12 70 L 0 70 Z" fill="#161412" />
          <polygon points="26,26 40,16 54,26 40,36" fill="#161412" />
        </g>
        {/* Sudut Kanan Bawah */}
        <g transform="translate(1018, 1858) scale(-1, -1)">
          <path d="M 0 0 L 70 0 L 70 12 L 12 12 L 12 70 L 0 70 Z" fill="#161412" />
          <polygon points="26,26 40,16 54,26 40,36" fill="#161412" />
        </g>

        {/* Badge Dekoratif Header Film Jadul */}
        <g transform="translate(540, 106)">
          <rect x="-140" y="-24" width="280" height="48" rx="6" fill="#161412" />
          <text
            x="0"
            y="9"
            fill="#EDE5CE"
            fontFamily="'Impact', 'Arial Black', sans-serif"
            fontSize="24"
            fontWeight="900"
            letterSpacing="6"
            textAnchor="middle"
          >
            ★ 1930s CARTOON ★
          </text>
        </g>
      </svg>

      {/* 5. Goresan Film Vertikal Berkelip (Film Scratches) */}
      {scratchAda1 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: scratchX1,
            width: 2,
            background: 'rgba(255, 255, 255, 0.45)',
            boxShadow: '0 0 2px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
          }}
        />
      )}
      {scratchAda2 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: scratchX2,
            width: 1.5,
            background: 'rgba(20, 18, 16, 0.65)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* 6. Heavy Vignette Lingkaran / Proyektor Tabung Gelap di Pinggiran */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, transparent 48%, rgba(20,18,16,0.65) 78%, rgba(10,8,6,0.96) 100%)',
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
};

export const preset_kartun_jadul: StylePreset = {
  nama: 'Kartun Jadul 1930s Rubberhose',
  slug: 'kartun-jadul',
  asal: 'claude-30-styles',
  teks: '#EDE5CE',
  redup: '#EDE5CEcc',
  aksen: '#EDE5CE',
  fontJudul: '"Archivo Black", "Impact", "Arial Black", "Playfair Display", serif',
  fontTeks: '"Plus Jakarta Sans", "Impact", sans-serif',
  fontLabel: '"Courier New", monospace',
  bobot: 900,
  kapital: true,
  judul: 'zoom',
  ikon: 'polos',
  sub: 'kotak',
  label: 'tidak',
  Latar: LatarKartunJadul,
  avg_pacing_sec: 2.8,
  palette_hex: ["#161412", "#EDE5CE", "#3B332A", "#807462", "#D4C9AD"],
  physics: {
    spring_stiffness: 220,
    spring_damping: 15,
    dominant_transition: 'zoom-punch',
    camera_shake_on_impact: true,
  },
};

export default preset_kartun_jadul;
