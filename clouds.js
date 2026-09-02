/* ─────────────────────────────────────────────────────────────────────────
   clouds.js — 3D fog cards driven by a tileable Perlin-fBm noise texture.

   Each cloud is a world-space plane running a small shader: it samples a
   seamless noise texture at two scales and SCROLLS the UVs very slowly along a
   wind direction, so the fog *flows through* the card instead of the card
   wobbling through space. A soft round falloff dissolves the card edge, and a
   smoothstep on the noise carves layered thin/thick patches (real breakup, no
   solid blob, no lattice/grid).

     • DECK    — dense, large, high-altitude fog the camera dives down through.
     • AMBIENT — a few very large, wispy fog banks biased to the map edges.
     • TERTIARY— a handful of smaller banks drifting over the interior.
     • SHADOW  — faint dark companions on the surface, scrolling ~2x faster.

   Ambient/tertiary/shadows fade as the camera dives to a pin; the deck
   dissolves on reveal (see the fly-through in us-explore.html).
   ──────────────────────────────────────────────────────────────────────── */

import * as THREE from 'three';

const clamp01 = t => (t < 0 ? 0 : t > 1 ? 1 : t);

function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Seamless (tileable) Perlin fBm baked to a grayscale texture. Gradient noise
   avoids the axis-aligned grid that value noise shows; wrapping the lattice at
   each octave's integer frequency keeps it tiling so UV scrolling has no seam. */
function makeNoiseTexture(size, f0, octaves, seed) {
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  function grad(ix, iy, sd) {
    let h = (ix * 374761393 + iy * 668265263 + sd * 2246822519) >>> 0;
    h = (h ^ (h >>> 13)) * 1274126177 >>> 0;
    const a = (h >>> 0) / 4294967296 * Math.PI * 2;
    return [Math.cos(a), Math.sin(a)];
  }
  function perlin(x, y, freq, sd) {
    const X = x * freq, Y = y * freq;
    let x0 = Math.floor(X), y0 = Math.floor(Y);
    const fx = X - x0, fy = Y - y0;
    const x1 = ((x0 + 1) % freq + freq) % freq, y1 = ((y0 + 1) % freq + freq) % freq;
    x0 = (x0 % freq + freq) % freq; y0 = (y0 % freq + freq) % freq;
    const g00 = grad(x0, y0, sd), g10 = grad(x1, y0, sd), g01 = grad(x0, y1, sd), g11 = grad(x1, y1, sd);
    const d00 = g00[0] * fx + g00[1] * fy;
    const d10 = g10[0] * (fx - 1) + g10[1] * fy;
    const d01 = g01[0] * fx + g01[1] * (fy - 1);
    const d11 = g11[0] * (fx - 1) + g11[1] * (fy - 1);
    const u = fade(fx), v = fade(fy);
    return lerp(lerp(d00, d10, u), lerp(d01, d11, u), v);
  }
  const data = new Uint8Array(size * size);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = i / size, y = j / size;
      let amp = 0.5, freq = f0, sum = 0, norm = 0;
      for (let o = 0; o < octaves; o++) {
        sum += amp * perlin(x, y, freq, seed + o * 1013);
        norm += amp; amp *= 0.5; freq *= 2;
      }
      let v = 0.5 + 0.5 * (sum / norm);
      data[j * size + i] = Math.max(0, Math.min(255, v * 255)) | 0;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

const VERT = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const FRAG = `
  precision highp float;
  uniform sampler2D uNoise;
  uniform float uTime, uOpacity, uScale, uSeed, uLow, uHigh;
  uniform vec2  uScroll;
  uniform vec3  uColor;
  varying vec2  vUv;
  void main(){
    // NATURAL BREAKUP: the SHAPE is driven by the fBm itself (irregular, wispy),
    // not a round body. A strong domain warp + per-card seed offset + 3 octaves
    // hide the fact that the source noise tiles, so it never looks repetitive.
    vec2 base = vUv * uScale + vec2(uSeed);
    vec2 flow = uScroll * uTime;
    float w1 = texture2D(uNoise, base * 0.6 + flow * 0.7).r;
    float w2 = texture2D(uNoise, base * 0.6 + vec2(4.3, 1.7) + flow * 0.7).r;
    vec2  warp = (vec2(w1, w2) - 0.5) * 0.9;           // break the tiling grid
    float n1 = texture2D(uNoise, base + warp + flow).r;
    float n2 = texture2D(uNoise, base * 2.0 + warp + flow * 1.6 + vec2(2.7, 9.1)).r;
    float n3 = texture2D(uNoise, base * 4.0 + warp * 0.5 + flow * 2.2 + vec2(5.5, 3.3)).r;
    float n  = n1 * 0.5 + n2 * 0.32 + n3 * 0.18;

    float dens = smoothstep(uLow, uHigh, n);           // irregular cloud mass w/ holes
    float d    = length(vUv - 0.5);
    float edge = smoothstep(0.5, 0.06, d);             // soft round window kills the card's square corners
    float a    = dens * edge * uOpacity;
    if (a < 0.004) discard;
    vec3 col = uColor * (0.82 + 0.26 * n);             // gentle internal form
    gl_FragColor = vec4(col, a);
  }
`;

export function initClouds(ctx) {
  const { scene, theme, plate, overviewDistance, getDiveProgress, onFrame } = ctx;
  const dark = theme === 'dark';
  const D = overviewDistance;
  const W = plate.w, H = plate.h;
  const rng = makeRng(20260827);

  const CLOUD_COLOR = new THREE.Color(dark ? 0xcfe6ee : 0xffffff);
  const SHADOW_COLOR = new THREE.Color(dark ? 0x03141f : 0x263341);
  const noiseTex = makeNoiseTexture(256, 4, 6, 1234);

  const noiseUniform = { value: noiseTex };
  const timeUniform = { value: 0 };
  const WIND = new THREE.Vector2(0.8, 0.55).normalize();

  const baseMat = new THREE.ShaderMaterial({
    uniforms: {
      uNoise: noiseUniform, uTime: timeUniform,
      uColor: { value: new THREE.Color(0xffffff) }, uOpacity: { value: 1 },
      uScroll: { value: new THREE.Vector2() }, uScale: { value: 1.6 },
      uSeed: { value: 0 }, uLow: { value: 0.42 }, uHigh: { value: 0.82 },
    },
    vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthWrite: false, depthTest: true,
    side: THREE.DoubleSide, blending: THREE.NormalBlending, fog: false,
  });

  const clouds = [];   // { mesh, baseOp, type }
  const shadows = [];

  function makeCard(size, color, baseOp, scale, low, high, speed) {
    const mat = baseMat.clone();
    mat.uniforms.uNoise = noiseUniform;
    mat.uniforms.uTime = timeUniform;      // share time so one update drives them all
    mat.uniforms.uColor.value.copy(color);
    mat.uniforms.uOpacity.value = baseOp;
    mat.uniforms.uScale.value = scale;
    mat.uniforms.uSeed.value = rng() * 100;
    mat.uniforms.uLow.value = low;
    mat.uniforms.uHigh.value = high;
    const jitter = (rng() - 0.5) * 0.5;
    mat.uniforms.uScroll.value.set((WIND.x + jitter * WIND.y) * speed, (WIND.y - jitter * WIND.x) * speed);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = rng() * Math.PI * 2;
    m.frustumCulled = false;
    return m;
  }

  function addCloud(type, x, y, z, size, baseOp, scale, low, high) {
    const speed = 0.004 + rng() * 0.006;
    const m = makeCard(size, CLOUD_COLOR, baseOp, scale, low, high, speed);
    m.position.set(x, y, z);
    m.renderOrder = 3;
    scene.add(m);
    clouds.push({ mesh: m, baseOp, type });
    // no ground-shadow cards — they read as dark "blobs" sitting on the map
  }

  /* DECK — many big, high, BROKEN layers the camera plunges through on load.
     Each layer is fairly transparent with real gaps so the US stays faintly
     visible through the whole dive (never a solid white wall). */
  const DECK = 120;
  for (let i = 0; i < DECK; i++) {
    const ang = rng() * Math.PI * 2, rad = Math.sqrt(rng());
    const x = Math.cos(ang) * W * 0.5 * rad;
    const z = Math.sin(ang) * H * 0.5 * rad;
    const y = D * (0.45 + rng() * 1.5);                       // 0.45D … 1.95D
    const size = W * (0.22 + Math.pow(rng(), 1.3) * 0.5);     // big + randomized
    addCloud('deck', x, y, z, size, 0.14 + rng() * 0.16, 1.4 + rng() * 0.8, 0.42, 0.82);
  }

  /* AMBIENT — just a few big chunks scattered AROUND the screen edges and a
     bit beyond (randomized position + scale, so it reads as broken cloud at
     the periphery — not a solid vignette and not full-screen cover) */
  const AMBIENT = 10;
  for (let i = 0; i < AMBIENT; i++) {
    const ang = (i / AMBIENT) * Math.PI * 2 + (rng() - 0.5) * 0.5;   // EVENLY around the rim, only lightly jittered (no clustering)
    const rf = 0.72 + rng() * 0.5;                                   // pulled ~20% closer in so they sit on-screen, not way off
    const x = Math.cos(ang) * W * 0.5 * rf - W * 0.03;               // slight left nudge (was reading right-heavy)
    const z = Math.sin(ang) * H * 0.5 * rf;
    const y = D * (0.04 + rng() * 0.12);
    const size = W * (0.24 + Math.pow(rng(), 1.3) * 0.48);           // big, strongly randomized
    addCloud('ambient', x, y, z, size, 0.16 + rng() * 0.14, 1.2 + rng() * 0.8, 0.44, 0.82);
  }

  /* TERTIARY — a couple of very faint wisps drifting over the interior */
  const TERT = 3;
  for (let i = 0; i < TERT; i++) {
    const x = (rng() * 2 - 1) * W * 0.34;
    const z = (rng() * 2 - 1) * H * 0.32;
    const y = D * (0.02 + rng() * 0.05);
    const size = W * (0.12 + rng() * 0.16);
    addCloud('ambient', x, y, z, size, 0.10 + rng() * 0.10, 1.6 + rng() * 0.8, 0.48, 0.86);
  }

  const t0 = performance.now();
  let revealT0 = null, revealMs = 2000, deckK = 1;
  onFrame(() => {
    const now = performance.now();
    timeUniform.value = (now - t0) / 1000;
    const dive = clamp01(getDiveProgress());
    if (revealT0 != null) deckK = 1 - clamp01((now - revealT0) / revealMs);

    for (const c of clouds) {
      const op = c.baseOp * (c.type === 'deck' ? deckK : (1 - dive));
      c.mesh.material.uniforms.uOpacity.value = op;
      c.mesh.visible = op > 0.004;
    }
    for (const s of shadows) {
      const op = s.baseOp * (1 - dive) * deckK;
      s.mesh.material.uniforms.uOpacity.value = op;
      s.mesh.visible = op > 0.004;
    }
  });

  return {
    reveal(ms) { revealMs = ms || 2000; revealT0 = performance.now(); },
    // live theme switch: recolour every cloud card without a rebuild
    setTheme(theme) {
      const c = new THREE.Color(theme === 'dark' ? 0xcfe6ee : 0xffffff);
      for (const cl of clouds) cl.mesh.material.uniforms.uColor.value.copy(c);
    },
  };
}
