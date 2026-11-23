import whisper
import json

audio_path = r"c:\Users\BRKH STUDIO\Downloads\Generated Audio November 23, 2026 - 6_10PM.wav"
model = whisper.load_model('base')
res = model.transcribe(audio_path, language='id', word_timestamps=True)

segments = []
for s in res['segments']:
    segments.append({
        'start': s['start'],
        'end': s['end'],
        'text': s['text'],
        'words': [{'word': w['word'], 'start': w['start'], 'end': w['end']} for w in s.get('words', [])]
    })

with open("motion/temp_audio_align.json", "w", encoding="utf-8") as f:
    json.dump(segments, f, indent=2, ensure_ascii=False)

print(f"ALIGNMENT_DONE: {len(segments)} segments")
