/* toon3d.js: Deterministic 3D Cel-Shaded Toon Explainer Engine (Perspective Camera, Character Rig, Blueprint & X-Ray) */
(function() {
  const T3 = window.T3 = {};

  const clamp = T3.clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const lerp = T3.lerp = (a, b, u) => a + (b - a) * u;
  const easeOutBack = T3.easeOutBack = (x) => {
    x = clamp(x);
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  };
  const easeInOutCubic = T3.easeInOutCubic = (x) => {
    x = clamp(x);
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  };

  T3.spring = (tau, w = 18, z = 0.78) => {
    if (tau <= 0) return 0;
    if (z < 1) {
      const wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
    }
    return 1 - Math.exp(-w * tau) * (1 + w * tau);
  };

  T3.PALETTE = {
    ink: '#0B0B0B',
    bpBlue: '#14427A',
    bpGrid: 'rgba(255, 255, 255, 0.18)',
    bpWhite: '#F8FAFC',
    bpRed: '#EF4444',
    wallTeal: '#285E6B',
    wallTealDark: '#1D4650',
    deskTop: '#5B8FB9',
    corkboard: '#C08552',
    hangarWall: '#3A4D39',
    hangarFloor: '#4F585E',
    hangarLine: '#FACC15',
    skyPurple: '#3B286D',
    skyPink: '#A8557A',
    skyOrange: '#F4A261',
    vecBlue: '#38BDF8',
    vecOrange: '#F97316',
    xrayFill: 'rgba(56, 189, 248, 0.26)',
    xrayEdge: '#7DD3FC',
    tagBg: '#181C20',
    tagYellow: '#FACC15'
  };

  T3.Cam3D = class {
    constructor(W = 1080, H = 1920, fov = 850) {
      this.W = W; this.H = H; this.fov = fov;
      this.x = 0; this.y = 0; this.z = -500;
      this.shakeX = 0; this.shakeY = 0;
    }
    set(x, y, z, fov = this.fov) {
      this.x = x; this.y = y; this.z = z; this.fov = fov;
    }
    applyShake(t, active, amp = 8) {
      if (!active) { this.shakeX = 0; this.shakeY = 0; return; }
      this.shakeX = Math.sin(t * 95.3) * amp;
      this.shakeY = Math.cos(t * 113.7) * amp;
    }
    project(px, py, pz) {
      const dz = Math.max(40, pz - this.z);
      const scale = this.fov / dz;
      return {
        x: this.W * 0.5 + (px - this.x) * scale + this.shakeX,
        y: this.H * 0.5 + (py - this.y) * scale + this.shakeY,
        s: scale
      };
    }
  };

  T3.drawCelBox = function(ctx, cam, cx, cy, cz, w, h, d, shades, inkWidth = 3) {
    const hw = w / 2, hh = h / 2, hd = d / 2;
    const pts = [
      cam.project(cx - hw, cy - hh, cz - hd),
      cam.project(cx + hw, cy - hh, cz - hd),
      cam.project(cx + hw, cy + hh, cz - hd),
      cam.project(cx - hw, cy + hh, cz - hd),
      cam.project(cx - hw, cy - hh, cz + hd),
      cam.project(cx + hw, cy - hh, cz + hd),
      cam.project(cx + hw, cy + hh, cz + hd),
      cam.project(cx - hw, cy + hh, cz + hd)
    ];

    const poly = (idx, fill) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.moveTo(pts[idx[0]].x, pts[idx[0]].y);
      for (let i = 1; i < idx.length; i++) ctx.lineTo(pts[idx[i]].x, pts[idx[i]].y);
      ctx.closePath();
      ctx.fill();
      if (inkWidth > 0) {
        ctx.strokeStyle = T3.PALETTE.ink;
        ctx.lineWidth = inkWidth;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    };

    if (pts[4].y < pts[0].y) poly([4, 5, 1, 0], shades.top || '#94A3B8');
    if (pts[0].x > pts[4].x) poly([4, 0, 3, 7], shades.side || '#64748B');
    if (pts[1].x < pts[5].x) poly([1, 5, 6, 2], shades.side || '#64748B');
    poly([0, 1, 2, 3], shades.front || '#CBD5E1');
  };

  T3.drawBlueprintView = function(ctx, W, H, opts = {}) {
    const grid = opts.grid || 48;
    ctx.save();
    ctx.fillStyle = T3.PALETTE.bpBlue;
    ctx.fillRect(0, 0, W, H);
    const vg = ctx.createRadialGradient(W/2, H/2, W*0.2, W/2, H/2, H*0.75);
    vg.addColorStop(0, 'rgba(255,255,255,0.06)');
    vg.addColorStop(1, 'rgba(6,22,45,0.45)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = T3.PALETTE.bpGrid;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= W; x += grid) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y <= H; y += grid) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 36, W - 72, H - 72);
    ctx.restore();
  };

  T3.drawSunsetSky = function(ctx, W, H, scroll = 0) {
    ctx.save();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, T3.PALETTE.skyPurple);
    g.addColorStop(0.55, T3.PALETTE.skyPink);
    g.addColorStop(1, T3.PALETTE.skyOrange);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const clouds = [
      { x: 220, y: 420, r: 95 },
      { x: 780, y: 310, r: 120 },
      { x: 520, y: 1280, r: 140 },
      { x: 160, y: 1460, r: 110 }
    ];
    for (const c of clouds) {
      const cx = ((c.x - scroll * 30) % (W + 300) + (W + 300)) % (W + 300) - 150;
      ctx.fillStyle = 'rgba(226, 212, 230, 0.82)';
      ctx.beginPath();
      ctx.arc(cx, c.y, c.r, 0, Math.PI * 2);
      ctx.arc(cx + c.r * 0.75, c.y + 15, c.r * 0.72, 0, Math.PI * 2);
      ctx.arc(cx - c.r * 0.75, c.y + 20, c.r * 0.68, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  T3.drawCharacter = function(ctx, x, y, scale = 1, opts = {}) {
    const role = opts.role || 'engineer';
    const expr = opts.expr || 'neutral';
    const tilt = opts.tilt || 0;
    const leftArmAng = opts.leftArmAng || 0.15;
    const rightArmAng = opts.rightArmAng || -0.15;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = T3.PALETTE.ink;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.fillStyle = role === 'mechanic' ? '#365314' : '#334155';
    ctx.beginPath();
    ctx.roundRect(-24, 65, 14, 70, 5);
    ctx.roundRect(10, 65, 14, 70, 5);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.ellipse(-20, 138, 18, 9, 0, 0, Math.PI * 2);
    ctx.ellipse(20, 138, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = role === 'mechanic' ? '#4D7C0F' : (role === 'pilot' ? '#3F6212' : '#93C5FD');
    ctx.beginPath();
    ctx.roundRect(-34, -10, 68, 80, 16);
    ctx.fill(); ctx.stroke();

    if (role === 'engineer') {
      ctx.strokeRect(8, 10, 18, 22);
      ctx.fillStyle = '#EF4444'; ctx.fillRect(11, 2, 4, 10);
      ctx.fillStyle = '#1D4ED8'; ctx.fillRect(18, 2, 4, 10);
    }

    if (role === 'mechanic') {
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.moveTo(-34, -10); ctx.lineTo(-10, -10); ctx.lineTo(-10, 70); ctx.lineTo(-34, 70); ctx.closePath();
      ctx.moveTo(10, -10); ctx.lineTo(34, -10); ctx.lineTo(34, 70); ctx.lineTo(10, 70); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }

    const drawArm = (ax, ang) => {
      ctx.save();
      ctx.translate(ax, 4);
      ctx.rotate(ang);
      ctx.fillStyle = role === 'engineer' ? '#F3C69F' : (role === 'mechanic' ? '#4D7C0F' : '#3F6212');
      ctx.beginPath(); ctx.roundRect(-7, 0, 14, 52, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#F3C69F';
      ctx.beginPath(); ctx.arc(0, 56, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    };
    drawArm(-38, leftArmAng);
    drawArm(38, rightArmAng);

    ctx.save();
    ctx.translate(0, -62);
    ctx.rotate(tilt);

    ctx.fillStyle = '#F3C69F';
    ctx.beginPath();
    ctx.ellipse(0, 0, 54, 48, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    if (role === 'mechanic') {
      ctx.fillStyle = '#3F6212';
      ctx.beginPath(); ctx.arc(0, -14, 54, Math.PI, 0); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(18, -15, 44, 10, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (role === 'pilot') {
      ctx.fillStyle = '#E2E8F0';
      ctx.beginPath(); ctx.arc(0, -8, 56, Math.PI * 0.92, Math.PI * 0.08); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-58, -12, 12, 26); ctx.strokeRect(-58, -12, 12, 26);
      ctx.fillRect(46, -12, 12, 26); ctx.strokeRect(46, -12, 12, 26);
    } else {
      ctx.fillStyle = '#6B4423';
      ctx.beginPath(); ctx.arc(0, -12, 55, Math.PI * 1.04, Math.PI * -0.04); ctx.fill(); ctx.stroke();
    }

    const eyeR = expr === 'shocked' ? 21 : 18;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(-16, -2, eyeR, eyeR * 1.15, -0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(16, -2, eyeR, eyeR * 1.15, 0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = T3.PALETTE.ink;
    ctx.beginPath();
    ctx.arc(-12, -1, 3.2, 0, Math.PI * 2);
    ctx.arc(12, -1, 3.2, 0, Math.PI * 2);
    ctx.fill();

    if (role === 'engineer') {
      ctx.strokeStyle = T3.PALETTE.ink;
      ctx.lineWidth = 3.5;
      ctx.strokeRect(-38, -22, 35, 34);
      ctx.strokeRect(3, -22, 35, 34);
      ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(3, -6); ctx.stroke();
    }

    ctx.strokeStyle = T3.PALETTE.ink;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    if (expr === 'worried' || expr === 'shocked') {
      ctx.moveTo(-14, 28);
      ctx.lineTo(-7, 23); ctx.lineTo(0, 28); ctx.lineTo(7, 23); ctx.lineTo(14, 28);
    } else if (expr === 'scheming') {
      ctx.fillStyle = '#FFFFFF';
      ctx.roundRect(-18, 18, 36, 14, 6);
      ctx.fill(); ctx.stroke();
      ctx.moveTo(-18, 25); ctx.lineTo(18, 25);
    } else if (expr === 'confident') {
      ctx.arc(0, 20, 12, 0.1 * Math.PI, 0.9 * Math.PI);
    } else {
      ctx.moveTo(-12, 26); ctx.lineTo(12, 26);
    }
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  };

  T3.drawForceVector = function(ctx, x1, y1, x2, y2, color, progress = 1) {
    if (progress <= 0.01) return;
    const cx = lerp(x1, x2, progress), cy = lerp(y1, y2, progress);
    const ang = Math.atan2(y2 - y1, x2 - x1), head = 28;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = T3.PALETTE.ink;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    const px = -Math.sin(ang) * 12, py = Math.cos(ang) * 12;
    const nx = cx - Math.cos(ang) * head, ny = cy - Math.sin(ang) * head;
    ctx.beginPath();
    ctx.moveTo(x1 + px, y1 + py);
    ctx.lineTo(nx + px, ny + py);
    ctx.lineTo(nx + px * 2.1, ny + py * 2.1);
    ctx.lineTo(cx, cy);
    ctx.lineTo(nx - px * 2.1, ny - py * 2.1);
    ctx.lineTo(nx - px, ny - py);
    ctx.lineTo(x1 - px, y1 - py);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  };

  T3.drawXrayHousing = function(ctx, x, y, w, h, r = 20) {
    ctx.save();
    ctx.fillStyle = T3.PALETTE.xrayFill;
    ctx.strokeStyle = T3.PALETTE.xrayEdge;
    ctx.lineWidth = 4;
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill(); ctx.stroke();
    ctx.restore();
  };
})();
