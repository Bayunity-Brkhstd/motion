const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SAMPLE_RATE = 48000;

// --- 1. UTILITAS PENULIS FILE WAV (16-BIT STEREO PCM) ---
function writeWav(filePath, leftChannel, rightChannel) {
  const numSamples = leftChannel.length;
  const numChannels = 2;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM chunk size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const l = Math.max(-1, Math.min(1, leftChannel[i]));
    const r = Math.max(-1, Math.min(1, rightChannel[i]));
    buffer.writeInt16LE(Math.round(l * 32767), offset);
    buffer.writeInt16LE(Math.round(r * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(filePath, buffer);
}

// --- 2. MESIN SINTESIS EFEK SUARA (SFX) PROSEDURAL ---
function generateSfxSamples(type, durationSec = 0.5) {
  const len = Math.ceil(SAMPLE_RATE * durationSec);
  const out = new Float32Array(len);

  // Filter low-pass sederhana untuk melembutkan noise
  let lpState = 0;

  for (let i = 0; i < len; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / durationSec;
    let sample = 0;

    switch (type) {
      case 'pop': {
        // Suara pop lembut untuk kemunculan ikon/kartu UI
        const freq = 260 + 520 * Math.exp(-t * 45);
        const env = Math.exp(-t * 28) * Math.min(1, t / 0.004);
        sample = Math.sin(2 * Math.PI * freq * t) * env * 0.75;
        break;
      }

      case 'click': {
        // Klik mekanis tajam untuk tombol / indikator digital
        const env = Math.exp(-t * 140);
        const tone = Math.sin(2 * Math.PI * 1800 * t) * 0.5;
        const noise = (Math.random() * 2 - 1) * 0.5;
        sample = (tone + noise) * env * 0.65;
        break;
      }

      case 'whoosh': {
        // Transisi kamera isometrik atau pergeseran panel
        const env = Math.sin(Math.PI * progress) ** 1.8;
        const rawNoise = Math.random() * 2 - 1;
        // Cutoff filter menyapu naik lalu turun mengikuti kurva whoosh
        const cutoff = 0.015 + 0.14 * Math.sin(Math.PI * progress);
        lpState += cutoff * (rawNoise - lpState);
        sample = lpState * env * 1.4;
        break;
      }

      case 'chime': {
        // Nada harmonik bersih untuk kesimpulan / highlight data penting
        const env = Math.exp(-t * 4.5) * Math.min(1, t / 0.01);
        const f1 = Math.sin(2 * Math.PI * 523.25 * t); // C5
        const f2 = Math.sin(2 * Math.PI * 659.25 * t) * 0.6; // E5
        const f3 = Math.sin(2 * Math.PI * 1046.5 * t) * 0.35; // C6
        sample = (f1 + f2 + f3) * env * 0.35;
        break;
      }

      case 'pulse': {
        // Bunyi bip/detak alat medis atau sensor teknis
        const env = Math.exp(-t * 22) * Math.min(1, t / 0.005);
        const tone = Math.sin(2 * Math.PI * 880 * t) + 0.3 * Math.sin(2 * Math.PI * 1760 * t);
        sample = tone * env * 0.45;
        break;
      }

      case 'hum': {
        // Dengung mesin/pompa halus (misalnya manset tensimeter mengembang)
        const fadeIn = Math.min(1, t / 0.15);
        const fadeOut = Math.min(1, (durationSec - t) / 0.2);
        const env = Math.max(0, fadeIn * fadeOut);
        const motor = Math.sin(2 * Math.PI * 110 * t) * 0.5 + Math.sin(2 * Math.PI * 165 * t) * 0.25;
        const air = (Math.random() * 2 - 1) * 0.08;
        lpState += 0.04 * (air - lpState);
        sample = (motor + lpState) * env * 0.35;
        break;
      }

      default: {
        const env = Math.exp(-t * 25);
        sample = Math.sin(2 * Math.PI * 440 * t) * env * 0.5;
      }
    }

    out[i] = sample;
  }

  return out;
}

// --- 3. SINTESIS MUSIK LATAR AMBIENT EDUKASI (STEREO PAD) ---
function generateAmbientMusic(totalDurationSec, outPath) {
  const totalSamples = Math.ceil(SAMPLE_RATE * totalDurationSec);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  // Progresi akor ambient hangat: Cmaj9 -> Am9 -> Fmaj7 -> G6 (masing-masing 4 detik)
  const chords = [
    [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
    [110.00, 164.81, 220.00, 246.94, 261.63], // Am9
    [87.31,  130.81, 174.61, 220.00, 329.63], // Fmaj7
    [98.00,  146.83, 196.00, 246.94, 329.63], // G6
  ];
  const chordDuration = 4.0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Fade in awal 1.5 detik & fade out akhir 2.5 detik
    const masterFadeIn = Math.min(1, t / 1.5);
    const masterFadeOut = Math.min(1, Math.max(0, (totalDurationSec - t) / 2.5));
    const masterEnv = masterFadeIn * masterFadeOut;

    const chordPos = (t / chordDuration) % chords.length;
    const chordIdx = Math.floor(chordPos);
    const chordLocalT = (t % chordDuration) / chordDuration;
    // Kurva crossfade lembut antar pergantian akor
    const chordEnv = Math.sin(Math.PI * chordLocalT) ** 0.35;

    const notes = chords[chordIdx];
    let sumL = 0;
    let sumR = 0;

    for (let n = 0; n < notes.length; n++) {
      const freq = notes[n];
      // Sedikit detune kiri-kanan untuk efek ruang stereo yang lebar
      const oscL = Math.sin(2 * Math.PI * (freq * 0.9985) * t);
      const oscR = Math.sin(2 * Math.PI * (freq * 1.0015) * t);
      const harmonic = 0.2 * Math.sin(2 * Math.PI * (freq * 2) * t);

      const weight = n === 0 ? 0.35 : 0.18;
      sumL += (oscL + harmonic) * weight;
      sumR += (oscR + harmonic) * weight;
    }

    // LFO lambat untuk gerakan lembut
    const lfo = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.25 * t);
    left[i] = sumL * chordEnv * masterEnv * lfo * 0.35;
    right[i] = sumR * chordEnv * masterEnv * lfo * 0.35;
  }

  writeWav(outPath, left, right);
}

// --- 4. EKSEKUSI & MIXING DENGAN VOICE OVER VIA FFMPEG ---
(function main() {
  const cuesFile = process.argv[2] || './build_video/audio_cues.json';
  const voFile = process.argv[3] || './vo_elevenlabs.mp3';
  const outputMaster = process.argv[4] || './build_video/master_audio.wav';

  if (!fs.existsSync(cuesFile)) {
    console.error(`File cue sheet tidak ditemukan: ${cuesFile}`);
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(cuesFile, 'utf-8'));
  let durationSec = config.duration || 60;

  // Deteksi otomatis durasi VO jika file VO tersedia
  if (fs.existsSync(voFile)) {
    const probeOut = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${voFile}"`
    ).toString().trim();
    const voDur = parseFloat(probeOut);
    if (!isNaN(voDur) && voDur > 0) {
      durationSec = Math.ceil(voDur + 1.5); // Tambah buffer 1.5 detik di akhir untuk outro
    }
  }

  const outDir = path.dirname(outputMaster);
  fs.mkdirSync(outDir, { recursive: true });

  // A. Bangun trek SFX penuh sesuai timeline
  const totalSamples = Math.ceil(SAMPLE_RATE * durationSec);
  const sfxL = new Float32Array(totalSamples);
  const sfxR = new Float32Array(totalSamples);

  for (const cue of config.cues || []) {
    const startSample = Math.floor((cue.time || 0) * SAMPLE_RATE);
    const dur = cue.duration || (cue.type === 'hum' ? 1.5 : cue.type === 'whoosh' ? 0.55 : 0.45);
    const gain = cue.gain !== undefined ? cue.gain : 0.7;
    const pan = Math.max(-1, Math.min(1, cue.pan || 0)); // -1 kiri, 0 tengah, +1 kanan

    const samples = generateSfxSamples(cue.type, dur);
    const gainL = gain * Math.cos(((pan + 1) * Math.PI) / 4);
    const gainR = gain * Math.sin(((pan + 1) * Math.PI) / 4);

    for (let i = 0; i < samples.length; i++) {
      const idx = startSample + i;
      if (idx >= 0 && idx < totalSamples) {
        sfxL[idx] += samples[i] * gainL;
        sfxR[idx] += samples[i] * gainR;
      }
    }
  }

  const sfxTrackPath = path.join(outDir, 'track_sfx.wav');
  writeWav(sfxTrackPath, sfxL, sfxR);

  // B. Bangun trek musik ambient
  const musicTrackPath = path.join(outDir, 'track_music.wav');
  generateAmbientMusic(durationSec, musicTrackPath);

  // C. Mixing akhir dengan FFmpeg (VO + SFX + Musik dengan Auto-Ducking)
  if (fs.existsSync(voFile)) {
    // Sidechaincompress menurunkan volume musik otomatis setiap kali suara VO masuk
    const filterComplex = [
      `[0:a]aresample=${SAMPLE_RATE},volume=1.05,asplit=2[vo_main][vo_sc]`,
      `[1:a]aresample=${SAMPLE_RATE},volume=0.85[sfx]`,
      `[2:a]aresample=${SAMPLE_RATE},volume=0.22[bgm_raw]`,
      `[bgm_raw][vo_sc]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=350[bgm_ducked]`,
      `[vo_main][sfx][bgm_ducked]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.95[out]`
    ].join(';');

    const cmd = `ffmpeg -y -i "${voFile}" -i "${sfxTrackPath}" -i "${musicTrackPath}" -filter_complex "${filterComplex}" -map "[out]" -ar ${SAMPLE_RATE} -ac 2 "${outputMaster}"`;
    execSync(cmd, { stdio: 'inherit' });
  } else {
    // Jika tanpa VO, gabungkan SFX + Musik saja
    const cmd = `ffmpeg -y -i "${sfxTrackPath}" -i "${musicTrackPath}" -filter_complex "[0:a]volume=0.9[s];[1:a]volume=0.35[m];[s][m]amix=inputs=2:duration=longest:normalize=0[out]" -map "[out]" -ar ${SAMPLE_RATE} -ac 2 "${outputMaster}"`;
    execSync(cmd, { stdio: 'inherit' });
  }

  console.log(`Master audio berhasil dibuat di: ${outputMaster} (Durasi: ${durationSec}s)`);
})();
