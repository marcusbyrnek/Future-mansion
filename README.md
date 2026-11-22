# Future-mansion

**Mansion Vision — The Modern Hillside Palace** (Example 02), as a silent
cinematic tour film and a hosted page for it.

 **Live: <https://future-mansion.vercel.app>** — the film streams there and the
gold button downloads the full-quality MP4 (1920×1080 · 30 fps · 2:29 · ~61 MB).

| Path | What it is |
|------|------------|
| `site/` | The deployed website: film page, poster/chapter thumbnails, the MP4 |
| `build/build_video.py` | Stills → Ken Burns clips → xfade chain → master MP4 |
| `build/make_cards.py` | Title / divider / end cards + caption chips |
| `build/make_site.py` | Builds `site/index.html` (+ poster/thumbs) from the master |
| `build/make_web_cut.py` | Optional smaller bitrate cut for slow connections |
| `assets/stills/` | The AI-generated stills the film is cut from |
| `index.html` + `assets/js/` | Retired real-time 3D model (kept, no longer hosted) |

Rebuild / redeploy: see `BUILD.md`. Handoff notes for the next session:
`NEXT-SESSION.md`.
