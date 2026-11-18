import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 202.0 # sedikit lebih panjang dari 201.44s

t = np.linspace(0, DUR, int(SR * DUR), endpoint=False)

# Chords (Frekuensi dasar dalam Hz):
# F maj: F3 (174.61), A3 (220.0), C4 (261.63)
# C maj: C3 (130.81), E3 (164.81), G3 (196.0)
# D min: D3 (146.83), F3 (174.61), A3 (220.0)
# Bb maj: Bb2 (116.54), D3 (146.83), F3 (174.61)

chords = [
    [174.61, 220.00, 261.63, 349.23], # F
    [130.81, 164.81, 196.00, 261.63], # C
    [146.83, 174.61, 220.00, 293.66], # Dm
    [116.54, 146.83, 174.61, 233.08]  # Bb
]

chord_duration = 4.0 # 4 detik per chord (tempo santai)
num_repeats = int(np.ceil(DUR / (len(chords) * chord_duration)))

wave_l = np.zeros(len(t))
wave_r = np.zeros(len(t))

chord_idx = 0
for r in range(num_repeats):
    for c in chords:
        start_t = chord_idx * chord_duration
        end_t = min(DUR, (chord_idx + 1) * chord_duration)
        if start_t >= DUR:
            break
            
        start_sample = int(start_t * SR)
        end_sample = int(end_t * SR)
        dur_samples = end_sample - start_sample
        
        chord_t = np.linspace(0, dur_samples / SR, dur_samples, endpoint=False)
        
        # Envelope ADSR lembut
        attack = int(0.6 * SR)
        release = int(0.8 * SR)
        env = np.ones(dur_samples)
        if dur_samples > attack + release:
            env[:attack] = np.linspace(0, 1, attack)
            env[-release:] = np.linspace(1, 0, release)
            
        # Synthesize voices with subtle chorus & stereo detune
        tone_l = np.zeros(dur_samples)
        tone_r = np.zeros(dur_samples)
        for freq in c:
            # Main fundamental + warm overtones
            tone_l += 0.4 * np.sin(2 * np.pi * freq * chord_t)
            tone_l += 0.2 * np.sin(2 * np.pi * (freq * 2) * chord_t)
            tone_l += 0.1 * np.sin(2 * np.pi * (freq * 1.002) * chord_t) # slight detune
            
            tone_r += 0.4 * np.sin(2 * np.pi * freq * chord_t)
            tone_r += 0.2 * np.sin(2 * np.pi * (freq * 2) * chord_t)
            tone_r += 0.1 * np.sin(2 * np.pi * (freq * 0.998) * chord_t) # slight detune
            
        wave_l[start_sample:end_sample] += tone_l * env
        wave_r[start_sample:end_sample] += tone_r * env
        
        chord_idx += 1

# Warm lowpass filter (menjaga vokal berita jernih di rentang 800Hz - 4kHz)
sos = butter(4, 750, 'low', fs=SR, output='sos')
wave_l = sosfilt(sos, wave_l)
wave_r = sosfilt(sos, wave_r)

# Normalize volume ke -22 dBFS agar menjadi karpet musik latar lembut
stereo = np.vstack([wave_l, wave_r]).T
peak = np.max(np.abs(stereo))
if peak > 0:
    stereo = (stereo / peak) * 0.12 # ~ -18 dB

sf.write('d:/berjan/motion/bgm_news_ambient.wav', stereo, SR)
print("Saved soft news ambient BGM: d:/berjan/motion/bgm_news_ambient.wav")
