#!/usr/bin/env python3
"""Generate ORIGINAL animated reference GIFs for viewer-interaction patterns:
  1) on-screen QR "scan to" overlay
  2) pop-out side instruction panel
  3) lower-third URL strap
All art is drawn from scratch here (no third-party footage)."""
import os, random
from PIL import Image, ImageDraw, ImageFont

OUT = '/Users/mifields/Desktop/250_website_build/interactive-viewer-reference'
W, H = 640, 360
ACCENT = (235, 87, 53)      # warm broadcast red-orange
TEAL = (76, 192, 180)

def font(size, bold=True, mono=False):
    cands = (['/System/Library/Fonts/Menlo.ttc'] if mono else
             ['/System/Library/Fonts/Supplemental/Arial Bold.ttf',
              '/System/Library/Fonts/Helvetica.ttc',
              '/Library/Fonts/Arial.ttf'])
    for c in cands:
        try:
            return ImageFont.truetype(c, size)
        except Exception:
            pass
    return ImageFont.load_default()

def ease(t):                      # easeOutCubic
    return 1 - (1 - t) ** 3

def clamp01(t):
    return 0 if t < 0 else 1 if t > 1 else t

def base_frame():
    """A faux 'broadcast' background so overlays read in context."""
    img = Image.new('RGB', (W, H))
    px = img.load()
    for y in range(H):
        t = y / H
        r = int(10 + 18 * (1 - t)); g = int(26 + 34 * (1 - t)); b = int(46 + 52 * (1 - t))
        for x in range(W):
            px[x, y] = (r, g, b)
    d = ImageDraw.Draw(img, 'RGBA')
    # soft top glow
    for i, rad in enumerate(range(220, 40, -30)):
        a = 6 + i * 3
        d.ellipse([W//2 - rad, -rad//2, W//2 + rad, rad], fill=(120, 170, 210, a))
    # faint field lines to suggest live content
    for gx in range(0, W, 48):
        d.line([(gx, 0), (gx - 40, H)], fill=(255, 255, 255, 8))
    return img

def rrect(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)

def qr_module_map(n=21, seed=7):
    """A QR-like matrix: 3 finder patterns + pseudo-random data (mockup only)."""
    m = [[0]*n for _ in range(n)]
    def finder(oy, ox):
        for yy in range(7):
            for xx in range(7):
                edge = xx in (0, 6) or yy in (0, 6)
                inner = 2 <= xx <= 4 and 2 <= yy <= 4
                m[oy+yy][ox+xx] = 1 if (edge or inner) else 0
    finder(0, 0); finder(0, n-7); finder(n-7, 0)
    rng = random.Random(seed)
    for y in range(n):
        for x in range(n):
            in_finder = ((x < 8 and y < 8) or (x > n-9 and y < 8) or (x < 8 and y > n-9))
            if not in_finder:
                m[y][x] = 1 if rng.random() < 0.5 else 0
    return m

QR = qr_module_map()

def draw_qr(d, x, y, size, fg=(15, 20, 28)):
    n = len(QR); q = 4  # quiet zone modules
    cell = size / (n + 2*q)
    for yy in range(n):
        for xx in range(n):
            if QR[yy][xx]:
                cx = x + (xx + q) * cell; cy = y + (yy + q) * cell
                d.rectangle([cx, cy, cx + cell + 0.6, cy + cell + 0.6], fill=fg)

def save_gif(frames, name, duration=60):
    p = os.path.join(OUT, name)
    frames[0].save(p, save_all=True, append_images=frames[1:], loop=0,
                   duration=duration, disposal=2, optimize=True)
    print('wrote', p, len(frames), 'frames')

# ── 1. QR scan-to overlay ────────────────────────────────────────────────
def gif_qr():
    frames = []
    IN, HOLD = 12, 30
    total = IN + HOLD
    card_w, card_h = 150, 186
    cx = W - card_w - 26; cy_final = H - card_h - 26
    for f in range(total):
        img = base_frame(); d = ImageDraw.Draw(img, 'RGBA')
        k = ease(clamp01(f / IN))
        cy = int(cy_final + (1 - k) * 40)
        a = int(255 * k)
        # card
        rrect(d, [cx, cy, cx + card_w, cy + card_h], 14, fill=(255, 255, 255, a))
        # label
        lf = font(15); sf = font(11, bold=False)
        d.text((cx + card_w/2, cy + 16), 'SCAN TO VOTE', font=lf,
               fill=(20, 28, 38, a), anchor='mm')
        if k > 0.6:
            draw_qr(d, cx + 18, cy + 30, card_w - 36)
            d.text((cx + card_w/2, cy + card_h - 16), 'live.example.com', font=sf,
                   fill=(90, 100, 112, a), anchor='mm')
        # pulsing scan brackets during hold
        if f >= IN:
            t = (f - IN) / HOLD
            grow = int(6 + 10 * (0.5 + 0.5 * __import__('math').sin(t * 6.283)))
            bx0, by0 = cx + 12 - grow, cy + 26 - grow
            bx1, by1 = cx + card_w - 12 + grow, cy + card_h - 30 + grow
            L = 20
            for (px, py, dx, dy) in [(bx0,by0,1,1),(bx1,by0,-1,1),(bx0,by1,1,-1),(bx1,by1,-1,-1)]:
                d.line([(px, py), (px + dx*L, py)], fill=TEAL + (230,), width=3)
                d.line([(px, py), (px, py + dy*L)], fill=TEAL + (230,), width=3)
        frames.append(img.convert('P', palette=Image.ADAPTIVE))
    save_gif(frames, 'qr-scan-overlay.gif', 55)

# ── 2. Pop-out side instruction panel ────────────────────────────────────
def gif_panel():
    frames = []
    IN, HOLD, OUT_ = 14, 26, 12
    pw = 250
    steps = ['Open your phone camera', 'Point it at the QR code', 'Tap the link to join live']
    for phase, cnt in (('in', IN), ('hold', HOLD), ('out', OUT_)):
        for f in range(cnt):
            img = base_frame(); d = ImageDraw.Draw(img, 'RGBA')
            if phase == 'in':   k = ease(f / IN)
            elif phase == 'hold': k = 1
            else:               k = 1 - ease(f / OUT_)
            x = int(W - pw * k)
            d.rectangle([x, 0, W, H], fill=(10, 22, 34, 235))
            d.line([(x, 0), (x, H)], fill=ACCENT + (255,), width=3)
            if k > 0.5:
                hf = font(20); nf = font(13, bold=False); numf = font(14)
                d.text((x + 26, 40), 'HOW TO JOIN', font=hf, fill=(240, 246, 250, 255))
                d.line([(x+26, 72), (x+26+70, 72)], fill=TEAL+(255,), width=3)
                for i, s in enumerate(steps):
                    yy = 100 + i*54
                    d.ellipse([x+26, yy, x+26+26, yy+26], outline=ACCENT+(255,), width=2)
                    d.text((x+26+13, yy+13), str(i+1), font=numf, fill=(240,246,250,255), anchor='mm')
                    d.text((x+64, yy+3), s, font=nf, fill=(200, 212, 222, 255))
                draw_qr(d, x+64, 268, 74)
                d.text((x+150, 305), 'or visit', font=font(11, bold=False), fill=(150,164,176,255))
                d.text((x+150, 320), 'example.com/live', font=font(12, bold=False), fill=(TEAL[0],TEAL[1],TEAL[2],255))
            frames.append(img.convert('P', palette=Image.ADAPTIVE))
    save_gif(frames, 'side-panel-popout.gif', 55)

# ── 3. Lower-third URL strap ─────────────────────────────────────────────
def gif_lowerthird():
    frames = []
    IN, HOLD = 12, 34
    bw, bh = 360, 58
    bx, by = 40, H - 78
    for f in range(IN + HOLD):
        img = base_frame(); d = ImageDraw.Draw(img, 'RGBA')
        k = ease(clamp01(f / IN))
        w = int(bw * k)
        # accent block + bar
        d.rectangle([bx, by, bx + 8, by + bh], fill=ACCENT + (255,))
        rrect(d, [bx + 8, by, bx + 8 + w, by + bh], 2, fill=(12, 26, 38, 232))
        if k > 0.55:
            a = int(255 * clamp01((k - 0.55) / 0.45))
            d.text((bx + 26, by + 12), 'VOTE FOR THE PLAY OF THE GAME',
                   font=font(15), fill=(240, 246, 250, a))
            d.text((bx + 26, by + 34), 'example.com/vote', font=font(15, mono=True),
                   fill=(TEAL[0], TEAL[1], TEAL[2], a))
            # blinking LIVE dot
            if (f // 4) % 2 == 0:
                d.ellipse([bx + bw - 30, by + 12, bx + bw - 18, by + 24], fill=ACCENT + (a,))
        frames.append(img.convert('P', palette=Image.ADAPTIVE))
    save_gif(frames, 'url-lower-third.gif', 55)

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    gif_qr(); gif_panel(); gif_lowerthird()
    print('done')
