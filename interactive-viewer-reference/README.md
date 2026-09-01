# Viewer-Interaction On-Screen Reference

Ways VIEWERS can act on what's on screen — not anchors pointing, but scannable / clickable / typeable prompts. Grouped by mechanism, each with when-to-use, hard specs, and reference links.

---

## 1. On-screen QR code ("scan to ___")
The default "point your phone at the TV" pattern. Coinbase's bouncing-QR Super Bowl spot (Feb 2022) made it mainstream.

**Specs that actually scan (living-room distance ~8–10 ft):**
- Size: **min 12% of screen height, ideal 20–25%.** 1080p ≈ 130px min / ~300px ideal; 4K ≈ 250px+.
- Position: **lower-right or lower-center** (right side = eyes land there after reading). Stay inside the **title-safe 10% margin** (streaming crops ~5% overscan).
- Contrast: **dark modules on white/solid** — never over photo/video. 4:1 min.
- Dwell: **hold 7–10s, static** (motion breaks phone autofocus; Coinbase was the exception).
- Always pair with a benefit CTA above it: "Scan for coupon," "Scan to vote," not just "Scan now."
- Use **dynamic QR** (level-H error correction) so you can swap the destination + track scans.

**Refs:**
- Placement/dwell playbook: https://lenkli.com/blog/marketing/qr-code-for-tv-commercials
- CTV strategies 2026: https://starti.ai/blog/top-10-qr-code-strategies-on-tv-for-frictionless-mobile-conversions-in-2026/
- Sizing + do/don't: https://adwave.com/resources/qr-codes-tv-advertising
- Engagement/CTA tips: https://bitly.com/blog/improve-ctv-ad-qr-code-experience/
- Common mistakes: https://www.mediavillage.com/article/common-mistakes-tv-advertisers-make-when-implementing-qr-codes-for-television/print/

---

## 2. URL / link "lower-third" strap
A clean bar or text line at the bottom showing a web address (great as a persistent secondary CTA under a QR, or on its own).

**Specs:**
- Sit in **title-safe** area (10% in from edges; ~192px L / 108px bottom at 1080p).
- Two-tier hierarchy: big primary (the URL / offer), small secondary (context).
- Styles: classic broadcast (white on dark semi-transparent bar + colored accent rule), corporate solid brand block, YouTube-modern (bold, no bar), widget/notification card for busy footage.
- Animation: subtle in (0.3–0.7s), hold 4–7s, slightly faster out. Export MOV/PNG-seq with **alpha** (don't green-key text edges).
- Keep it short + typo-proof; use a vanity/short link.

**Refs:**
- Crash course: https://www.clipcat.com/blog/clipcats-crash-course-to-designing-lower-thirds/
- Styles + safe zones: https://infinitecreation.io/tutorial-lower-thirds
- 4 design rules + free templates: https://anfx.co/blog/lower-thirds-design-rules-free-templates/
- Modern design ideas (bar/card/ribbon/widget): https://olafmotion.com/trends-inspiration/modern-lower-thirds-design/
- Full guide: https://riverside.com/blog/lower-thirds

---

## 3. In-player CLICKABLE overlay (no second device)
Viewer clicks the QR/hotspot and a panel opens **inside the player** — even fullscreen — without leaving the stream. Best conversion because there's no "grab your phone" step, and hotspots persist into the on-demand recording.

- **Resi QRclick** — auto-detects a QR in the feed, turns it into an in-player clickable overlay (form/giving/registration opens in the player). https://resi.io/features/qrclick/ · setup: https://support.pushpay.com/s/article/How-to-Use-QRclick-Overlays
- Note: destination must allow **iframe embedding** or the in-player window breaks.

---

## 4. Pop-out side panel / instruction overlay
A panel that slides in with steps ("How to join / vote / play"), often triggered live and auto-hiding when done so the layout stays clean between segments. Built as a **browser-source overlay** on top of your existing scene.

- **LiveReacting Plugin Mode** — generates a browser-source URL you paste into OBS; drives trivia/polls/giveaways, appears only when you hit Start, auto-disappears. https://blog.livereacting.com/obs-interactive-overlay-add-trivia-polls-and-giveaways-to-your-stream-2-minute-setup-3/
- **OBS browser/image/media sources** (how overlays layer; higher source = on top): https://pc.zukaa.ai/blog/how-to-add-overlays-to-livestreams-in-obs-studio
- Design the panel like a mini side-drawer: 1 headline + 3 numbered steps + the QR/URL. Keep it in the safe zone opposite the main subject.

---

## 5. Built-in QR / widget generators (fastest to produce)
- **StreamYard QR widget** — branded QR (logo-in-center, brand colors, optional label) added straight to stage; works live + in recordings. https://support.streamyard.com/hc/en-us/articles/47835996376212-QR-Codes

---

## Quick decision guide
- **One-off "go here" →** on-screen QR (§1) + URL strap (§2).
- **Max conversion, keep them watching →** in-player clickable (§3).
- **Explain a multi-step action / live game →** pop-out side panel (§4).
- **Need it in 5 min, branded →** StreamYard/OBS widget (§5).
