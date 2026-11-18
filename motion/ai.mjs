// kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id · Lisensi Nonkomersial Maliki Studio 1.0 (alat/LISENSI.md): dilarang dijual ulang.
// Panggil AI milik pengguna (BYOK): Gemini, OpenAI-compatible/Ollama, atau langganan lewat CLI resmi (Claude Code/Codex/OpenCode).
// Dipakai bersama oleh naskah.mjs (naskah) dan gambar.mjs (SVG objek per adegan).
import {readFileSync, existsSync, mkdtempSync, rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {tmpdir, homedir} from 'node:os';

export const berhenti = (m) => {
  console.error(m);
  // langkah opsional (gambar.mjs) menyetel globalThis.__lunak: gagal → lanjut tanpa menggagalkan video
  process.exit(globalThis.__lunak ? 0 : 1);
};

export function bacaEnv() {
  const env = {};
  if (existsSync('.env')) {
    for (const baris of readFileSync('.env', 'utf8').split('\n')) {
      const m = baris.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
  for (const [k, v] of Object.entries(process.env)) if (k in env || /_(API_KEY|API_KEYS|MODEL|BASE_URL)$|^(OPENCODE|CLAUDE_CODE|CODEX)_MODEL$/.test(k)) env[k] = v;
  return env;
}

export function ambilDaftarGeminiKeys(env) {
  const raw = env.GEMINI_API_KEYS || env.GEMINI_API_KEY || '';
  return raw.split(/[\r\n,]+/).map((k) => k.trim()).filter(Boolean);
}

let indeksKunciGemini = 0;

export async function tanyaAI(penyedia, prompt, env, tugas = 'menulis naskah') {
  if (penyedia === 'gemini') {
    const daftarKunci = ambilDaftarGeminiKeys(env);
    if (!daftarKunci.length) berhenti('Isi GEMINI_API_KEY di .env (gratis: aistudio.google.com/apikey)');
    const {GoogleGenAI} = await import('@google/genai');
    // model utama, lalu cadangan bertier gratis (aistudio.google.com/docs/pricing, 13 Nov 2026)
    const urutan = [...new Set([env.GEMINI_MODEL ?? 'gemini-3.8-flash', 'gemini-3.8-flash', 'gemini-3.6-flash',
      'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'])];
    const totalKunci = daftarKunci.length;
    let pesan = '';

    for (let percobaanKunci = 0; percobaanKunci < totalKunci; percobaanKunci++) {
      const idx = (indeksKunciGemini + percobaanKunci) % totalKunci;
      const apiKeyAktif = daftarKunci[idx];
      const nomorKey = idx + 1;
      const ai = new GoogleGenAI({apiKey: apiKeyAktif, httpOptions: {timeout: 90_000}});

      for (const model of urutan) {
        for (let coba = 0; coba < 2; coba++) {
          try {
            const r = await ai.models.generateContent({model, contents: prompt});
            indeksKunciGemini = (idx + 1) % totalKunci;
            if (model !== urutan[0] || totalKunci > 1) {
              console.log(`• Berhasil memakai Gemini Key #${nomorKey}${totalKunci > 1 ? ' (Mode Rolling)' : ''} (model: ${model}).`);
            }
            return r.text ?? '';
          } catch (e) {
            const kode = e?.status ?? e?.code;
            pesan = `Key #${nomorKey} (${model}): ${kode ?? e?.name} ${String(e?.message ?? '').slice(0, 160)}`;
            if ([400, 401, 403].includes(kode)) {
              console.log(`• Gemini Key #${nomorKey} ditolak (${kode}). Mencoba key berikutnya…`);
              break;
            }
            if (kode === 429 || /quota|rate limit|resource_exhausted/i.test(String(e?.message ?? ''))) {
              console.log(`• Gemini Key #${nomorKey} kena limit/kuota 429 (${model}). Failover beralih ke key berikutnya…`);
              break;
            }
            console.log(`• Gemini Key #${nomorKey} ${model} sibuk (${kode ?? e?.name}), mencoba lagi…`);
            if (!kode) break;
            await new Promise((r) => setTimeout(r, 2000 * (coba + 1)));
          }
        }
      }
    }
    berhenti('Semua API Key Gemini sedang sibuk atau kuota habis (HTTP 429). Coba lagi nanti.\n' + pesan);
  }
  if (penyedia === 'claude-code' || penyedia === 'codex' || penyedia === 'opencode' || penyedia === 'antigravity') {
    // Pakai langganan lewat CLI resmi yang sudah login (Claude Pro/Max → Claude Code, ChatGPT Plus/Pro → Codex, Antigravity → agy)
    const nama = {'claude-code': 'claude', codex: 'codex', opencode: 'opencode', antigravity: 'agy'}[penyedia];
    const label = {claude: 'Claude Code', codex: 'Codex', opencode: 'OpenCode', agy: 'Antigravity CLI'}[nama];
    const WIN = process.platform === 'win32';
    const calon = [
      join(homedir(), '.cheat-clip-and-motion', 'cli', 'bin', nama), join(homedir(), '.cheat-clip-and-motion', 'cli', nama + '.cmd'),
      join(homedir(), '.studio-maliki', 'cli', 'bin', nama), join(homedir(), '.studio-maliki', 'cli', nama + '.cmd'),
      join(homedir(), '.gemini', 'bin', WIN ? 'agy.exe' : 'agy'),
      join(homedir(), '.local', 'bin', nama), `/opt/homebrew/bin/${nama}`, `/usr/local/bin/${nama}`,
      join(homedir(), '.npm-global', 'bin', nama)];
    const cari = spawnSync(WIN ? 'where' : 'which', [nama], {encoding: 'utf8'});
    const cli = (cari.status === 0 && cari.stdout.split(/\r?\n/)[0].trim()) || calon.find((c) => existsSync(c));
    if (!cli) berhenti(`CLI '${label}' belum terpasang. Pasang lalu login sekali di Terminal, kemudian coba lagi.`);
    const tmp = mkdtempSync(join(tmpdir(), 'studio-'));
    const envBersih = {...process.env};
    for (const k of ['ANTHROPIC_API_KEY', 'ANTHROPIC_AUTH_TOKEN', 'OPENAI_API_KEY', 'CODEX_API_KEY']) delete envBersih[k];
    // OpenCode bisa langsung memakai kunci Gemini yang sudah disimpan (nama variabel yang ia baca)
    if (nama === 'opencode' && env.GEMINI_API_KEY && !envBersih.GOOGLE_GENERATIVE_AI_API_KEY) envBersih.GOOGLE_GENERATIVE_AI_API_KEY = env.GEMINI_API_KEY;
    const keluar = join(tmp, 'jawab.txt');
    const args = nama === 'claude'
      ? ['-p', '--tools', '', '--output-format', 'text', '--no-session-persistence',
        ...(env.CLAUDE_CODE_MODEL ? ['--model', env.CLAUDE_CODE_MODEL] : [])]
      : nama === 'codex'
        ? ['exec', '--skip-git-repo-check', '-o', keluar, ...(env.CODEX_MODEL ? ['--model', env.CODEX_MODEL] : []), '-']
        : nama === 'agy'
          ? ['--output-format', 'text', ...(env.ANTIGRAVITY_MODEL ? ['--model', env.ANTIGRAVITY_MODEL] : []), '-p', prompt]
          : ['run', '--agent', 'plan', ...(env.OPENCODE_MODEL ? ['--model', env.OPENCODE_MODEL] : [])];
    console.log(`• Meminta ${label} (langganan) ${tugas}…`);
    const r = spawnSync(cli, args, {input: nama === 'agy' ? undefined : prompt, encoding: 'utf8', cwd: tmp, env: envBersih, timeout: 600_000,
      shell: WIN && /\.cmd$/i.test(cli)});
    const teks = existsSync(keluar) ? readFileSync(keluar, 'utf8') : r.stdout;
    rmSync(tmp, {recursive: true, force: true});
    if (r.status !== 0) berhenti(`${nama} gagal. Pastikan sudah login dan kuota langganan masih ada.\n${(r.stderr || r.stdout || '').slice(-600)}`);
    return teks;
  }
  if (penyedia === 'openai') {
    const url = (env.OPENAI_BASE_URL ?? 'http://localhost:11434/v1').replace(/\/$/, '') + '/chat/completions';
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${env.OPENAI_API_KEY || 'ollama'}`},
      body: JSON.stringify({model: env.OPENAI_MODEL ?? 'gemma3:4b', messages: [{role: 'user', content: prompt}]}),
    });
    if (!res.ok) berhenti(`AI ${url} membalas ${res.status}: ${await res.text()}`);
    return (await res.json()).choices[0].message.content;
  }
  berhenti(`Penyedia AI tidak dikenal: ${penyedia} (pilih gemini, openai, claude-code, codex, opencode, antigravity)`);
}
