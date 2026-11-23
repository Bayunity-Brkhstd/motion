import asyncio
from playwright.async_api import async_playwright
import os
import subprocess
import time
import base64

HTML_FILE = os.path.abspath("build_canvas/animasi.html").replace("\\", "/")
FRAMES_DIR = os.path.abspath("build_canvas/frames").replace("\\", "/")
OUTPUT_MP4 = os.path.abspath("studio/hasil/video.mp4").replace("\\", "/")
AUDIO_VO = os.path.abspath("motion/public/audio_rumah_horor.wav").replace("\\", "/")
TOTAL_DURATION = 64.36  # detik
FPS = 30
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)

async def render_worker(worker_id, start_frame, end_frame):
    print(f"[Worker {worker_id}] Merender frame {start_frame} sampai {end_frame} ({end_frame - start_frame} frames)...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1080, "height": 1920})
        await page.goto(f"file:///{HTML_FILE}")
        
        # Pastikan tidak ada loop yang berjalan
        await page.evaluate("window.__is_headless = true;")
        
        batch_size = 50
        for f in range(start_frame, end_frame):
            t = f / FPS
            # Gambar secara deterministik dan ambil data PNG Base64 secara atomik
            b64_data = await page.evaluate(f"""() => {{
                window.__draw({t});
                return document.getElementById('c').toDataURL('image/png').slice(22);
            }}""")
            
            frame_path = os.path.join(FRAMES_DIR, f"frame_{f:05d}.png")
            with open(frame_path, "wb") as img_file:
                img_file.write(base64.b64decode(b64_data))
            
            if (f - start_frame) % 100 == 0 and f > start_frame:
                print(f"[Worker {worker_id}] Progres: frame {f}/{end_frame} (t={t:.2f}s)")
                
        await browser.close()
    print(f"[Worker {worker_id}] Selesai.")

async def main():
    os.makedirs(FRAMES_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(OUTPUT_MP4), exist_ok=True)
    
    # Hapus frame lama agar tidak ada residu
    print("Membersihkan frame lama di build_canvas/frames/...")
    for f in os.listdir(FRAMES_DIR):
        if f.endswith(".png"):
            try:
                os.remove(os.path.join(FRAMES_DIR, f))
            except Exception:
                pass

    num_workers = 6
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

    # Sinkronkan ke folder sesi Studio user
    user_project_dir = os.path.expanduser("~/cheat clip motion/motion/20261123-181217")
    if os.path.exists(user_project_dir):
        user_video_path = os.path.join(user_project_dir, "video.mp4")
        import shutil
        shutil.copy2(OUTPUT_MP4, user_video_path)
        print(f"Video MP4 juga disinkronkan ke sesi Studio: {user_video_path}")

if __name__ == "__main__":
    asyncio.run(main())
