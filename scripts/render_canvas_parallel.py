import asyncio
from playwright.async_api import async_playwright
import os
import subprocess
import time

HTML_FILE = os.path.abspath("build_canvas/animasi.html").replace("\\", "/")
FRAMES_DIR = os.path.abspath("build_canvas/frames").replace("\\", "/")
OUTPUT_MP4 = os.path.abspath("studio/hasil/video.mp4").replace("\\", "/")
AUDIO_VO = os.path.abspath("motion/public/audio_rumah_horor.wav").replace("\\", "/")
TOTAL_DURATION = 64.36  # detik
FPS = 30
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)

async def render_worker(worker_id, start_frame, end_frame):
    print(f"[Worker {worker_id}] Merender frame {start_frame} sampai {end_frame}...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1080, "height": 1920})
        await page.goto(f"file:///{HTML_FILE}")
        
        for f in range(start_frame, end_frame):
            t = f / FPS
            await page.evaluate(f"window.__draw({t})")
            frame_path = os.path.join(FRAMES_DIR, f"frame_{f:05d}.png")
            # Ambil screenshot canvas langsung untuk efisiensi
            canvas_el = await page.query_selector("#c")
            await canvas_el.screenshot(path=frame_path)
            
            if f % 150 == 0:
                print(f"[Worker {worker_id}] Progres: frame {f}/{end_frame}")
                
        await browser.close()
    print(f"[Worker {worker_id}] Selesai.")

async def main():
    os.makedirs(FRAMES_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUTPUT_MP4), exist_ok=True)
    
    num_workers = 4
    chunk = TOTAL_FRAMES // num_workers
    tasks = []
    
    start_time = time.time()
    for w in range(num_workers):
        sf = w * chunk
        ef = (w + 1) * chunk if w < num_workers - 1 else TOTAL_FRAMES
        tasks.append(render_worker(w + 1, sf, ef))
        
    await asyncio.gather(*tasks)
    render_time = time.time() - start_time
    print(f"Semua {TOTAL_FRAMES} frame selesai dirender dalam {render_time:.1f} detik.")
    
    # Gabung frame PNG + Audio VO via FFmpeg
    print("Menggabungkan frame dengan FFmpeg...")
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-framerate", str(FPS),
        "-i", os.path.join(FRAMES_DIR, "frame_%05d.png"),
        "-i", AUDIO_VO,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_MP4
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"Video MP4 berhasil disimpan ke: {OUTPUT_MP4}")

if __name__ == "__main__":
    asyncio.run(main())
