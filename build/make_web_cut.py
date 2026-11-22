#!/usr/bin/env python3
"""Re-encode the finished film into a web/download cut.

The CRF-21 master is ~130 MB — too big to commit or to hand out on a phone
connection. This makes a two-pass H.264 copy at a fixed video bitrate (default
2800 kb/s, ≈ 52 MB for the 2:29 cut) with `+faststart` so the site can begin
streaming before the file has finished arriving.

    .venv/bin/python build/make_web_cut.py [master.mp4] [kbps]

Writes `site/film/<same-name>.mp4` (that folder is what gets deployed).
"""
import os
import subprocess
import sys

import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_SRC = os.path.join(ROOT, "out", "mansion-vision-the-modern-hillside-palace.mp4")
FILM_DIR = os.path.join(ROOT, "site", "film")

src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
kbps = int(sys.argv[2]) if len(sys.argv) > 2 else 2800

if not os.path.exists(src):
    sys.exit(f"master not found: {src}\nrun build/build_video.py first")

os.makedirs(FILM_DIR, exist_ok=True)
dest = os.path.join(FILM_DIR, os.path.basename(src))
passlog = os.path.join(FILM_DIR, "ffmpeg2pass")

common = ["-y", "-hide_banner", "-loglevel", "error", "-i", src,
          "-c:v", "libx264", "-preset", "slow", "-b:v", f"{kbps}k",
          "-maxrate", f"{int(kbps * 1.45)}k", "-bufsize", f"{kbps * 2}k",
          "-pix_fmt", "yuv420p", "-r", "30", "-an"]

print(f"pass 1/2  →  {kbps} kb/s")
subprocess.run([FFMPEG, *common, "-pass", "1", "-passlogfile", passlog,
                "-f", "null", os.devnull], check=True)
print("pass 2/2")
subprocess.run([FFMPEG, *common, "-pass", "2", "-passlogfile", passlog,
                "-movflags", "+faststart", dest], check=True)

for f in os.listdir(FILM_DIR):          # tidy pass logs
    if f.startswith("ffmpeg2pass"):
        os.remove(os.path.join(FILM_DIR, f))

mb = os.path.getsize(dest) / (1024 * 1024)
print(f"\nweb cut: {dest}\n         {mb:.1f} MB  (~{kbps} kb/s)")
if mb > 92:
    print("WARNING: over 92 MB — GitHub rejects files above 100 MB. Lower kbps.")
