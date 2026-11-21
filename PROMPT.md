# PROMPT — paste this into the next AI session (no repo attached)

You are helping Marcus (Mbombela, South Africa) finish **MANSION VISION:
The Modern Hillside Palace** — an AI-generated ~2–5 minute cinematic video of
Example 02 from the "MANSION VISION — AI Master Prompt Guide" (the Modern
Hillside Palace shot: a contemporary hybrid hillside mansion in Beverly Hills —
curved white concrete, floor-to-ceiling glass, living green roof, terraced
levels, infinity-edge turquoise pool, Canary Island date palms, blue-hour
twilight, black marble + white stucco, Elle Decor quality).

I have attached a ZIP. It contains everything the project needs — you will NOT
have GitHub or internet access (pypi/github may work, nothing else is guaranteed).

Read these first, in order:
1. `NEXT-SESSION.md` — complete project state, environment traps, definition of done
2. `BUILD.md` — how the film is built
3. `assets/stills/` — all AI-generated stills (Act I exterior `0x-*.jpg`,
   Act II interior `int-0x-*.jpg`)
4. `build/make_cards.py` and `build/build_video.py` — the whole render pipeline

What to do, depending on what Marcus asks:
- **Extend the film**: generate the 2 pending stills (`11-pool-symmetrical`,
  `12-closing-hero`), slot them into `EXTERIOR_SHOTS` (+ captions), rebuild,
  verify frames, deliver.
- **Fix/re-cut the film**: edit `build_video.py` (shot list, durations, order,
  motions, dissolve length) and `make_cards.py`, rebuild, verify.
- **Anything new**: keep the look bible consistent — curved white concrete,
  green roof, black marble, champagne brass, turquoise infinity pool,
  blue-hour twilight, warm interior glow. Elle Decor quality, photorealistic.

Hard rules:
- **Image generation caps at ~10 images per turn** — plan batches of ≤10.
- **npm is broken** (TLS) — get ffmpeg via `python3 -m venv .venv &&
  .venv/bin/pip install pillow imageio-ffmpeg`.
- **Web VS Code cannot run code** — only real terminals can execute anything.
- **Everything untracked disappears between workspace resets** — the MP4 you
  produce must be handed to the user immediately as a downloadable file the
  same session (e.g. `python3 -m http.server 8080 -b 0.0.0.0` in the working
  directory, then have the user open `/out/mansion-vision-the-modern-hillside-palace.mp4`
  on the preview URL and Save Video As — verify with curl first).
- Keep changes incremental; show Marcus a frame before and after every change.
- The film is silent by choice — do not add music/voiceover unless he asks.
- Do not commit or upload the MP4 anywhere; do not create GitHub releases from
  a sandbox (uploads host is blocked).
- Move at a slow, deliberate pace — Marcus wants to iterate, not be rushed.

When the film is rebuilt: verify with `ffmpeg -ss` frame extraction, then make
sure Marcus actually downloads the file before the session ends.
