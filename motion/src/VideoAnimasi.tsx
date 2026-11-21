// VideoAnimasi.tsx: Native Remotion Kinetic Character Animation Engine
// Mendukung Rig Toon 3D, Stickman, & Isometric dengan kalkulasi sendi deterministik
import React, { useRef, useEffect, useMemo } from 'react';
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
  aksi?: 'jalan' | 'lari' | 'bicara' | 'tunjuk' | 'diam' | 'kaget' | 'pikir';
  ekspresi?: 'senyum' | 'serius' | 'kaget' | 'bicara' | 'tenang';
  posisiX?: number; // 0..width
  posisiY?: number; // 0..height
  hadap?: 1 | -1;
  benda?: 'tidak_ada' | 'amplop' | 'folder' | 'palu' | 'kertas' | 'ponsel';
};

export type AdeganAnimasi = {
  judul: string;
  teks: string;
  durasi?: number;
  durasi_detik?: number;
  suara?: string;
  rig?: 'toon-3d' | 'stickman' | 'isometric' | 'custom';
  latar?: 'blueprint' | 'senja' | 'kantor' | 'kota' | 'isometric-grid' | 'gelap';
  karakter?: KarakterPose;
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

// ── Background Layers (Memoized with React.memo for high performance) ─────
const LatarBlueprint: React.FC<{ width: number; height: number }> = React.memo(({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0F2C59';
    ctx.fillRect(0, 0, width, height);

    // Radial gradient glow
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.15, width / 2, height / 2, height * 0.7);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
    grad.addColorStop(1, 'rgba(10, 25, 47, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Blueprint grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.lineWidth = 1.5;
    const step = 48;
    ctx.beginPath();
    for (let x = 0; x <= width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Border frame
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

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
      {/* Cel-shaded clouds */}
      {[
        { x: 200, y: 350, r: 80, spd: 20 },
        { x: 800, y: 220, r: 110, spd: 15 },
        { x: 450, y: 650, r: 90, spd: 25 },
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
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            }}
          />
        );
      })}
    </div>
  );
};

const LatarKota: React.FC<{ width: number; height: number }> = React.memo(({ width, height }) => (
  <div
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(180deg, #0284C7 0%, #BAE6FD 65%, #F0FDF4 100%)',
    }}
  >
    {/* Ground / street */}
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
    >
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 0,
          right: 0,
          height: 12,
          background: 'repeating-linear-gradient(90deg, #FACC15 0px, #FACC15 60px, transparent 60px, transparent 120px)',
        }}
      />
    </div>
  </div>
));

const LatarIsometric: React.FC<{ width: number; height: number }> = React.memo(({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0B132B';
    ctx.fillRect(0, 0, width, height);

    // Draw isometric grid diamonds
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

    // Floating isometric cubes in background
    const drawIsoCube = (cx: number, cy: number, size: number, colTop: string, colLeft: string, colRight: string) => {
      const h = size * 0.58;
      // Top
      ctx.fillStyle = colTop;
      ctx.beginPath();
      ctx.moveTo(cx, cy - h);
      ctx.lineTo(cx + size, cy - h / 2);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - size, cy - h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Left
      ctx.fillStyle = colLeft;
      ctx.beginPath();
      ctx.moveTo(cx - size, cy - h / 2);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - size, cy + size - h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right
      ctx.fillStyle = colRight;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + size, cy - h / 2);
      ctx.lineTo(cx + size, cy + size - h / 2);
      ctx.lineTo(cx, cy + size);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    drawIsoCube(width * 0.25, height * 0.35, 70, '#4ECCA3', '#2B9348', '#1B4332');
    drawIsoCube(width * 0.75, height * 0.28, 85, '#38BDF8', '#0284C7', '#0369A1');
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
});

// ── Drawing Rig Karakter (Canvas 2D) ───────────────────────────────────────
const KarakterCanvas: React.FC<{
  adegan: AdeganAnimasi;
  frame: number;
  width: number;
  height: number;
}> = ({ adegan, frame, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = frame / FPS;
  const rig = adegan.rig || 'toon-3d';
  const pose = adegan.karakter || {};
  const aksi = pose.aksi || 'bicara';
  const ekspresi = pose.ekspresi || 'senyum';
  const hadap = pose.hadap ?? 1;
  const benda = pose.benda || 'tidak_ada';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Posisi dasar karakter
    const defX = width / 2;
    const defY = height * 0.68;
    const posX = pose.posisiX ?? defX;
    const posY = pose.posisiY ?? defY;

    ctx.save();
    ctx.translate(posX, posY);
    ctx.scale(hadap * 1.5, 1.5); // Skala karakter agar pas di 1080x1920

    // Soft drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 50, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── RIG 1: TOON-3D EXPLAINER RIG ──────────────────────────────────────
    if (rig === 'toon-3d') {
      const speed = aksi === 'lari' ? 12 : aksi === 'jalan' ? 6 : 2;
      const walk = (aksi === 'jalan' || aksi === 'lari') ? Math.sin(t * speed) : 0;
      const bob = Math.abs(walk) * 8;

      ctx.save();
      ctx.translate(0, -bob);

      // Kaki Kiri & Kanan
      ctx.strokeStyle = '#0B0B0B';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Kaki Kiri
      ctx.fillStyle = '#334155';
      ctx.save();
      ctx.translate(-20, 60);
      ctx.rotate(walk * 0.35);
      ctx.beginPath();
      ctx.roundRect(-10, 0, 20, 60, 6);
      ctx.fill();
      ctx.stroke();
      // Sepatu kiri
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(-2, 60, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Kaki Kanan
      ctx.fillStyle = '#1E293B';
      ctx.save();
      ctx.translate(20, 60);
      ctx.rotate(-walk * 0.35);
      ctx.beginPath();
      ctx.roundRect(-10, 0, 20, 60, 6);
      ctx.fill();
      ctx.stroke();
      // Sepatu kanan
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.ellipse(2, 60, 14, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Badan / Rompi Toon (Cel-shaded)
      ctx.fillStyle = '#38BDF8'; // Cyan jacket
      ctx.beginPath();
      ctx.roundRect(-42, -15, 84, 85, 14);
      ctx.fill();
      ctx.stroke();

      // Kantong & Emblem
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.roundRect(-30, 25, 26, 30, 4);
      ctx.fill();
      ctx.stroke();

      // Lengan Kiri
      const armLSpeed = walk !== 0 ? -walk * 0.45 : (aksi === 'pikir' ? -1.8 : 0.2);
      ctx.save();
      ctx.translate(-42, 5);
      ctx.rotate(armLSpeed);
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(-10, 0, 20, 55, 8);
      ctx.fill();
      ctx.stroke();
      // Tangan Mitten Kiri
      ctx.fillStyle = '#FBCFE8';
      ctx.beginPath();
      ctx.arc(0, 60, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Lengan Kanan (Aksi Tunjuk / Bawa Benda)
      const armRSpeed = aksi === 'tunjuk' ? -1.2 : (walk !== 0 ? walk * 0.45 : -0.2);
      ctx.save();
      ctx.translate(42, 5);
      ctx.rotate(armRSpeed);
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.roundRect(-10, 0, 20, 55, 8);
      ctx.fill();
      ctx.stroke();
      // Tangan Mitten Kanan
      ctx.fillStyle = '#FBCFE8';
      ctx.beginPath();
      ctx.arc(0, 60, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Props Benda di Tangan
      if (benda === 'folder') {
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(8, 45, 34, 25);
        ctx.strokeRect(8, 45, 34, 25);
      } else if (benda === 'amplop') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(8, 48, 30, 20);
        ctx.strokeRect(8, 48, 30, 20);
      } else if (benda === 'palu') {
        ctx.fillStyle = '#78350F';
        ctx.fillRect(10, 40, 6, 32);
        ctx.fillStyle = '#94A3B8';
        ctx.fillRect(2, 34, 22, 10);
        ctx.strokeRect(2, 34, 22, 10);
      }
      ctx.restore();

      // Kepala Bulat Toon
      ctx.save();
      ctx.translate(0, -68);
      const headTilt = (aksi === 'pikir' ? 0.15 : walk * 0.05);
      ctx.rotate(headTilt);

      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.ellipse(0, 0, 52, 46, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Rambut Toon
      ctx.fillStyle = '#1E1B4B';
      ctx.beginPath();
      ctx.arc(0, -12, 53, Math.PI * 1.05, Math.PI * -0.05);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Mata Putih Kartun Besar (Bersentuhan khas Toon Explainer)
      const eyeR = ekspresi === 'kaget' ? 18 : 15;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-14, 0, eyeR, 0, Math.PI * 2);
      ctx.arc(14, 0, eyeR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupil Hitam
      const pupilShift = aksi === 'tunjuk' ? 5 : 0;
      ctx.fillStyle = '#0B0B0B';
      ctx.beginPath();
      ctx.arc(-14 + pupilShift, 0, 6, 0, Math.PI * 2);
      ctx.arc(14 + pupilShift, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Alis Ekspresif
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      if (ekspresi === 'serius') {
        ctx.moveTo(-24, -18); ctx.lineTo(-6, -12);
        ctx.moveTo(24, -18); ctx.lineTo(6, -12);
      } else if (ekspresi === 'kaget') {
        ctx.moveTo(-24, -22); ctx.lineTo(-8, -24);
        ctx.moveTo(24, -22); ctx.lineTo(8, -24);
      } else {
        // Senyum / Tenang
        ctx.moveTo(-24, -15); ctx.lineTo(-8, -17);
        ctx.moveTo(24, -15); ctx.lineTo(8, -17);
      }
      ctx.stroke();

      // Mulut Dinamis (Lip-Sync Speech)
      const mouthOpen = (aksi === 'bicara' || ekspresi === 'bicara') ? Math.abs(Math.sin(t * 14)) * 14 + 3 : (ekspresi === 'senyum' ? 6 : 2);
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

    // ── RIG 2: STICKMAN KINETIC ACTION RIG ────────────────────────────────
    else if (rig === 'stickman') {
      const speed = aksi === 'lari' ? 14 : 7;
      const walk = (aksi === 'jalan' || aksi === 'lari') ? Math.sin(t * speed) : 0;
      const bob = Math.abs(walk) * 6;

      ctx.save();
      ctx.translate(0, -bob);

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#0F172A';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Kaki Kiri
      ctx.beginPath();
      ctx.moveTo(-10, 40);
      ctx.lineTo(-14 + walk * 25, 75);
      ctx.lineTo(-18 + walk * 35, 110);
      ctx.stroke();

      // Kaki Kanan
      ctx.beginPath();
      ctx.moveTo(10, 40);
      ctx.lineTo(14 - walk * 25, 75);
      ctx.lineTo(18 - walk * 35, 110);
      ctx.stroke();

      // Torso Berpakaian Biru
      ctx.fillStyle = '#2563EB';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.roundRect(-20, -35, 40, 75, 8);
      ctx.fill();
      ctx.stroke();

      // Dasi Merah
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(-4, -30);
      ctx.lineTo(4, -30);
      ctx.lineTo(5, 5);
      ctx.lineTo(0, 14);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();

      // Lengan Kiri
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(-20, -25);
      ctx.lineTo(-35 - walk * 25, 5);
      ctx.lineTo(-45 - walk * 35, 30);
      ctx.stroke();

      // Lengan Kanan
      ctx.beginPath();
      ctx.moveTo(20, -25);
      ctx.lineTo(35 + walk * 25, 5);
      ctx.lineTo(45 + walk * 35, 30);
      ctx.stroke();

      // Kepala Stickman Bulat Bersih
      ctx.save();
      ctx.translate(0, -75);
      ctx.fillStyle = '#FDE68A';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mata Dot Stickman
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(-10, -2, 4, 0, Math.PI * 2);
      ctx.arc(10, -2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Mulut
      const mouth = Math.abs(Math.sin(t * 12)) * 8;
      ctx.beginPath();
      ctx.ellipse(0, 16, 6, mouth + 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Head
      ctx.restore(); // Body
    }

    // ── RIG 3: ISOMETRIC TECH BLOCK RIG ───────────────────────────────────
    else {
      // Isometric technical presentation
      const floatY = Math.sin(t * 3) * 12;
      ctx.save();
      ctx.translate(0, floatY);

      // Main server block
      ctx.fillStyle = '#4ECCA3';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0B0B0B';
      ctx.beginPath();
      ctx.roundRect(-60, -40, 120, 140, 12);
      ctx.fill();
      ctx.stroke();

      // Tech indicator LEDs
      for (let i = 0; i < 4; i++) {
        const ledOn = Math.floor((t * 6 + i) % 2) === 0;
        ctx.fillStyle = ledOn ? '#FBBF24' : '#10B981';
        ctx.beginPath();
        ctx.arc(-35 + i * 24, 70, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Isometric Mascot on top
      ctx.save();
      ctx.translate(0, -80);
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(-8, -4, 7, 0, Math.PI * 2);
      ctx.arc(8, -4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0B0B0B';
      ctx.beginPath();
      ctx.arc(-8, -4, 3, 0, Math.PI * 2);
      ctx.arc(8, -4, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
    }

    ctx.restore();
  }, [adegan, frame, width, height, t, rig, pose, aksi, ekspresi, hadap, benda]);

  return <canvas ref={canvasRef} width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} />;
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

  // Pemetaan Latar
  const latarKey = adegan.latar || 'blueprint';
  const renderLatar = () => {
    switch (latarKey) {
      case 'senja':
        return <LatarSenja width={width} height={height} frame={frame} />;
      case 'kota':
      case 'kantor':
        return <LatarKota width={width} height={height} />;
      case 'isometric-grid':
        return <LatarIsometric width={width} height={height} />;
      case 'blueprint':
      default:
        return <LatarBlueprint width={width} height={height} />;
    }
  };

  // Subtitle Word Highlight Sync
  const kata = adegan.teks.split(/\s+/).filter(Boolean);
  const durasiAdegan = adegan.durasi_detik ?? adegan.durasi ?? 3.5;
  const frameTotal = durasiAdegan * fps;
  const kataIdxAktif = Math.min(
    kata.length - 1,
    Math.floor((frame / frameTotal) * kata.length)
  );

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {/* 1. Latar Belakang (Memoized) */}
      {renderLatar()}

      {/* 2. Top Callout Badge */}
      {adegan.callout ? (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 70,
            opacity,
            transform: `translateY(${translateY}px)`,
          }}
        >
          <span
            style={{
              background: '#0B0B0B',
              color: '#FACC15',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 900,
              fontSize: 32,
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
          top: 150,
          left: 70,
          right: 70,
          opacity,
          transform: `translateY(${translateY}px)`,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            background: 'rgba(15, 23, 42, 0.92)',
            color: '#FFFFFF',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 900,
            fontSize: 52,
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

      {/* 4. Canvas Karakter Bergerak (Kinetic Rig) */}
      <KarakterCanvas adegan={adegan} frame={frame} width={width} height={height} />

      {/* 5. Subtitle Pop-Up Sinkron Per Kata */}
      <div
        style={{
          position: 'absolute',
          bottom: 260,
          left: 80,
          right: 80,
          textAlign: 'center',
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
            fontSize: 44,
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

      {/* 6. Audio Adegan jika ada */}
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
