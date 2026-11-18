const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve('./preview_frames');
const HTML_PATH = path.resolve('./build_video/index.html');

const KEYFRAMES = [
  { t: 8.0, name: 'f_8.png', scene: 'Scene 1: Hook & Pembuka' },
  { t: 25.0, name: 'f_25.png', scene: 'Scene 2: Tekanan Darah & Anatomi' },
  { t: 50.0, name: 'f_50.png', scene: 'Scene 3: 5 Komponen' },
  { t: 75.0, name: 'f_75.png', scene: 'Scene 4: Manset Mengembang & Arteri Terjepit' },
  { t: 110.0, name: 'f_110.png', scene: 'Scene 5: Osilometri & Amplitudo' },
  { t: 135.0, name: 'f_135.png', scene: 'Scene 6: Hasil di Layar & Kategori' },
  { t: 158.0, name: 'f_158.png', scene: 'Scene 7: 4 Tips Akurasi' },
  { t: 170.0, name: 'f_170.png', scene: 'Scene 8: Outro & Disclaimer' }
];

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Meluncurkan Chromium headless untuk Visual QA keyframes...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const fileUrl = `file://${HTML_PATH.replace(/\\/g, '/')}`;
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  for (const kf of KEYFRAMES) {
    await page.evaluate((timeSec) => {
      window.seekTo(timeSec);
    }, kf.t);

    const outPath = path.join(OUT_DIR, kf.name);
    await page.screenshot({ path: outPath, type: 'png' });
    console.log(`Rendered: ${kf.name} (t=${kf.t}s) - ${kf.scene}`);
  }

  await browser.close();
  console.log('Semua frame uji berhasil dirender!');
})();
