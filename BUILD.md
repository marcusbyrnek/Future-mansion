# Mansion Vision — The Modern Hillside Palace (Example 02)

Cinematic exterior tour of the **Example 02 — Modern Hillside Palace** estate from
`MANSION VISION — AI Master Prompt Guide`, built as an AI-still sequence with a slow,
eased camera drift (Ken Burns), elegant dissolves, and silent pacing.

**Deliverable:** `out/mansion-vision-the-modern-hillside-palace.mp4`
1920×1080 · 30 fps · ≈ 2 min 15 s · H.264 (yuv420p) · silent · ~5 Mbps

## The estate (look bible)

A contemporary hybrid hillside palace in Beverly Hills on a coastal bluff:
sweeping **curved white concrete forms**, **floor-to-ceiling glass** glowing warm
gold, **a living green roof** with a rooftop sky lounge, **three terraced levels**
stepping down the slope, an **infinity-edge pool** glowing turquoise, **Canary
Island date palms** and **sculpted topiary**, white stucco + black marble accents,
**blue-hour twilight** with panoramic ocean views. Elle Decor quality, photorealistic.

## Journey (clockwise orbit, arrival → night)

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

Bookended by a gold-on-black **MANSION VISION** title card and end card
(letterspaced serif caps, matching the guide cover). 1.6 s `xfade` dissolves,
subtle vignette, whisper of film grain, per-shot gold lower-third captions with a
soft scrim.

## Rebuild

```bash
python3 -m venv .venv && .venv/bin/pip install pillow imageio-ffmpeg
.venv/bin/python build/make_cards.py     # title/end cards + caption chips
.venv/bin/python build/build_video.py    # stills -> 14 s clips -> xfade chain -> final MP4
```

Source stills live in `assets/stills/` (generated, kept for reproducibility).
`out/` is git-ignored — rebuild locally.

## Extending toward the full 2–5 minute journey

Two planned shots were not generated this pass (image-generation cap):

- `11-pool-symmetrical.jpg` — symmetrical pool alignment shot (closing hero candidate)
- `12-closing-hero.jpg` — lower-lawn closing hero at deepest dusk

Add rows to `SHOTS` in `build/build_video.py` (+ a matching caption in
`build/make_cards.py`) and rebuild. Suggested next beats: entry hall approach at
driver-drop-off, pool steps close-up, topiary garden axis, glass-bridge link to the
guest wing, helicopterpad/approach, and a dawn "morning after" epilogue.

To make the journey longer without new stills, raise `SHOT_D` (currently 14 s) or
`XF` (currently 1.6 s) — but new angles are the better lever.
