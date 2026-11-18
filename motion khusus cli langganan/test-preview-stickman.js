const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runPreview() {
  const previewDir = path.join(__dirname, 'preview_frames');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });

  const htmlUrl = 'file://' + path.join(__dirname, 'build_stickman', 'index.html').replace(/\\/g, '/');
  console.log('Loading page:', htmlUrl);
  await page.goto(htmlUrl);

  const testTimestamps = [
    { name: 'f_15_scene1_exterior.png', time: 15.0 },
    { name: 'f_50_scene2_meeting_letter.png', time: 50.0 },
    { name: 'f_90_scene3_snowball_stamp.png', time: 90.0 },
    { name: 'f_130_scene4_podium_vacant_chair.png', time: 130.0 },
    { name: 'f_165_scene5_constitutional_steps.png', time: 165.0 },
    { name: 'f_195_scene6_sunset_conclusion.png', time: 195.0 }
  ];

  for (const item of testTimestamps) {
    console.log(`Rendering ${item.name} at ${item.time}s...`);
    await page.evaluate((t) => window.seekTo(t), item.time);
    const outPath = path.join(previewDir, item.name);
    await page.screenshot({ path: outPath });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
  console.log('Visual QA previews complete.');
}

runPreview().catch(err => {
  console.error('Error during preview render:', err);
  process.exit(1);
});
