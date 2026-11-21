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
};

export type PropsAnimasi = {
  judul: string;
  rigDefault?: 'toon-3d' | 'stickman' | 'isometric' | 'custom';
  audioNarasi?: string;
  adegan: AdeganAnimasi[];
  rasio?: 'vertikal' | 'landscape';
  aksen?: string;
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
    ctx.fillStyle = '#FEF08A';
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(width * 0.08, height * 0.22, width * 0.64, 76, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#991B1B';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WARUNG MAKAN SIFOREJO', width * 0.40, height * 0.26 + 6);
    ctx.font = '700 15px sans-serif';
    ctx.fillStyle = '#1E293B';
    ctx.fillText('☕ KOPI TUBRUK • GORENGAN • ROKOK KETENGAN', width * 0.40, height * 0.29 + 6);

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

// Latar Isometric Grid
const LatarIsometric: React.FC<{ width: number; height: number }> = React.memo(({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0B132B';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(78, 204, 163, 0.18)';
    ctx.lineWidth = 1.5;
    const tileW = 120;
    const tileH = 60;
    ctx.beginPath();
    for (let y = -height; y < height * 2; y += tileH) {
      for (let x = -width; x < width * 2; x += tileW) {
        ctx.moveTo(x, y + tileH / 2);
        ctx.lineTo(x + tileW / 2, y);
        ctx.lineTo(x + tileW, y + tileH / 2);
        ctx.lineTo(x + tileW / 2, y + tileH);
        ctx.closePath();
      }
    }
    ctx.stroke();
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// Helper Pemilih Latar Dinamis (Resolves Indonesian setting keywords automatically)
const renderLatarDinamis = (latarKey: string | undefined, width: number, height: number, frame: number) => {
  const l = (latarKey || '').toLowerCase();
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
  if (l.includes('isometric') || l.includes('grid')) {
    return <LatarIsometric width={width} height={height} />;
  }
  if (l.includes('blueprint')) {
    return <LatarBlueprint width={width} height={height} />;
  }
  // Default fallback jika tema cerita pedesaan/lokal
  return <LatarWarungDesa width={width} height={height} frame={frame} />;
};

// ── Fungsi Render Karakter Tunggal (Kinetic Rig Engine) ────────────────────
const drawSingleRig = (
  ctx: CanvasRenderingContext2D,
  rig: string,
  pose: KarakterPose,
  posX: number,
  posY: number,
  t: number
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

    // Mulut Lip-Sync Dinamis
    const mouthOpen = (aksi === 'bicara' || ekspresi === 'bicara')
      ? Math.abs(Math.sin(t * 14)) * 14 + 3
      : (isShocked ? 18 : (ekspresi === 'senyum' ? 6 : 2));

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

    // Mata & Mulut
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-10, -4, 4, 0, Math.PI * 2);
    ctx.arc(10, -4, 4, 0, Math.PI * 2);
    ctx.fill();

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
    const char1 = adegan.karakter || {};
    const char2 = adegan.karakter2;

    const defY = height * 0.68;

    // Jika ada 2 Karakter (misal Budi & Ridwan saling dialog)
    if (char2) {
      // Karakter 1 (Budi) di sebelah KIRI menghadap kanan
      const x1 = char1.posisiX ?? (width * 0.28);
      const y1 = char1.posisiY ?? defY;
      drawSingleRig(ctx, char1.aksi ? rig : (char1.warnaBaju ? 'toon-3d' : rig), { ...char1, hadap: char1.hadap ?? 1 }, x1, y1, t);

      // Karakter 2 (Ridwan) di sebelah KANAN menghadap kiri
      const x2 = char2.posisiX ?? (width * 0.72);
      const y2 = char2.posisiY ?? defY;
      drawSingleRig(ctx, char2.warnaBaju ? 'toon-3d' : rig, { ...char2, hadap: char2.hadap ?? -1 }, x2, y2, t);
    } else {
      // 1 Karakter di Tengah
      const x = char1.posisiX ?? (width / 2);
      const y = char1.posisiY ?? defY;
      drawSingleRig(ctx, rig, char1, x, y, t);
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
  const bubbleLeft = isLeft ? 60 : (width * 0.20);
  const bubbleRight = isLeft ? (width * 0.20) : 60;

  return (
    <div
      style={{
        position: 'absolute',
        top: height * 0.35,
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
              background: isLeft ? '#2563EB' : '#EA580C',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: 22,
              padding: '4px 14px',
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

        {/* Speech Bubble Tail Pointing to Character */}
        <div
          style={{
            position: 'absolute',
            bottom: -22,
            [isLeft ? 'left' : 'right']: 80,
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
            [isLeft ? 'left' : 'right']: 82,
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

  // Subtitle Word Highlight Sync
  const kata = adegan.teks.split(/\s+/).filter(Boolean);
  const durasiAdegan = adegan.durasi_detik ?? adegan.durasi ?? 3.5;
  const frameTotal = durasiAdegan * fps;
  const kataIdxAktif = Math.min(
    kata.length - 1,
    Math.floor((frame / frameTotal) * kata.length)
  );

  // Deteksi dialog dari teks atau field dialog
  const dialogText = adegan.dialog || (adegan.teks.includes(':') ? adegan.teks : '');
  const speakerName = adegan.speaker || (dialogText.includes(':') ? dialogText.split(':')[0].replace(/['"]/g, '').trim() : '');
  const cleanDialog = dialogText.includes(':') ? dialogText.split(':').slice(1).join(':').replace(/^['"\s]+|['"\s]+$/g, '') : dialogText;
  const speakerSide = (speakerName.toLowerCase().includes('ridwan') || speakerName.toLowerCase().includes('teman')) ? 'kanan' : 'kiri';

  // Native Remotion Stepped Frame Stop-Motion (12 FPS standar)
  const stopFps = (adegan as any).stop_motion_fps || (propsUtama as any).stop_motion_fps || 12;
  const step = Math.max(1, Math.round(fps / stopFps));
  const steppedFrame = Math.floor(frame / step) * step;

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* 1. Latar Belakang Dinamis (Warung Desa, Kursi Bambu, Jalanan, dll.) */}
      {renderLatarDinamis(adegan.latar, width, height, steppedFrame)}

      {/* 2. Top Callout Badge (misal: "📍 WARUNG SIFOREJO") */}
      {adegan.callout ? (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 70,
            opacity,
            transform: `translateY(${translateY}px)`,
            zIndex: 10,
          }}
        >
          <span
            style={{
              background: '#0B0B0B',
              color: '#FACC15',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 900,
              fontSize: 30,
              padding: '12px 24px',
              borderRadius: '999px',
              border: '2px solid #FACC15',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              letterSpacing: 1.5,
            }}
          >
            {adegan.callout}
          </span>
        </div>
      ) : null}

      {/* 3. Judul Adegan (Pop-up Clean Card) */}
      <div
        style={{
          position: 'absolute',
          top: 145,
          left: 70,
          right: 70,
          opacity,
          transform: `translateY(${translateY}px)`,
          zIndex: 10,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#FFFFFF',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 900,
            fontSize: 48,
            lineHeight: 1.25,
            padding: '16px 28px',
            borderRadius: 16,
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          }}
        >
          {adegan.judul}
        </span>
      </div>

      {/* 4. Canvas Karakter Bergerak (Multi-Rig Support) */}
      <KarakterCanvas adegan={adegan} frame={frame} width={width} height={height} />

      {/* 5. Balon Dialog Percakapan (Speech Bubble) jika ada dialog */}
      {cleanDialog ? (
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

      {/* 6. Subtitle Narasi Sinkron Per Kata di Bagian Bawah */}
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          left: 70,
          right: 70,
          textAlign: 'center',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(11, 15, 25, 0.94)',
            color: '#FFFFFF',
            padding: '18px 32px',
            borderRadius: 24,
            border: '3px solid #38BDF8',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 40,
            fontWeight: 800,
            lineHeight: 1.4,
          }}
        >
          {kata.map((k, i) => {
            const aktif = i === kataIdxAktif;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  margin: '0 8px',
                  color: aktif ? '#FACC15' : '#FFFFFF',
                  transform: aktif ? 'scale(1.12)' : 'scale(1)',
                  transition: 'transform 0.1s ease',
                  opacity: i <= kataIdxAktif ? 1 : 0.45,
                }}
              >
                {k}
              </span>
            );
          })}
        </div>
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
