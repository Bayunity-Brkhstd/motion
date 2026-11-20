// node beats.js dist/clip.html out/sheet.png t1 t2 ...
const {chromium} = require('playwright');
const path = require('path');
const os = require('os');
const {execFileSync} = require('child_process');
const fs = require('fs');

(async () => {
  const [html, out, ...ts] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 1080, height: 1920}});
  await p.goto('file://' + path.resolve(html) + '?render');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toon-beats-'));
  try {
    for (let i = 0; i < ts.length; i++) {
      await p.evaluate(t => window.seek(t), +ts[i]);
      await p.screenshot({path: path.join(dir, `${String(i).padStart(3, '0')}.png`)});
    }
    await b.close();
    const cols = Math.min(4, ts.length), rows = Math.ceil(ts.length / cols);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', path.join(dir, '%03d.png'), '-vf', `scale=540:-1,tile=${cols}x${rows}:padding=6:color=black`, '-frames:v', '1', out]);
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
})();
