import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    os.makedirs('preview_frames', exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1080, 'height': 1920})
        html_path = os.path.abspath('build_canvas/animasi.html').replace('\\', '/')
        await page.goto(f'file:///{html_path}')
        
        # Test keyframes pada beberapa detik penting:
        # t=3s (Adegan 1: Rumah No. 13 & Karakter), t=15s (Adegan 2: Jendela Atas)
        for t in [3.0, 15.0]:
            await page.evaluate(f"window.__draw({t})")
            await page.screenshot(path=f'preview_frames/frame_qa_{int(t)}s.png')
            print(f"Captured frame_qa_{int(t)}s.png")
            
        await browser.close()

asyncio.run(main())
