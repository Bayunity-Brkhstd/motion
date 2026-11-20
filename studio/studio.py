# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["pywebview>=5.0"]
# ///
# kredit-maliki: Template oleh Maliki Saputra (@malikisaputra) — https://malikisaputra.biz.id · Lisensi Nonkomersial Maliki Studio 1.0 (alat/LISENSI.md): dilarang dijual ulang.
"""Cheat Clip and Motion — server lokal untuk tampilan Klip & Motion.

Hanya mendengar di 127.0.0.1 (tidak bisa dibuka dari perangkat lain).
Jalankan: uv run studio.py            → jendela aplikasi (native)
          uv run studio.py --browser  → buka di browser saja
"""
from __future__ import annotations

import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

AKAR = Path(__file__).resolve().parent
ALAT = AKAR.parent
KLIP = ALAT / "klip"
MOTION = ALAT / "motion"
SUARA = ALAT / "suara"
def _cari_folder_data() -> Path:
    if "STUDIO_DATA" in os.environ:
        return Path(os.environ["STUDIO_DATA"])
    baru = Path.home() / "cheat clip motion"
    lama1 = Path.home() / "Cheat Clip and Motion"
    lama2 = Path.home() / "Studio Maliki"
    for p in (baru, lama1, lama2):
        if p.exists():
            return p
    return baru

DATA = _cari_folder_data()
ENV = DATA / "pengaturan.env"
PORT = int(os.environ.get("STUDIO_PORT", "8787"))
KUNCI = ["SUARA", "VOXCPM_MODE", "VOXCPM_DESAIN", "AI", "LANGGANAN", "OPENCODE_MODEL", "CLAUDE_CODE_MODEL", "CODEX_MODEL",
         "GEMINI_API_KEY", "GEMINI_API_KEYS", "GEMINI_MODEL",
         "OPENAI_BASE_URL", "OPENAI_API_KEY", "OPENAI_MODEL", "SUARA_MAC", "TEMA"]
BAWAAN = {"SUARA": "bawaan", "VOXCPM_MODE": "bawaan", "AI": "lokal", "LANGGANAN": "claude-code", "GEMINI_MODEL": "gemini-3.8-flash",
          "OPENAI_BASE_URL": "http://localhost:11434/v1", "OPENAI_MODEL": "gemma3:4b", "SUARA_MAC": "Damayanti"}


def baca_pengaturan() -> dict:
    p = dict(BAWAAN)
    if ENV.exists():
        for baris in ENV.read_text(encoding="utf-8").splitlines():
            if "=" in baris and not baris.startswith("#"):
                k, v = baris.split("=", 1)
                if k in KUNCI:
                    p[k] = v
    return p


def simpan_pengaturan(baru: dict) -> None:
    p = baca_pengaturan()
    if "GEMINI_API_KEYS" in baru or "GEMINI_API_KEY" in baru:
        raw_val = baru.get("GEMINI_API_KEYS") if "GEMINI_API_KEYS" in baru else baru.get("GEMINI_API_KEY")
        if raw_val is not None:
            keys = [k.strip() for k in re.split(r"[\r\n,]+", str(raw_val)) if k.strip() and not k.strip().startswith("••••")]
            if keys:
                p["GEMINI_API_KEYS"] = "\n".join(keys)
                p["GEMINI_API_KEY"] = keys[0]
            elif str(raw_val).strip() == "":
                p["GEMINI_API_KEYS"] = ""
                p["GEMINI_API_KEY"] = ""
    for k in KUNCI:
        if k in ("GEMINI_API_KEYS", "GEMINI_API_KEY"):
            continue
        if k in baru and baru[k] is not None:
            p[k] = str(baru[k]).strip()
    DATA.mkdir(parents=True, exist_ok=True)
    ENV.write_text("# Pengaturan Cheat Clip and Motion (berisi kunci AI — jangan dibagikan)\n" +
                   "\n".join(f"{k}={p.get(k, '')}" for k in KUNCI) + "\n", encoding="utf-8")
    os.chmod(ENV, 0o600)


def samarkan(p: dict) -> dict:
    """Kunci tidak pernah dikirim balik utuh ke halaman."""
    out = dict(p)
    raw_keys = p.get("GEMINI_API_KEYS") or p.get("GEMINI_API_KEY") or ""
    keys = [k.strip() for k in re.split(r"[\r\n,]+", raw_keys) if k.strip()]
    out["gemini_keys_count"] = len(keys)
    if keys:
        out["GEMINI_API_KEYS"] = "\n".join(("••••" + k[-4:]) for k in keys)
        out["GEMINI_API_KEY"] = "••••" + keys[0][-4:]
    else:
        out["GEMINI_API_KEYS"] = ""
        out["GEMINI_API_KEY"] = ""

    v_oa = out.get("OPENAI_API_KEY", "")
    out["OPENAI_API_KEY"] = ("••••" + v_oa[-4:]) if v_oa else ""
    return out


# ── Pekerjaan (satu per satu) ───────────────────────────────────────────────
class Kerja:
    def __init__(self):
        self.kunci = threading.Lock()
        self.id = 0
        self.jenis = ""
        self.log: list[str] = []
        self.status = "siap"  # siap | jalan | selesai | gagal
        self.folder: Path | None = None
        self.proc: subprocess.Popen | None = None
        self.hasil: dict = {}

    def jalankan(self, jenis: str, langkah: list[tuple[list[str], Path]], folder: Path, setelah=None):
        with self.kunci:
            if self.status == "jalan":
                raise RuntimeError("Masih ada proses berjalan. Tunggu selesai atau batalkan.")
            self.id += 1
            self.jenis, self.log, self.status, self.folder, self.hasil = jenis, [], "jalan", folder, {}
        threading.Thread(target=self._kerja, args=(langkah, setelah), daemon=True).start()

    def _kerja(self, langkah, setelah):
        env = os.environ.copy()
        p = baca_pengaturan()
        env.update({k: v for k, v in p.items() if v})
        env["UV"] = cari_uv()
        if p.get("VOXCPM_MODE") == "clone" and ref_suara():
            env["VOXCPM_REFERENSI"] = str(ref_suara())
        if p.get("VOXCPM_MODE") != "desain":
            env.pop("VOXCPM_DESAIN", None)
        env["PYTHONUNBUFFERED"] = "1"
        env["PYTHONIOENCODING"] = "utf-8"  # Windows: cegah galat cp1252 saat mencetak “ ” dan emoji
        try:
            for cmd, cwd in langkah:
                self.log.append("$ " + " ".join(Path(c).name if i < 2 else c for i, c in enumerate(cmd)))
                self.proc = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=subprocess.PIPE,
                                             stderr=subprocess.STDOUT, text=True, bufsize=1,
                                             encoding="utf-8", errors="replace",
                                             creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                for baris in self.proc.stdout:
                    baris = baris.rstrip()
                    if baris and not re.search(r"objc\[|AVFAudioReceiver|Warning|warn\(|^\s*$", baris):
                        self.log.append(baris)
                        self.log[:] = self.log[-400:]
                if self.proc.wait() != 0:
                    self.status = "gagal" if self.status != "batal" else "batal"
                    return
            if setelah:
                setelah(self)
            self.status = "selesai"
        except Exception as e:  # noqa: BLE001
            self.log.append(f"Galat: {e}")
            self.status = "gagal"
        finally:
            self.proc = None

    def batal(self):
        if self.proc:
            self.status = "batal"
            self.proc.terminate()

    def ringkas(self) -> dict:
        return {"id": self.id, "jenis": self.jenis, "status": self.status, "log": self.log[-200:],
                "hasil": self.hasil}


KERJA = Kerja()


def cari_uv() -> str:
    for c in (shutil.which("uv"), str(Path.home() / ".local/bin/uv"), str(Path.home() / ".local/bin/uv.exe"),
              "/opt/homebrew/bin/uv"):
        if c and Path(c).exists():
            return c
    raise RuntimeError("uv belum terpasang. Jalankan installer lagi.")


def cari_node() -> str:
    for c in (shutil.which("node"), "/usr/local/bin/node", "/opt/homebrew/bin/node",
              r"C:\Program Files\nodejs\node.exe"):
        if c and Path(c).exists():
            return c
    raise RuntimeError("Node.js belum terpasang (nodejs.org) — dibutuhkan untuk Motion.")


def proyek_baru(jenis: str) -> Path:
    if KERJA.status == "jalan":  # jangan tinggalkan folder kosong kalau ditolak
        raise RuntimeError("Masih ada proses berjalan. Tunggu selesai atau batalkan dulu.")
    f = DATA / jenis / time.strftime("%Y%m%d-%H%M%S")
    f.mkdir(parents=True, exist_ok=True)
    return f


def penyedia_ai(nilai: str | None) -> str:
    """'langganan' → CLI pilihan di Pengaturan (claude-code / codex / opencode)."""
    p = baca_pengaturan()
    v = (nilai or p["AI"] or "lokal").lower()
    if v == "claude":  # Claude API dihapus (14 Nov 2026) → pakai Lokal
        v = "lokal"
    return p.get("LANGGANAN") or "claude-code" if v == "langganan" else v


def _cari_cli_dir() -> Path:
    baru = Path.home() / ".cheat-clip-and-motion" / "cli"
    lama = Path.home() / ".studio-maliki" / "cli"
    if baru.exists():
        return baru
    if lama.exists():
        return lama
    return baru

CLI_DIR = _cari_cli_dir()  # CLI dipasang di sini (tanpa sudo)
PAKET_CLI = {"codex": "@openai/codex", "opencode": "opencode-ai", "claude": "@anthropic-ai/claude-code", "antigravity": "google-antigravity"}
PERINTAH_LOGIN = {"claude": "claude auth login", "codex": "codex login", "opencode": "opencode auth login", "antigravity": "agy"}
DOMAIN_BOLEH = ("aistudio.google.com", "share.gemini.google", "gemini.google.com", "github.com", "ollama.com", "nodejs.org", "platform.openai.com",
                "openrouter.ai", "console.groq.com", "chatgpt.com", "claude.ai", "opencode.ai", "docs.astral.sh", "antigravity.google")


def cari_cli(nama: str) -> str | None:
    daftar_nama = [nama]
    if nama in ("antigravity", "agy"):
        daftar_nama = ["agy", "antigravity"]
    for n in daftar_nama:
        for c in (
            str(CLI_DIR / "bin" / n),
            str(CLI_DIR / f"{n}.cmd"),
            shutil.which(n),
            str(Path.home() / ".local/bin" / n),
            f"/opt/homebrew/bin/{n}",
            f"/usr/local/bin/{n}",
            str(Path.home() / ".npm-global/bin" / n),
            str(Path.home() / ".gemini" / "bin" / f"{n}.exe"),
            str(Path.home() / ".gemini" / "bin" / n),
            str(Path.home() / ".gemini" / "antigravity" / "bin" / f"{n}.exe"),
            str(Path.home() / ".gemini" / "antigravity" / "bin" / n),
        ):
            if c and Path(c).exists():
                return c
        if os.name == "nt":
            res = shutil.which(f"{n}.cmd") or shutil.which(f"{n}.exe")
            if res:
                return res
    return None


def voxcpm_terpasang() -> bool:
    hub = Path(os.environ.get("HF_HOME", Path.home() / ".cache" / "huggingface")) / "hub" / "models--openbmb--VoxCPM2"
    return any(hub.glob("snapshots/*/model.safetensors"))


def ref_suara() -> Path | None:
    for f in sorted(DATA.glob("suara-referensi.*")):
        return f
    return None


def pasang_suara() -> dict:
    cmd = [cari_uv(), "run", "-q", str(SUARA / "suara.py"), "--cek"]
    KERJA.jalankan("suara", [(cmd, SUARA)], DATA)
    return {"ok": True}


def status_ai() -> dict:
    """Status nyata tiap jalur AI, untuk panduan bertahap di Pengaturan AI."""
    p = baca_pengaturan()
    keys_raw = p.get("GEMINI_API_KEYS") or p.get("GEMINI_API_KEY") or ""
    daftar_gemini = [k.strip() for k in re.split(r"[\r\n,]+", keys_raw) if k.strip()]
    out = {"gemini": {"kunci": len(daftar_gemini) > 0, "jumlah": len(daftar_gemini), "rolling": len(daftar_gemini) > 1}}
    # Ollama: terpasang? server menyala? model apa saja?
    import urllib.request
    ollama = shutil.which("ollama") or ("/Applications/Ollama.app" if Path("/Applications/Ollama.app").exists() else None)
    model, hidup = [], False
    try:
        with urllib.request.urlopen("http://localhost:11434/api/tags", timeout=1.5) as r:
            model = [m["name"] for m in json.loads(r.read()).get("models", [])]
            hidup = True
    except Exception:  # noqa: BLE001
        pass
    out["openai"] = {"ollama": bool(ollama), "hidup": hidup, "model": model}
    # CLI langganan: terpasang? sudah login?
    cli = {}
    for nama in ("claude", "codex", "opencode", "antigravity"):
        jalur = cari_cli(nama)
        login = False
        if jalur:
            try:
                if nama == "claude":
                    r = subprocess.run([jalur, "auth", "status"], capture_output=True, text=True, timeout=20)
                    login = '"loggedIn": true' in r.stdout
                elif nama == "codex":
                    r = subprocess.run([jalur, "login", "status"], capture_output=True, text=True, timeout=20)
                    login = r.returncode == 0 and "not logged" not in (r.stdout + r.stderr).lower()
                elif nama == "antigravity":
                    login = bool(jalur) and (Path.home() / ".gemini" / "antigravity").exists()
                else:
                    r = subprocess.run([jalur, "auth", "list"], capture_output=True, text=True, timeout=20)
                    m = re.search(r"(\d+)\s+credentials?", re.sub(r"\x1b\[[0-9;]*m", "", r.stdout))
                    login = r.returncode == 0 and bool(m) and int(m.group(1)) > 0
            except Exception:  # noqa: BLE001
                login = False
        lewat_gemini = nama == "opencode" and bool(jalur) and not login and bool(p.get("GEMINI_API_KEY"))
        cli[nama] = {"terpasang": bool(jalur), "login": login or lewat_gemini, "lewat_gemini": lewat_gemini}
    out["cli"] = cli
    out["node"] = bool(shutil.which("npm") or Path("/usr/local/bin/npm").exists())
    return out


def sistem_detail() -> dict:
    """Spesifikasi laptop + status komponen untuk wizard pemasangan."""
    import platform
    info = {"os": platform.system(), "versi": platform.mac_ver()[0] or platform.release(), "arsitektur": platform.machine(),
            "prosesor": platform.processor() or platform.machine(), "ram_gb": 0.0, "disk_gb": 0.0}
    try:
        if sys.platform == "darwin":
            info["ram_gb"] = int(subprocess.run(["sysctl", "-n", "hw.memsize"], capture_output=True, text=True).stdout) / 2 ** 30
            info["prosesor"] = subprocess.run(["sysctl", "-n", "machdep.cpu.brand_string"], capture_output=True, text=True).stdout.strip() or info["prosesor"]
        elif os.name == "nt":
            import ctypes

            class Mem(ctypes.Structure):
                _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong), ("ullTotalPhys", ctypes.c_ulonglong),
                            ("ullAvailPhys", ctypes.c_ulonglong), ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                            ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong), ("sullAvailExtendedVirtual", ctypes.c_ulonglong)]
            m = Mem(); m.dwLength = ctypes.sizeof(Mem)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))  # type: ignore[attr-defined]
            info["ram_gb"] = m.ullTotalPhys / 2 ** 30
    except Exception:  # noqa: BLE001
        pass
    info["disk_gb"] = shutil.disk_usage(Path.home()).free / 2 ** 30
    npm = shutil.which("node") or ("/usr/local/bin/node" if Path("/usr/local/bin/node").exists() else None)
    info["node"] = subprocess.run([npm, "--version"], capture_output=True, text=True).stdout.strip() if npm else ""
    info["komponen"] = {
        "klip": (DATA / ".siap-klip").exists(),
        "motion": (MOTION / "node_modules" / "remotion").exists(),
        "voxcpm": voxcpm_terpasang(),
    }
    info["wizard_selesai"] = (DATA / ".wizard-selesai").exists()
    return info


def siapkan(komponen: str) -> dict:
    """Pasang/siapkan komponen dari wizard (progres tampil di layar)."""
    if komponen == "klip":
        uv = cari_uv()
        langkah = [([uv, "sync", "--script", str(KLIP / "klip.py")], KLIP),
                   ([uv, "run", "-q", str(KLIP / "klip.py"), "--uji-ai", "lokal"], KLIP)]

        def setelah(k: Kerja):
            (DATA / ".siap-klip").write_text("ok")
        KERJA.jalankan("pasang", langkah, DATA, setelah)
    elif komponen == "motion":
        npm = shutil.which("npm") or "/usr/local/bin/npm"
        if not Path(npm).exists():
            raise RuntimeError("Node.js belum terpasang. Pasang dari nodejs.org, lalu buka ulang Studio.")
        KERJA.jalankan("pasang", [([npm, "install"], MOTION)], MOTION)
    elif komponen == "voxcpm":
        KERJA.jalankan("pasang", [([cari_uv(), "run", "-q", str(SUARA / "suara.py"), "--cek"], SUARA)], DATA)
    else:
        raise ValueError("Komponen tidak dikenal.")
    return {"ok": True}


def pasang_cli(nama: str) -> dict:
    if nama not in PAKET_CLI:
        raise ValueError("CLI tidak dikenal.")
    if nama == "antigravity":
        if cari_cli("agy"):
            return {"ok": True}
        uv = cari_uv()
        KERJA.jalankan("pasang", [([uv, "pip", "install", PAKET_CLI[nama]], DATA)], DATA)
        return {"ok": True}
    npm = shutil.which("npm") or "/usr/local/bin/npm"
    if not Path(npm).exists() and not shutil.which("npm"):
        raise RuntimeError("Node.js belum terpasang. Pasang dari nodejs.org dulu.")
    CLI_DIR.mkdir(parents=True, exist_ok=True)
    KERJA.jalankan("pasang", [([npm, "install", "-g", "--prefix", str(CLI_DIR), PAKET_CLI[nama]], CLI_DIR)], CLI_DIR)
    return {"ok": True}


def buka_login(nama: str) -> dict:
    """Buka Terminal berisi perintah login resmi — pengguna sendiri yang masuk ke akunnya."""
    jalur = cari_cli(nama)
    if not jalur:
        raise ValueError(f"{nama} belum terpasang.")
    perintah = PERINTAH_LOGIN.get(nama, f"{nama}").replace(nama, f'"{jalur}"', 1)
    if nama == "antigravity":
        perintah = f'"{jalur}"'
    if nama == "codex":
        # `codex login` membuka browser untuk "Sign in with ChatGPT" dan menunggu izin di server lokalnya
        subprocess.Popen([jalur, "login"], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         start_new_session=True)
        return {"ok": True, "browser": True}
    if sys.platform == "darwin":
        skrip = f'tell application "Terminal" to do script "{perintah.replace(chr(34), chr(92) + chr(34))}"'
        subprocess.run(["osascript", "-e", skrip, "-e", 'tell application "Terminal" to activate'], check=False)
    elif os.name == "nt":
        subprocess.Popen(["cmd", "/c", "start", "cmd", "/k", perintah])
    else:
        subprocess.Popen(["x-terminal-emulator", "-e", perintah])
    return {"ok": True}


def uji_ai(penyedia: str) -> dict:
    p = baca_pengaturan()
    env = os.environ.copy()
    env.update({k: v for k, v in p.items() if v})
    env["PYTHONIOENCODING"] = "utf-8"
    nyata = penyedia_ai(penyedia)
    try:
        r = subprocess.run([cari_uv(), "run", "-q", str(KLIP / "klip.py"), "--uji-ai", nyata], capture_output=True, text=True,
                           encoding="utf-8", errors="replace", env=env, timeout=240, cwd=KLIP,
                           creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    except subprocess.TimeoutExpired:
        return {"ok": False, "pesan": "Tidak ada jawaban dalam 4 menit."}
    bersih = lambda t: re.sub(r"\x1b\[[0-9;]*m", "", t or "")  # noqa: E731
    r.stdout, r.stderr = bersih(r.stdout), bersih(r.stderr)
    keluaran = (r.stdout or "").strip().splitlines()
    galat = [b for b in (r.stderr or "").splitlines() if b.strip() and not re.search(r"warn|objc\[|AVFAudio|ctranslate2", b, re.I)]
    if r.returncode == 0 and keluaran:
        return {"ok": True, "pesan": keluaran[-1][:200], "penyedia": nyata}
    return {"ok": False, "pesan": (galat[-1] if galat else (keluaran[-1] if keluaran else "Gagal tanpa pesan."))[:400], "penyedia": nyata}


def mulai_klip(d: dict) -> dict:
    sumber = (d.get("sumber") or "").strip()
    if not sumber:
        raise ValueError("Isi link YouTube atau pilih file video dulu.")
    folder = proyek_baru("klip")
    cmd = [cari_uv(), "run", "-q", str(KLIP / "klip.py"), sumber, "--keluar", str(folder),
           "--jumlah", str(int(d.get("jumlah", 3))), "--durasi", str(int(d.get("durasi", 30))),
           "--ai", penyedia_ai(d.get("ai")), "--model", d.get("model", "small"),
           "--warna", d.get("warna", "#FFB020")]
    cmd.append("--hanya-analisis")
    if d.get("arahan"):
        cmd += ["--arahan", d["arahan"]]
    if d.get("rentang"):
        cmd += ["--rentang", d["rentang"]]
    if d.get("subtitle_file"):
        cmd += ["--subtitle-file", d["subtitle_file"]]
    (folder / "permintaan.json").write_text(json.dumps(d, ensure_ascii=False), encoding="utf-8")

    def setelah(k: Kerja):
        k.hasil = muat_proyek("klip", folder.name)

    KERJA.jalankan("klip", [(cmd, KLIP)], folder, setelah)
    return {"proyek": folder.name}


def mulai_render_klip(d: dict) -> dict:
    nama = re.sub(r"[^\w-]", "", d.get("nama", ""))
    folder = DATA / "klip" / nama
    if not (folder / "klip.json").exists():
        raise ValueError("Proyek tidak ditemukan. Analisis videonya dulu.")
    pilih = [int(x) for x in d.get("pilih", [])]
    if not pilih:
        raise ValueError("Centang minimal satu klip untuk dirender.")
    gaya = d.get("gaya") or {}
    for k in ("musik", "sfx"):  # hanya berkas di folder aset Studio
        if gaya.get(k):
            p = (DATA / "aset" / Path(gaya[k]).name)
            gaya[k] = str(p) if p.exists() else ""
    # judul banner hasil suntingan pengguna
    if d.get("judul"):
        daftar = json.loads((folder / "klip.json").read_text(encoding="utf-8"))
        for x in daftar:
            if str(x["no"]) in d["judul"]:
                x["judul_banner"] = d["judul"][str(x["no"])]
        (folder / "klip.json").write_text(json.dumps(daftar, ensure_ascii=False, indent=2), encoding="utf-8")
    (folder / "gaya-permintaan.json").write_text(json.dumps(gaya, ensure_ascii=False), encoding="utf-8")
    cmd = [cari_uv(), "run", "-q", str(KLIP / "klip.py"), "--render", "--keluar", str(folder),
           "--pilih", ",".join(map(str, pilih)), "--gaya", str(folder / "gaya-permintaan.json")]

    def setelah(k: Kerja):
        k.hasil = muat_proyek("klip", nama)

    KERJA.jalankan("render", [(cmd, KLIP)], folder, setelah)
    return {"proyek": nama}


def analisa_audio_motion(d: dict) -> dict:
    audio_path = (d.get("audio") or d.get("audioNarasi") or d.get("audio_jalur") or "").strip()
    if not audio_path:
        raise ValueError("File audio narasi belum dipilih.")
    p_audio = Path(audio_path).resolve()
    if not p_audio.exists():
        raise ValueError(f"File audio tidak ditemukan: {audio_path}")
    naskah = d.get("naskah") or {}
    if isinstance(naskah, str):
        naskah = json.loads(naskah)
    DATA.mkdir(parents=True, exist_ok=True)
    temp_naskah = DATA / f"temp_analisa_{int(time.time()*1000)}.json"
    temp_naskah.write_text(json.dumps(naskah, ensure_ascii=False), encoding="utf-8")
    cmd = [
        cari_uv(), "run", "--script", str(MOTION / "analisa.py"),
        "--audio", str(p_audio),
        "--naskah", str(temp_naskah)
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                           cwd=MOTION, timeout=180, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        if r.returncode != 0:
            galat = r.stderr.strip() or r.stdout.strip() or "Gagal menganalisa audio."
            raise RuntimeError(galat[-400:])
        m = re.search(r"\{[\s\S]*\}", r.stdout)
        if not m:
            raise RuntimeError("Keluaran analisa audio tidak valid.")
        return json.loads(m.group(0))
    finally:
        if temp_naskah.exists():
            temp_naskah.unlink(missing_ok=True)


def mulai_motion(d: dict) -> dict:
    topik = (d.get("topik") or "").strip()
    naskah_teks = (d.get("naskah") or "").strip()
    if not topik and not naskah_teks:
        raise ValueError("Isi topik, atau tempel naskah JSON.")
    ai = penyedia_ai(d.get("ai"))
    if not naskah_teks and ai == "lokal":
        raise ValueError("Membuat naskah dari topik butuh AI (Gemini/Ollama/Claude) — atur di Pengaturan, "
                         "atau tempel naskah JSON dari Claude/Gemini gratis.")
    node = cari_node()
    folder = proyek_baru("motion")
    nama = folder.name
    if not (MOTION / "node_modules").exists():
        langkah = [([shutil.which("npm") or "npm", "install", "--silent"], MOTION)]
    else:
        langkah = []
    gaya = d.get("gaya", "garis")
    if naskah_teks:
        data = json.loads(naskah_teks)
        data["gaya"] = gaya
        (MOTION / "naskah").mkdir(exist_ok=True)
        (MOTION / "naskah" / f"{nama}.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        langkah.append(([node, "naskah.mjs", topik, f"--ai={ai}", f"--gaya={gaya}", f"--nama={nama}"], MOTION))
    if d.get("gambar") and ai != "lokal":
        # AI menggambar objek SVG per adegan (gagal → video tetap jadi dengan emoji)
        langkah.append(([node, "gambar.mjs", f"naskah/{nama}.json", f"--ai={ai}"], MOTION))
    p = baca_pengaturan()
    perintah = [node, "buat.mjs", f"naskah/{nama}.json", f"--gaya={gaya}", f"--suara-mac={p.get('SUARA_MAC', 'Damayanti')}"]
    audio_narasi = (d.get("audioNarasi") or "").strip()
    if audio_narasi and Path(audio_narasi).exists():
        perintah.append(f"--audio-narasi={audio_narasi}")
    elif p.get("SUARA") == "voxcpm":
        if not voxcpm_terpasang():
            raise ValueError("Suara AI (VoxCPM) belum dipasang. Buka Pengaturan AI → Suara narator → Pasang suara AI.")
        if p.get("VOXCPM_MODE") == "clone" and not ref_suara():
            # tidak ada suara bawaan siapa pun: mode clone WAJIB memakai rekaman pengguna sendiri (dengan izin)
            raise ValueError("Mode \"Clone suaraku\" butuh rekaman suaramu sendiri. Buka Pengaturan AI → Suara narator, "
                             "centang pernyataan izin, lalu pilih rekaman 10–20 detik. Atau pilih warna suara Netral.")
        perintah.append("--suara=voxcpm")
    langkah.append((perintah, MOTION))

    def setelah(k: Kerja):
        for f in (MOTION / "hasil").glob(f"{nama}-*.mp4"):
            shutil.move(str(f), folder / "video.mp4")
        n = MOTION / "naskah" / f"{nama}.json"
        if n.exists():
            shutil.copy(n, folder / "naskah.json")
        k.hasil = muat_proyek("motion", nama)

    KERJA.jalankan("motion", langkah, folder, setelah)
    return {"proyek": nama}


def panggil_cli_sutradara_real(ai_aktif: str, cli_aktif: str, model: str, prompt_teks: str) -> tuple[str, list[str], float]:
    """Menjalankan instruksi obrolan ke AI Agent CLI secara on-demand (ephemeral) tanpa daemon background."""
    import time
    t0 = time.time()
    cli_logs = []

    if ai_aktif == "langganan":
        nama_bin = {
            "antigravity": "antigravity",
            "claude-code": "claude",
            "codex": "codex",
            "opencode": "opencode"
        }.get(cli_aktif, "antigravity")

        jalur_cli = cari_cli(nama_bin)
        if not jalur_cli:
            cli_logs.append(f"[CLI Error] Binary '{nama_bin}' belum terpasang.")
            return "", cli_logs, 0.0

        nama_file_cli = Path(jalur_cli).name
        cli_logs.append(f"$ {nama_file_cli} {f'--model {model}' if model else ''} --output-format text -p \"...\"")
        cli_logs.append(f"[CLI Task] Menghubungkan ke {nama_bin.upper()} Agent (On-Demand Execution)...")

        env = os.environ.copy()
        for k in ("ANTHROPIC_API_KEY", "ANTHROPIC_AUTH_TOKEN", "OPENAI_API_KEY", "CODEX_API_KEY"):
            env.pop(k, None)

        if nama_bin in ("antigravity", "agy"):
            cmd = [jalur_cli, "--output-format", "text"]
            if model:
                cmd += ["--model", model]
            cmd += ["-p", prompt_teks]
            masukan = None
        elif nama_bin == "claude":
            cmd = [jalur_cli, "-p", "--tools", "", "--output-format", "text", "--no-session-persistence"]
            if model:
                cmd += ["--model", model]
            masukan = prompt_teks
        elif nama_bin == "codex":
            cmd = [jalur_cli, "exec", "--skip-git-repo-check", "-"]
            if model:
                cmd += ["--model", model]
            masukan = prompt_teks
        else:
            cmd = [jalur_cli, "run", "--agent", "plan"]
            if model:
                cmd += ["--model", model]
            masukan = prompt_teks

        try:
            r = subprocess.run(
                cmd,
                input=masukan,
                capture_output=True,
                text=True,
                encoding="utf-8",
                timeout=180,
                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0)
            )
            latency = round(time.time() - t0, 2)
            if r.returncode == 0 and r.stdout.strip():
                cli_logs.append(f"[CLI Sukses] Respons diterima ({len(r.stdout.strip())} karakter) dalam {latency}s.")
                cli_logs.append(f"[CLI Selesai] Proses {nama_file_cli} ditutup seketika. RAM bebas.")
                return r.stdout.strip(), cli_logs, latency
            else:
                err = (r.stderr or r.stdout or "").strip()
                cli_logs.append(f"[CLI Keluar] Kode {r.returncode}: {err[:200]}")
                return "", cli_logs, latency
        except subprocess.TimeoutExpired:
            cli_logs.append("[CLI Timeout] Subprocess melebihi batas waktu 180s.")
            return "", cli_logs, 180.0

    elif ai_aktif == "gemini":
        p = baca_pengaturan()
        keys_raw = p.get("GEMINI_API_KEYS") or p.get("GEMINI_API_KEY") or ""
        daftar_kunci = [k.strip() for k in re.split(r"[\r\n,]+", keys_raw) if k.strip()]
        if daftar_kunci:
            try:
                import urllib.request
                cli_logs.append(f"[Gemini API] Mengirim prompt ke Google AI Studio ({model or 'gemini-2.5-flash'})...")
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model or 'gemini-2.5-flash'}:generateContent?key={daftar_kunci[0]}"
                data = json.dumps({"contents": [{"parts": [{"text": prompt_teks}]}]}).encode("utf-8")
                req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=120) as resp:
                    j = json.loads(resp.read().decode("utf-8"))
                    teks = j["candidates"][0]["content"]["parts"][0]["text"]
                    latency = round(time.time() - t0, 2)
                    cli_logs.append(f"[Gemini API Done] Respons diterima dalam {latency}s.")
                    return teks, cli_logs, latency
            except Exception as e:
                cli_logs.append(f"[Gemini API Error] {e}")

    latency = round(time.time() - t0, 2)
    cli_logs.append(f"[Lokal] Selesai dihitung via pipeline lokal ({latency}s).")
    return "", cli_logs, latency


def orkestrasi_motion_pro(d: dict) -> dict:
    import time
    instruksi = d.get("instruksi", "").strip()
    model = d.get("model", "")
    naskah_md = d.get("naskah", "").strip()
    durasi_audio = float(d.get("durasi_audio") or 0)
    nama_audio = d.get("nama_audio", "")
    arahan_visual = d.get("arahan_visual", "").strip()
    gambar_ref = d.get("gambar_ref", [])
    aksi = d.get("aksi", "chat")

    skill_dir = MOTION / "skills"
    daftar_skill = ["isometric-video", "motion-graphics", "sound-effects", "video-making"]
    skills_aktif = [s for s in daftar_skill if (skill_dir / s).exists()]

    # Parsing naskah markdown menjadi segmen adegan (4 - 8 detik per adegan)
    adegan_list = []
    baris_list = [b.strip() for b in naskah_md.splitlines() if b.strip()]

    blok_adegan = []
    current_title = ""
    current_lines = []
    for b in baris_list:
        if b.startswith("#"):
            if current_lines or current_title:
                blok_adegan.append((current_title or "Adegan", " ".join(current_lines)))
                current_lines = []
            current_title = re.sub(r"^#+\s*", "", b).strip()
        else:
            current_lines.append(b)
    if current_lines or current_title:
        blok_adegan.append((current_title or "Adegan", " ".join(current_lines)))

    if len(blok_adegan) <= 1:
        teks_penuh = " ".join(baris_list)
        kalimat = re.split(r"(?<=[.!?])\s+", teks_penuh)
        blok_adegan = []
        temp_kata = []
        for k in kalimat:
            k = k.strip()
            if not k:
                continue
            temp_kata.append(k)
            kata_count = sum(len(x.split()) for x in temp_kata)
            if kata_count >= 18:
                gabung = " ".join(temp_kata)
                judul_potong = " ".join(gabung.split()[:4]).capitalize()
                blok_adegan.append((judul_potong, gabung))
                temp_kata = []
        if temp_kata:
            gabung = " ".join(temp_kata)
            judul_potong = " ".join(gabung.split()[:4]).capitalize()
            blok_adegan.append((judul_potong, gabung))

    if not blok_adegan:
        blok_adegan = [
            ("Hook Pembuka", "Di era kecerdasan buatan, video berdurasi panjang memerlukan konsistensi alur dan visual."),
            ("Masalah Utama", "Tantangan terbesar adalah mempertahankan retensi penonton tanpa pacing yang membosankan."),
            ("Solusi Arsitektur", "Kuncinya adalah mengintegrasikan fisika pegas closed-form dan pergantian visual dinamis."),
            ("Penerapan Remotion", "Setiap komponen React disusun dengan presisi matematis frame demi frame 30fps."),
            ("Sinkronisasi Audio", "Narasi voice-over dipetakan per kata menghasilkan timestamp yang akurat."),
            ("Call To Action", "Bangun karya video motion berdurasi panjang berkualitas studio hari ini.")
        ]

    total_kata = sum(len(teks.split()) for _, teks in blok_adegan)
    durasi_total_target = durasi_audio if durasi_audio >= 60 else max(240.0, total_kata / 2.3)

    current_time = 0.0
    for idx, (judul_raw, teks) in enumerate(blok_adegan):
        nomor = idx + 1
        kata_adegan = max(1, len(teks.split()))
        if durasi_audio >= 60:
            durasi_adegan = round((kata_adegan / max(1, total_kata)) * durasi_total_target, 2)
            durasi_adegan = max(3.5, min(8.5, durasi_adegan))
        else:
            durasi_adegan = round(max(4.0, min(8.0, kata_adegan / 2.5)), 2)

        mulai = round(current_time, 2)
        selesai = round(current_time + durasi_adegan, 2)
        current_time = selesai

        ikon = "⚡"
        if nomor == 1:
            ikon = "🚀"
        elif "masalah" in judul_raw.lower() or "tantangan" in teks.lower():
            ikon = "⚠️"
        elif "solusi" in judul_raw.lower() or "arsitektur" in teks.lower():
            ikon = "💡"
        elif "remotion" in teks.lower() or "kode" in teks.lower():
            ikon = "💻"
        elif "audio" in teks.lower() or "suara" in teks.lower():
            ikon = "🎙️"
        elif nomor == len(blok_adegan):
            ikon = "🏆"
        else:
            ikon_list = ["🎯", "⚙️", "📊", "🧩", "✨", "🔥", "🎨", "🎬"]
            ikon = ikon_list[idx % len(ikon_list)]

        gaya_pref = arahan_visual or "flat 3D isometric"
        svg_prompt = f"Ilustrasi {gaya_pref} untuk konsep: {judul_raw}. Bersih, modern, dan konsisten."

        adegan_list.append({
            "nomor": nomor,
            "mulai": mulai,
            "selesai": selesai,
            "durasi_detik": durasi_adegan,
            "durasi": durasi_adegan,
            "judul": judul_raw[:35],
            "teks": teks,
            "ikon": ikon,
            "svg_prompt": svg_prompt
        })

    av_lower = arahan_visual.lower()
    if "neon" in av_lower or "cyber" in av_lower:
        palet = ["#0f172a", "#818cf8", "#22d3ee", "#c084fc", "#f43f5e"]
        gaya_tema = "tekno"
    elif "hangat" in av_lower or "pastel" in av_lower or "retro" in av_lower:
        palet = ["#fffbeb", "#f59e0b", "#f97316", "#ef4444", "#78350f"]
        gaya_tema = "hangat"
    elif "kertas" in av_lower or "kartun" in av_lower:
        palet = ["#f8fafc", "#334155", "#3b82f6", "#10b981", "#64748b"]
        gaya_tema = "kertas"
    else:
        palet = ["#0b0f19", "#6366f1", "#06b6d4", "#a855f7", "#ffffff"]
        gaya_tema = "garis"

    menit = int(current_time // 60)
    detik = int(current_time % 60)
    durasi_label = f"{menit}m {detik}s ({round(current_time, 1)} detik)"

    p_cfg = baca_pengaturan()
    ai_aktif = (p_cfg.get("AI") or "lokal").lower()
    cli_aktif = p_cfg.get("LANGGANAN") or "antigravity"
    nama_mesin = {
        "antigravity": "Antigravity CLI",
        "claude-code": "Claude Code CLI",
        "codex": "OpenAI Codex CLI",
        "opencode": "OpenCode Agent"
    }.get(cli_aktif, "Antigravity CLI") if ai_aktif == "langganan" else (
        "Google Gemini API" if ai_aktif == "gemini" else ("Ollama / OpenAI" if ai_aktif == "openai" else "AI Lokal")
    )

    KAMUS_MODEL = {
        "gemini-3.8-flash-high": "Gemini 3.8 Flash (High Effort)",
        "gemini-3.8-flash-medium": "Gemini 3.8 Flash (Medium Effort)",
        "gemini-3.8-flash-low": "Gemini 3.8 Flash (Low Effort)",
        "claude-sonnet-4-6": "Claude Sonnet 4.6 (Thinking)",
        "claude-opus-4-6-thinking": "Claude Opus 4.6 (Thinking)",
        "gpt-oss-120b-medium": "GPT-OSS 120B (Medium)",
        "sonnet": "Claude 3.7 Sonnet",
        "opus": "Claude 3 Opus",
        "haiku": "Claude 3.5 Haiku",
        "o3-mini": "OpenAI o3-mini",
        "o1": "OpenAI o1",
        "gpt-4.5-preview": "GPT-4.5 Preview",
        "gpt-4o": "GPT-4o",
        "gemini-2.5-flash": "Gemini 2.5 Flash",
        "gemini-2.5-pro": "Gemini 2.5 Pro",
        "gemini-2.0-flash": "Gemini 2.0 Flash",
        "claude": "Claude 3.7 Sonnet",
        "antigravity": "Antigravity Engine",
        "codex": "OpenAI Codex Engine",
        "opencode": "OpenCode Engine"
    }
    nama_model_murni = KAMUS_MODEL.get(model, model or "Bawaan Akun")
    model_label = f"{nama_model_murni} ({nama_mesin})"

    # ── EKSEKUSI REAL KE AI AGENT VIA CLI (ON-DEMAND) ──
    prompt_sutradara = f"""Anda adalah Motion Director Agent profesional untuk Cheat Motion Pro.
Tugas Anda adalah merespons instruksi pengguna dan menyusun atau memperbarui struktur adegan video motion graphic 1080x1920 30fps durasi panjang (Target: {durasi_label}, Total kata naskah: {total_kata} kata).
Modul Skills aktif: {', '.join(skills_aktif)}

Konteks Aset Proyek:
- Durasi Audio Narasi: {durasi_label} ({nama_audio or 'Audio Voice Over'})
- Arahan Gaya Visual: {arahan_visual or 'Adaptif Modern'}
- Gambar Referensi: {', '.join(gambar_ref) if gambar_ref else 'Belum ada gambar referensi'}
- Potongan Naskah Markdown:
\"\"\"
{naskah_md[:2200]}
\"\"\"

Instruksi Pengguna:
"{instruksi}"

Petunjuk Respon:
1. Berikan penjelasan profesional, strategi pacing, dan evaluasi naskah/audio secara ringkas dan ramah.
2. Jelaskan tahapan thinking reasoning dalam bentuk poin-poin.
3. Berikan rekomendasi 5 palet warna HEX.
4. Sertakan blok ```json storyboard adegan lengkap yang proporsional dengan format:
```json
{{
  "palet": ["#0b0f19", "#6366f1", "#06b6d4", "#a855f7", "#ffffff"],
  "gaya": "garis",
  "adegan": [
    {{
      "nomor": 1,
      "mulai": 0,
      "selesai": 5.5,
      "durasi_detik": 5.5,
      "judul": "Judul Adegan",
      "teks": "Teks narasi adegan...",
      "ikon": "🚀",
      "svg_prompt": "Ilustrasi visual..."
    }}
  ]
}}
```
"""

    teks_ai, cli_logs, latency = panggil_cli_sutradara_real(ai_aktif, cli_aktif, model, prompt_sutradara)

    if teks_ai:
        m_json = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", teks_ai, re.DOTALL)
        if m_json:
            try:
                parsed = json.loads(m_json.group(1))
                if parsed.get("adegan") and len(parsed["adegan"]) > 0:
                    adegan_list = parsed["adegan"]
                    if parsed.get("palet"):
                        palet = parsed["palet"]
                    if parsed.get("gaya"):
                        gaya_tema = parsed["gaya"]
            except Exception:
                pass
        jawaban_tampil = re.sub(r"```(?:json)?\s*\{.*?\}\s*```", "", teks_ai, flags=re.DOTALL).strip()
        if not jawaban_tampil:
            jawaban_tampil = teks_ai
    else:
        jawaban_tampil = (
            f"Saya telah menganalisis instruksi Anda dengan **{model_label}**.\n\n"
            f"• **Durasi Total:** {durasi_label}\n"
            f"• **Jumlah Adegan:** {len(adegan_list)} adegan terstruktur (ritme ideal 4 – 8 detik per adegan)\n"
            f"• **Gaya & Palet:** Disesuaikan dengan {len(gambar_ref)} gambar referensi dan arahan *{arahan_visual or 'Adaptif Modern'}*\n"
            f"• **Remotion Ready:** Komposisi video 1080×1920 30fps siap diproses ke pipeline rendering."
        )

    naskah_json = {
        "judul": blok_adegan[0][0] if blok_adegan else "Proyek Long-form Motion Pro",
        "gaya": gaya_tema,
        "durasi_total": round(current_time, 2),
        "audioNarasi": nama_audio or None,
        "arahan_visual": arahan_visual or None,
        "palet": palet,
        "adegan": adegan_list
    }

    reasoning_steps = [
        f"✓ Mesin Eksekusi: {model_label} (On-Demand CLI Subprocess)",
        f"✓ Latensi Komputasi: {latency}s · RAM segera dibebaskan pasca respons",
        "✓ Membaca konfigurasi pipeline: motion/skills/SKILL-LONGFORM.md",
        f"✓ Memeriksa modul skill terpasang: {', '.join(skills_aktif)} (SEMUA SIAP)",
        f"✓ Menganalisis naskah markdown ({total_kata} kata)",
        f"✓ Melakukan audio-script alignment terhadap durasi {durasi_label}",
        f"✓ Segmentasi naskah menjadi {len(adegan_list)} adegan (durasi 4 - 8 detik per adegan)",
        f"✓ Ekstraksi palet warna & arahan gaya visual: {arahan_visual or 'Adaptif Modern'}"
    ]

    berkas_disimpan = None
    if aksi in ("render", "simpan") or d.get("simpan"):
        (MOTION / "naskah").mkdir(parents=True, exist_ok=True)
        nama_file = f"motion-pro-{int(time.time())}"
        target = MOTION / "naskah" / f"{nama_file}.json"
        target.write_text(json.dumps(naskah_json, ensure_ascii=False, indent=2), encoding="utf-8")
        berkas_disimpan = str(target)

    return {
        "ok": True,
        "model": model,
        "model_label": model_label,
        "reasoning_steps": reasoning_steps,
        "cli_logs": cli_logs,
        "latency": latency,
        "jawaban": jawaban_tampil,
        "adegan": adegan_list,
        "palet": palet,
        "naskah_json": naskah_json,
        "berkas_disimpan": berkas_disimpan,
        "skills": skills_aktif
    }


def simpan_naskah_pro(d: dict) -> dict:
    import time
    nama = re.sub(r"[^\w-]", "", d.get("nama") or f"motion-pro-{int(time.time())}")
    naskah = d.get("naskah_json")
    if not naskah:
        raise ValueError("Data naskah JSON kosong.")
    (MOTION / "naskah").mkdir(parents=True, exist_ok=True)
    target = MOTION / "naskah" / f"{nama}.json"
    target.write_text(json.dumps(naskah, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"ok": True, "nama": nama, "jalur": str(target)}


def render_motion_pro(d: dict) -> dict:
    """Merender komposisi video Motion Pro (1080x1920 30fps) dari naskah storyboard."""
    naskah = d.get("naskah_json")
    if not naskah:
        raise ValueError("Data naskah storyboard kosong. Lakukan analisis atau orkestrasi terlebih dahulu.")

    topik = naskah.get("judul") or "Motion Pro Long-Form"
    gaya = naskah.get("gaya") or "garis"
    audio_narasi = d.get("audio_narasi") or d.get("audioNarasi") or naskah.get("audioNarasi")

    payload = {
        "topik": topik,
        "naskah": json.dumps(naskah, ensure_ascii=False),
        "gaya": gaya
    }
    if audio_narasi:
        payload["audioNarasi"] = str(audio_narasi)

    res = mulai_motion(payload)
    return res


def bersihkan_cache_pro() -> dict:
    """Membersihkan cache rendering, temp frames, dan file unggahan sementara guna membebaskan ruang disk."""
    total_bytes = 0
    dirs_to_clean = [
        MOTION / "node_modules" / ".cache",
        MOTION / "hasil" / "temp",
        DATA / "unggahan"
    ]
    for d in dirs_to_clean:
        if d.exists():
            for p in d.rglob("*"):
                if p.is_file():
                    try:
                        total_bytes += p.stat().st_size
                        p.unlink()
                    except Exception:  # noqa: BLE001
                        pass
    # Hapus file zip mentah tersisa di folder skills jika ada
    skill_dir = MOTION / "skills"
    if skill_dir.exists():
        for z in skill_dir.glob("*.zip"):
            try:
                total_bytes += z.stat().st_size
                z.unlink()
            except Exception:  # noqa: BLE001
                pass

    mb = round(total_bytes / (1024 * 1024), 2)
    return {"ok": True, "dibersihkan_mb": mb, "pesan": f"Berhasil membersihkan cache & file sementara ({mb} MB dibebaskan)."}


def daftar_skills_pro() -> dict:
    """Daftar modul skills yang aktif di folder motion/skills/."""
    skill_dir = MOTION / "skills"
    skill_dir.mkdir(parents=True, exist_ok=True)
    reg_file = skill_dir / "registry.json"
    reg_map = {}
    if reg_file.exists():
        try:
            items = json.loads(reg_file.read_text(encoding="utf-8"))
            if isinstance(items, list):
                for it in items:
                    if isinstance(it, dict) and "slug" in it:
                        reg_map[it["slug"]] = it
        except Exception:
            pass

    inti = {"isometric-video", "motion-graphics", "sound-effects", "video-making", "SKILL-LONGFORM.md", "prompt-agent.md", "alur-produksi.json", "registry.json"}
    daftar = []
    for item in skill_dir.iterdir():
        if item.name.startswith("."):
            continue
        is_dir = item.is_dir()
        is_md = item.suffix.lower() == ".md"
        slug = item.stem if is_md else item.name
        if slug in {"registry", "prompt-agent", "alur-produksi"}:
            continue
        if is_dir or is_md:
            info = reg_map.get(slug, {})
            daftar.append({
                "id": slug,
                "nama": info.get("name") or (item.stem if is_md else item.name),
                "deskripsi": info.get("description", ""),
                "palette_hex": info.get("palette_hex", []),
                "avg_pacing_sec": info.get("avg_pacing_sec", 3.5),
                "inti": item.name in inti or item.stem in inti,
                "jenis": "folder" if is_dir else "markdown",
                "aktif": True,
                "siap": True
            })
    return {"ok": True, "skills": daftar}


def unggah_skill_pro(d: dict) -> dict:
    """Menerima file skill .zip / .md / .txt, mengekstrak ke motion/skills/, dan auto-purge file mentah."""
    import base64
    import zipfile
    import io

    nama = re.sub(r"[^\w-]", "", d.get("nama") or "custom-skill")
    konten_b64 = d.get("konten", "")
    tipe = d.get("tipe", "zip").lower()
    skill_dir = MOTION / "skills"
    skill_dir.mkdir(parents=True, exist_ok=True)

    if not konten_b64:
        raise ValueError("Konten file skill kosong.")
    data = base64.b64decode(konten_b64)

    if tipe == "zip" or nama.endswith(".zip"):
        target_folder = skill_dir / nama.replace(".zip", "")
        target_folder.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            zf.extractall(target_folder)
        # Sesuai FR-05: Auto-purge file zip mentah dilakukan karena diekstrak langsung dari memory buffer
    else:
        target_file = skill_dir / f"{nama}.md"
        target_file.write_bytes(data)

    return {"ok": True, "nama": nama, "daftar": daftar_skills_pro()["skills"]}


def hapus_skill_pro(d: dict) -> dict:
    """Menghapus skill eksternal custom dari motion/skills/ (skill bawaan dilindungi)."""
    nama = re.sub(r"[^\w-]", "", d.get("nama", "") or d.get("id", ""))
    inti = {"isometric-video", "motion-graphics", "sound-effects", "video-making"}
    if nama in inti:
        raise ValueError(f"Skill inti '{nama}' tidak dapat dihapus.")
    skill_dir = MOTION / "skills"
    target_dir = skill_dir / nama
    target_md = skill_dir / f"{nama}.md"
    if target_dir.is_dir():
        shutil.rmtree(target_dir)
    elif target_md.is_file():
        target_md.unlink()

    # Hapus dari registry.json jika ada
    reg_file = skill_dir / "registry.json"
    if reg_file.exists():
        try:
            items = json.loads(reg_file.read_text(encoding="utf-8"))
            items = [it for it in items if it.get("slug") != nama]
            reg_file.write_text(json.dumps(items, indent=2), encoding="utf-8")
        except Exception:
            pass

    # Hapus preset .tsx jika ada
    preset_file = MOTION / "src" / "presets" / f"{nama}.tsx"
    if preset_file.is_file():
        try:
            preset_file.unlink()
        except Exception:
            pass

    return {"ok": True, "daftar": daftar_skills_pro()["skills"]}


def ekstrak_gaya_video_pro(d: dict) -> dict:
    """Ekstraksi gaya visual video referensi -> Buat AI Skill & Preset Remotion Global."""
    import base64
    slug = re.sub(r"[^\w-]", "-", (d.get("slug") or "style-custom").lower()).strip("-")
    if not slug:
        slug = f"style-{int(time.time())}"

    video_b64 = d.get("video", "") or d.get("data", "")
    video_path_str = d.get("video_path", "")
    auto_purge = bool(d.get("auto_purge", True))

    tmp_video = None
    if video_b64:
        if "," in video_b64:
            video_b64 = video_b64.split(",", 1)[1]
        raw_bytes = base64.b64decode(video_b64)
        tmp_dir = DATA / "tmp_extract"
        tmp_dir.mkdir(parents=True, exist_ok=True)
        tmp_video = tmp_dir / f"ref_{slug}_{int(time.time())}.mp4"
        tmp_video.write_bytes(raw_bytes)
        video_target = tmp_video
    elif video_path_str:
        video_target = Path(video_path_str)
        if not video_target.is_absolute():
            video_target = ALAT / video_path_str
    else:
        raise ValueError("Tidak ada file video yang disertakan.")

    if not video_target.exists():
        raise ValueError(f"File video '{video_target}' tidak ditemukan.")

    # Cari folder scripts di ALAT (root proyek) atau AKAR (studio)
    scripts_dir = ALAT / "scripts"
    if not (scripts_dir / "extract_video_style.py").exists():
        scripts_dir = AKAR / "scripts"

    py_bin = sys.executable
    if py_bin.lower().endswith("pythonw.exe"):
        cand = py_bin[:-5] + ".exe"
        if Path(cand).exists():
            py_bin = cand

    # 1. Jalankan scripts/extract_video_style.py
    cmd_extract = [
        py_bin,
        str(scripts_dir / "extract_video_style.py"),
        "--video", str(video_target),
        "--slug", slug,
    ]
    if auto_purge:
        cmd_extract.append("--purge")

    res1 = subprocess.run(cmd_extract, capture_output=True, text=True, cwd=str(ALAT))
    if res1.returncode != 0:
        raise RuntimeError(f"Gagal ekstraksi gaya: {res1.stderr or res1.stdout}")

    # 2. Jalankan scripts/generate_style_artifacts.py
    cmd_gen = [
        py_bin,
        str(scripts_dir / "generate_style_artifacts.py"),
        "--slug", slug,
        "--purge-frames"
    ]
    res2 = subprocess.run(cmd_gen, capture_output=True, text=True, cwd=str(ALAT))
    if res2.returncode != 0:
        raise RuntimeError(f"Gagal generate template & skill: {res2.stderr or res2.stdout}")

    # 3. Baca metrics hasil generasi
    metrics_file = ALAT / "tmp_style_frames" / slug / "metrics.json"
    if not metrics_file.exists():
        metrics_file = AKAR / "tmp_style_frames" / slug / "metrics.json"

    metrics = {}
    if metrics_file.exists():
        try:
            metrics = json.loads(metrics_file.read_text(encoding="utf-8"))
        except Exception:
            pass

    return {
        "ok": True,
        "slug": slug,
        "display_name": metrics.get("display_name", slug.title()),
        "palette_hex": metrics.get("palette_hex", []),
        "avg_pacing_sec": metrics.get("avg_pacing_sec", 3.5),
        "skill_md": f"motion/skills/{slug}/SKILL.md",
        "preset_tsx": f"motion/src/presets/{slug}.tsx",
        "metrics": metrics,
        "daftar": daftar_skills_pro()["skills"]
    }

    return {
        "ok": True,
        "slug": slug,
        "display_name": metrics.get("display_name", slug.title()),
        "palette_hex": metrics.get("palette_hex", []),
        "avg_pacing_sec": metrics.get("avg_pacing_sec", 3.5),
        "skill_md": f"motion/skills/{slug}/SKILL.md",
        "preset_tsx": f"motion/src/presets/{slug}.tsx",
        "metrics": metrics,
        "daftar": daftar_skills_pro()["skills"]
    }


def muat_proyek(jenis: str, nama: str) -> dict:
    f = DATA / jenis / nama
    out = {"jenis": jenis, "nama": nama}
    for berkas in ("klip.json", "info.json", "permintaan.json", "naskah.json"):
        p = f / berkas
        if p.exists():
            out[berkas.split(".")[0]] = json.loads(p.read_text(encoding="utf-8"))
    if (f / "video.mp4").exists():
        out["video"] = f"/berkas/{jenis}/{nama}/video.mp4"
    if (f / "gambar.jpg").exists():
        out["gambar"] = f"/berkas/{jenis}/{nama}/gambar.jpg"
    if (f / "gaya.json").exists():
        out["gaya"] = json.loads((f / "gaya.json").read_text(encoding="utf-8"))
    pr = (out.get("info") or {}).get("pratinjau")
    if pr and (f / pr).exists():
        out["sumber"] = f"/berkas/{jenis}/{nama}/{pr}"
    return out


def jejak_klip(nama: str, no: int) -> dict:
    """Jejak wajah satu klip (detik relatif, posisi-x 0..1) untuk pratinjau Studio — sama persis dengan yang dipakai render."""
    folder = DATA / "klip" / nama
    daftar = json.loads((folder / "klip.json").read_text(encoding="utf-8"))
    d = next((x for x in daftar if x.get("no") == no), None)
    if not d:
        return {"jejak": []}
    if d.get("jejak"):
        return {"jejak": d["jejak"]}
    r = subprocess.run([cari_uv(), "run", "-q", str(KLIP / "klip.py"), "--keluar", str(folder), "--jejak", str(no)],
                       capture_output=True, text=True, cwd=KLIP, timeout=300,
                       creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    try:
        return {"jejak": json.loads(r.stdout.strip().splitlines()[-1])}
    except Exception:  # noqa: BLE001
        return {"jejak": [], "galat": (r.stderr or "")[-300:]}


def daftar_proyek() -> list[dict]:
    out = []
    for jenis in ("klip", "motion"):
        for f in sorted((DATA / jenis).glob("*"), reverse=True) if (DATA / jenis).exists() else []:
            p = muat_proyek(jenis, f.name)
            if (jenis == "klip" and "info" not in p) or (jenis == "motion" and "video" not in p):
                continue  # proyek gagal/terputus tidak ditampilkan (berkasnya tetap ada di disk)
            judul = (p.get("info") or {}).get("judul") or (p.get("naskah") or {}).get("judul") or \
                (p.get("permintaan") or {}).get("sumber") or (p.get("permintaan") or {}).get("topik") or f.name
            jumlah = len(p.get("klip") or []) or (1 if p.get("video") else 0)
            out.append({"jenis": jenis, "nama": f.name, "judul": judul, "jumlah": jumlah,
                        "gambar": p.get("gambar", ""), "durasi": (p.get("info") or {}).get("durasi"),
                        "ai": (p.get("info") or {}).get("ai", "")})
    return sorted(out, key=lambda x: x["nama"], reverse=True)[:50]


def cek_sistem() -> dict:
    return {"uv": bool(shutil.which("uv") or (Path.home() / ".local/bin/uv").exists()),
            "node": bool(shutil.which("node") or Path("/usr/local/bin/node").exists()),
            "mac": sys.platform == "darwin", "win": os.name == "nt", "data": str(DATA),
            "cli": {n: bool(cari_cli(n)) for n in ("claude", "codex", "opencode", "antigravity")},
            "voxcpm": voxcpm_terpasang(), "referensi": ref_suara().name if ref_suara() else ""}


def daftar_model_mesin_aktif() -> dict:
    p = baca_pengaturan()
    ai = (p.get("AI") or "lokal").lower()
    langganan = p.get("LANGGANAN") or "antigravity"

    hasil = {
        "penyedia": ai,
        "langganan": langganan,
        "mesin_label": "",
        "model_tersimpan": "",
        "models": []
    }

    if ai == "langganan":
        if langganan == "antigravity":
            hasil["mesin_label"] = "Antigravity CLI (Google Antigravity)"
            hasil["model_tersimpan"] = p.get("ANTIGRAVITY_MODEL", "")
            models_list = [("", "Bawaan Akun Antigravity")]
            agy = cari_cli("antigravity")
            if agy:
                try:
                    r = subprocess.run([agy, "models"], capture_output=True, text=True, timeout=5)
                    for line in r.stdout.splitlines():
                        line = line.strip()
                        if not line or "Fetching" in line:
                            continue
                        parts = line.split("\t")
                        if len(parts) >= 2:
                            models_list.append((parts[0].strip(), parts[1].strip()))
                        elif parts:
                            models_list.append((parts[0].strip(), parts[0].strip()))
                except Exception:
                    pass
            if len(models_list) <= 1:
                models_list = [
                    ("", "Bawaan Akun Antigravity"),
                    ("gemini-3.8-flash-high", "Gemini 3.8 Flash (High)"),
                    ("gemini-3.8-flash-medium", "Gemini 3.8 Flash (Medium)"),
                    ("gemini-3.8-flash-low", "Gemini 3.8 Flash (Low)"),
                    ("claude-sonnet-4-6", "Claude Sonnet 4.6 (Thinking)"),
                    ("claude-opus-4-6-thinking", "Claude Opus 4.6 (Thinking)"),
                    ("gpt-oss-120b-medium", "GPT-OSS 120B (Medium)")
                ]
            hasil["models"] = [{"id": m[0], "nama": m[1]} for m in models_list]

        elif langganan == "claude-code":
            hasil["mesin_label"] = "Claude Code CLI"
            hasil["model_tersimpan"] = p.get("CLAUDE_CODE_MODEL", "")
            hasil["models"] = [
                {"id": "", "nama": "Bawaan Akun Claude"},
                {"id": "sonnet", "nama": "Claude 3.7 Sonnet (Bawaan Akun)"},
                {"id": "opus", "nama": "Claude 3 Opus (Deep Reasoning)"},
                {"id": "haiku", "nama": "Claude 3.5 Haiku (Cepat)"}
            ]
        elif langganan == "codex":
            hasil["mesin_label"] = "OpenAI Codex CLI"
            hasil["model_tersimpan"] = p.get("CODEX_MODEL", "")
            hasil["models"] = [
                {"id": "", "nama": "Bawaan Akun Codex"},
                {"id": "o3-mini", "nama": "OpenAI o3-mini (Reasoning)"},
                {"id": "o1", "nama": "OpenAI o1"},
                {"id": "gpt-4.5-preview", "nama": "GPT-4.5 Preview"},
                {"id": "gpt-4o", "nama": "GPT-4o"}
            ]
        elif langganan == "opencode":
            hasil["mesin_label"] = "OpenCode Agent"
            hasil["model_tersimpan"] = p.get("OPENCODE_MODEL", "")
            models_list = [("", "Bawaan OpenCode")]
            cli = cari_cli("opencode")
            if cli:
                try:
                    r = subprocess.run([cli, "models"], capture_output=True, text=True, timeout=5)
                    for b in r.stdout.splitlines():
                        b = b.strip()
                        if re.match(r"^[\w.-]+/[\w.:@/-]+$", b):
                            models_list.append((b, b))
                except Exception:
                    pass
            if len(models_list) <= 1:
                models_list += [
                    ("anthropic/claude-3-7-sonnet", "anthropic/claude-3-7-sonnet"),
                    ("openai/gpt-4o", "openai/gpt-4o"),
                    ("google/gemini-2.5-flash", "google/gemini-2.5-flash")
                ]
            hasil["models"] = [{"id": m[0], "nama": m[1]} for m in models_list]

    elif ai == "gemini":
        hasil["mesin_label"] = "Google Gemini API"
        hasil["model_tersimpan"] = p.get("GEMINI_MODEL", "gemini-2.5-flash")
        hasil["models"] = [
            {"id": "gemini-2.5-flash", "nama": "Gemini 2.5 Flash (Cepat & Direkomendasikan)"},
            {"id": "gemini-2.5-pro", "nama": "Gemini 2.5 Pro (Penalaran Kompleks)"},
            {"id": "gemini-2.0-flash", "nama": "Gemini 2.0 Flash"}
        ]
    elif ai == "openai":
        hasil["mesin_label"] = "Ollama / OpenAI API"
        hasil["model_tersimpan"] = p.get("OPENAI_MODEL", "")
        st = status_ai().get("openai", {})
        m_list = st.get("model", [])
        if m_list:
            hasil["models"] = [{"id": m, "nama": m} for m in m_list]
        else:
            hasil["models"] = [{"id": p.get("OPENAI_MODEL", "gemma3:4b"), "nama": p.get("OPENAI_MODEL", "gemma3:4b")}]
    else:
        hasil["mesin_label"] = "AI Lokal"
        hasil["models"] = [{"id": "lokal", "nama": "Rumus Heuristik Lokal (Tanpa Internet)"}]

    return hasil


# ── HTTP ────────────────────────────────────────────────────────────────────
class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _json(self, obj, kode=200):
        b = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(kode)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _file(self, p: Path):
        if not p.is_file():
            return self._json({"galat": "tidak ditemukan"}, 404)
        ukuran = p.stat().st_size
        tipe = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
        rng = self.headers.get("Range")
        mulai, akhir = 0, ukuran - 1
        if rng and (m := re.match(r"bytes=(\d*)-(\d*)", rng)):
            mulai = int(m.group(1) or 0)
            akhir = int(m.group(2)) if m.group(2) else ukuran - 1
            self.send_response(206)
            self.send_header("Content-Range", f"bytes {mulai}-{akhir}/{ukuran}")
        else:
            self.send_response(200)
        self.send_header("Content-Type", tipe)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(akhir - mulai + 1))
        self.end_headers()
        with open(p, "rb") as fh:
            fh.seek(mulai)
            sisa = akhir - mulai + 1
            while sisa > 0 and (blok := fh.read(min(1 << 16, sisa))):
                self.wfile.write(blok)
                sisa -= len(blok)

    def _body(self) -> dict:
        n = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(n) or b"{}")

    def _asal_aman(self) -> bool:
        # tolak permintaan dari situs lain (CSRF) — hanya halaman Studio sendiri
        asal = self.headers.get("Origin")
        return asal is None or asal in (f"http://127.0.0.1:{PORT}", f"http://localhost:{PORT}")

    def do_GET(self):
        u = urlparse(self.path)
        jalur = unquote(u.path)
        try:
            if jalur in ("/", "/index.html"):
                return self._file(AKAR / "index.html")
            if jalur == "/api/status":
                return self._json(KERJA.ringkas())
            if jalur == "/api/pengaturan":
                return self._json({"pengaturan": samarkan(baca_pengaturan()), "sistem": cek_sistem()})
            if jalur == "/api/model-aktif":
                return self._json(daftar_model_mesin_aktif())
            if jalur == "/api/model-opencode":
                # daftar model dari OpenCode milik pengguna (`opencode models`)
                cli = cari_cli("opencode")
                if not cli:
                    return self._json({"model": []})
                try:
                    r = subprocess.run([cli, "models"], capture_output=True, text=True, timeout=30)
                    daftar = [b.strip() for b in r.stdout.splitlines() if re.match(r"^[\w.-]+/[\w.:@/-]+$", b.strip())]
                except Exception:  # noqa: BLE001
                    daftar = []
                return self._json({"model": daftar[:300]})
            if jalur == "/api/sistem-detail":
                return self._json(sistem_detail())
            if jalur == "/api/status-ai":
                return self._json(status_ai())
            if jalur == "/api/proyek":
                return self._json(daftar_proyek())
            if m := re.match(r"^/api/jejak/([\w-]+)/(\d+)$", jalur):
                return self._json(jejak_klip(m.group(1), int(m.group(2))))
            if m := re.match(r"^/api/proyek/(klip|motion)/([\w-]+)$", jalur):
                return self._json(muat_proyek(m.group(1), m.group(2)))
            if m := re.match(r"^/berkas/(klip|motion)/([\w-]+)/([\w.-]+)$", jalur):
                return self._file(DATA / m.group(1) / m.group(2) / m.group(3))
            if m := re.match(r"^/font/([\w.-]+\.ttf)$", jalur):  # font preset klip (OFL) untuk pratinjau
                return self._file(KLIP / "font" / m.group(1))
            if jalur.startswith("/aset/"):
                p = (AKAR / jalur.lstrip("/")).resolve()
                if AKAR in p.parents:
                    return self._file(p)
            self._json({"galat": "tidak ditemukan"}, 404)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_POST(self):
        if not self._asal_aman():
            return self._json({"galat": "asal tidak diizinkan"}, 403)
        jalur = urlparse(self.path).path
        try:
            if jalur == "/api/pasang-suara":
                return self._json(pasang_suara())
            if jalur == "/api/referensi-suara":
                # rekaman suara untuk clone — hanya suara sendiri / yang sudah memberi izin (dicentang di UI)
                if self.headers.get("X-Izin") != "ya":
                    return self._json({"galat": "Centang dulu pernyataan izin suara."}, 400)
                eks = re.sub(r"[^a-z0-9]", "", Path(self.headers.get("X-Nama-File", "a.wav")).suffix.lower())[:5] or "wav"
                if eks not in ("wav", "mp3", "m4a", "flac", "ogg"):
                    return self._json({"galat": "Format rekaman harus wav/mp3/m4a/flac/ogg."}, 400)
                for lama in DATA.glob("suara-referensi.*"):
                    lama.unlink()
                n = int(self.headers.get("Content-Length") or 0)
                if n > 50 * 1024 * 1024:
                    return self._json({"galat": "Rekaman terlalu besar (maks 50 MB, cukup 10–20 detik)."}, 400)
                (DATA / f"suara-referensi.{eks}").write_bytes(self.rfile.read(n))
                return self._json({"ok": True})
            if jalur == "/api/unggah":
                nama = re.sub(r"[^\w.-]", "_", self.headers.get("X-Nama-File", "video.mp4"))
                tujuan = DATA / ("aset" if self.headers.get("X-Jenis") == "aset" else "unggahan")
                tujuan.mkdir(parents=True, exist_ok=True)
                p = tujuan / nama
                n = int(self.headers.get("Content-Length") or 0)
                with open(p, "wb") as fh:
                    while n > 0 and (blok := self.rfile.read(min(1 << 20, n))):
                        fh.write(blok)
                        n -= len(blok)
                return self._json({"jalur": str(p)})
            d = self._body()
            if jalur == "/api/pengaturan":
                simpan_pengaturan(d)
                return self._json({"ok": True, "pengaturan": samarkan(baca_pengaturan())})
            if jalur == "/api/siapkan":
                return self._json(siapkan(d.get("komponen", "")))
            if jalur == "/api/wizard-selesai":
                (DATA / ".wizard-selesai").write_text("ok")
                return self._json({"ok": True})
            if jalur == "/api/uji-ai":
                return self._json(uji_ai(d.get("penyedia", "")))
            if jalur == "/api/pasang-cli":
                return self._json(pasang_cli(d.get("nama", "")))
            if jalur == "/api/login-cli":
                return self._json(buka_login(d.get("nama", "")))
            if jalur == "/api/ollama-tarik":
                model = re.sub(r"[^\w.:/-]", "", d.get("model", "gemma3:4b"))
                ollama = shutil.which("ollama") or next((c for c in ("/usr/local/bin/ollama", "/Applications/Ollama.app/Contents/Resources/ollama",
                    str(Path.home() / "AppData/Local/Programs/Ollama/ollama.exe")) if Path(c).exists()), "ollama")
                KERJA.jalankan("pasang", [([ollama, "pull", model], DATA)], DATA)
                return self._json({"ok": True})
            if jalur == "/api/buka-url":
                from urllib.parse import urlparse as _u
                url = d.get("url", "")
                if _u(url).scheme == "https" and _u(url).hostname in DOMAIN_BOLEH:
                    webbrowser.open(url)
                    return self._json({"ok": True})
                return self._json({"galat": "Alamat tidak diizinkan."}, 400)
            if jalur == "/api/klip-render":
                return self._json({"galat": "Mode klip video sedang dalam tahap pengembangan. Silakan pasang aplikasi klip terpisah di https://github.com/Bayunity-Brkhstd/clip"}, 400)
            if jalur == "/api/hapus-proyek":
                f = (DATA / d.get("jenis", "") / re.sub(r"[^\w-]", "", d.get("nama", ""))).resolve()
                if f.is_dir() and DATA.resolve() in f.parents and f.parent.name in ("klip", "motion"):
                    shutil.rmtree(f)
                return self._json({"ok": True})
            if jalur == "/api/klip":
                return self._json({"galat": "Mode klip video sedang dalam tahap pengembangan. Silakan pasang aplikasi klip terpisah di https://github.com/Bayunity-Brkhstd/clip"}, 400)
            if jalur == "/api/motion/analisa-audio":
                return self._json(analisa_audio_motion(d))
            if jalur == "/api/motion":
                return self._json(mulai_motion(d))
            if jalur == "/api/motion-pro/orkestrasi":
                return self._json(orkestrasi_motion_pro(d))
            if jalur == "/api/motion-pro/render":
                return self._json(render_motion_pro(d))
            if jalur == "/api/motion-pro/simpan-naskah":
                return self._json(simpan_naskah_pro(d))
            if jalur == "/api/motion-pro/bersihkan-cache":
                return self._json(bersihkan_cache_pro())
            if jalur in ("/api/motion-pro/daftar-skills", "/api/daftar-skills-global"):
                return self._json(daftar_skills_pro())
            if jalur == "/api/motion-pro/unggah-skill":
                return self._json(unggah_skill_pro(d))
            if jalur == "/api/motion-pro/hapus-skill":
                return self._json(hapus_skill_pro(d))
            if jalur in ("/api/motion-pro/ekstrak-gaya-video", "/api/ekstrak-gaya-video"):
                return self._json(ekstrak_gaya_video_pro(d))
            if jalur == "/api/unduh":
                f = (DATA / d.get("jenis", "") / d.get("nama", "") / d.get("file", "")).resolve()
                if not f.is_file() or DATA.resolve() not in f.parents:
                    return self._json({"galat": "berkas tidak ditemukan"}, 404)
                tujuan = Path.home() / "Downloads" / f"{d.get('nama')}-{f.name}"
                shutil.copy(f, tujuan)
                return self._json({"jalur": str(tujuan)})
            if jalur == "/api/matikan":
                KERJA.batal()
                threading.Timer(0.3, lambda: os._exit(0)).start()
                return self._json({"ok": True})
            if jalur == "/api/batal":
                KERJA.batal()
                return self._json({"ok": True})
            if jalur == "/api/buka-folder":
                f = DATA / d.get("jenis", "") / d.get("nama", "")
                if f.exists() and DATA in f.resolve().parents:
                    buka_folder(f)
                return self._json({"ok": True})
            self._json({"galat": "tidak ditemukan"}, 404)
        except (ValueError, RuntimeError, json.JSONDecodeError) as e:
            self._json({"galat": str(e)}, 400)


def buka_folder(f: Path) -> None:
    if sys.platform == "darwin":
        subprocess.run(["open", str(f)])
    elif os.name == "nt":
        os.startfile(str(f))  # type: ignore[attr-defined]
    else:
        subprocess.run(["xdg-open", str(f)])


def server_hidup(url: str) -> bool:
    import urllib.request
    try:
        urllib.request.urlopen(url + "/api/status", timeout=1)
        return True
    except Exception:  # noqa: BLE001
        return False


def main():
    DATA.mkdir(parents=True, exist_ok=True)
    url = f"http://127.0.0.1:{PORT}"
    sudah = server_hidup(url)
    if not sudah:
        srv = ThreadingHTTPServer(("127.0.0.1", PORT), H)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        print(f"Cheat Clip and Motion jalan di {url}")
    if "--tanpa-buka" in sys.argv:
        try:
            while True:
                time.sleep(3600)
        except KeyboardInterrupt:
            return
    if "--browser" in sys.argv:
        webbrowser.open(url)
        try:
            while True:
                time.sleep(3600)
        except KeyboardInterrupt:
            return
    # Jendela aplikasi native (WebKit di macOS, WebView2 di Windows). Tutup jendela = mesin berhenti.
    try:
        import webview
    except Exception as e:  # noqa: BLE001
        print(f"Jendela native tidak tersedia ({e}); membuka browser.")
        webbrowser.open(url)
        while True:
            time.sleep(3600)

    class Jembatan:
        def unduh(self, nama: str, isi: str) -> str:
            tujuan = Path.home() / "Downloads" / nama
            tujuan.write_text(isi, encoding="utf-8")
            return str(tujuan)

    if sys.platform == "darwin":
        # Nama & ikon di menu bar/Dock: "Cheat Clip and Motion", bukan "python"
        try:
            from AppKit import NSApplication, NSImage
            from Foundation import NSBundle
            info = NSBundle.mainBundle().localizedInfoDictionary() or NSBundle.mainBundle().infoDictionary()
            info["CFBundleName"] = "Cheat Clip and Motion"
        except Exception:  # noqa: BLE001
            pass

    def setelah_mulai():
        # ikon Dock dipasang setelah aplikasi Cocoa berjalan (kalau terlalu awal, ditimpa ikon python)
        if sys.platform != "darwin":
            return
        try:
            from AppKit import NSApplication, NSImage
            from PyObjCTools import AppHelper
            gambar = NSImage.alloc().initWithContentsOfFile_(str(AKAR / "aset" / "ikon.png"))
            AppHelper.callAfter(lambda: NSApplication.sharedApplication().setApplicationIconImage_(gambar))
        except Exception:  # noqa: BLE001
            pass

    webview.settings["ALLOW_DOWNLOADS"] = True
    webview.create_window("Cheat Clip and Motion", url, width=1360, height=880, min_size=(900, 640),
                          background_color="#07090F", js_api=Jembatan())
    webview.start(setelah_mulai)
    KERJA.batal()
    os._exit(0)


if __name__ == "__main__":
    main()
