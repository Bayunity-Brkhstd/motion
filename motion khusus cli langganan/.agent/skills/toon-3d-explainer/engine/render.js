// node render.js dist/clip.html out/clip.mp4 [fps]
const {chromium} = require('playwright');
const {spawn} = require('child_process');
const path = require('path');

(async () => {
  const [html, out, fpsArg] = process.argv.slice(2);
  const FPS = !fpsArg ? 30 : +fpsArg;
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  await p.goto('file://' + path.resolve(html) + '?render');
  await p.evaluate(() => document.fonts.ready);
  const info = await p.evaluate(() => ({
    T: window.DURATION,
    W: document.getElementById('stage').offsetWidth,
    H: document.getElementById('stage').offsetHeight
  }));
  await p.setViewportSize({width: info.W, height: info.H});
  const N = Math.round(info.T * FPS), K = 4, sub = 1 / (FPS * 2 * K);
  const vf = `format=gbrap,tmix=frames=4:weights='1 1 1 1',select='eq(mod(n\\,4)\\,3)',setpts=N/(${FPS})/TB`;
  const ff = spawn('ffmpeg', [
    '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS * 4),
    '-c:v', 'png', '-i', '-', '-vf', vf, '-r', String(FPS),
    '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out
  ]);
  let ffCode = null;
  const closed = new Promise(r => ff.on('close', c => { ffCode = c; r(); }));
  for (let f = 0; f < N && ffCode === null; f++) {
    for (let k = 0; k < K && ffCode === null; k++) {
      const t = Math.max(0, f / FPS + (k - 1.5) * sub);
      await p.evaluate(t => window.seek(t), t);
      const buf = await p.screenshot({type: 'png'});
      if (!ff.stdin.write(buf)) await Promise.race([new Promise(r => ff.stdin.once('drain', r)), closed]);
    }
  }
  ff.stdin.end(); await closed; await b.close();
  if (ffCode !== 0) process.exit(1);
  console.log('rendered', out, N, 'frames');
})();
