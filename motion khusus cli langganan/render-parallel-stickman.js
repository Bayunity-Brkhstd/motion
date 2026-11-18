const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const TOTAL_DURATION = 201.44;
const FPS = 30;
const TOTAL_FRAMES = Math.ceil(TOTAL_DURATION * FPS); // 6044 frames
const NUM_WORKERS = 4;
const FRAMES_DIR = path.join(__dirname, 'frames_stickman');

if (isMainThread) {
  if (!fs.existsSync(FRAMES_DIR)) {
    fs.mkdirSync(FRAMES_DIR, { recursive: true });
  }

  console.log(`=== STARTING PARALLEL STICKMAN RENDER ===`);
  console.log(`Total duration: ${TOTAL_DURATION}s | FPS: ${FPS} | Total frames: ${TOTAL_FRAMES}`);
  console.log(`Spawning ${NUM_WORKERS} workers...`);

  const framesPerWorker = Math.ceil(TOTAL_FRAMES / NUM_WORKERS);
  let activeWorkers = NUM_WORKERS;
  const startTime = Date.now();

  for (let i = 0; i < NUM_WORKERS; i++) {
    const startFrame = i * framesPerWorker;
    const endFrame = Math.min((i + 1) * framesPerWorker - 1, TOTAL_FRAMES - 1);

    const worker = new Worker(__filename, {
      workerData: { workerId: i, startFrame, endFrame, fps: FPS, framesDir: FRAMES_DIR }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'progress') {
        const pct = ((msg.current / TOTAL_FRAMES) * 100).toFixed(1);
        if (msg.current % 300 === 0 || msg.current === msg.endFrame) {
          console.log(`[Worker ${msg.workerId}] Frame ${msg.current}/${msg.endFrame} (${pct}%)`);
        }
      } else if (msg.type === 'done') {
        activeWorkers--;
        console.log(`[Worker ${msg.workerId}] FINISHED range ${msg.startFrame}-${msg.endFrame}`);
        if (activeWorkers === 0) {
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`=== ALL WORKERS COMPLETE in ${elapsed}s ===`);
        }
      }
    });

    worker.on('error', (err) => {
      console.error(`Worker ${i} error:`, err);
    });
  }
} else {
  // Worker Thread
  const { workerId, startFrame, endFrame, fps, framesDir } = workerData;

  (async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    });

    const htmlPath = 'file://' + path.join(__dirname, 'build_stickman', 'index.html').replace(/\\/g, '/');
    await page.goto(htmlPath);

    for (let f = startFrame; f <= endFrame; f++) {
      const t = f / fps;
      await page.evaluate((time) => window.seekTo(time), t);

      const frameFilename = `frame_${String(f).padStart(6, '0')}.png`;
      const outPath = path.join(framesDir, frameFilename);
      await page.screenshot({ path: outPath, type: 'png' });

      parentPort.postMessage({ type: 'progress', workerId, current: f, endFrame });
    }

    await browser.close();
    parentPort.postMessage({ type: 'done', workerId, startFrame, endFrame });
  })().catch(err => {
    console.error(`Worker ${workerId} uncaught error:`, err);
    process.exit(1);
  });
}
