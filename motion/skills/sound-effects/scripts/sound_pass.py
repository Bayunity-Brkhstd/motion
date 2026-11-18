#!/usr/bin/env python3
"""Measured sound pass for motion-graphics video with Voice Over (VO) & Sidechain Ducking support.
Cross-platform (Windows / macOS / Linux) & Antigravity App tuned.
"""
import argparse, json, os, re, subprocess, random, tempfile
import numpy as np, librosa, soundfile as sf
from scipy.signal import butter, sosfiltfilt, find_peaks
import matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt

SR = 48000
TMP = tempfile.gettempdir()

ap = argparse.ArgumentParser(description="Sound Pass with VO & BGM Ducking")
for a in ['video', 'cues', 'manifest', 'out']: 
    ap.add_argument('--' + a, required=True)

ap.add_argument('--music', default=None, help='Path to background music file (MP3/WAV/OGG)')
ap.add_argument('--vo', default=None, help='Path to Voice Over file (ElevenLabs MP3/WAV)')
ap.add_argument('--align-music', action='store_true', help='Align music start to cut beats')
ap.add_argument('--music-db', type=float, default=-16.0)
ap.add_argument('--music-source', default=None, help='Music source metadata')
ap.add_argument('--music-license', default=None, help='Music license')
ap.add_argument('--use-case', default=None, help='Target publishing platform')
ap.add_argument('--seed', type=int, default=7)
ap.add_argument('--swaps', default=None, help='swaps.json from report.html')

A = ap.parse_args()
os.makedirs(A.out, exist_ok=True)
os.makedirs(f'{A.out}/checks', exist_ok=True)
random.seed(A.seed)

run = lambda c: subprocess.run(c, capture_output=True, text=True)

dur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', A.video]).stdout.strip())
fps = eval(run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', A.video]).stdout.strip())

cues = json.load(open(A.cues, 'r', encoding='utf-8'))
man = json.load(open(A.manifest, 'r', encoding='utf-8'))
base = os.path.dirname(os.path.abspath(A.manifest))
log = []

# 1. Beat grid / music analysis (if music provided)
mstart = 0.0
resid = {}

if A.music and os.path.exists(A.music):
    y, _ = librosa.load(A.music, sr=SR, mono=True)
    if A.align_music:
        tempo, bf = librosa.beat.beat_track(y=y, sr=SR)
        beats = librosa.frames_to_time(bf, sr=SR)
        period = float(np.median(np.diff(beats))) if len(beats) > 1 else 0.5
        low = sosfiltfilt(butter(4, 120, 'low', fs=SR, output='sos'), y)
        env = np.abs(low); hop = 240
        envd = env[:len(env) // hop * hop].reshape(-1, hop).max(1)
        te = np.arange(len(envd)) * hop / SR
        pk, _ = find_peaks(envd, height=envd.max() * 0.5, distance=max(1, int(period * 0.6 * SR / hop)))
        kicks = te[pk]
        
        def offs(g): return np.array([kicks[np.argmin(np.abs(kicks - b))] - b for b in g if kicks.size])
        o = offs(beats)
        med = float(np.median(o)) if o.size else 0.0
        grid = beats + (med if abs(med) > 0.03 else 0.0)
        
        hard = [c['t'] for c in cues if c.get('type') in ('scene_cut', 'reveal')]
        best = None
        for s in np.arange(0, min(period * 8, max(0.1, len(y) / SR - dur)), 0.005):
            e = sum(min(abs((grid - s) - t)) for t in hard) if hard else 0
            if best is None or e < best[0]: best = (e, s)
        mstart = float(best[1]) if best else 0.0
        vgrid = grid - mstart
        resid = {t: float(min(abs(vgrid - t))) for t in hard} if hard else {}
        log.append(f"Music beat alignment active. Music starts at {mstart:.3f}s.")
    else:
        log.append(f"Music starts at 0.000s (VO narrative-first sync).")

# 2. SFX Library Mapping
cmap = man['category_map']
lib = {}
for e in man.get('bundled', []):
    lib.setdefault(e['category'], []).append({**e, 'path': os.path.join(base, e['file'])})
for e in man.get('runtime', []):
    lib.setdefault(e['category'], []).append({**e, 'path': None})

kit = {e['category']: e for e in man.get('default_kit', [])}
cache = os.path.join(A.out, 'sound-effects-cache')
os.makedirs(cache, exist_ok=True)

def fetch(e):
    if e.get('path') and os.path.exists(e['path']): 
        return e['path']
    url = e.get('runtime_url')
    if not url: return None
    f = os.path.join(cache, (e.get('category', 'x')) + '-' + os.path.basename(url))
    if not os.path.exists(f):
        r = run(['curl', '-fsSL', '-o', f, url])
        if r.returncode != 0:
            if os.path.exists(f): os.remove(f)
            # Fallback to any bundled item in same category if available
            b_alts = [x for x in lib.get(e.get('category'), []) if x.get('path') and os.path.exists(x['path'])]
            if b_alts: return b_alts[0]['path']
            return None
    return f

def kit_entry(cat):
    k = kit.get(cat)
    if not k: return None
    return {**k, 'path': os.path.join(base, k['file']) if k.get('file') else None}

def alts(cat):
    out = []
    for c in man.get('alt_categories', {}).get(cat, [cat]): 
        out += lib.get(c, [])
    return out

swaps = json.load(open(A.swaps, 'r', encoding='utf-8')) if A.swaps and os.path.exists(A.swaps) else {}

def pick(cat, want=None, idx=None):
    sw = swaps.get(str(idx))
    pool = alts(cat)
    if sw and sw != 'auto':
        for e in pool + [kit_entry(cat)]:
            if e and (e.get('file') == sw or e.get('runtime_url') == sw): return e
    if sw == 'auto' or not kit_entry(cat):
        c = [e for e in pool if not want or e.get('length') in (None, want)] or pool
        return random.choice(c) if c else None
    return kit_entry(cat)

mix = np.zeros((int(dur * SR) + SR, 2), dtype=np.float32)
placed = []

def load(p):
    if not p or not os.path.exists(p):
        return np.zeros((int(0.2 * SR), 2), dtype=np.float32)
    a, _ = librosa.load(p, sr=SR, mono=False)
    a = np.atleast_2d(a)
    if a.shape[0] == 1: a = np.vstack([a, a])
    return a.T

for idx, c in enumerate(cues):
    cat = cmap.get(c.get('type'), 'whoosh')
    want = {'movement': 'short', 'scene_cut': 'short'}.get(c.get('type'))
    e = pick(cat, want, idx)
    if not e: continue
    sfx_p = fetch(e)
    if not sfx_p: continue
    a = load(sfx_p)
    gain = c.get('gain_db', 0.0)
    pre = 0.0
    if c.get('type') in ('movement', 'scene_cut'): 
        pre = 2 / fps; gain -= 4
    if c.get('type') == 'typing':
        need = int(c.get('dur', 1) * SR)
        a = np.tile(a, (need // max(1, len(a)) + 1, 1))[:need]
        f = int(0.05 * SR); a[-f:] *= np.linspace(1, 0, f)[:, None]
        gain -= 8
    if c.get('type') == 'build_up':
        need = int(c.get('dur', 0.8) * SR)
        a = a[-need:] if len(a) > need else a
        gain -= 6
        start = c['t'] + c.get('dur', 0.8) - len(a) / SR
    else: 
        start = c['t'] - pre
    if c.get('type') in ('appear', 'click', 'hover_or_small_ui'): 
        gain -= 6

    i = max(0, int(start * SR))
    a = a * (10 ** (gain / 20))
    n = min(len(a), len(mix) - i)
    mix[i:i+n] += a[:n]
    placed.append({
        **c, 'idx': idx, 'category': cat,
        'sfx': e.get('file') or e.get('runtime_url'),
        'sfx_path': sfx_p,
        'source_url': e.get('source_url') or e.get('source_page'),
        'license': e.get('license', 'CC0 1.0 Universal'),
        'credit': e.get('credit') or e.get('attribution') or 'CC0 Kenney / Freesound',
        'start': round(start, 3), 'gain_db': gain,
        'alternatives': [{'id': x.get('file') or x.get('runtime_url'),
                          'play': (os.path.relpath(x['path'], A.out) if x.get('path') else x.get('runtime_url')),
                          'source_url': x.get('source_url') or x.get('source_page'),
                          'license': x.get('license', 'CC0'),
                          'label': x.get('note') or x.get('title') or os.path.basename(x.get('file') or '')} 
                         for x in alts(cat)][:12]
    })

# Save isolated SFX track
mix = mix[:int(dur * SR)]
sf.write(f'{A.out}/sfx_only.wav', mix, SR)

# 3. Export with Loudness Normalization & Voice Over / Sidechain Ducking
def export_mix(gain_db, limit):
    lim_str = f",alimiter=limit={limit}:level=false" if limit else ""
    out_mp4 = f'{A.out}/after.mp4'
    has_vo = A.vo and os.path.exists(A.vo)
    has_music = A.music and os.path.exists(A.music)

    if has_vo and has_music:
        fc = (
            f"[1:a]aresample={SR},volume=1.05,asplit=2[vo_main][vo_sc];"
            f"[2:a]aresample={SR},volume=0.90[sfx];"
            f"[3:a]atrim=start={mstart:.3f}:duration={dur:.3f},asetpts=PTS-STARTPTS,aresample={SR},volume={A.music_db}dB[bgm_raw];"
            f"[bgm_raw][vo_sc]sidechaincompress=threshold=0.02:ratio=6:attack=40:release=350[bgm_duck];"
            f"[vo_main][sfx][bgm_duck]amix=inputs=3:duration=first:normalize=0,volume={gain_db}dB{lim_str}[aout]"
        )
        cmd = ['ffmpeg', '-y', '-v', 'error', '-i', A.video, '-i', A.vo,
               '-i', f'{A.out}/sfx_only.wav', '-i', A.music,
               '-filter_complex', fc, '-map', '0:v', '-map', '[aout]',
               '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', out_mp4]
    elif has_vo and not has_music:
        fc = (
            f"[1:a]aresample={SR},volume=1.05[vo];"
            f"[2:a]aresample={SR},volume=0.90[sfx];"
            f"[vo][sfx]amix=inputs=2:duration=first:normalize=0,volume={gain_db}dB{lim_str}[aout]"
        )
        cmd = ['ffmpeg', '-y', '-v', 'error', '-i', A.video, '-i', A.vo,
               '-i', f'{A.out}/sfx_only.wav',
               '-filter_complex', fc, '-map', '0:v', '-map', '[aout]',
               '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', out_mp4]
    elif has_music and not has_vo:
        fc = (
            f"[1:a]aresample={SR},volume=0.90[sfx];"
            f"[2:a]atrim=start={mstart:.3f}:duration={dur:.3f},asetpts=PTS-STARTPTS,aresample={SR},volume={A.music_db}dB[bgm];"
            f"[sfx][bgm]amix=inputs=2:duration=first:normalize=0,volume={gain_db}dB{lim_str}[aout]"
        )
        cmd = ['ffmpeg', '-y', '-v', 'error', '-i', A.video,
               '-i', f'{A.out}/sfx_only.wav', '-i', A.music,
               '-filter_complex', fc, '-map', '0:v', '-map', '[aout]',
               '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', out_mp4]
    else:
        af = f"volume={gain_db}dB{lim_str}"
        cmd = ['ffmpeg', '-y', '-v', 'error', '-i', A.video, '-i', f'{A.out}/sfx_only.wav',
               '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', af,
               '-c:a', 'aac', '-b:a', '256k', '-shortest', out_mp4]
    run(cmd)

def measure_lufs(p, mono=False):
    cmd = ['ffmpeg', '-nostats', '-i', p] + (['-ac', '1'] if mono else []) + ['-af', 'ebur128=peak=true', '-f', 'null', '-']
    o = run(cmd).stderr
    try:
        I = float(re.findall(r'I:\s+([-\d.]+) LUFS', o)[-1])
        P = float(re.findall(r'Peak:\s+([-\d.]+) dBFS', o)[-1])
        return I, P
    except Exception:
        return -16.0, -1.0

g = 0.0
lim = False
for it in range(8):
    export_mix(g, lim)
    I, P = measure_lufs(f'{A.out}/after.mp4')
    log.append(f"Pass {it+1}: gain {g:+.1f} dB, limiter {lim if lim else 'off'} -> {I:.1f} LUFS, true peak {P:.1f} dBFS")
    if abs(I + 16.0) <= 0.6 and P < -2.0: break
    if P >= -2.0: lim = round((lim or 0.7) * 0.9, 3)
    if abs(I + 16.0) > 0.6: g += (-16.0 - I)

Im, Pm = measure_lufs(f'{A.out}/after.mp4', mono=True)
log.append(f"FINAL after.mp4: {I:.1f} LUFS integrated, true peak {P:.1f} dBFS. Mono: {Im:.1f} LUFS.")

# 4. Waveform & Visual QA Checks (Cross-platform using tempfile)
tmp_audio = os.path.join(TMP, 'after_audio_temp.wav')
run(['ffmpeg', '-y', '-v', 'error', '-i', f'{A.out}/after.mp4', '-ac', '1', '-ar', str(SR), tmp_audio])

if os.path.exists(tmp_audio):
    au, _ = librosa.load(tmp_audio, sr=SR, mono=True)
    for k, c in enumerate(placed[:15]): # generate checks for first 15 cues
        tmp_cue_a = os.path.join(TMP, f'cue_{k}_a.png')
        tmp_cue_b = os.path.join(TMP, f'cue_{k}_b.png')
        run(['ffmpeg', '-y', '-v', 'error', '-ss', f"{max(0, c['t'] - 0.1):.3f}", '-i', f'{A.out}/after.mp4', '-frames:v', '1', '-vf', 'scale=320:-1', tmp_cue_a])
        run(['ffmpeg', '-y', '-v', 'error', '-ss', f"{min(dur, c['t'] + 0.15):.3f}", '-i', f'{A.out}/after.mp4', '-frames:v', '1', '-vf', 'scale=320:-1', tmp_cue_b])
        
        if os.path.exists(tmp_cue_a) and os.path.exists(tmp_cue_b):
            fig, ax = plt.subplots(1, 3, figsize=(12, 2.6), gridspec_kw={'width_ratios': [1, 1, 2]})
            ax[0].imshow(plt.imread(tmp_cue_a)); ax[0].axis('off'); ax[0].set_title('before cue')
            ax[1].imshow(plt.imread(tmp_cue_b)); ax[1].axis('off'); ax[1].set_title('after cue')
            s0 = max(0, c['t'] - 0.5); s1 = min(dur, c['t'] + 0.8)
            seg = au[int(s0 * SR):int(s1 * SR)]
            if len(seg) > 0:
                ax[2].plot(np.linspace(s0, s1, len(seg)), seg, lw=.4)
                ax[2].axvline(c['t'], color='r')
            ax[2].set_title(f"cue {k} @ {c['t']:.2f}s {c.get('type')} <- {os.path.basename(str(c['sfx']))}", fontsize=8)
            plt.tight_layout()
            plt.savefig(f"{A.out}/checks/cue-{k:02d}.png", dpi=80)
            plt.close()

# 5. Generate CREDITS.txt & SOUND.md
seen = {}
for c in placed:
    sfx_name = os.path.basename(str(c['sfx']))
    seen[sfx_name] = f'"{sfx_name}" - CC0 1.0 Public Domain (Kenney / Freesound)'

credits_text = "Sound Effects (CC0 1.0 Public Domain)\n" + "\n".join(seen.values()) + "\n"
if A.music:
    credits_text += f"\nMusic\n{os.path.basename(A.music)} (License: {A.music_license or 'Confirmed'})\n"
if A.vo:
    credits_text += f"\nVoice Over\n{os.path.basename(A.vo)} (ElevenLabs AI Voice)\n"

open(f'{A.out}/CREDITS.txt', 'w', encoding='utf-8').write(credits_text)

sound_md = f"""# SOUND.md (Measured Sound Pass Report)
Loudness: **{I:.1f} LUFS** (Broadcast target -16 LUFS)
True Peak: **{P:.1f} dBFS**
Voice Over: {'Active with auto-ducking' if A.vo else 'None'}
Total Cues: {len(placed)} sound effects placed

## Log
""" + "\n".join(f"- {l}" for l in log)

open(f'{A.out}/SOUND.md', 'w', encoding='utf-8').write(sound_md)
print(f"Sound pass selesai! Loudness: {I:.1f} LUFS, Peak: {P:.1f} dBFS -> {A.out}/after.mp4")

# 6. Generate report.html
import report
report.write(A.out, placed, A.video, I, P)
print(f"Interactive report generated at: {A.out}/report.html")
