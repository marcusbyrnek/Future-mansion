#!/usr/bin/env python3
"""Generate title card, end card and per-shot caption overlays (1920x1080 PNGs)."""
import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1920, 1080
OUT = os.path.join(os.path.dirname(__file__), "cards")
os.makedirs(OUT, exist_ok=True)

SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"

GOLD = [(0.00, (252, 240, 190)), (0.35, (233, 205, 120)),
        (0.62, (198, 158, 74)), (0.85, (150, 112, 40)), (1.00, (110, 80, 28))]
GOLD_SOFT = (214, 182, 106)
GOLD_DIM = (150, 126, 74)


def bg_canvas():
    img = Image.new("RGB", (W, H), (7, 7, 11))
    glow = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(glow)
    d.ellipse([W * 0.16, H * 0.12, W * 0.84, H * 0.88], fill=44)
    glow = glow.filter(ImageFilter.GaussianBlur(240))
    warm = Image.new("RGB", (W, H), (24, 21, 17))
    return Image.composite(warm, img, glow)


def tracked_width(draw, text, font, tracking):
    w = 0
    for ch in text:
        w += draw.textlength(ch, font=font) + tracking
    return w - tracking


def draw_tracked(draw, xy, text, font, tracking, fill):
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking


def tracked_mask(xy, text, font, tracking):
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    draw_tracked(d, xy, text, font, tracking, 255)
    return mask


def gold_line(img, y, text, font, tracking, band_top, band_bottom):
    """Draw letterspaced caps filled with a vertical gold gradient confined to the text band."""
    d = ImageDraw.Draw(img)
    tw = tracked_width(d, text, font, tracking)
    x = (W - tw) / 2
    mask = tracked_mask((x, y), text, font, tracking)
    grad = Image.new("RGB", (W, H))
    gp = grad.load()
    for yy in range(H):
        t = (yy - band_top) / max(band_bottom - band_top, 1)
        t = min(max(t, 0.0), 1.0)
        col = GOLD[-1][1]
        for i in range(len(GOLD) - 1):
            t0, c0 = GOLD[i]; t1, c1 = GOLD[i + 1]
            if t0 <= t <= t1:
                f = (t - t0) / max(t1 - t0, 1e-6)
                col = tuple(int(c0[j] + (c1[j] - c0[j]) * f) for j in range(3))
                break
        for xx in range(W):
            gp[xx, yy] = col
    img.paste(grad, (0, 0), mask)


def centered(img, y, text, font, tracking, fill):
    d = ImageDraw.Draw(img)
    tw = tracked_width(d, text, font, tracking)
    x = (W - tw) / 2
    draw_tracked(d, (x, y), text, font, tracking, fill)


def hrule(img, cx, y, half, thickness, color):
    d = ImageDraw.Draw(img)
    d.rectangle([cx - half, y, cx + half, y + thickness], fill=color)


def make_divider():
    img = bg_canvas()
    f_big = ImageFont.truetype(SERIF, 100)
    f_sub = ImageFont.truetype(SERIF, 34)
    f_small = ImageFont.truetype(SERIF, 23)
    gold_line(img, 348, "INSIDE THE PALACE", f_big, 13, 348, 448)
    hrule(img, W // 2, 528, 300, 2, (168, 134, 60))
    centered(img, 560, "THE RESIDENCE  ·  THE MODERN HILLSIDE PALACE", f_sub, 8, (232, 217, 160))
    centered(img, 648, "AN INTERIOR TOUR — FROM FOYER TO SKY LOUNGE", f_small, 8, GOLD_DIM)
    img.save(os.path.join(OUT, "divider.png"))


def make_title():
    img = bg_canvas()
    f_big = ImageFont.truetype(SERIF, 126)
    f_sub = ImageFont.truetype(SERIF, 42)
    f_small = ImageFont.truetype(SERIF, 25)
    gold_line(img, 306, "MANSION VISION", f_big, 22, 306, 462)
    hrule(img, W // 2, 522, 330, 3, (168, 134, 60))
    centered(img, 556, "THE MODERN HILLSIDE PALACE", f_sub, 15, (232, 217, 160))
    centered(img, 648, "EXAMPLE 02  ·  AN EXTERIOR TOUR AT BLUE HOUR", f_small, 8, GOLD_DIM)
    img.save(os.path.join(OUT, "title.png"))


def make_end():
    img = bg_canvas()
    f_mark = ImageFont.truetype(SERIF, 92)
    f_mid = ImageFont.truetype(SERIF, 34)
    f_small = ImageFont.truetype(SERIF, 22)
    gold_line(img, 288, "MANSION VISION", f_mark, 26, 288, 390)
    hrule(img, W // 2, 446, 240, 2, (168, 134, 60))
    centered(img, 486, "THE MODERN HILLSIDE PALACE", f_mid, 10, (232, 217, 160))
    centered(img, 556, "Curved white concrete  ·  a living green roof  ·  an infinity-edge pool", f_small, 1, (196, 180, 140))
    centered(img, 598, "at blue hour — Beverly Hills, coastal bluff", f_small, 1, (196, 180, 140))
    centered(img, 726, "A I   G E N E R A T E D", f_small, 6, GOLD_DIM)
    centered(img, 770, "IMAGINE THE ESTATE OF YOUR DREAMS", f_small, 6, GOLD_SOFT)
    img.save(os.path.join(OUT, "end.png"))


def make_caption(num, text):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # soft cinematic scrim so the chip reads on bright water/glass
    scrim_h = 330
    for i in range(scrim_h):
        t = i / (scrim_h - 1)          # 0 at top of band -> 1 at bottom
        alpha = int(255 * 0.55 * (1 - math.cos(math.pi * t)) / 2)
        d.line([(0, H - scrim_h + i), (W, H - scrim_h + i)], fill=(4, 4, 8, alpha))
    f = ImageFont.truetype(SERIF, 30)
    label = f"{num} — {text.upper()}"
    x, y = 96, 948
    tracking = 7
    d.rectangle([x, y - 28, x + 170, y - 25], fill=(202, 164, 82, 245))
    # drop shadow then letterspaced gold text
    draw_tracked(d, (x + 2, y + 2), label, f, tracking, (0, 0, 0, 200))
    draw_tracked(d, (x, y), label, f, tracking, (238, 216, 152, 255))
    img.save(os.path.join(OUT, f"cap-{num}.png"))


CAPTIONS = [
    ("01", "Arrival — The Motor Court"),
    ("02", "The Garden Approach"),
    ("03", "The Terraced East Profile"),
    ("04", "The Infinity Pool — Twilight"),
    ("05", "Infinity Edge — Ocean Horizon"),
    ("06", "Curved Concrete & Glass"),
    ("07", "The Rooftop Sky Lounge"),
    ("08", "The Living Green Roof — Drone"),
    ("09", "The Bluff — From the Ocean"),
    ("10", "West Facade — Deepest Blue Hour"),
    ("11", "The Entry — Floating Stair"),
    ("12", "The Grand Living Salon"),
    ("13", "The Chef's Kitchen"),
    ("14", "The Dining Room — Ocean Panorama"),
    ("15", "The Library & Fireplace"),
    ("16", "The Primary Suite"),
    ("17", "The Spa Bath"),
    ("18", "The Rooftop Sky Lounge"),
    ("19", "The Home Cinema"),
]

if __name__ == "__main__":
    make_title()
    make_end()
    make_divider()
    for n, t in CAPTIONS:
        make_caption(n, t)
    print("cards written to", OUT)
