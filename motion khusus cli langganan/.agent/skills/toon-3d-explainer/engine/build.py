"""Assemble clip fragments + toon3d engine into self-contained HTML files.
usage: python3 build.py <out_dir> clips/01-name.html [clips/02-name.html ...]"""
import re, sys, pathlib
E = pathlib.Path(__file__).resolve().parent

def build(src, dst):
    frag = open(src, encoding='utf-8').read()
    m = re.search(r'<title>(.*?)</title>', frag)
    title = m.group(1) if m else pathlib.Path(src).stem
    css = ''.join(re.findall(r'<style>(.*?)</style>', frag, re.S))
    body = re.sub(r'<style>.*?</style>|<script>.*?</script>|<title>.*?</title>', '', frag, flags=re.S).strip()
    js = ''.join(re.findall(r'<script>(.*?)</script>', frag, re.S))
    base = open(E/'base.css', encoding='utf-8').read()
    engine = open(E/'toon3d.js', encoding='utf-8').read()
    html = (f'<!doctype html><html><head><meta charset="utf-8"><title>{title}</title><style>{base}{css}</style></head><body>\n'
            f'<div id="wrap"><div id="stage"><canvas id="scene3d"></canvas>{body}</div></div>\n'
            f'<script>{engine}</script><script>{js}</script></body></html>')
    open(dst, 'w', encoding='utf-8').write(html)

if __name__ == '__main__':
    out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
    for s in sys.argv[2:]:
        d = out / (pathlib.Path(s).stem + '.html'); build(s, d); print('built', d)
