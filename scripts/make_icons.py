#!/usr/bin/env python3
"""Generate Saanjha home-screen / PWA icons with Pillow.

A diya (oil lamp) mark — cream bowl + turmeric-amber flame — on the deep
herb-green brand square. Drawn at 4x and downsampled (LANCZOS) for smooth edges.

Outputs (to ../public):
  icon-192.png            rounded, Android/Chrome manifest
  icon-512.png            rounded, manifest + splash
  icon-maskable-512.png   full-bleed square, art in the 80% safe zone
  apple-touch-icon.png    180, full-bleed square (iOS applies its own mask)
  favicon-32.png / 16     browser tab
"""
import os
from PIL import Image, ImageDraw

SS = 4  # supersample factor

GREEN = (46, 93, 59, 255)      # #2E5D3B brand
CREAM = (242, 246, 236, 255)   # #F2F6EC bowl
AMBER = (216, 150, 42, 255)    # #D8962A flame / rim
LIGHT = (245, 220, 150, 255)   # inner flame
RIM   = (198, 132, 30, 255)    # darker amber rim shadow

OUT = os.path.join(os.path.dirname(__file__), "..", "public")
os.makedirs(OUT, exist_ok=True)


def scaled(p, W, s):
    """Scale a point about the image centre (W/2, W/2)."""
    c = W / 2
    return (c + (p[0] - c) * s, c + (p[1] - c) * s)


def sb(box, W, s):
    return [*scaled((box[0], box[1]), W, s), *scaled((box[2], box[3]), W, s)]


def draw_art(d, W, s):
    f = lambda v: v * W  # fraction -> px

    # --- bowl (a shallow boat: lower half of an ellipse) ---
    bowl_box = [f(0.20), f(0.46), f(0.80), f(0.80)]
    d.chord(sb(bowl_box, W, s), 0, 180, fill=CREAM)
    # amber rim along the mouth of the bowl
    rim_box = [f(0.20), f(0.55), f(0.80), f(0.69)]
    d.ellipse(sb(rim_box, W, s), fill=AMBER)
    # cream cut-out so only a thin rim band shows
    cut_box = [f(0.235), f(0.575), f(0.765), f(0.665)]
    d.ellipse(sb(cut_box, W, s), fill=CREAM)
    # foot of the lamp
    foot = [f(0.42), f(0.78), f(0.58), f(0.84)]
    d.rounded_rectangle(sb(foot, W, s), radius=f(0.02) * s, fill=CREAM)

    # --- flame ---
    cx = f(0.5)
    # outer amber bulb + point
    d.ellipse(sb([cx - f(0.115), f(0.45), cx + f(0.115), f(0.62)], W, s), fill=AMBER)
    d.polygon([
        scaled((cx - f(0.105), f(0.515)), W, s),
        scaled((cx + f(0.105), f(0.515)), W, s),
        scaled((cx, f(0.28)), W, s),
    ], fill=AMBER)
    # inner light flame
    d.ellipse(sb([cx - f(0.062), f(0.49), cx + f(0.062), f(0.60)], W, s), fill=LIGHT)
    d.polygon([
        scaled((cx - f(0.055), f(0.535)), W, s),
        scaled((cx + f(0.055), f(0.535)), W, s),
        scaled((cx, f(0.355)), W, s),
    ], fill=LIGHT)


def make(size, corner_frac, art_scale):
    W = size * SS
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, W], fill=GREEN)
    draw_art(d, W, art_scale)
    if corner_frac > 0:
        mask = Image.new("L", (W, W), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [0, 0, W - 1, W - 1], radius=int(W * corner_frac), fill=255)
        img.putalpha(mask)
    return img.resize((size, size), Image.LANCZOS)


jobs = [
    ("icon-192.png", 192, 0.22, 1.0),
    ("icon-512.png", 512, 0.22, 1.0),
    ("icon-maskable-512.png", 512, 0.0, 0.78),
    ("apple-touch-icon.png", 180, 0.0, 0.92),
    ("favicon-32.png", 32, 0.0, 1.0),
    ("favicon-16.png", 16, 0.0, 1.0),
]
for name, size, corner, art in jobs:
    make(size, corner, art).save(os.path.join(OUT, name))
    print("wrote", name, size)
print("done ->", os.path.normpath(OUT))
