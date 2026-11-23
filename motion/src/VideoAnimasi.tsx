// VideoAnimasi.tsx: Native Remotion Kinetic Character Animation Engine
// Mendukung Multi-Karakter, Dialog Antar-Tokoh, Balon Ucapan, & Latar Pedesaan/Warung
import React, { useRef, useEffect } from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { STYLE_PRESETS, getPreset } from './presets';

export const FPS = 30;

export type KarakterPose = {
  nama?: string;
  aksi?: 'jalan' | 'lari' | 'bicara' | 'tunjuk' | 'diam' | 'kaget' | 'pikir' | 'duduk';
  ekspresi?: 'senyum' | 'serius' | 'kaget' | 'bicara' | 'tenang';
  posisiX?: number; // 0..width
  posisiY?: number; // 0..height
  hadap?: 1 | -1;
  benda?: 'tidak_ada' | 'kopi' | 'rokok' | 'amplop' | 'folder' | 'palu' | 'kertas' | 'ponsel';
  warnaBaju?: string;
  warnaCelana?: string;
  warnaRambut?: string;
};

export type AdeganAnimasi = {
  judul: string;
  teks: string;
  dialog?: string; // Teks percakapan karakter, misal "Ridwan: 'Bud, utang rokok pas takbiran bayar!'"
  speaker?: string; // Nama pembicara: 'Budi' | 'Ridwan' | string
  durasi?: number;
  durasi_detik?: number;
  suara?: string;
  rig?: 'toon-3d' | 'stickman' | 'isometric' | 'custom' | string;
  latar?: string; // 'warung-desa' | 'kursi-bambu' | 'jalan-desa' | 'pos-ronda' | 'blueprint' | 'senja' | 'kota' | 'kantor' | 'isometric-grid' | string
  karakter?: KarakterPose;
  karakter2?: KarakterPose; // Karakter kedua (misal: Ridwan) untuk adegan dialog berdua
  callout?: string;
  kunci?: string[];
  kataTimings?: { kata: string; start: number; end: number }[];
  speechStart?: number;
  speechEnd?: number;
};

export type PropsAnimasi = {
  judul: string;
  rigDefault?: 'toon-3d' | 'stickman' | 'isometric' | 'custom';
  audioNarasi?: string;
  adegan: AdeganAnimasi[];
  rasio?: 'vertikal' | 'landscape';
  aksen?: string;
  gaya?: string;
  palet?: string[];
};

const JEDA = 0.3; // detik jeda antar adegan
export const frameAdeganAnimasi = (a: AdeganAnimasi, tanpaJeda = false) => {
  const d = typeof a.durasi_detik === 'number' && a.durasi_detik > 0 ? a.durasi_detik : (a.durasi ?? 3.5);
  return Math.ceil((d + (tanpaJeda ? 0 : JEDA)) * FPS);
};

export const totalFrameAnimasi = (p: PropsAnimasi) => {
  if (!p || !p.adegan || p.adegan.length === 0) return 30 * FPS;
  return p.adegan.reduce((s, a) => s + frameAdeganAnimasi(a, !!p.audioNarasi), 0);
};

// ── Utilitas Matematika Animasi Deterministik ──────────────────────────────
const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// ── Background Layers: Warung Desa, Kursi Bambu, Jalan Desa, dll. ──────────

// 1. Latar Warung Makan Pinggir Desa (Siforejo Vibes)
const LatarWarungDesa: React.FC<{ width: number; height: number; frame: number }> = React.memo(({ width, height, frame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Langit Senja Desa
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    sky.addColorStop(0, '#78350F');
    sky.addColorStop(0.35, '#D97706');
    sky.addColorStop(0.7, '#FBBF24');
    sky.addColorStop(1, '#FEF3C7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Siluet Bukit Hijau/Cokelat di Kejauhan
    ctx.fillStyle = '#451A03';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.42);
    ctx.quadraticCurveTo(width * 0.3, height * 0.35, width * 0.6, height * 0.40);
    ctx.quadraticCurveTo(width * 0.85, height * 0.45, width, height * 0.38);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fill();

    // Siluet Pohon Kelapa Pedesaan
    const drawKelapa = (x: number, y: number, h: number) => {
      ctx.strokeStyle = '#291102';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 25, y - h * 0.5, x + 18, y - h);
      ctx.stroke();
      for (let a = -1.2; a <= 1.2; a += 0.4) {
        ctx.beginPath();
        ctx.moveTo(x + 18, y - h);
        ctx.quadraticCurveTo(x + 18 + a * 65, y - h - 25, x + 18 + a * 95, y - h + 30);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1C1917';
        ctx.stroke();
      }
    };
    drawKelapa(width * 0.88, height * 0.55, 260);

    // Lantai Semen / Ubin Warung
    ctx.fillStyle = '#592008';
    ctx.fillRect(0, height * 0.55, width, height * 0.45);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(0, height * 0.60, width, height * 0.40);

    // Dinding Papan Kayu Warung
    ctx.fillStyle = '#3E1805';
    ctx.fillRect(0, height * 0.18, width * 0.82, height * 0.42);
    ctx.strokeStyle = '#220C02';
    ctx.lineWidth = 3;
    for (let y = height * 0.20; y < height * 0.60; y += 38) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width * 0.82, y);
      ctx.stroke();
    }

    // Tiang Kayu Penyangga Warung
    ctx.fillStyle = '#78350F';
    ctx.fillRect(width * 0.74, height * 0.14, 42, height * 0.50);
    ctx.strokeStyle = '#220C02';
    ctx.strokeRect(width * 0.74, height * 0.14, 42, height * 0.50);

    // Atap Genteng Merah Bata Pedesaan
    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.12);
    ctx.lineTo(width * 0.92, height * 0.16);
    ctx.lineTo(width * 0.88, height * 0.22);
    ctx.lineTo(0, height * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Spanduk Kain Warung Makan ("WARUNG MAKAN SIFOREJO")
    const bannerX = width * 0.08;
    const bannerY = height * 0.27;
    const bannerW = width * 0.68;
    const bannerH = 114;
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 14);
    ctx.fill();
    ctx.stroke();

    const bannerCenterX = bannerX + bannerW / 2;
    ctx.fillStyle = '#991B1B';
    ctx.font = '900 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WARUNG MAKAN SIFOREJO', bannerCenterX, bannerY + 42);

    ctx.font = '700 16px sans-serif';
    ctx.fillStyle = '#1E293B';
    ctx.fillText('☕ KOPI TUBRUK • GORENGAN • ROKOK KETENGAN', bannerCenterX, bannerY + 82);
    ctx.textBaseline = 'alphabetic'; // reset baseline

    // Meja Kayu Warung di Bawah
    ctx.fillStyle = '#92400E';
    ctx.fillRect(0, height * 0.72, width * 0.60, 32);
    ctx.fillStyle = '#451A03';
    ctx.fillRect(0, height * 0.75, width * 0.60, height * 0.25);

    // Toples Kerupuk Khas Warung
    const drawToples = (x: number, y: number, col: string) => {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      ctx.fillRect(x, y - 60, 48, 60);
      ctx.strokeRect(x, y - 60, 48, 60);
      // Tutup toples
      ctx.fillStyle = col;
      ctx.fillRect(x - 4, y - 72, 56, 14);
      ctx.strokeRect(x - 4, y - 72, 56, 14);
      // Kerupuk bundar
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x + 24, y - 30, 15, 0, Math.PI * 2);
      ctx.fill();
    };
    drawToples(width * 0.06, height * 0.72, '#DC2626');
    drawToples(width * 0.17, height * 0.72, '#2563EB');

    // Cangkir Kopi Panas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(width * 0.32, height * 0.72 - 34, 34, 34);
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(width * 0.34, height * 0.72 - 32, 30, 22);
    ctx.strokeRect(width * 0.32, height * 0.72 - 34, 34, 34);

    // Asap Kopi Panas (Animated)
    const steam = (frame * 2) % 40;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.37, height * 0.72 - 38 - steam);
    ctx.quadraticCurveTo(width * 0.40, height * 0.72 - 48 - steam, width * 0.36, height * 0.72 - 58 - steam);
    ctx.stroke();

    // Lampu Bohlam Gantung Warung
    const lampX = width * 0.44;
    const lampY = height * 0.14;
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lampX, 0);
    ctx.lineTo(lampX, lampY);
    ctx.stroke();
    ctx.fillStyle = '#FDE047';
    ctx.beginPath();
    ctx.arc(lampX, lampY + 12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }, [width, height, frame]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// 2. Latar Kursi Bambu Nongkrong Depan Warung
const LatarKursiBambu: React.FC<{ width: number; height: number; frame: number }> = React.memo(({ width, height, frame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Langit Senja Hangat
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    sky.addColorStop(0, '#7C2D12');
    sky.addColorStop(0.4, '#EA580C');
    sky.addColorStop(0.8, '#FBBF24');
    sky.addColorStop(1, '#FEF3C7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Rindang Dedaunan Pedesaan
    ctx.fillStyle = '#14532D';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(i * (width / 5), height * 0.40, 110, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pagar Bambu Pedesaan
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.48);
    ctx.lineTo(width, height * 0.48);
    ctx.moveTo(0, height * 0.55);
    ctx.lineTo(width, height * 0.55);
    ctx.stroke();

    for (let x = 30; x < width; x += 55) {
      ctx.fillStyle = '#B45309';
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x, height * 0.42, 22, height * 0.22, 4);
      ctx.fill();
      ctx.stroke();
    }

    // Lantai Tanah / Teras Depan Warung
    ctx.fillStyle = '#451A03';
    ctx.fillRect(0, height * 0.64, width, height * 0.36);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(0, height * 0.67, width, height * 0.33);

    // Kursi Lincak Bambu Panjang (Tempat Nongkrong)
    const benchY = height * 0.72;
    const drawKakiBambu = (kx: number) => {
      ctx.fillStyle = '#D97706';
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 4;
      ctx.fillRect(kx, benchY + 15, 32, height * 0.18);
      ctx.strokeRect(kx, benchY + 15, 32, height * 0.18);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(kx, benchY + 55, 32, 6);
      ctx.fillRect(kx, benchY + 105, 32, 6);
    };
    drawKakiBambu(width * 0.10);
    drawKakiBambu(width * 0.46);
    drawKakiBambu(width * 0.82);

    // Dudukan Bambu Lincak
    ctx.fillStyle = '#F59E0B';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(width * 0.05, benchY, width * 0.90, 36, 10);
    ctx.fill();
    ctx.stroke();

    // Serat bilah bambu
    ctx.strokeStyle = '#B45309';
    ctx.lineWidth = 2.5;
    for (let x = width * 0.08; x < width * 0.92; x += 28) {
      ctx.beginPath();
      ctx.moveTo(x, benchY + 4);
      ctx.lineTo(x, benchY + 32);
      ctx.stroke();
    }

    // Meja Bambu Kecil di Tengah
    const tableX = width * 0.50;
    const tableY = height * 0.73;
    ctx.fillStyle = '#FBBF24';
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(tableX, tableY, 95, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cangkir Kopi di Meja
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(tableX - 32, tableY - 26, 24, 24);
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(tableX - 30, tableY - 24, 20, 16);
    ctx.strokeRect(tableX - 32, tableY - 26, 24, 24);

    // Asbak & Batang Rokok
    ctx.fillStyle = '#CBD5E1';
    ctx.strokeStyle = '#0F172A';
    ctx.beginPath();
    ctx.ellipse(tableX + 22, tableY - 8, 22, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(tableX + 18, tableY - 12, 18, 5);
    ctx.fillStyle = '#DC2626'; // Bara rokok
    ctx.fillRect(tableX + 36, tableY - 12, 4, 5);

    // Asap Rokok Mengepul
    const smokeY = (frame * 2.5) % 45;
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tableX + 38, tableY - 14 - smokeY);
    ctx.quadraticCurveTo(tableX + 42, tableY - 24 - smokeY, tableX + 37, tableY - 34 - smokeY);
    ctx.stroke();
  }, [width, height, frame]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// 3. Latar Jalanan Pedesaan (Sawah & Pepohonan)
const LatarJalanDesa: React.FC<{ width: number; height: number; frame: number }> = React.memo(({ width, height, frame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Langit Pagi/Sore
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    sky.addColorStop(0, '#0284C7');
    sky.addColorStop(0.5, '#38BDF8');
    sky.addColorStop(1, '#FEF08A');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Hamparan Sawah Hijau
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.50);
    ctx.lineTo(width, height * 0.46);
    ctx.lineTo(width, height * 0.68);
    ctx.lineTo(0, height * 0.68);
    ctx.closePath();
    ctx.fill();

    // Jalan Aspal Desa
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.68);
    ctx.lineTo(width, height * 0.68);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Garis Pinggir Jalan
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.68);
    ctx.lineTo(width, height * 0.68);
    ctx.stroke();

    // Tiang Listrik Pedesaan di Kiri
    ctx.fillStyle = '#475569';
    ctx.fillRect(width * 0.12, height * 0.15, 18, height * 0.55);
    // Palang tiang
    ctx.fillRect(width * 0.05, height * 0.18, 90, 8);
    // Kabel listrik melengkung
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.05, height * 0.18);
    ctx.quadraticCurveTo(width * 0.5, height * 0.28, width, height * 0.22);
    ctx.stroke();
  }, [width, height, frame]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// 4. Latar Pos Ronda / Gardu Siskamling Desa
const LatarPosRonda: React.FC<{ width: number; height: number; frame: number }> = React.memo(({ width, height, frame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Suasana Malam / Senja Pos Ronda
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    sky.addColorStop(0, '#0F172A');
    sky.addColorStop(0.6, '#1E293B');
    sky.addColorStop(1, '#334155');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Gardu Pos Kamling Bambu
    ctx.fillStyle = '#B45309';
    ctx.strokeStyle = '#451A03';
    ctx.lineWidth = 6;
    // 4 Tiang Bambu
    ctx.fillRect(width * 0.15, height * 0.35, 30, height * 0.40);
    ctx.fillRect(width * 0.75, height * 0.35, 30, height * 0.40);
    ctx.strokeRect(width * 0.15, height * 0.35, 30, height * 0.40);
    ctx.strokeRect(width * 0.75, height * 0.35, 30, height * 0.40);

    // Atap Ijuk / Seng
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.moveTo(width * 0.08, height * 0.35);
    ctx.lineTo(width * 0.48, height * 0.22);
    ctx.lineTo(width * 0.88, height * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Kentongan Kayu Pos Ronda
    ctx.fillStyle = '#D97706';
    ctx.fillRect(width * 0.32, height * 0.38, 22, 65);
    ctx.strokeRect(width * 0.32, height * 0.38, 22, 65);
    // Celah kentongan
    ctx.fillStyle = '#451A03';
    ctx.fillRect(width * 0.39, height * 0.45, 6, 35);
  }, [width, height, frame]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// Latar Blueprint Bawaan
const LatarBlueprint: React.FC<{ width: number; height: number }> = React.memo(({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0F2C59';
    ctx.fillRect(0, 0, width, height);
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.15, width / 2, height / 2, height * 0.7);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
    grad.addColorStop(1, 'rgba(10, 25, 47, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.5;
    const step = 48;
    ctx.beginPath();
    for (let x = 0; x <= width; x += step) {
      ctx.moveTo(x, 0); ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += step) {
      ctx.moveTo(0, y); ctx.lineTo(width, y);
    }
    ctx.stroke();
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// Latar Senja Cel-Shaded
const LatarSenja: React.FC<{ width: number; height: number; frame: number }> = ({ width, height, frame }) => {
  const t = frame / FPS;
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #2E1065 0%, #701A75 40%, #D97706 85%, #F59E0B 100%)',
        overflow: 'hidden',
      }}
    >
      {[
        { x: 200, y: 350, r: 80, spd: 20 },
        { x: 800, y: 220, r: 110, spd: 15 },
      ].map((c, i) => {
        const cx = ((c.x + t * c.spd) % (width + 300)) - 150;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx,
              top: c.y,
              width: c.r * 2,
              height: c.r,
              background: 'rgba(253, 230, 138, 0.35)',
              borderRadius: '999px',
              border: '2px solid rgba(254, 243, 199, 0.5)',
            }}
          />
        );
      })}
    </div>
  );
};

// Latar Kota / Street
const LatarKota: React.FC<{ width: number; height: number }> = React.memo(({ width, height }) => (
  <div
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(180deg, #0284C7 0%, #BAE6FD 65%, #F0FDF4 100%)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: height * 0.32,
        background: '#334155',
        borderTop: '6px solid #0F172A',
      }}
    />
  </div>
));

// ── Latar Rumah, Halaman & Jendela Kamar (Adaptive Silhouette & Ambient Architecture) ──
const LatarRumahDanHalaman: React.FC<{
  latarKey: string;
  width: number;
  height: number;
  frame: number;
  palet?: string[];
}> = React.memo(({ latarKey, width, height, frame, palet }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const l = (latarKey || '').toLowerCase();
  const cSkyTop = palet?.[0] || '#0B132B';
  const cSkyMid = palet?.[1] || '#1C2541';
  const cAksen = palet?.[2] || '#FACC15';
  const cTanah = '#0A0E1A';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Langit Malam / Misteri Atmosferik Pekat (Sesuai Referensi)
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#0A0F1D');
    sky.addColorStop(0.4, '#151D2A');
    sky.addColorStop(0.75, '#1A2332');
    sky.addColorStop(1, '#0D1117');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    // Bintang-bintang kecil di langit malam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    const starCoords = [
      [120, 80], [280, 140], [450, 95], [680, 120], [890, 75],
      [180, 260], [340, 210], [610, 240], [820, 190], [980, 250],
      [90, 390], [310, 350], [750, 320], [920, 380]
    ];
    for (const [sx, sy] of starCoords) {
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Rembulan Bulat Penuh Terang di Kanan Atas (Sesuai Referensi)
    const moonX = width * 0.78;
    const moonY = height * 0.135;
    const moonR = 64;

    const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.8);
    moonGlow.addColorStop(0, 'rgba(254, 240, 199, 0.28)');
    moonGlow.addColorStop(0.5, 'rgba(254, 240, 199, 0.08)');
    moonGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Badan Bulan dengan Kawah Halus
    ctx.fillStyle = '#E8E4CE';
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    ctx.fill();

    // Kawah Bulan
    ctx.fillStyle = 'rgba(190, 185, 160, 0.4)';
    ctx.beginPath();
    ctx.arc(moonX - 16, moonY - 14, 15, 0, Math.PI * 2);
    ctx.arc(moonX + 18, moonY + 20, 12, 0, Math.PI * 2);
    ctx.arc(moonX + 22, moonY - 10, 9, 0, Math.PI * 2);
    ctx.fill();

    // 2. Bangunan Rumah & Lantai Atas / Jendela
    const isJendela = l.includes('jendela') || l.includes('kamar');
    const isSamping = l.includes('samping') || l.includes('lorong') || l.includes('gang');

    if (isJendela) {
      // Tampilan Dekat (Close-up) Jendela Kamar Lantai Atas
      ctx.fillStyle = '#111827';
      // Dinding kamar / kusen
      ctx.fillRect(0, 0, width, height);

      // Frame Jendela Besar
      const winW = width * 0.72;
      const winH = height * 0.52;
      const winX = (width - winW) / 2;
      const winY = height * 0.18;

      ctx.fillStyle = '#030712';
      ctx.fillRect(winX, winY, winW, winH);

      // Kaca Jendela dengan pantulan / bayangan tirai
      const glassGrad = ctx.createLinearGradient(winX, winY, winX + winW, winY + winH);
      glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      glassGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.05)');
      glassGrad.addColorStop(1, 'rgba(15, 23, 42, 0.8)');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(winX, winY, winW, winH);

      // Kusen Jendela Kayu
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 14;
      ctx.strokeRect(winX, winY, winW, winH);
      // Palang salib kusen
      ctx.beginPath();
      ctx.moveTo(winX + winW / 2, winY);
      ctx.lineTo(winX + winW / 2, winY + winH);
      ctx.moveTo(winX, winY + winH / 2);
      ctx.lineTo(winX + winW, winY + winH / 2);
      ctx.stroke();

      // Tirai bergoyang halus
      const tiraiGoyang = Math.sin(frame / 15) * 12;
      ctx.fillStyle = 'rgba(243, 244, 246, 0.18)';
      ctx.beginPath();
      ctx.moveTo(winX, winY);
      ctx.quadraticCurveTo(winX + 60 + tiraiGoyang, winY + winH * 0.6, winX + 40, winY + winH);
      ctx.lineTo(winX, winY + winH);
      ctx.closePath();
      ctx.fill();

      // Ambang Jendela Bawah
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(winX - 25, winY + winH, winW + 50, 28);
    } else {
      // Halaman Rumah Kosong / Samping Bangunan Rumah
      // Tampak Depan Rumah No. 13 Kosong (Presisi 1:1 Sesuai Referensi)
      const rX = width * 0.18;
      const rW = width * 0.64;
      const rY = height * 0.36;
      const rH = height * 0.35;

      // 1. Dinding Kayu Papan Rumah Abu-Abu Muda (#CBD5E1)
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(rX, rY + 70, rW, rH - 70);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(rX, rY + 70, rW, rH - 70);

      // Garis-garis papan kayu horizontal tipis
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.lineWidth = 2;
      for (let ly = rY + 95; ly < rY + rH; ly += 22) {
        ctx.beginPath();
        ctx.moveTo(rX, ly);
        ctx.lineTo(rX + rW, ly);
        ctx.stroke();
      }

      // 2. Atap Segitiga Rumah Abu-abu Gelap (#475569)
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(rX - 35, rY + 70);
      ctx.lineTo(width / 2, rY - 35);
      ctx.lineTo(rX + rW + 35, rY + 70);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Ventilasi Bulat Hitam di Bawah Atap
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(width / 2, rY + 30, 24, 0, Math.PI * 2);
      ctx.fill();

      // Retakan halus di atap kiri
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 110, rY + 20);
      ctx.lineTo(width / 2 - 95, rY + 35);
      ctx.lineTo(width / 2 - 80, rY + 30);
      ctx.stroke();

      // 3. Jendela Kiri (Disalib Papan Kayu X Tebal Cokelat Muda)
      const winKW = rW * 0.34;
      const winKH = 115;
      const winKX = rX + 36;
      const winKY = rY + 95;
      ctx.fillStyle = '#111827';
      ctx.fillRect(winKX, winKY, winKW, winKH);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      ctx.strokeRect(winKX, winKY, winKW, winKH);

      // Dua papan kayu silang cokelat (#B45309) dengan paku bulat
      ctx.save();
      ctx.fillStyle = '#B45309';
      ctx.strokeStyle = '#451A03';
      ctx.lineWidth = 3;
      // Batang 1 (\)
      ctx.beginPath();
      ctx.moveTo(winKX - 15, winKY + 8);
      ctx.lineTo(winKX + winKW + 15, winKY + winKH - 12);
      ctx.lineTo(winKX + winKW + 10, winKY + winKH + 10);
      ctx.lineTo(winKX - 20, winKY + 30);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Batang 2 (/)
      ctx.beginPath();
      ctx.moveTo(winKX - 15, winKY + winKH - 15);
      ctx.lineTo(winKX + winKW + 15, winKY + 10);
      ctx.lineTo(winKX + winKW + 20, winKY + 32);
      ctx.lineTo(winKX - 10, winKY + winKH + 7);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.restore();

      // 4. Jendela Kanan (Tirai Cokelat/Kuning & Siluet Kepala Hitam)
      const winRW = winKW;
      const winRH = winKH;
      const winRX = rX + rW - winRW - 36;
      const winRY = winKY;
      // Latar belakang kamar gelap di balik tirai
      ctx.fillStyle = '#261C14';
      ctx.fillRect(winRX, winRY, winRW, winRH);

      // Tirai cokelat kemerahan di kiri dan kanan
      ctx.fillStyle = '#451A03';
      ctx.fillRect(winRX, winRY, 28, winRH);
      ctx.fillRect(winRX + winRW - 28, winRY, 28, winRH);

      // Bayangan Siluet Orang Berdiri di Balik Tirai Jendela Kanan
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(winRX + winRW / 2, winRY + 46, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(winRX + winRW / 2 - 32, winRY + winRH);
      ctx.quadraticCurveTo(winRX + winRW / 2, winRY + 65, winRX + winRW / 2 + 32, winRY + winRH);
      ctx.closePath();
      ctx.fill();

      // Kusen Luar Jendela Kanan
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(winRX, winRY, winRW, winRH);
      // Garis kusen tengah
      ctx.beginPath();
      ctx.moveTo(winRX + winRW / 2, winRY);
      ctx.lineTo(winRX + winRW / 2, winRY + winRH);
      ctx.stroke();

      // 5. Plat Nomor Rumah "13"
      const platW = 54;
      const platH = 32;
      const platX = width / 2 - platW / 2;
      const platY = rY + 225;
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(platX, platY, platW, platH);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(platX, platY, platW, platH);
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 20px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('13', width / 2, platY + platH / 2);

      // Pintu Kayu Cokelat (#78350F)
      const pintuW = 86;
      const pintuH = 135;
      const pintuX = width / 2 - pintuW / 2;
      const pintuY = platY + platH + 6;
      ctx.fillStyle = '#78350F';
      ctx.fillRect(pintuX, pintuY, pintuW, pintuH);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(pintuX, pintuY, pintuW, pintuH);

      // Gagang Pintu Bulat Emas
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.arc(pintuX + 16, pintuY + pintuH * 0.52, 5, 0, Math.PI * 2);
      ctx.fill();

      // 6. Pagar Kayu Berjejer Rapi Abu-abu Gelap (#334155)
      const pagarY = rY + rH - 25;
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 3;
      const stepPagar = 40;
      for (let px = 20; px < width - 20; px += stepPagar) {
        if (px > width / 2 - 45 && px < width / 2 + 45) continue; // Celah pintu pagar tengah
        ctx.beginPath();
        ctx.moveTo(px, pagarY + 115);
        ctx.lineTo(px, pagarY + 20);
        ctx.lineTo(px + 10, pagarY);
        ctx.lineTo(px + 20, pagarY + 20);
        ctx.lineTo(px + 20, pagarY + 115);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      // Pintu Pagar Tengah yang Terbuka Sedikit
      ctx.save();
      ctx.translate(width / 2 - 40, pagarY + 20);
      ctx.rotate(0.08);
      for (let g = 0; g < 2; g++) {
        const gx = g * 28;
        ctx.beginPath();
        ctx.moveTo(gx, 95); ctx.lineTo(gx, 20); ctx.lineTo(gx + 10, 0); ctx.lineTo(gx + 20, 20); ctx.lineTo(gx + 20, 95);
        ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.fillRect(-5, 30, 60, 12); ctx.strokeRect(-5, 30, 60, 12);
      ctx.fillRect(-5, 68, 60, 12); ctx.strokeRect(-5, 68, 68, 12);
      ctx.restore();

      // Palang horizontal pagar kiri dan kanan
      ctx.fillRect(10, pagarY + 35, width / 2 - 60, 12);
      ctx.strokeRect(10, pagarY + 35, width / 2 - 60, 12);
      ctx.fillRect(10, pagarY + 75, width / 2 - 60, 12);
      ctx.strokeRect(10, pagarY + 75, width / 2 - 60, 12);

      ctx.fillRect(width / 2 + 50, pagarY + 35, width / 2 - 60, 12);
      ctx.strokeRect(width / 2 + 50, pagarY + 35, width / 2 - 60, 12);
      ctx.fillRect(width / 2 + 50, pagarY + 75, width / 2 - 60, 12);
      ctx.strokeRect(width / 2 + 50, pagarY + 75, width / 2 - 60, 12);

      // Pohon Ranting Siluet Kering Hitam di Kiri & Kanan (Sesuai Referensi)
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      // Pohon kiri
      ctx.beginPath();
      ctx.moveTo(50, height * 0.72);
      ctx.lineTo(40, height * 0.38);
      ctx.lineTo(15, height * 0.3);
      ctx.moveTo(40, height * 0.48);
      ctx.lineTo(95, height * 0.42);
      ctx.moveTo(40, height * 0.58);
      ctx.lineTo(10, height * 0.54);
      ctx.stroke();
      // Pohon kanan
      ctx.beginPath();
      ctx.moveTo(width - 50, height * 0.72);
      ctx.lineTo(width - 40, height * 0.4);
      ctx.lineTo(width - 15, height * 0.32);
      ctx.moveTo(width - 40, height * 0.5);
      ctx.lineTo(width - 95, height * 0.44);
      ctx.moveTo(width - 40, height * 0.6);
      ctx.lineTo(width - 15, height * 0.56);
      ctx.stroke();

      // Tanah / Jalanan Gelap Pekat Berkabut
      const kabutGrad = ctx.createLinearGradient(0, height * 0.66, 0, height);
      kabutGrad.addColorStop(0, 'rgba(10, 15, 29, 0.75)');
      kabutGrad.addColorStop(0.35, '#0F172A');
      kabutGrad.addColorStop(1, '#020617');
      ctx.fillStyle = kabutGrad;
      ctx.fillRect(0, height * 0.68, width, height * 0.32);

      // Jalan Setapak Tengah Menuju Pintu Rumah
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 32, pintuY + pintuH);
      ctx.lineTo(width / 2 + 32, pintuY + pintuH);
      ctx.lineTo(width / 2 + 95, height);
      ctx.lineTo(width / 2 - 95, height);
      ctx.closePath();
      ctx.fill();
    }
  }, [width, height, frame, latarKey, cSkyTop, cSkyMid, cAksen]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// ── Latar Dinamis Universal Generatif (Menyesuaikan Palet Tema & Kata Kunci) ──
const LatarDinamisGeneratif: React.FC<{
  latarKey: string;
  width: number;
  height: number;
  frame: number;
  palet?: string[];
}> = React.memo(({ latarKey, width, height, frame, palet }) => {
  const bg1 = palet?.[0] || '#0F172A';
  const bg2 = palet?.[1] || '#1E293B';
  const aksen = palet?.[2] || '#38BDF8';

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: `linear-gradient(180deg, ${bg1} 0%, ${bg2} 60%, #020617 100%)`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '50%',
          width: width * 0.8,
          height: width * 0.8,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle, ${aksen}22 0%, transparent 70%)`,
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: height * 0.26,
          background: 'rgba(2, 6, 23, 0.85)',
          borderTop: `3px solid ${aksen}44`,
        }}
      />
    </div>
  );
});

// ── Latar Stickman Motion Explainer (Master Production Blueprint) ─────────
const LatarStickmanExplainer: React.FC<{
  latarKey: string;
  width: number;
  height: number;
  frame: number;
}> = React.memo(({ latarKey, width, height, frame }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = frame / FPS;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // 1. Base Off-White Paper Texture
    ctx.fillStyle = '#F8F9FA';
    ctx.fillRect(0, 0, width, height);

    // Subtle Paper Texture / Fine Grid lines
    ctx.strokeStyle = 'rgba(26, 26, 26, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 60) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    const l = latarKey.toLowerCase();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // ── SCENE 1 & 6: Gedung Parlemen Senayan (Kubah Hijau & Pilar) ───────────
    if (l.includes('senayan') || l.includes('parlemen') || l.includes('gerbang') || l.includes('outro')) {
      // Langit Senja / Pagi
      const isOutro = l.includes('outro');
      if (isOutro) {
        const sky = ctx.createLinearGradient(0, 0, 0, height * 0.7);
        sky.addColorStop(0, '#FEF3C7');
        sky.addColorStop(1, '#F8F9FA');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height * 0.7);
      }

      // Lantai Pelataran Senayan
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, height * 0.72, width, height * 0.28);
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      ctx.lineTo(width, height * 0.72);
      ctx.stroke();

      // Tangga Gedung Parlemen
      for (let s = 1; s <= 3; s++) {
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(width * 0.15, height * 0.72 - s * 14, width * 0.7, 14);
        ctx.strokeRect(width * 0.15, height * 0.72 - s * 14, width * 0.7, 14);
      }

      // Pilar-pilar Gedung DPR (6 Pilar Neoklasik)
      const pilarY = height * 0.42;
      const pilarH = height * 0.26;
      for (let i = 0; i < 6; i++) {
        const px = width * 0.22 + i * (width * 0.11);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(px, pilarY, width * 0.045, pilarH);
        ctx.strokeRect(px, pilarY, width * 0.045, pilarH);
      }

      // Balok Atap Penopang
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(width * 0.18, pilarY - 25, width * 0.64, 25);
      ctx.strokeRect(width * 0.18, pilarY - 25, width * 0.64, 25);

      // Kubah Hijau Ikonik Parlemen (Gaya Lengkung Senayan)
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.ellipse(width / 2, pilarY - 25, width * 0.28, height * 0.18, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();

      // Garis Tekstur Kubah
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 3;
      for (let a = -0.7; a <= 0.7; a += 0.35) {
        ctx.beginPath();
        ctx.arc(width / 2, pilarY - 25, width * 0.27, Math.PI * (1 + a * 0.3), Math.PI * (1 + (a + 0.2) * 0.3));
        ctx.stroke();
      }
      ctx.strokeStyle = '#1A1A1A';
      ctx.lineWidth = 5;

      // Tiang Bendera Merah Putih
      ctx.beginPath();
      ctx.moveTo(width / 2, pilarY - 25 - height * 0.18);
      ctx.lineTo(width / 2, pilarY - 25 - height * 0.26);
      ctx.stroke();

      ctx.fillStyle = '#DC2626';
      ctx.fillRect(width / 2, pilarY - 25 - height * 0.26, 45, 15);
      ctx.strokeRect(width / 2, pilarY - 25 - height * 0.26, 45, 15);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width / 2, pilarY - 25 - height * 0.26 + 15, 45, 15);
      ctx.strokeRect(width / 2, pilarY - 25 - height * 0.26 + 15, 45, 15);

      // Banner Breaking News jika scene breaking-news
      if (l.includes('breaking')) {
        ctx.fillStyle = '#B91C1C';
        ctx.fillRect(width * 0.08, 90, width * 0.84, 85);
        ctx.strokeRect(width * 0.08, 90, width * 0.84, 85);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 42px Montserrat, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔴 BREAKING NEWS: KAMIS, 12 NOVEMBER 2026', width / 2, 132);
      }

      // Siluet Rakyat di Outro
      if (isOutro) {
        ctx.fillStyle = 'rgba(26, 26, 26, 0.85)';
        for (let i = 0; i < 18; i++) {
          const rx = 100 + i * 105 + Math.sin(i) * 20;
          const ry = height * 0.74;
          // Kepala
          ctx.beginPath(); ctx.arc(rx, ry - 35, 16, 0, Math.PI * 2); ctx.fill();
          // Badan
          ctx.beginPath(); ctx.roundRect(rx - 14, ry - 18, 28, 45, 6); ctx.fill();
        }

        // Teks Penutup Babak Baru Konstitusi
        ctx.fillStyle = '#0F172A';
        ctx.font = '900 48px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MENANTI BABAK BARU KONSTITUSI INDONESIA', width / 2, height * 0.22);
      }
    }

    // ── SCENE 2: Meja Rapat Bundar & Dokumen Surat Pengunduran Diri ──────────
    else if (l.includes('meja') || l.includes('dokumen') || l.includes('surat')) {
      // Dinding Ruang Rapat Minimalis
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 0, width, height * 0.65);
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, height * 0.65, width, height * 0.35);
      ctx.beginPath(); ctx.moveTo(0, height * 0.65); ctx.lineTo(width, height * 0.65); ctx.stroke();

      // Meja Bundar Kayu Perspektif
      ctx.fillStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.ellipse(width / 2, height * 0.78, width * 0.38, height * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Jam Analog Kartun 20 Menit (di dinding atas)
      const clockX = width / 2;
      const clockY = 190;
      const clockR = 65;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.arc(clockX, clockY, clockR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      
      // Jarum Jam Berputar Cepat
      const needleAngle = (t * 4) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(clockX, clockY);
      ctx.lineTo(clockX + Math.sin(needleAngle) * 45, clockY - Math.cos(needleAngle) * 45);
      ctx.lineWidth = 6; ctx.strokeStyle = '#DC2626'; ctx.stroke();
      ctx.lineWidth = 5; ctx.strokeStyle = '#1A1A1A';

      // Badge "20 MENIT"
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(clockX - 70, clockY + 80, 140, 36);
      ctx.strokeRect(clockX - 70, clockY + 80, 140, 36);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 20px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⏱️ 20 MENIT', clockX, clockY + 98);

      // Dokumen Surat Pengunduran Diri (Jika scene dokumen)
      if (l.includes('dokumen') || l.includes('surat')) {
        const docX = width / 2;
        const docY = height * 0.48;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(docX - 180, docY - 140, 360, 260);
        ctx.strokeRect(docX - 180, docY - 140, 360, 260);

        ctx.fillStyle = '#B91C1C';
        ctx.font = '900 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SURAT PENGUNDURAN DIRI', docX, docY - 100);

        ctx.fillStyle = '#1A1A1A';
        ctx.font = '700 18px system-ui, sans-serif';
        ctx.fillText('DARI JABATAN WAKIL PRESIDEN RI', docX, docY - 65);

        // Cap Merah: ATAS PERMINTAAN SENDIRI
        ctx.strokeStyle = '#DC2626';
        ctx.strokeRect(docX - 140, docY - 40, 280, 42);
        ctx.fillStyle = '#DC2626';
        ctx.font = '800 18px system-ui, sans-serif';
        ctx.fillText('★ ATAS PERMINTAAN SENDIRI ★', docX, docY - 19);

        // Kaca Pembesar Kartun dengan Tanda Tanya (?)
        ctx.strokeStyle = '#1A1A1A';
        const magX = docX + 80;
        const magY = docY + 45;
        ctx.fillStyle = 'rgba(217, 119, 6, 0.2)';
        ctx.beginPath(); ctx.arc(magX, magY, 35, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(magX + 25, magY + 25); ctx.lineTo(magX + 55, magY + 55); ctx.lineWidth = 8; ctx.stroke();
        ctx.lineWidth = 5;

        // Tanda Tanya Berdenyut
        const scaleQ = 1 + Math.sin(t * 8) * 0.15;
        ctx.fillStyle = '#D97706';
        ctx.font = `900 ${Math.round(36 * scaleQ)}px system-ui, sans-serif`;
        ctx.fillText('?', magX, magY + 12);
      }
    }

    // ── SCENE 3: Bola Salju Pemakzulan vs Stempel Gugur Otomatis ─────────────
    else if (l.includes('salju') || l.includes('stempel') || l.includes('pemakzulan')) {
      const isStempel = l.includes('stempel');
      // Split Screen Diagonal
      ctx.fillStyle = isStempel ? '#FEF2F2' : '#EFF6FF';
      ctx.fillRect(0, 0, width, height);

      // Lantai
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, height * 0.75, width, height * 0.25);
      ctx.beginPath(); ctx.moveTo(0, height * 0.75); ctx.lineTo(width, height * 0.75); ctx.stroke();

      if (!isStempel) {
        // Bola Salju Raksasa (Hak Menyatakan Pendapat)
        const ballX = width * 0.58;
        const ballY = height * 0.52;
        ctx.fillStyle = '#E0F2FE';
        ctx.beginPath(); ctx.arc(ballX, ballY, 190, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#1E3A8A';
        ctx.font = '900 28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HAK MENYATAKAN PENDAPAT', ballX, ballY - 20);
        ctx.fillStyle = '#DC2626';
        ctx.fillText('(USULAN PEMAKZULAN)', ballX, ballY + 20);

        // Kertas-kertas Polemik Ijazah Berterbangan
        for (let p = 0; p < 4; p++) {
          const px = width * 0.25 + p * 120 + Math.sin(t * 4 + p) * 20;
          const py = 220 + (p % 2) * 80 + Math.cos(t * 3 + p) * 15;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(px, py, 90, 60);
          ctx.strokeRect(px, py, 90, 60);
          ctx.fillStyle = '#B91C1C';
          ctx.font = '700 12px system-ui, sans-serif';
          ctx.fillText('POLEMIK IJAZAH', px + 45, py + 34);
        }
      } else {
        // Stempel Raksasa "OBJEK HUKUM GUGUR OTOMATIS"
        const stampW = width * 0.65;
        const stampH = 160;
        const stampX = (width - stampW) / 2;
        const stampY = height * 0.32;

        ctx.fillStyle = '#DC2626';
        ctx.fillRect(stampX, stampY, stampW, stampH);
        ctx.strokeRect(stampX, stampY, stampW, stampH);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 48px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('OBJEK HUKUM GUGUR OTOMATIS', width / 2, stampY + 55);

        ctx.font = '700 26px system-ui, sans-serif';
        ctx.fillText('JABATAN DILEPAS SECARA SUKARELA', width / 2, stampY + 115);

        // Efek Kepulan Asap (Puff of Smoke)
        ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
        for (let k = 0; k < 6; k++) {
          const sx = width * 0.3 + k * 80 + Math.sin(t * 6 + k) * 10;
          const sy = height * 0.68 + (k % 2) * 20;
          ctx.beginPath(); ctx.arc(sx, sy, 35 + (k % 3) * 10, 0, Math.PI * 2); ctx.fill();
        }
      }
    }

    // ── SCENE 4: Podium Kenegaraan & Jam Pasir 60 Hari ───────────────────────
    else if (l.includes('podium') || l.includes('jam-pasir') || l.includes('kosong')) {
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(0, 0, width, height);

      // Lantai Istana Kenegaraan
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, height * 0.72, width, height * 0.28);
      ctx.beginPath(); ctx.moveTo(0, height * 0.72); ctx.lineTo(width, height * 0.72); ctx.stroke();

      // Dua Kursi Kenegaraan di Belakang
      // Kursi 1: PRESIDEN (Kiri)
      const chair1X = width * 0.3;
      const chairY = height * 0.44;
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(chair1X - 80, chairY, 160, 220);
      ctx.strokeRect(chair1X - 80, chairY, 160, 220);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PRESIDEN', chair1X, chairY + 50);

      // Kursi 2: WAKIL PRESIDEN (Kanan - KOSONG RESMI)
      const chair2X = width * 0.7;
      ctx.setLineDash([12, 8]);
      ctx.fillStyle = 'rgba(241, 245, 249, 0.8)';
      ctx.fillRect(chair2X - 80, chairY, 160, 220);
      ctx.strokeRect(chair2X - 80, chairY, 160, 220);
      ctx.setLineDash([]);

      ctx.fillStyle = '#B91C1C';
      ctx.font = '900 20px system-ui, sans-serif';
      ctx.fillText('WAKIL PRESIDEN', chair2X, chairY + 45);

      // Label Status Kosong Resmi Berkedip
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(chair2X - 110, chairY + 95, 220, 48);
      ctx.strokeRect(chair2X - 110, chairY + 95, 220, 48);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 22px system-ui, sans-serif';
      ctx.fillText('STATUS: KOSONG RESMI', chair2X, chairY + 126);

      // Jam Pasir Raksasa Mengalirkan Pasir Emas (Jika scene jam-pasir)
      if (l.includes('jam') || l.includes('pasir') || l.includes('60')) {
        const hgX = width * 0.88;
        const hgY = height * 0.35;
        // Kaca Atas
        ctx.fillStyle = '#FEF3C7';
        ctx.beginPath(); ctx.moveTo(hgX - 45, hgY - 60); ctx.lineTo(hgX + 45, hgY - 60); ctx.lineTo(hgX, hgY); ctx.closePath(); ctx.fill(); ctx.stroke();
        // Kaca Bawah
        ctx.beginPath(); ctx.moveTo(hgX, hgY); ctx.lineTo(hgX - 45, hgY + 60); ctx.lineTo(hgX + 45, hgY + 60); ctx.closePath(); ctx.fill(); ctx.stroke();

        // Aliran Pasir Emas
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(hgX, hgY); ctx.lineTo(hgX, hgY + 50); ctx.stroke();
        ctx.strokeStyle = '#1A1A1A'; ctx.lineWidth = 5;

        // Label Batas Maksimal 60 Hari
        ctx.fillStyle = '#D97706';
        ctx.fillRect(hgX - 120, hgY + 75, 240, 42);
        ctx.strokeRect(hgX - 120, hgY + 75, 240, 42);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 20px system-ui, sans-serif';
        ctx.fillText('BATAS: 60 HARI', hgX, hgY + 102);
      }
    }

    // ── SCENE 5: Whiteboard Rapat Gabungan MPR & DPD (4 Langkah Konstitusi) ──
    else if (l.includes('whiteboard') || l.includes('tahap') || l.includes('rapat')) {
      // Papan Tulis Putih Besar
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(width * 0.05, 80, width * 0.9, height * 0.72);
      ctx.strokeRect(width * 0.05, 80, width * 0.9, height * 0.72);

      // Header Rapat Gabungan
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(width * 0.05, 80, width * 0.9, 85);
      ctx.strokeRect(width * 0.05, 80, width * 0.9, 85);
      ctx.fillStyle = '#FACC15';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('RAPAT GABUNGAN MPR & DPD: JUMAT, 13 NOVEMBER 2026', width / 2, 122);

      // 4 Kotak Tahapan Berjajar
      const tahapan = [
        { no: '1', title: 'SIDANG PARIPURNA', icon: '🔨', desc: 'Bahas kekosongan kursi' },
        { no: '2', title: 'SURAT KE PRESIDEN', icon: '✉️', desc: 'Usul 2 nama calon Wapres' },
        { no: '3', title: 'TIM VERIFIKASI', icon: '🔍', desc: 'Periksa syarat & dokumen' },
        { no: '4', title: 'TIM AD HOC', icon: '📝', desc: 'Susun Draf Tap MPR' },
      ];

      const cardW = (width * 0.84) / 4;
      for (let i = 0; i < 4; i++) {
        const cx = width * 0.08 + i * cardW;
        const cy = 200;
        const ch = height * 0.52;
        const isCurrent = (
          (l.includes('paripurna') && i === 0) ||
          (l.includes('surat') && i === 1) ||
          (l.includes('verifikasi') && i === 2) ||
          (l.includes('adhoc') && i === 3) ||
          l.includes('whiteboard')
        );

        ctx.fillStyle = isCurrent ? '#FEF3C7' : '#F8FAFC';
        ctx.fillRect(cx + 10, cy, cardW - 20, ch);
        ctx.strokeRect(cx + 10, cy, cardW - 20, ch);

        // Nomor Badge
        ctx.fillStyle = isCurrent ? '#B91C1C' : '#334155';
        ctx.beginPath(); ctx.arc(cx + cardW / 2, cy + 50, 28, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 24px system-ui, sans-serif';
        ctx.fillText(tahapan[i].no, cx + cardW / 2, cy + 58);

        // Icon
        ctx.font = '48px system-ui, sans-serif';
        ctx.fillText(tahapan[i].icon, cx + cardW / 2, cy + 130);

        // Judul Tahapan
        ctx.fillStyle = '#0F172A';
        ctx.font = '900 20px system-ui, sans-serif';
        ctx.fillText(tahapan[i].title, cx + cardW / 2, cy + 200);

        // Deskripsi
        ctx.fillStyle = '#475569';
        ctx.font = '600 16px system-ui, sans-serif';
        ctx.fillText(tahapan[i].desc, cx + cardW / 2, cy + 245);
      }
    }
  }, [latarKey, width, height, t]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// ── Latar Digital Lab & Microchip / Hardware Tech ───────────────────────────
const LatarTechLabChip: React.FC<{
  latarKey: string;
  width: number;
  height: number;
  frame: number;
  palet?: string[];
}> = React.memo(({ latarKey, width, height, frame, palet }) => {
  const isChip = latarKey.includes('chip') || latarKey.includes('mikro');
  const aksen = palet?.[2] || (isChip ? '#00F5D4' : '#38BDF8');
  const aksenSec = isChip ? '#A855F7' : '#00F5D4';
  const pulse = Math.sin(frame * 0.1) * 0.2 + 0.8;

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, #030712 0%, #0B132B 50%, #030712 100%)',
        overflow: 'hidden',
      }}
    >
      {/* 1. Perspective Tech Grid (Lantai Digital) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: height * 0.45,
          perspective: 350,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '-50% -50% 0 -50%',
            transform: 'rotateX(65deg)',
            backgroundImage: `
              linear-gradient(to right, ${aksen}25 1px, transparent 1px),
              linear-gradient(to bottom, ${aksen}25 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'linear-gradient(to bottom, transparent, black 40%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%)',
          }}
        />
        {/* Glow floor horizon */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${aksen}, transparent)`,
            boxShadow: `0 0 24px ${aksen}`,
          }}
        />
      </div>

      {/* 2. Visual Inti: Microchip Processor / Core Matrix atau Hologram Lab */}
      <svg
        width={width}
        height={height}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <defs>
          <radialGradient id="chipGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={aksen} stopOpacity="0.35" />
            <stop offset="100%" stopColor={aksen} stopOpacity="0" />
          </radialGradient>
          <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Central Glow Aura */}
        <circle cx={width / 2} cy={height * 0.42} r={280} fill="url(#chipGlow)" />

        {isChip ? (
          /* ── Modus Ruang Mikro Chip: Silicon Die & Matrix Array ── */
          <g transform={`translate(${width / 2}, ${height * 0.42})`}>
            {/* PCB Trace Bus Lines radiating out */}
            {[-180, -120, -60, 0, 60, 120, 180].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x1 = Math.cos(rad) * 140;
              const y1 = Math.sin(rad) * 140;
              const x2 = Math.cos(rad) * 360;
              const y2 = Math.sin(rad) * 360;
              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={aksen} strokeWidth="2" strokeOpacity="0.4" strokeDasharray="6,4" />
                  <circle cx={x2} cy={y2} r="4" fill={aksenSec} opacity="0.8" />
                </g>
              );
            })}

            {/* Processor Die Base (Outer Shell) */}
            <rect x="-140" y="-140" width="280" height="280" rx="16" fill="#0B132B" stroke={aksen} strokeWidth="3" filter="url(#neonBlur)" />
            {/* Gold Edge Connector Pins */}
            {Array.from({ length: 8 }).map((_, idx) => (
              <g key={idx}>
                {/* Top pins */}
                <rect x={-110 + idx * 30} y="-155" width="14" height="12" rx="2" fill="#FACC15" opacity="0.8" />
                {/* Bottom pins */}
                <rect x={-110 + idx * 30} y="143" width="14" height="12" rx="2" fill="#FACC15" opacity="0.8" />
                {/* Left pins */}
                <rect x="-155" y={-110 + idx * 30} width="12" height="14" rx="2" fill="#FACC15" opacity="0.8" />
                {/* Right pins */}
                <rect x="143" y={-110 + idx * 30} width="12" height="14" rx="2" fill="#FACC15" opacity="0.8" />
              </g>
            ))}

            {/* Inner Silicon Wafer Core */}
            <rect x="-105" y="-105" width="210" height="210" rx="10" fill="#030712" stroke={aksenSec} strokeWidth="2" strokeDasharray="8,4" />

            {/* 4x4 Parallel Core Matrix Blocks (CUDA / Tensor Grid) */}
            {Array.from({ length: 4 }).map((_, row) =>
              Array.from({ length: 4 }).map((__, col) => {
                const coreActive = (row + col + Math.floor(frame / 6)) % 3 === 0;
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={-85 + col * 45}
                    y={-85 + row * 45}
                    width="35"
                    height="35"
                    rx="4"
                    fill={coreActive ? aksen : '#1E293B'}
                    opacity={coreActive ? pulse : 0.4}
                  />
                );
              })
            )}

            {/* Core Chip Label */}
            <text x="0" y="125" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" letterSpacing="2" fontFamily="monospace">
              TENSOR / CUDA DIE ARCHITECTURE
            </text>
          </g>
        ) : (
          /* ── Modus Laboratorium Digital: Server Racks & Holographic Tech Hub ── */
          <g>
            {/* Left & Right Server Racks */}
            <rect x="40" y={height * 0.2} width="110" height={height * 0.55} rx="8" fill="#0B132B" stroke="#1E293B" strokeWidth="2" />
            <rect x={width - 150} y={height * 0.2} width="110" height={height * 0.55} rx="8" fill="#0B132B" stroke="#1E293B" strokeWidth="2" />

            {/* Server Rack Status Blinkers */}
            {Array.from({ length: 12 }).map((_, idx) => (
              <g key={idx}>
                <line x1="55" y1={height * 0.23 + idx * 36} x2="135" y2={height * 0.23 + idx * 36} stroke="#1E293B" strokeWidth="2" />
                <circle cx="65" cy={height * 0.23 + idx * 36} r="3" fill={(idx + frame) % 4 === 0 ? '#10B981' : '#38BDF8'} />
                <circle cx="78" cy={height * 0.23 + idx * 36} r="3" fill={(idx + frame) % 5 === 0 ? '#F59E0B' : '#64748B'} />

                <line x1={width - 135} y1={height * 0.23 + idx * 36} x2={width - 55} y2={height * 0.23 + idx * 36} stroke="#1E293B" strokeWidth="2" />
                <circle cx={width - 70} cy={height * 0.23 + idx * 36} r="3" fill={(idx + frame) % 3 === 0 ? '#10B981' : '#38BDF8'} />
              </g>
            ))}

            {/* Center Holographic Workstation Circle */}
            <g transform={`translate(${width / 2}, ${height * 0.38})`}>
              <circle cx="0" cy="0" r="160" fill="none" stroke={aksen} strokeWidth="2" strokeDasharray="12,8" opacity="0.7" />
              <circle cx="0" cy="0" r="110" fill="none" stroke={aksenSec} strokeWidth="1.5" strokeDasharray="4,6" opacity="0.6" />
              <circle cx="0" cy="0" r="60" fill="none" stroke="#FFFFFF" strokeWidth="1" opacity="0.4" />

              {/* Crosshair & Data Readouts */}
              <line x1="-180" y1="0" x2="180" y2="0" stroke={aksen} strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
              <line x1="0" y1="-180" x2="0" y2="180" stroke={aksen} strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />

              <text x="0" y="-8" textAnchor="middle" fill="#FFFFFF" fontSize="16" fontWeight="900" letterSpacing="1.5" fontFamily="monospace">
                DIGITAL AI LAB
              </text>
              <text x="0" y="16" textAnchor="middle" fill={aksen} fontSize="11" fontWeight="700" letterSpacing="1" fontFamily="monospace">
                HIGH PERFORMANCE COMPUTING
              </text>
            </g>
          </g>
        )}

        {/* Top-Level Tech Telemetry HUD */}
        <g transform="translate(60, 130)">
          <text x="0" y="0" fill={aksen} fontSize="11" fontWeight="700" fontFamily="monospace" letterSpacing="1">
            SYS: CORE_PIPELINE // MATRIX: ACTIVE
          </text>
        </g>
      </svg>
    </div>
  );
});

// Helper Pemilih Latar Dinamis (Resolves Indonesian setting keywords automatically)
const renderLatarDinamis = (
  latarKey: string | undefined,
  width: number,
  height: number,
  frame: number,
  palet?: string[],
  callout?: string
) => {
  const l = ((latarKey || '') + ' ' + (callout || '')).toLowerCase();
  
  // 1. Suasana Rumah, Halaman, Kamar, Jendela, Bangunan, Lorong, Gang
  if (
    l.includes('rumah') || l.includes('jendela') || l.includes('kamar') ||
    l.includes('halaman') || l.includes('samping') || l.includes('bangunan') ||
    l.includes('gang') || l.includes('lorong') || l.includes('semak')
  ) {
    return <LatarRumahDanHalaman latarKey={l} width={width} height={height} frame={frame} palet={palet} />;
  }

  // 2. Stickman Motion Explainer Scenarios (Senayan, Meja Rapat, Bola Salju, Podium, Whiteboard, Outro)
  if (
    l.includes('senayan') || l.includes('parlemen') || l.includes('breaking') ||
    l.includes('meja-rapat') || l.includes('dokumen') || l.includes('surat-resmi') ||
    l.includes('bola-salju') || l.includes('stempel-hukum') || l.includes('podium') ||
    l.includes('jam-pasir') || l.includes('whiteboard') || l.includes('tahap-sidang') ||
    l.includes('outro-channel') || l.includes('gerbang-dpr')
  ) {
    return <LatarStickmanExplainer latarKey={l} width={width} height={height} frame={frame} />;
  }

  // 3. Rural & Traditional Scenarios
  if (l.includes('warung') || l.includes('kedai') || l.includes('siforejo')) {
    return <LatarWarungDesa width={width} height={height} frame={frame} />;
  }
  if (l.includes('bambu') || l.includes('kursi') || l.includes('nongkrong') || l.includes('teras')) {
    return <LatarKursiBambu width={width} height={height} frame={frame} />;
  }
  if (l.includes('jalan') || l.includes('desa') || l.includes('sawah')) {
    return <LatarJalanDesa width={width} height={height} frame={frame} />;
  }
  if (l.includes('pos') || l.includes('ronda') || l.includes('kamling')) {
    return <LatarPosRonda width={width} height={height} frame={frame} />;
  }
  if (l.includes('senja') || l.includes('sore')) {
    return <LatarSenja width={width} height={height} frame={frame} />;
  }
  if (l.includes('kota') || l.includes('kantor')) {
    return <LatarKota width={width} height={height} />;
  }
  if (l.includes('blueprint')) {
    return <LatarBlueprint width={width} height={height} />;
  }

  // 4. Tech / Lab / Microchip / Cyber / Digital Scenarios
  if (
    l.includes('lab') || l.includes('chip') || l.includes('mikro') ||
    l.includes('gpu') || l.includes('komputer') || l.includes('tech') ||
    l.includes('digital') || l.includes('server') || l.includes('sirkuit') ||
    l.includes('matrix') || l.includes('data') || l.includes('sains')
  ) {
    return <LatarTechLabChip latarKey={l} width={width} height={height} frame={frame} palet={palet} />;
  }

  // Universal fallback yang adaptif terhadap palet gaya/ekstraksi
  return <LatarDinamisGeneratif latarKey={l} width={width} height={height} frame={frame} palet={palet} />;
};

// ── Fungsi Render Karakter Tunggal (Kinetic Rig Engine) ────────────────────
const drawSingleRig = (
  ctx: CanvasRenderingContext2D,
  rig: string,
  pose: KarakterPose,
  posX: number,
  posY: number,
  t: number,
  isSpeaking: boolean = false
) => {
  const aksi = pose.aksi || 'bicara';
  const ekspresi = pose.ekspresi || 'senyum';
  const hadap = pose.hadap ?? 1;
  const benda = pose.benda || 'tidak_ada';
  const warnaBaju = pose.warnaBaju || '#38BDF8';
  const warnaCelana = pose.warnaCelana || '#1E293B';
  const warnaRambut = pose.warnaRambut || '#1E1B4B';

  ctx.save();
  ctx.translate(posX, posY);
  ctx.scale(hadap * 1.45, 1.45); // Skala proporsi karakter

  // Soft drop shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 10, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── RIG 1: TOON 3D (CEL-SHADED HYBRID) ──────────────────────────────────
  if (rig === 'toon-3d' || rig === 'toon-desa' || !rig) {
    const isSitting = aksi === 'duduk';
    const isShocked = aksi === 'kaget' || ekspresi === 'kaget';
    const speed = aksi === 'lari' ? 12 : aksi === 'jalan' ? 6 : 2;
    const walk = (aksi === 'jalan' || aksi === 'lari') ? Math.sin(t * speed) : 0;
    const bob = isSitting ? 0 : Math.abs(walk) * 8;

    ctx.save();
    ctx.translate(0, isSitting ? 35 : -bob);

    // Kaki Kiri & Kanan
    ctx.strokeStyle = '#0B0B0B';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isSitting) {
      // Posisi Duduk di Kursi Bambu / Warung
      // Paha Horizontal
      ctx.fillStyle = warnaCelana;
      ctx.beginPath();
      ctx.roundRect(-24, 45, 42, 22, 6);
      ctx.fill();
      ctx.stroke();
      // Betis Menekuk ke Bawah
      ctx.beginPath();
      ctx.roundRect(10, 58, 20, 45, 6);
      ctx.fill();
      ctx.stroke();
      // Sepatu
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(22, 103, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Posisi Berdiri / Berjalan
      // Kaki Kiri
      ctx.fillStyle = warnaCelana;
      ctx.save();
      ctx.translate(-20, 60);
      ctx.rotate(walk * 0.35);
      ctx.beginPath();
      ctx.roundRect(-10, 0, 20, 60, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(-2, 60, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Kaki Kanan
      ctx.fillStyle = warnaCelana;
      ctx.save();
      ctx.translate(20, 60);
      ctx.rotate(-walk * 0.35);
      ctx.beginPath();
      ctx.roundRect(-10, 0, 20, 60, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(2, 60, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Badan / Baju Toon Cel-Shaded
    ctx.fillStyle = warnaBaju;
    ctx.beginPath();
    ctx.roundRect(-42, -15, 84, 85, 14);
    ctx.fill();
    ctx.stroke();

    // Kantong / Aksesori Baju
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.roundRect(-30, 25, 26, 30, 4);
    ctx.fill();
    ctx.stroke();

    // Lengan Kiri
    const armLSpeed = isShocked ? -2.2 : (walk !== 0 ? -walk * 0.45 : (aksi === 'pikir' ? -1.8 : 0.2));
    ctx.save();
    ctx.translate(-42, 5);
    ctx.rotate(armLSpeed);
    ctx.fillStyle = warnaBaju;
    ctx.beginPath();
    ctx.roundRect(-10, 0, 20, 55, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FBCFE8'; // Kulit tangan
    ctx.beginPath();
    ctx.arc(0, 60, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Lengan Kanan (Aksi Tunjuk / Bawa Kopi / Rokok)
    const armRSpeed = isShocked ? -2.2 : (aksi === 'tunjuk' ? -1.25 : (walk !== 0 ? walk * 0.45 : -0.2));
    ctx.save();
    ctx.translate(42, 5);
    ctx.rotate(armRSpeed);
    ctx.fillStyle = warnaBaju;
    ctx.beginPath();
    ctx.roundRect(-10, 0, 20, 55, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#FBCFE8';
    ctx.beginPath();
    ctx.arc(0, 60, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Props Benda di Tangan
    if (benda === 'rokok') {
      // Batang rokok menyala
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(8, 55, 24, 6);
      ctx.strokeRect(8, 55, 24, 6);
      ctx.fillStyle = '#DC2626'; // Bara
      ctx.fillRect(32, 55, 5, 6);
      // Asap rokok
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(37, 54);
      ctx.quadraticCurveTo(42, 45, 39, 36);
      ctx.stroke();
    } else if (benda === 'kopi') {
      // Cangkir kopi
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(6, 45, 24, 24);
      ctx.strokeRect(6, 45, 24, 24);
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(8, 47, 20, 14);
    } else if (benda === 'folder') {
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(8, 45, 34, 25);
      ctx.strokeRect(8, 45, 34, 25);
    } else if (benda === 'amplop') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(8, 48, 30, 20);
      ctx.strokeRect(8, 48, 30, 20);
    }
    ctx.restore();

    // Kepala Karakter
    ctx.save();
    ctx.translate(0, -68);
    const headTilt = (aksi === 'pikir' ? 0.16 : (isShocked ? -0.1 : walk * 0.05));
    ctx.rotate(headTilt);

    ctx.fillStyle = '#FED7AA'; // Kulit wajah
    ctx.beginPath();
    ctx.ellipse(0, 0, 52, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rambut Toon
    ctx.fillStyle = warnaRambut;
    ctx.beginPath();
    ctx.arc(0, -12, 53, Math.PI * 1.05, Math.PI * -0.05);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Mata Besar Kartun
    const eyeR = isShocked ? 20 : 15;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-14, 0, eyeR, 0, Math.PI * 2);
    ctx.arc(14, 0, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil Hitam
    const pupilShift = aksi === 'tunjuk' ? 5 : (isShocked ? 0 : 2);
    ctx.fillStyle = '#0B0B0B';
    ctx.beginPath();
    ctx.arc(-14 + pupilShift, 0, isShocked ? 4 : 6, 0, Math.PI * 2);
    ctx.arc(14 + pupilShift, 0, isShocked ? 4 : 6, 0, Math.PI * 2);
    ctx.fill();

    // Alis Ekspresif
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (isShocked) {
      ctx.moveTo(-26, -26); ctx.lineTo(-8, -26);
      ctx.moveTo(26, -26); ctx.lineTo(8, -26);
    } else if (ekspresi === 'serius') {
      ctx.moveTo(-24, -18); ctx.lineTo(-6, -12);
      ctx.moveTo(24, -18); ctx.lineTo(6, -12);
    } else {
      ctx.moveTo(-24, -15); ctx.lineTo(-8, -17);
      ctx.moveTo(24, -15); ctx.lineTo(8, -17);
    }
    ctx.stroke();

    // Mulut Lip-Sync Dinamis: hanya buka-tutup jika isSpeaking bernilai TRUE
    const mouthOpen = isSpeaking
      ? Math.abs(Math.sin(t * 16)) * 14 + 4
      : 2;

    ctx.fillStyle = '#991B1B';
    ctx.beginPath();
    if (mouthOpen > 6) {
      ctx.ellipse(0, 22, 12, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.arc(0, 20, 10, 0, Math.PI);
      ctx.stroke();
    }

    ctx.restore(); // Head
    ctx.restore(); // Body
  }

  // ── RIG 2: STICKMAN KINETIC ACTION RIG ──────────────────────────────────
  else if (rig === 'stickman') {
    const isSitting = aksi === 'duduk';
    const isShocked = aksi === 'kaget';
    const speed = aksi === 'lari' ? 14 : 7;
    const walk = (aksi === 'jalan' || aksi === 'lari') ? Math.sin(t * speed) : 0;
    const bob = isSitting ? 0 : Math.abs(walk) * 6;

    ctx.save();
    ctx.translate(0, isSitting ? 30 : -bob);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#0F172A';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (isSitting) {
      // Kaki Duduk Stickman
      ctx.beginPath();
      ctx.moveTo(0, 35);
      ctx.lineTo(35, 35);
      ctx.lineTo(35, 85);
      ctx.stroke();
    } else {
      // Kaki Kiri & Kanan Berjalan
      ctx.beginPath();
      ctx.moveTo(-10, 40);
      ctx.lineTo(-14 + walk * 25, 75);
      ctx.lineTo(-18 + walk * 35, 110);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(10, 40);
      ctx.lineTo(14 - walk * 25, 75);
      ctx.lineTo(18 - walk * 35, 110);
      ctx.stroke();
    }

    // Badan Stickman
    ctx.fillStyle = warnaBaju;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(-20, -35, 40, 75, 8);
    ctx.fill();
    ctx.stroke();

    // Lengan
    const armAngle = isShocked ? -1.8 : walk * 0.45;
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#0F172A';
    ctx.beginPath();
    ctx.moveTo(-20, -25);
    ctx.lineTo(-35 - armAngle * 25, 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(20, -25);
    ctx.lineTo(35 + armAngle * 25, 15);
    ctx.stroke();

    // Kepala Stickman
    ctx.save();
    ctx.translate(0, -75);
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Mata & Mulut Stickman
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-10, -4, 4, 0, Math.PI * 2);
    ctx.arc(10, -4, 4, 0, Math.PI * 2);
    ctx.fill();

    // Mulut Stickman Kinetik
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    const mouthOpen = isSpeaking ? Math.abs(Math.sin(t * 16)) * 8 + 2 : 2;
    ctx.beginPath();
    if (mouthOpen > 5) {
      ctx.arc(0, 12, mouthOpen, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.arc(0, 10, 8, 0, Math.PI);
      ctx.stroke();
    }

    // Peci / Rambut Ciri Khas Karakter
    if (pose.nama?.toLowerCase().includes('muzani') || pose.nama?.toLowerCase().includes('mpr')) {
      // Peci hitam khas Ketua MPR
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-24, -42, 48, 18);
      ctx.strokeRect(-24, -42, 48, 18);
    } else if (pose.nama?.toLowerCase().includes('gibran')) {
      // Rambut belah samping khas Gibran
      ctx.fillStyle = '#1A1A1A';
      ctx.beginPath();
      ctx.arc(0, -10, 38, Math.PI * 1.1, Math.PI * -0.1);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
    ctx.restore();
  }

  // ── RIG 3: ISOMETRIC TECH RIG ───────────────────────────────────────────
  else {
    ctx.save();
    ctx.fillStyle = '#4ECCA3';
    ctx.strokeStyle = '#0B132B';
    ctx.lineWidth = 4;
    // Blok Badan
    ctx.beginPath();
    ctx.roundRect(-30, -10, 60, 80, 6);
    ctx.fill();
    ctx.stroke();
    // Blok Kepala
    ctx.fillStyle = '#38BDF8';
    ctx.beginPath();
    ctx.roundRect(-35, -80, 70, 65, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
};

// ── Multi-Karakter Canvas Component ───────────────────────────────────────
const KarakterCanvas: React.FC<{
  adegan: AdeganAnimasi;
  frame: number;
  width: number;
  height: number;
}> = ({ adegan, frame, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Native Remotion Stepped Frame Stop-Motion (12 FPS deterministik)
  const stopFps = (adegan as any).stop_motion_fps || 12;
  const step = Math.max(1, Math.round(FPS / stopFps));
  const steppedFrame = Math.floor(frame / step) * step;
  const t = steppedFrame / FPS;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const rig = adegan.rig || 'toon-3d';
    const char1 = adegan.karakter;
    const char2 = adegan.karakter2;

    // Jika adegan tanpa tokoh (misal: b-roll latar / aset saja)
    if (!char1 && !char2) {
      return;
    }

    const defY = height * 0.68;
    const tDetik = frame / FPS;

    // Cek apakah suara VO sedang aktif di segmen adegan ini
    const isVoActive = (typeof adegan.speechStart === 'number' && typeof adegan.speechEnd === 'number')
      ? (tDetik >= adegan.speechStart && tDetik <= adegan.speechEnd)
      : true;

    // Deteksi tokoh mana yang sedang berbicara untuk aktivasi lip-sync animasi mulut
    const dialogText = adegan.dialog || (adegan.teks.includes(':') ? adegan.teks : '');
    const spkName = (adegan.speaker || (dialogText.includes(':') ? dialogText.split(':')[0].replace(/['"]/g, '').trim() : '')).toLowerCase();
    
    const name1 = (char1?.nama || 'maya').toLowerCase();
    const name2 = (char2?.nama || 'rian').toLowerCase();

    // Rian adalah karakter 2 (di kanan)
    const isRianSpeaking = char2 ? (
      (name2 && spkName.includes(name2)) ||
      spkName.includes('rian') ||
      spkName.includes('ridwan') ||
      spkName.includes('cowok') ||
      (!spkName.includes(name1) && spkName.length > 0)
    ) : false;

    const char2Speaking = isRianSpeaking && isVoActive;
    const char1Speaking = char2 ? (!isRianSpeaking && isVoActive) : isVoActive;

    if (char1 && char2) {
      // 2 Karakter: Kiri (char1) & Kanan (char2)
      const x1 = char1.posisiX ?? (width * 0.28);
      const y1 = char1.posisiY ?? defY;
      drawSingleRig(ctx, rig, { ...char1, hadap: char1.hadap ?? 1 }, x1, y1, t, char1Speaking);

      const x2 = char2.posisiX ?? (width * 0.72);
      const y2 = char2.posisiY ?? defY;
      drawSingleRig(ctx, rig, { ...char2, hadap: char2.hadap ?? -1 }, x2, y2, t, char2Speaking);
    } else if (char1) {
      // 1 Karakter di Tengah
      const x = char1.posisiX ?? (width / 2);
      const y = char1.posisiY ?? defY;
      drawSingleRig(ctx, rig, char1, x, y, t, char1Speaking);
    } else if (char2) {
      // Karakter 2 saja
      const x = char2.posisiX ?? (width / 2);
      const y = char2.posisiY ?? defY;
      drawSingleRig(ctx, rig, char2, x, y, t, char2Speaking);
    }
  }, [adegan, frame, width, height, t]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
};

// ── Balon Dialog Pop-Up Kinetik (Speech Bubble) ───────────────────────────
const BalonDialog: React.FC<{
  dialogTeks: string;
  speaker?: string;
  speakerSide?: 'kiri' | 'kanan';
  frame: number;
  fps: number;
  width: number;
  height: number;
}> = ({ dialogTeks, speaker, speakerSide = 'kanan', frame, fps, width, height }) => {
  const transisi = spring({ frame, fps, config: { damping: 12, mass: 0.8, stiffness: 120 } });
  const scale = interpolate(transisi, [0, 1], [0.6, 1]);
  const opacity = interpolate(transisi, [0, 1], [0, 1]);

  const isLeft = speakerSide === 'kiri';
  const bubbleLeft = isLeft ? 50 : (width * 0.22);
  const bubbleRight = isLeft ? (width * 0.22) : 50;

  return (
    <div
      style={{
        position: 'absolute',
        top: height * 0.36,
        left: bubbleLeft,
        right: bubbleRight,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: isLeft ? 'bottom left' : 'bottom right',
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FEF9C3 100%)',
          color: '#0F172A',
          padding: '20px 28px',
          borderRadius: 24,
          border: '4px solid #0F172A',
          boxShadow: '0 16px 36px rgba(0,0,0,0.45)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Speaker Name Tag */}
        {speaker ? (
          <div
            style={{
              display: 'inline-block',
              background: isLeft ? '#EC4899' : '#0284C7',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 22,
              padding: '4px 16px',
              borderRadius: 8,
              marginBottom: 8,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            💬 {speaker}
          </div>
        ) : null}

        {/* Dialog Content */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 800,
            lineHeight: 1.35,
            color: '#0F172A',
          }}
        >
          {dialogTeks}
        </div>

        {/* Speech Bubble Tail Menunjuk Tepat ke Karakter */}
        <div
          style={{
            position: 'absolute',
            bottom: -22,
            [isLeft ? 'left' : 'right']: isLeft ? 270 : 280,
            width: 0,
            height: 0,
            borderLeft: '18px solid transparent',
            borderRight: '18px solid transparent',
            borderTop: '22px solid #0F172A',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -16,
            [isLeft ? 'left' : 'right']: isLeft ? 272 : 282,
            width: 0,
            height: 0,
            borderLeft: '16px solid transparent',
            borderRight: '16px solid transparent',
            borderTop: '18px solid #FEF9C3',
          }}
        />
      </div>
    </div>
  );
};

// ── Komponen Adegan Individual ─────────────────────────────────────────────
const SingleAdeganAnimasi: React.FC<{
  adegan: AdeganAnimasi;
  propsUtama: PropsAnimasi;
}> = ({ adegan, propsUtama }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Transisi halus masuk (Slide in + Fade)
  const transisi = spring({ frame, fps, config: { damping: 14 } });
  const translateY = interpolate(transisi, [0, 1], [40, 0]);
  const opacity = interpolate(transisi, [0, 1], [0, 1]);

  // Subtitle Word Highlight Sync Presisi
  const kata = adegan.teks.split(/\s+/).filter(Boolean);
  const durasiAdegan = adegan.durasi_detik ?? adegan.durasi ?? 3.5;
  const frameTotal = durasiAdegan * fps;
  const tDetik = frame / fps;

  let kataIdxAktif = -1;
  if (adegan.kataTimings && adegan.kataTimings.length > 0) {
    for (let k = 0; k < adegan.kataTimings.length; k++) {
      const kt = adegan.kataTimings[k];
      if (tDetik >= kt.start && tDetik <= kt.end) {
        kataIdxAktif = k;
        break;
      }
    }
    if (kataIdxAktif === -1) {
      if (tDetik < (adegan.kataTimings[0]?.start ?? 0)) {
        kataIdxAktif = -1; // Belum mulai bicara
      } else {
        // Cari kata terdekat yang sudah lewat
        for (let k = adegan.kataTimings.length - 1; k >= 0; k--) {
          if (tDetik >= adegan.kataTimings[k].start) {
            kataIdxAktif = k;
            break;
          }
        }
      }
    }
  } else {
    kataIdxAktif = Math.min(
      kata.length - 1,
      Math.floor((frame / frameTotal) * kata.length)
    );
  }

  // Deteksi dialog dari teks atau field dialog
  const dialogText = adegan.dialog || (adegan.teks.includes(':') ? adegan.teks : '');
  const speakerName = adegan.speaker || (dialogText.includes(':') ? dialogText.split(':')[0].replace(/['"]/g, '').trim() : '');
  const cleanDialog = dialogText.includes(':') ? dialogText.split(':').slice(1).join(':').replace(/^['"\s]+|['"\s]+$/g, '') : dialogText;

  const char1Name = (adegan.karakter?.nama || 'Maya').toLowerCase();
  const char2Name = (adegan.karakter2?.nama || 'Rian').toLowerCase();
  const spkLower = speakerName.toLowerCase();

  // Jika Tokoh 2 yang bicara, posisikan balon di KANAN di atas Tokoh 2
  // Jika Tokoh 1 yang bicara, posisikan balon di KIRI di atas Tokoh 1
  const isRightSpeaker = adegan.karakter2 ? (
    (char2Name && spkLower.includes(char2Name)) ||
    spkLower.includes('rian') ||
    spkLower.includes('ridwan') ||
    spkLower.includes('cowok') ||
    (!spkLower.includes(char1Name) && spkLower.length > 0)
  ) : false;

  const speakerSide: 'kiri' | 'kanan' = isRightSpeaker ? 'kanan' : 'kiri';

  // Native Remotion Stepped Frame Stop-Motion (12 FPS standar)
  const stopFps = (adegan as any).stop_motion_fps || (propsUtama as any).stop_motion_fps || 12;
  const step = Math.max(1, Math.round(fps / stopFps));
  const steppedFrame = Math.floor(frame / step) * step;

  const isLandscape = width > height;

  // Integrasi Style Preset (Ekstraksi Video / Tema)
  const namaGaya = propsUtama.gaya || (adegan as any).gaya || (propsUtama as any).tema;
  const presetAktif = namaGaya && STYLE_PRESETS[namaGaya] ? STYLE_PRESETS[namaGaya] : undefined;
  const paletAktif = propsUtama.palet || presetAktif?.palette_hex;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* 0. Preset Style Latar (Jika ada dari preset ekstraksi video) */}
      {presetAktif && presetAktif.Latar ? (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <presetAktif.Latar
            f={steppedFrame}
            i={0}
            n={1}
            aksen={presetAktif.aksen || '#38BDF8'}
            judul={adegan.judul}
          />
        </div>
      ) : null}

      {/* 1. Latar Belakang Dinamis (Rumah/Jendela, Warung Desa, Senayan, dll.) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: presetAktif?.Latar ? 1 : 0, opacity: presetAktif?.Latar ? 0.85 : 1 }}>
        {renderLatarDinamis(adegan.latar, width, height, steppedFrame, paletAktif, adegan.callout || adegan.judul)}
      </div>

      {/* 2. Top HUD Bar & Tag */}
      {(() => {
        const isHorror = ((adegan.latar || '') + ' ' + (propsUtama.judul || '')).toLowerCase().includes('rumah no') ||
                         ((adegan.latar || '') + ' ' + (propsUtama.judul || '')).toLowerCase().includes('kosong 10 tahun');

        const rawJudul = (propsUtama.judul || '').trim();
        const isGeneric = !rawJudul || rawJudul.toLowerCase().includes('animasi karakter bergerak');

        let judulPakai = '';
        if (!isGeneric) {
          judulPakai = rawJudul;
        } else if (isHorror) {
          judulPakai = 'KONON, RUMAH NO. 13\nKOSONG 10 TAHUN';
        }

        let baris1 = judulPakai;
        let baris2 = '';
        if (judulPakai.includes('\n')) {
          const parts = judulPakai.split('\n');
          baris1 = parts[0].trim();
          baris2 = parts.slice(1).join(' ').trim();
        } else if (judulPakai.includes(':')) {
          const parts = judulPakai.split(':');
          baris1 = parts[0].trim();
          baris2 = parts.slice(1).join(':').trim();
        } else if (judulPakai.includes(' - ')) {
          const parts = judulPakai.split(' - ');
          baris1 = parts[0].trim();
          baris2 = parts.slice(1).join(' - ').trim();
        } else if (judulPakai.length > 26) {
          const kataList = judulPakai.split(' ');
          const mid = Math.ceil(kataList.length / 2);
          baris1 = kataList.slice(0, mid).join(' ');
          baris2 = kataList.slice(mid).join(' ');
        }

        return (
          <>
            {/* 2a. Sisi Kiri: Badge Scene & Callout Latar */}
            <div
              style={{
                position: 'absolute',
                top: 60,
                left: 55,
                color: '#FFFFFF',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                zIndex: 15,
              }}
            >
              {isHorror ? (
                <>
                  <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 1.5, opacity: 0.9 }}>HARI 7</div>
                  <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.1, fontFamily: 'monospace' }}>23.47</div>
                </>
              ) : null}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: 6,
                  padding: '5px 12px',
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: 0.8,
                  color: '#38BDF8',
                  backdropFilter: 'blur(4px)',
                  marginTop: isHorror ? 4 : 0,
                }}
              >
                {adegan.callout || (adegan.latar ? `📍 ${adegan.latar.toUpperCase()}` : '📍 SCENE')}
              </div>
            </div>

            {/* 2b. Sisi Kanan: Badge Part */}
            <div
              style={{
                position: 'absolute',
                top: 60,
                right: 55,
                textAlign: 'right',
                zIndex: 15,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(220, 38, 38, 0.9)',
                  color: '#FFFFFF',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontWeight: 900,
                  fontSize: 15,
                  padding: '5px 14px',
                  borderRadius: 6,
                  letterSpacing: 1,
                  boxShadow: '0 4px 12px rgba(220,38,38,0.3)',
                }}
              >
                PART 1
              </div>
            </div>

            {/* 2c. Header Judul Besar Berwarna Putih & Kuning (Dinamis dari Naskah) */}
            {judulPakai ? (
              <div
                style={{
                  position: 'absolute',
                  top: 170,
                  left: 40,
                  right: 40,
                  textAlign: 'center',
                  zIndex: 15,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    fontSize: 44,
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 6px 14px rgba(0,0,0,0.8)',
                    lineHeight: 1.15,
                  }}
                >
                  {baris1}
                </div>
                {baris2 ? (
                  <div
                    style={{
                      fontFamily: 'Impact, Arial Black, sans-serif',
                      fontSize: 40,
                      fontWeight: 900,
                      color: '#FACC15',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      textShadow: '3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 0 6px 14px rgba(0,0,0,0.8)',
                      marginTop: 4,
                    }}
                  >
                    {baris2}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        );
      })()}

      {/* 3. Canvas Karakter Bergerak (Multi-Rig Support dengan Lip-Sync Aktif) */}
      <KarakterCanvas adegan={adegan} frame={frame} width={width} height={height} />

      {/* 5. Balon Dialog Percakapan (Hanya jika mode dialog dan balon diizinkan aktif) */}
      {cleanDialog && (adegan as any).tampilkanBalon !== false && (adegan as any).tampilkan_balon !== false ? (
        <BalonDialog
          dialogTeks={cleanDialog}
          speaker={speakerName}
          speakerSide={speakerSide}
          frame={frame}
          fps={fps}
          width={width}
          height={height}
        />
      ) : null}

      {/* 6. Subtitle Narasi Bersih Minimalis di Bagian Bawah (Sesuai Referensi) */}
      <div
        style={{
          position: 'absolute',
          bottom: 110,
          left: 60,
          right: 60,
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            color: '#FFFFFF',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 34,
            fontWeight: 800,
            lineHeight: 1.35,
            letterSpacing: 0.5,
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 2px #000, 0 0 1px #000',
          }}
        >
          {kata.map((k, i) => {
            const aktif = i === kataIdxAktif;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  margin: '0 6px',
                  color: aktif ? '#FACC15' : '#FFFFFF',
                  transform: aktif ? 'scale(1.12)' : 'scale(1)',
                  fontWeight: aktif ? 900 : 700,
                  transition: 'transform 0.08s ease',
                }}
              >
                {k}
              </span>
            );
          })}
        </span>
      </div>

      {/* 7. Audio Adegan jika ada */}
      {adegan.suara ? <Audio src={staticFile(adegan.suara)} /> : null}
    </AbsoluteFill>
  );
};

// ── Komposisi Utama VideoAnimasi ───────────────────────────────────────────
export const VideoAnimasi: React.FC<PropsAnimasi> = (props) => {
  const adeganList = props.adegan || [];
  let frameMulai = 0;

  return (
    <AbsoluteFill style={{ background: '#020617' }}>
      {/* Trek Narasi Penuh jika ada */}
      {props.audioNarasi ? <Audio src={staticFile(props.audioNarasi)} /> : null}

      {/* Urutan Adegan */}
      {adeganList.map((adegan, i) => {
        const durasiFrame = frameAdeganAnimasi(adegan, !!props.audioNarasi);
        const seq = (
          <Sequence key={i} from={frameMulai} durationInFrames={durasiFrame}>
            <SingleAdeganAnimasi adegan={adegan} propsUtama={props} />
          </Sequence>
        );
        frameMulai += durasiFrame;
        return seq;
      })}
    </AbsoluteFill>
  );
};
