#!/usr/bin/env python3
"""Assemble 'MANSION VISION — The Modern Hillside Palace' complete tour.

Act I (exterior): 14s eased Ken Burns stills, arrival -> deepest dusk.
Divider: 'INSIDE THE PALACE' gold card.
Act II (interior): 12s holds — foyer to sky lounge to home cinema.
Pass 1 renders one clip per scene; Pass 2 chains xfade dissolves + vignette +
film grain -> final MP4 (silent).
"""
import math
import os
import subprocess
import sys

import imageio_ffmpeg

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STILLS = os.path.join(ROOT, "assets", "stills")
CARDS = os.path.join(ROOT, "build", "cards")
OUT_DIR = os.path.join(ROOT, "out")
CLIPS = os.path.join(OUT_DIR, "clips")
os.makedirs(CLIPS, exist_ok=True)

W, H, FPS = 1920, 1080, 30
SHOT_D = 14.0
CARD_D = 6.0
XF = 1.6          # dissolve length (s)
UP_W, UP_H = 3344, 1882   # 2x source upscale for smooth zoompan


def run(args):
    print("+", " ".join(str(a) for a in args[:8]), "..." if len(args) > 8 else "")
    subprocess.run([str(a) for a in args], check=True)


def ease_expr(d_frames, span_expr, base):
    """Cosine ease-in-out interpolation helper for zoompan z expressions."""
    return f"({base} + ({span_expr}) * (1 - cos(PI*on/{d_frames - 1})) / 2)"


def motion_filter(kind, z0, z1, frames, pan_dir=1):
    d = frames
    if kind == "push":
        z = ease_expr(d, f"{z1 - z0}", z0)
        x = "(iw-iw/zoom)/2"
        y = "(ih-ih/zoom)/2"
    elif kind == "pull":
        z = ease_expr(d, f"{z1 - z0}", z0)  # z0 > z1: eased zoom-out
        x = "(iw-iw/zoom)/2"
        y = "(ih-ih/zoom)/2"
    elif kind == "panx":
        z = f"{z0}"
        ease = f"(1 - cos(PI*on/{d - 1})) / 2"
        if pan_dir >= 0:
            x = f"(iw-iw/zoom)*{ease}"
        else:
            x = f"(iw-iw/zoom)*(1-{ease})"
        y = "(ih-ih/zoom)/2"
    else:
        raise ValueError(kind)
    return (f"scale={UP_W}:{UP_H}:flags=lanczos,"
            f"zoompan=z='{z}':x='{x}':y='{y}':d={d}:s={W}x{H}:fps={FPS},"
            f"setsar=1")


EXTERIOR_SHOTS = [
    # (file, caption_number, motion, z0, z1, pan_dir) — 14 s holds
    ("05-arrival-motor-court.jpg",          "01", "push", 1.00, 1.15,  1),
    ("10-garden-path-approach.jpg",         "02", "push", 1.06, 1.18,  1),
    ("02-east-terraces.jpg",                "03", "panx", 1.18, None,  1),
    ("01-hero-pool-deck.jpg",               "04", "push", 1.00, 1.12,  1),
    ("03-infinity-pool-ocean.jpg",          "05", "pull", 1.16, 1.00,  1),
    ("06-facade-detail.jpg",                "06", "push", 1.00, 1.20,  1),
    ("07-rooftop-sky-lounge.jpg",           "07", "panx", 1.18, None,  1),
    ("04-aerial-green-roof.jpg",            "08", "pull", 1.24, 1.00,  1),
    ("08-from-ocean-bluff.jpg",             "09", "push", 1.06, 1.16,  1),
    ("09-west-facade-deepest-dusk.jpg",     "10", "push", 1.00, 1.10,  1),
]

INTERIOR_SHOTS = [
    # (file, caption_number, motion, z0, z1, pan_dir) — 12 s holds
    ("int-01-entry.jpg",                    "11", "push", 1.00, 1.14,  1),
    ("int-02-living-salon.jpg",             "12", "pull", 1.14, 1.00,  1),
    ("int-03-kitchen.jpg",                  "13", "push", 1.00, 1.16,  1),
    ("int-04-dining.jpg",                   "14", "panx", 1.16, None,  1),
    ("int-05-library.jpg",                  "15", "push", 1.00, 1.18,  1),
    ("int-06-primary-suite.jpg",            "16", "pull", 1.15, 1.00,  1),
    ("int-07-spa-bath.jpg",                 "17", "push", 1.00, 1.14,  1),
    ("int-08-sky-lounge.jpg",               "18", "panx", 1.16, None,  1),
    ("int-09-cinema.jpg",                   "19", "push", 1.00, 1.18,  1),
]

DIVIDER_D = 5.0
INTERIOR_D = 12.0


def render_clip(src, out_path, motion, z0, z1, pan_dir, dur, caption=None,
                fade_in=False, fade_out=False):
    if os.path.exists(out_path):
        print(f"= reuse {os.path.basename(out_path)}")
        return
    frames = int(round(dur * FPS))
    grade = "eq=contrast=1.03:saturation=1.07:brightness=-0.012"
    vf = motion_filter(motion, z0, z1, frames, pan_dir) + "," + grade
    inputs = ["-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", src]
    if caption:
        cap_png = os.path.join(CARDS, f"cap-{caption}.png")
        inputs += ["-loop", "1", "-framerate", str(FPS), "-t", str(dur), "-i", cap_png]
        vf = (motion_filter(motion, z0, z1, frames, pan_dir) + "," + grade + "[base];"
              + f"[1:v]format=rgba,fade=t=in:st=0.7:d=0.8:alpha=1,"
                f"fade=t=out:st={dur - 0.9:.2f}:d=0.8:alpha=1[ck];"
              + "[base][ck]overlay=0:0:format=auto,format=yuv420p[vout]")
        maps = ["-map", "[vout]"]
        fc = ["-filter_complex", vf]
    else:
        if fade_in:
            vf += f",fade=t=in:st=0:d=1.6"
        if fade_out:
            vf += f",fade=t=out:st={dur - 1.8:.2f}:d=1.8"
        vf += ",format=yuv420p"
        maps = ["-map", "0:v"]
        fc = ["-vf", vf]

    args = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error", *inputs, *fc,
            *maps, "-c:v", "libx264", "-preset", "medium", "-crf", "17",
            "-t", str(dur), out_path]
    run(args)


def main():
    clips = []

    # title card — gentle push, fade from black
    t_out = os.path.join(CLIPS, "00-title.mp4")
    render_clip(os.path.join(CARDS, "title.png"), t_out, "push", 1.0, 1.045, 1,
                CARD_D, fade_in=True)
    clips.append((t_out, CARD_D))

    for i, (fname, cap, motion, z0, z1, pan_dir) in enumerate(EXTERIOR_SHOTS, start=1):
        out_path = os.path.join(CLIPS, f"{i:02d}-{fname.replace('.jpg', '.mp4')}")
        render_clip(os.path.join(STILLS, fname), out_path, motion, z0, z1 or 1.0,
                    pan_dir, SHOT_D, caption=cap)
        clips.append((out_path, SHOT_D))

    # section divider — into the residence
    d_out = os.path.join(CLIPS, "50-divider.mp4")
    render_clip(os.path.join(CARDS, "divider.png"), d_out, "push", 1.0, 1.045, 1,
                DIVIDER_D)
    clips.append((d_out, DIVIDER_D))

    for j, (fname, cap, motion, z0, z1, pan_dir) in enumerate(INTERIOR_SHOTS, start=11):
        out_path = os.path.join(CLIPS, f"{j:02d}-{fname.replace('.jpg', '.mp4')}")
        render_clip(os.path.join(STILLS, fname), out_path, motion, z0, z1 or 1.0,
                    pan_dir, INTERIOR_D, caption=cap)
        clips.append((out_path, INTERIOR_D))

    # end card — gentle push, fade to black
    e_out = os.path.join(CLIPS, "99-end.mp4")
    render_clip(os.path.join(CARDS, "end.png"), e_out, "push", 1.045, 1.0, 1,
                CARD_D, fade_out=True)
    clips.append((e_out, CARD_D))

    # xfade dissolve chain
    inputs = []
    for path, _ in clips:
        inputs += ["-i", path]
    fc_parts = []
    prev = "[0:v]"
    offset = clips[0][1] - XF
    cum = clips[0][1]
    for i in range(1, len(clips)):
        label = f"[v{i}]"
        fc_parts.append(f"{prev}[{i}:v]xfade=transition=fade:duration={XF}:offset={offset:.3f}{label}")
        prev = label
        cum += clips[i][1] - XF
        offset = cum - XF
    total = cum
    fc_parts.append(f"{prev}vignette=PI/5.4,noise=alls=3:allf=t,"
                    f"scale=in_range=full:out_range=limited:flags=lanczos,format=yuv420p[vout]")
    filter_complex = ";".join(fc_parts)

    final_path = os.path.join(OUT_DIR, "mansion-vision-the-modern-hillside-palace.mp4")
    args = [FFMPEG, "-y", "-hide_banner", "-loglevel", "error", *inputs,
            "-filter_complex", filter_complex, "-map", "[vout]",
            "-c:v", "libx264", "-preset", "medium", "-crf", "19",
            "-movflags", "+faststart", "-r", str(FPS), final_path]
    run(args)
    print(f"\nFinal: {final_path}")
    print(f"Approx. duration: {total:.1f}s")


if __name__ == "__main__":
    main()
