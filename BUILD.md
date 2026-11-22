# Mansion Vision — The Modern Hillside Palace (Example 02)

Cinematic tour of the **Example 02 — Modern Hillside Palace** estate from
`MANSION VISION — AI Master Prompt Guide`. Act I orbits the exterior at blue hour;
Act II steps inside — from the foyer's floating stair to the rooftop sky lounge and
the home cinema. AI-still sequence, slow eased camera drift (Ken Burns), gold
dissolves, silent pacing.

**Deliverable:** `out/mansion-vision-the-modern-hillside-palace.mp4`
1920×1080 · 30 fps · ≈ 2 min 29 s · H.264 (yuv420p) · silent · ~3.4 Mbps
(paced 9 s exterior / 8 s interior holds, 1.3 s dissolves, CRF 21)

## The estate (look bible)

A contemporary hybrid hillside palace in Beverly Hills on a coastal bluff:
sweeping **curved white concrete forms**, **floor-to-ceiling glass** glowing warm
gold, **a living green roof** with a rooftop sky lounge, **three terraced levels**
stepping down the slope, an **infinity-edge pool** glowing turquoise, **Canary
Island date palms** and **sculpted topiary**, white stucco + black marble accents,
**blue-hour twilight** with panoramic ocean views. Elle Decor quality, photorealistic.
Interiors carry the same grammar inward: curved white concrete, polished black
marble, travertine, warm cove lighting, champagne brass, wide-plank oak.

## Act I — Exterior (arrival → deepest dusk)

| # | Shot file | Beat | Camera |
|---|-----------|------|--------|
| 01 | `05-arrival-motor-court.jpg` | Arrival — The Motor Court | push in 1.00→1.15 |
| 02 | `10-garden-path-approach.jpg` | The Garden Approach | push in 1.06→1.18 |
| 03 | `02-east-terraces.jpg` | The Terraced East Profile | pan L→R @ 1.18× |
| 04 | `01-hero-pool-deck.jpg` | The Infinity Pool — Twilight | push in 1.00→1.12 |
| 05 | `03-infinity-pool-ocean.jpg` | Infinity Edge — Ocean Horizon | pull back 1.16→1.00 |
| 06 | `06-facade-detail.jpg` | Curved Concrete & Glass | push in 1.00→1.20 |
| 07 | `07-rooftop-sky-lounge.jpg` | The Rooftop Sky Lounge | pan L→R @ 1.18× |
| 08 | `04-aerial-green-roof.jpg` | The Living Green Roof — Drone | pull back 1.24→1.00 |
| 09 | `08-from-ocean-bluff.jpg` | The Bluff — From the Ocean | push in 1.06→1.16 |
| 10 | `09-west-facade-deepest-dusk.jpg` | West Facade — Deepest Blue Hour | push in 1.00→1.10 |

→ gold divider card **INSIDE THE PALACE**

## Act II — Interior (foyer → sky lounge → cinema)

| # | Shot file | Beat | Camera |
|---|-----------|------|--------|
| 11 | `int-01-entry.jpg` | The Entry — Floating Stair | push in 1.00→1.14 |
| 12 | `int-02-living-salon.jpg` | The Grand Living Salon | pull back 1.14→1.00 |
| 13 | `int-03-kitchen.jpg` | The Chef's Kitchen | push in 1.00→1.16 |
| 14 | `int-04-dining.jpg` | The Dining Room — Ocean Panorama | pan L→R @ 1.16× |
| 15 | `int-05-library.jpg` | The Library & Fireplace | push in 1.00→1.18 |
| 16 | `int-06-primary-suite.jpg` | The Primary Suite | pull back 1.15→1.00 |
| 17 | `int-07-spa-bath.jpg` | The Spa Bath | push in 1.00→1.14 |
| 18 | `int-08-sky-lounge.jpg` | The Rooftop Sky Lounge | pan L→R @ 1.16× |
| 19 | `int-09-cinema.jpg` | The Home Cinema | push in 1.00→1.18 |

Bookended by the gold-on-black **MANSION VISION** title card and end card
(letterspaced serif caps, matching the guide cover). 1.3 s `xfade` dissolves,
subtle vignette, whisper of film grain, per-scene gold lower-third captions with a
soft scrim.

## Rebuild

```bash
python3 -m venv .venv && .venv/bin/pip install pillow imageio-ffmpeg
.venv/bin/python build/make_cards.py     # title / divider / end + caption chips
.venv/bin/python build/build_video.py    # stills -> clips -> xfade chain -> MP4
```

Source stills live in `assets/stills/` (generated, kept for reproducibility).
`out/` is git-ignored — rebuild locally.

## The hosted film page (`site/`) · live at future-mansion.vercel.app

The website is a self-contained folder — it is the Vercel **output directory**,
so nothing else in the repo is served. Regenerate it after any re-cut:

```bash
# optional: a smaller-bitrate copy for slow connections (skippable; the 61 MB
# CRF-21 master already streams fine and is what the download button serves)
.venv/bin/python build/make_web_cut.py            # -> site/film/*.mp4 @ ~2800 kb/s
# page + poster + per-chapter thumbnails, timestamps derived from build_video.py
.venv/bin/python build/make_site.py               # -> site/index.html, site/img/*
```

`make_site.py` prefers an existing `site/film/` cut, else falls back to the
`out/` master. Commit `site/`, then Vercel redeploys (project **future-mansion**,
`outputDirectory = site`). The MP4 lives in git on purpose — it is the only way
the deployment can serve and offer it for download.

## Interactive 3D — retired (not hosted)

Besides the film, the repo now contains a real-time 3D recreation of the estate
(Three.js r180, vendored in `assets/vendor/` — no CDN, no build step):

```bash
python3 -m http.server 8080 -b 0.0.0.0   # then open http://localhost:8080
```

- **Play the Tour** — 150 s slow cinematic ride (CatmullRom spline): motor court →
  garden → east terraces → pool deck → infinity edge → west facade → aerial
  green-roof reveal → east descent. Gold captions, thin progress bar.
- **Free Look** — drag to orbit, scroll to zoom.
- **Ambience** — optional generated brown-noise ocean (off by default).

Scene features: three crescent slabs with curved glass curtain walls (slim bronze
mullions), warm emissive interiors (canvas-painted glow with furniture silhouettes),
cove light arcs, living green roof with parapet + glass rail + sky lounge
(black-marble bar, bottle shelf, sofas, fire pit), infinity-edge pool (animated
caustics shader + underwater glow), motor court, curved drive, gate pillars,
black grand tourer, topiary, Canary Island date palms (procedural), cypresses,
animated dusk ocean with ember glitter lane, ember horizon + afterglow sun,
stars, cliff-face bluff, rolling hill silhouettes.

Files: `index.html` · `assets/js/mansion.js` · `assets/js/textures.js` ·
`assets/vendor/three.core.min.js` / `three.module.min.js`.

Caveats (honest): this is real-time stylized CG, not photoreal render — it cannot
match the AI stills' fidelity. Interior rooms are implied through glowing glass,
not walk-in geometry; that is the next big slice if wanted (foyer + salon first).

## Extending further

Still planned (never generated — image-generation cap):

- `11-pool-symmetrical.jpg` — symmetrical pool alignment (closing-hero candidate)
- `12-closing-hero.jpg` — lower-lawn closing hero at deepest dusk

Practical levers: add rows to `EXTERIOR_SHOTS` / `INTERIOR_SHOTS` in
`build/build_video.py` (+ matching captions in `build/make_cards.py`), or raise
`SHOT_D` / `INTERIOR_D` / `XF`. Good next beats: arrival gate + intercom, pool-steps
macro, topiary garden axis, guest-wing link, dawn "morning after" epilogue.
