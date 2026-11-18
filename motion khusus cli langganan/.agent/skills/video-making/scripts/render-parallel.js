const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Konfigurasi via argumen CLI atau default
const FPS = parseInt(process.env.FPS || '30', 10);
const DURATION = parseFloat(process.env.DURATION || '60');
const WORKERS = parseInt(process.env.WORKERS || '2', 10);
const HTML_PATH = path.resolve(process.env.HTML_PATH || './build_video/index.html');
const OUT_DIR = path.resolve(process.env.OUT_DIR || './build_video/frames');
const AUDIO_PATH = process.env.AUDIO_PATH ? path.resolve(process.env.AUDIO_PATH) : null;
const FINAL_MP4 = path.resolve(process.env.FINAL_MP4 || './final_video.mp4');

const TOTAL_FRAMES = Math.ceil(FPS * DURATION);

async function renderChunk(workerId, startFrame, endFrame) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  // Format URL file cross-platform
  const fileUrl = HTML_PATH.startsWith('/') || /^[a-zA-Z]:/.test(HTML_PATH)
    ? `file://${HTML_PATH.replace(/\\/g, '/')}`
    : `file://${path.resolve(HTML_PATH).replace(/\\/g, '/')}`;

  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  for (let frame = startFrame; frame < endFrame; frame++) {
    const timeSec = frame / FPS;
    // Panggil fungsi deterministik di halaman web
    await page.evaluate((t) => {
      if (typeof window.seekTo === 'function') window.seekTo(t);
    }, timeSec);

    const frameName = `frame_${String(frame).padStart(6, '0')}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, frameName), type: 'png' });

    if (frame % 60 === 0) {
      fs.writeFileSync(
        path.join(OUT_DIR, `log_worker_${workerId}.txt`),
        `Worker ${workerId}: rendered ${frame}/${endFrame} (${Math.round(((frame - startFrame) / (endFrame - startFrame)) * 100)}%)\n`
      );
    }
  }

  await browser.close();
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const chunkSize = Math.ceil(TOTAL_FRAMES / WORKERS);
  const tasks = [];

  console.log(`Memulai render ${TOTAL_FRAMES} frame (${DURATION}s @ ${FPS}fps) dengan ${WORKERS} worker paralel...`);

  for (let w = 0; w < WORKERS; w++) {
    const start = w * chunkSize;
    const end = Math.min(start + chunkSize, TOTAL_FRAMES);
    if (start < end) {
      tasks.push(renderChunk(w, start, end));
    }
  }

  await Promise.all(tasks);
  console.log('Semua frame selesai dirender. Menggabungkan dengan FFmpeg...');

  const audioInput = AUDIO_PATH && fs.existsSync(AUDIO_PATH) ? `-i "${AUDIO_PATH}" -c:a aac -b:a 192k -shortest` : '';
  const ffmpegCmd = `ffmpeg -y -framerate ${FPS} -i "${path.join(OUT_DIR, 'frame_%06d.png')}" ${audioInput} -c:v libx264 -pix_fmt yuv420p -crf 18 "${FINAL_MP4}"`;
  
  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`Selesai! Video tersimpan di: ${FINAL_MP4}`);
})();
