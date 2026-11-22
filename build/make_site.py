#!/usr/bin/env python3
"""Build the hosted film page in `site/`.

Reads the finished MP4 (default `out/mansion-vision-the-modern-hillside-palace.mp4`,
or the path given as argv[1]), extracts a poster frame plus one thumbnail per
shot, works out the chapter timestamps from the same constants `build_video.py`
renders with, and writes `site/index.html`.

    .venv/bin/python build/make_site.py [path/to/film.mp4]

The video itself is copied to `site/film/` so the whole folder is a complete,
self-contained deployment (nothing else in the repo is served).
"""
import html
import json
import os
import re
import shutil
import subprocess
import sys

import imageio_ffmpeg

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build_video as bv          # noqa: E402  (constants + shot lists)
import make_cards as mc           # noqa: E402  (caption text)

ROOT = os.path.dirname(HERE)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SITE = os.path.join(ROOT, "site")
IMG = os.path.join(SITE, "img")
FILM_DIR = os.path.join(SITE, "film")

SITE_URL = os.environ.get("SITE_URL", "https://future-mansion.vercel.app")

DEFAULT_SRC = os.path.join(ROOT, "out", "mansion-vision-the-modern-hillside-palace.mp4")
WEB_SRC = os.path.join(ROOT, "site", "film", os.path.basename(DEFAULT_SRC))
# prefer the web cut (build/make_web_cut.py) when it has already been made
SRC = sys.argv[1] if len(sys.argv) > 1 else (WEB_SRC if os.path.exists(WEB_SRC) else DEFAULT_SRC)
FILM_NAME = os.path.basename(SRC)

CAPTION_TEXT = dict(mc.CAPTIONS)


def run(args):
    subprocess.run([str(a) for a in args], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def probe(path):
    """duration (s), width, height, bitrate (bps) via ffprobe-less ffmpeg parse."""
    out = subprocess.run([FFMPEG, "-i", path], capture_output=True, text=True).stderr
    dur = 0.0
    w = h = 0
    bitrate = 0
    for line in out.splitlines():
        if "Duration:" in line:
            hms, _, rest = line.split("Duration:")[1].partition(",")
            hh, mm, ss = hms.strip().split(":")
            dur = int(hh) * 3600 + int(mm) * 60 + float(ss)
            if "bitrate:" in rest:
                try:
                    bitrate = int(rest.split("bitrate:")[1].split("kb/s")[0].strip()) * 1000
                except ValueError:
                    pass
        if "Video:" in line:
            m = re.search(r"\b(\d{3,5})x(\d{3,5})\b", line)
            if m:
                w, h = int(m.group(1)), int(m.group(2))
    return dur, w, h, bitrate


def timeline():
    """[(key, label, start_s, dur_s)] in final-timeline order, xfades accounted for."""
    entries = [("__title", "Title card", bv.CARD_D)]
    for fname, cap, *_ in bv.EXTERIOR_SHOTS:
        entries.append((cap, CAPTION_TEXT[cap], bv.SHOT_D))
    entries.append(("__divider", "Inside the Palace", bv.DIVIDER_D))
    for fname, cap, *_ in bv.INTERIOR_SHOTS:
        entries.append((cap, CAPTION_TEXT[cap], bv.INTERIOR_D))
    entries.append(("__end", "End card", bv.CARD_D))

    rows, start = [], 0.0
    for key, label, dur in entries:
        rows.append({"key": key, "label": label, "start": start, "dur": dur})
        start += dur - bv.XF
    return rows


def grab_frame(src, t, dest, width):
    run([FFMPEG, "-y", "-hide_banner", "-loglevel", "error", "-ss", f"{t:.3f}",
         "-i", src, "-frames:v", "1", "-vf", f"scale={width}:-2",
         "-q:v", "3", dest])


def mmss(t):
    return f"{int(t // 60)}:{int(round(t % 60)):02d}"


def human(nbytes):
    return f"{nbytes / (1024 * 1024):.0f} MB" if nbytes >= 1024 * 1024 else \
           f"{nbytes / 1024:.0f} KB"


PAGE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Mansion Vision — The Modern Hillside Palace · The Film</title>
<meta name="description" content="{desc}" />
<meta property="og:type" content="video.movie" />
<meta property="og:title" content="Mansion Vision — The Modern Hillside Palace" />
<meta property="og:description" content="{desc}" />
<meta property="og:url" content="{site_url}/" />
<meta property="og:image" content="{site_url}/img/poster.jpg" />
<meta property="og:video" content="{site_url}/film/{film_name}" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="{width}" />
<meta property="og:video:height" content="{height}" />
<meta name="twitter:card" content="player" />
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='88'>🎬</text></svg>" />
<style>
  :root {{
    --gold: #d4af37;
    --gold-soft: #e9d9a0;
    --gold-dim: #967e44;
    --ink: #06070c;
    --ink-2: #0b0d14;
    --line: rgba(212, 175, 55, .22);
  }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html {{ background: var(--ink); }}
  body {{
    font-family: Didot, 'Bodoni MT', 'Playfair Display', Georgia, 'Times New Roman', serif;
    background:
      radial-gradient(120% 70% at 50% -10%, rgba(212,175,55,.13), transparent 62%),
      radial-gradient(90% 60% at 50% 110%, rgba(38,54,74,.35), transparent 70%),
      var(--ink);
    color: var(--gold-soft);
    min-height: 100%;
    -webkit-font-smoothing: antialiased;
  }}
  .wrap {{ max-width: 1180px; margin: 0 auto; padding: 46px 26px 78px; }}

  /* ---------- masthead ---------- */
  header {{ text-align: center; margin-bottom: 34px; }}
  .mark {{ font-size: clamp(24px, 4.4vw, 42px); font-weight: 500; letter-spacing: .42em; text-indent: .42em; color: var(--gold-soft); }}
  .mark .thin {{ color: var(--gold); }}
  .rule {{ width: 190px; height: 1px; margin: 20px auto; background: linear-gradient(90deg, transparent, var(--gold), transparent); }}
  .sub {{ font-size: clamp(11px, 1.5vw, 14px); letter-spacing: .32em; text-transform: uppercase; color: rgba(233,217,160,.72); }}
  .kicker {{ margin-top: 12px; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--gold-dim); }}

  /* ---------- player ---------- */
  .stage {{
    position: relative; border: 1px solid var(--line); border-radius: 4px; overflow: hidden;
    background: #000; box-shadow: 0 40px 90px -40px rgba(0,0,0,.9), 0 0 0 1px rgba(0,0,0,.6);
  }}
  .stage video {{ display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; background: #000; }}
  .stage .corners {{ position: absolute; inset: 10px; pointer-events: none; }}
  .stage .corners i {{ position: absolute; width: 22px; height: 22px; border: 1px solid rgba(212,175,55,.5); }}
  .stage .corners i:nth-child(1) {{ top: 0; left: 0; border-right: 0; border-bottom: 0; }}
  .stage .corners i:nth-child(2) {{ top: 0; right: 0; border-left: 0; border-bottom: 0; }}
  .stage .corners i:nth-child(3) {{ bottom: 0; left: 0; border-right: 0; border-top: 0; }}
  .stage .corners i:nth-child(4) {{ bottom: 0; right: 0; border-left: 0; border-top: 0; }}

  /* ---------- actions + specs ---------- */
  .actions {{ display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: center; margin: 26px 0 14px; }}
  .btn {{
    display: inline-flex; align-items: center; gap: 12px; cursor: pointer; text-decoration: none;
    font-family: inherit; font-size: 11px; letter-spacing: .28em; text-transform: uppercase;
    color: #12100a; background: linear-gradient(180deg, #f0dfa6, var(--gold) 55%, #a8862f);
    border: 1px solid #e6cd85; padding: 15px 30px; border-radius: 2px;
    box-shadow: 0 14px 34px -14px rgba(212,175,55,.75);
    transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
  }}
  .btn:hover {{ transform: translateY(-1px); filter: brightness(1.07); box-shadow: 0 18px 40px -14px rgba(212,175,55,.9); }}
  .btn.ghost {{ color: var(--gold-soft); background: rgba(8,9,14,.55); border: 1px solid rgba(212,175,55,.42); box-shadow: none; }}
  .btn.ghost:hover {{ border-color: var(--gold); color: #fff; box-shadow: 0 0 26px rgba(212,175,55,.22); }}
  .specs {{ display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 6px; }}
  .chip {{
    font-size: 9.5px; letter-spacing: .22em; text-transform: uppercase; color: rgba(233,217,160,.78);
    border: 1px solid rgba(212,175,55,.24); border-radius: 999px; padding: 7px 13px; background: rgba(255,255,255,.02);
    white-space: nowrap;
  }}
  .note {{ text-align: center; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--gold-dim); margin-top: 16px; }}

  /* ---------- chapters ---------- */
  .acts {{ display: grid; grid-template-columns: 1fr 1fr; gap: 26px; margin-top: 52px; }}
  .act h2 {{ font-size: 12px; letter-spacing: .36em; text-transform: uppercase; color: var(--gold); font-weight: 500; }}
  .act h2 span {{ color: rgba(233,217,160,.5); }}
  .act .hr {{ height: 1px; background: linear-gradient(90deg, var(--gold-dim), transparent); margin: 12px 0 8px; }}
  ol {{ list-style: none; }}
  ol li a {{
    display: flex; align-items: center; gap: 14px; padding: 9px 10px; border-radius: 3px;
    text-decoration: none; color: rgba(233,217,160,.86); transition: background .2s ease, color .2s ease;
  }}
  ol li a:hover, ol li a.active {{ background: rgba(212,175,55,.1); color: #fff; }}
  .t {{ font-variant-numeric: tabular-nums; font-size: 11px; letter-spacing: .12em; color: var(--gold-dim); min-width: 38px; }}
  ol li a:hover .t, ol li a.active .t {{ color: var(--gold); }}
  .th {{ width: 62px; height: 35px; object-fit: cover; border-radius: 2px; border: 1px solid rgba(212,175,55,.28); flex: none; opacity: .82; }}
  ol li a:hover .th {{ opacity: 1; border-color: var(--gold); }}
  .lb {{ font-size: 12.5px; letter-spacing: .13em; text-transform: uppercase; }}

  .lede {{ margin: 46px auto 0; max-width: 760px; text-align: center; font-size: 14.5px; line-height: 2; letter-spacing: .04em; color: rgba(233,217,160,.66); }}
  footer {{ margin-top: 54px; text-align: center; font-size: 9.5px; letter-spacing: .3em; text-transform: uppercase; color: rgba(150,126,68,.85); }}

  @media (max-width: 860px) {{
    .acts {{ grid-template-columns: 1fr; gap: 30px; }}
    .wrap {{ padding: 30px 16px 56px; }}
    .th {{ display: none; }}
  }}
</style>
</head>
<body>
<div class="wrap">

  <header>
    <div class="mark">MANSION <span class="thin">VISION</span></div>
    <div class="rule"></div>
    <div class="sub">The Modern Hillside Palace</div>
    <div class="kicker">Example 02 &ensp;·&ensp; A cinematic tour at blue hour &ensp;·&ensp; {runtime}</div>
  </header>

  <div class="stage">
    <video id="film" controls playsinline preload="metadata" poster="img/poster.jpg">
      <source src="film/{film_name}" type="video/mp4" />
      Your browser cannot play this video — <a href="film/{film_name}" style="color:#e9d9a0">download the MP4</a> instead.
    </video>
    <div class="corners"><i></i><i></i><i></i><i></i></div>
  </div>

  <div class="actions">
    <a class="btn" href="film/{film_name}" download="{film_name}">⬇&ensp;Download the film&ensp;·&ensp;{size}</a>
    <button class="btn ghost" id="btn-copy">🔗&ensp;Copy video link</button>
  </div>

  <div class="specs">
    <span class="chip">{width}×{height}</span>
    <span class="chip">{fps} fps</span>
    <span class="chip">H.264 · MP4</span>
    <span class="chip">{size}</span>
    <span class="chip">{bitrate}</span>
    <span class="chip">Silent by choice</span>
    <span class="chip">AI-generated stills</span>
  </div>
  <p class="note">Act I orbits the exterior at blue hour &ensp;·&ensp; Act II steps inside — foyer to sky lounge to home cinema</p>

  <div class="acts">
    <section class="act">
      <h2>Act I &ensp;<span>· The Exterior</span></h2>
      <div class="hr"></div>
      <ol id="act-1">{act1}</ol>
    </section>
    <section class="act">
      <h2>Act II &ensp;<span>· The Interior</span></h2>
      <div class="hr"></div>
      <ol id="act-2">{act2}</ol>
    </section>
  </div>

  <p class="lede">
    A contemporary hybrid hillside palace on a Beverly Hills coastal bluff — sweeping curved
    white concrete, floor-to-ceiling glass glowing warm gold, a living green roof with a rooftop
    sky lounge, three terraced levels stepping down the slope, and an infinity-edge pool glowing
    turquoise into the ocean horizon. Slow eased camera drift, gold dissolves, whisper of grain.
  </p>

  <footer>Mansion Vision &ensp;·&ensp; Example 02 &ensp;·&ensp; A I   G E N E R A T E D &ensp;·&ensp; Imagine the estate of your dreams</footer>
</div>

<script>
  const film = document.getElementById('film');
  const chapters = {chapters_json};

  document.querySelectorAll('[data-t]').forEach(a => {{
    a.addEventListener('click', e => {{
      e.preventDefault();
      film.currentTime = parseFloat(a.dataset.t) + 0.05;
      film.play();
      film.scrollIntoView({{ behavior: 'smooth', block: 'center' }});
    }});
  }});

  const links = [...document.querySelectorAll('[data-t]')];
  film.addEventListener('timeupdate', () => {{
    let current = null;
    for (const l of links) if (film.currentTime >= parseFloat(l.dataset.t)) current = l;
    links.forEach(l => l.classList.toggle('active', l === current));
  }});

  const btnCopy = document.getElementById('btn-copy');
  const videoUrl = new URL('film/{film_name}', location.href).href;
  btnCopy.addEventListener('click', async () => {{
    const label = btnCopy.innerHTML;
    try {{
      await navigator.clipboard.writeText(videoUrl);
      btnCopy.innerHTML = '✓&ensp;Link copied';
    }} catch (err) {{
      btnCopy.innerHTML = videoUrl;
      btnCopy.style.letterSpacing = '.04em';
    }}
    setTimeout(() => {{ btnCopy.innerHTML = label; btnCopy.style.letterSpacing = ''; }}, 2600);
  }});
</script>
</body>
</html>
"""


def chapter_html(rows):
    out = []
    for r in rows:
        thumb = ""
        if not r["key"].startswith("__"):
            thumb = f'<img class="th" src="img/{r["key"]}.jpg" alt="" loading="lazy" />'
        out.append(
            f'<li><a href="#" data-t="{r["start"]:.2f}">'
            f'<span class="t">{mmss(r["start"])}</span>{thumb}'
            f'<span class="lb">{html.escape(r["label"])}</span></a></li>'
        )
    return "".join(out)


def main():
    if not os.path.exists(SRC):
        sys.exit(f"film not found: {SRC}\nrun build/build_video.py first (or pass a path)")

    dur, w, h, bitrate = probe(SRC)
    rows = timeline()
    size = os.path.getsize(SRC)

    os.makedirs(IMG, exist_ok=True)
    os.makedirs(FILM_DIR, exist_ok=True)

    # poster: the infinity-pool hero, mid-hold
    poster_row = next(r for r in rows if r["key"] == "04")
    grab_frame(SRC, poster_row["start"] + poster_row["dur"] / 2,
               os.path.join(IMG, "poster.jpg"), 1920)

    # one thumbnail per shot
    for r in rows:
        if r["key"].startswith("__"):
            continue
        grab_frame(SRC, r["start"] + min(2.2, r["dur"] / 2), os.path.join(IMG, f'{r["key"]}.jpg'), 320)

    dest_film = os.path.join(FILM_DIR, FILM_NAME)
    if os.path.abspath(dest_film) != os.path.abspath(SRC):
        shutil.copyfile(SRC, dest_film)

    act1 = [r for r in rows if not r["key"].startswith("__") and int(r["key"]) <= 10]
    act2 = [r for r in rows if not r["key"].startswith("__") and int(r["key"]) >= 11]

    desc = (f"A {mmss(dur)} silent cinematic tour of The Modern Hillside Palace — "
            "curved white concrete, a living green roof and an infinity-edge pool at blue hour. "
            f"{w}x{h}, {human(size)} MP4, free to download.")

    page = PAGE.format(
        desc=html.escape(desc, quote=True),
        site_url=SITE_URL.rstrip("/"),
        film_name=FILM_NAME,
        width=w, height=h, fps=30,
        runtime=mmss(dur),
        size=human(size),
        bitrate=f"~{bitrate // 1000} kb/s" if bitrate else "H.264",
        act1=chapter_html(act1),
        act2=chapter_html(act2),
        chapters_json=json.dumps([{"t": round(r["start"], 2), "label": r["label"]} for r in rows]),
    )
    with open(os.path.join(SITE, "index.html"), "w") as fh:
        fh.write(page)

    print(f"site written to {SITE}")
    print(f"  film      {FILM_NAME} ({human(size)})")
    print(f"  runtime   {dur:.1f}s  ·  {w}x{h}  ·  {bitrate // 1000} kb/s")
    print(f"  chapters  {len(act1)} exterior + {len(act2)} interior")


if __name__ == "__main__":
    main()
