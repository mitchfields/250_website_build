#!/usr/bin/env python3
"""Bake assets/birds-atlas.png from the vertical green-screen goose sprite sheet.

- keys out the green background
- blackens the remaining bird (rgb = 0, alpha = coverage)
- finds the 5 poses, anchors each by the beak tip + head centre so the body stays
  put while the wings flap (no sprite "bounce")
- rotates each pose 90deg CW so the bird points along +X (the flock travel dir)
- lays an 8-frame ping-pong flap [0,1,2,3,4,3,2,1] as a horizontal strip
"""
import sys, numpy as np
from PIL import Image

SRC = '/Users/mifields/.cursor/projects/Users-mifields-Desktop-250-website-build/assets/image-3d4cbd86-11bb-4622-ba9a-309b7c173e78.png'
OUTS = [
    '/Users/mifields/Desktop/250_website_build/assets/birds-atlas.png',
    '/Users/mifields/Desktop/250_website_build/site/assets/birds-atlas.png',
    '/Users/mifields/Desktop/250_website_build/US-Historic-Homes-netlify/assets/birds-atlas.png',
]
FR = 200          # output frame size (square)
LO, HI = 55, 120  # green-distance -> alpha ramp

im = Image.open(SRC).convert('RGB')
rgb = np.asarray(im).astype(np.float32)
H, W, _ = rgb.shape

# background green = median of the four corners
corners = np.array([rgb[2, 2], rgb[2, W-3], rgb[H-3, 2], rgb[H-3, W-3]])
bg = np.median(corners, axis=0)

dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
alpha = np.clip((dist - LO) / (HI - LO), 0, 1)          # 0 = green, 1 = bird

# --- find the 5 birds as contiguous runs of non-empty rows ---
rowmass = alpha.sum(axis=1)
thr = rowmass.max() * 0.03
on = rowmass > thr
runs = []
i = 0
while i < H:
    if on[i]:
        j = i
        while j < H and (on[j] or (j+2 < H and on[min(H-1, j+2)])):  # bridge tiny gaps
            j += 1
        runs.append((i, j))
        i = j
    else:
        i += 1
# keep the 5 largest runs, in top-to-bottom order
runs = sorted(sorted(runs, key=lambda r: -(r[1]-r[0]))[:5])
if len(runs) != 5:
    print(f'WARN: found {len(runs)} runs: {runs}', file=sys.stderr)

birds = []   # (alpha_crop, beak_y_local, head_cx_local, r0, c0)
for (r0, r1) in runs:
    a = alpha[r0:r1]
    colmass = a.sum(axis=0)
    cthr = colmass.max() * 0.03
    cols = np.where(colmass > cthr)[0]
    c0, c1 = int(cols[0]), int(cols[-1]) + 1
    rows = np.where(a.sum(axis=1) > a.sum(axis=1).max() * 0.03)[0]
    br0, br1 = int(rows[0]), int(rows[-1]) + 1
    beak_y = br0
    head_h = max(3, int((br1 - br0) * 0.18))
    head = a[beak_y:beak_y + head_h]
    xs = np.arange(W)
    hm = head.sum()
    head_cx = float((head.sum(axis=0) * xs).sum() / hm) if hm > 0 else (c0 + c1) / 2
    birds.append(dict(a=a, r0=r0, br0=br0, br1=br1, c0=c0, c1=c1,
                      beak_y=beak_y, head_cx=head_cx))

# --- common alignment box (anchor = beak tip at top-centre) ---
pad = 8
D = max(b['br1'] - b['beak_y'] for b in birds)          # body length below beak
Lx = max(b['head_cx'] - b['c0'] for b in birds)         # wing reach left of head
Rx = max(b['c1'] - b['head_cx'] for b in birds)         # wing reach right of head
SQ = int(max(2 * max(Lx, Rx), D + pad) + 2 * pad)
anchor_x = SQ // 2
anchor_y = pad

frames = []
for b in birds:
    canvas = np.zeros((SQ, SQ), np.float32)             # alpha only; rgb stays black
    a = b['a']                                          # local to the row run (starts at r0)
    ah, aw = a.shape
    # map source (col x, run-row y) -> canvas so (head_cx, beak_y) lands on (anchor_x, anchor_y)
    dx = int(round(anchor_x - b['head_cx']))
    dy = int(round(anchor_y - b['beak_y']))   # beak_y is already crop-local
    for sy in range(ah):
        ty = sy + dy
        if ty < 0 or ty >= SQ:
            continue
        row = a[sy]
        x0 = max(0, dx); x1 = min(SQ, aw + dx)
        sx0 = x0 - dx; sx1 = x1 - dx
        if x1 > x0:
            canvas[ty, x0:x1] = np.maximum(canvas[ty, x0:x1], row[sx0:sx1])
    # rotate 90deg CW: beak (top) -> right, so the bird points +X
    canvas = np.rot90(canvas, k=-1)
    frames.append(canvas)

order = [0, 1, 2, 3, 4, 3, 2, 1]                        # ping-pong flap
strip = np.zeros((FR, FR * len(order), 4), np.uint8)
for k, fi in enumerate(order):
    fa = Image.fromarray((frames[fi] * 255).astype(np.uint8), 'L').resize((FR, FR), Image.LANCZOS)
    fa = np.asarray(fa).astype(np.uint8)
    tile = np.zeros((FR, FR, 4), np.uint8)              # rgb = 0 (black)
    tile[:, :, 3] = fa
    strip[:, k*FR:(k+1)*FR] = tile

out = Image.fromarray(strip, 'RGBA')
for p in OUTS:
    out.save(p)
    print('wrote', p, out.size)
print('SQ', SQ, 'bg', bg.tolist(), 'runs', runs)
