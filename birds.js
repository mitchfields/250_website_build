/* ─────────────────────────────────────────────────────────────────────────
   birds.js — occasional bird flocks that live IN the 3D scene (like the
   clouds), so they parallax when you orbit/zoom. Viewed from above: each bird
   is a tiny black top-down silhouette whose wings flap (an 8-frame atlas swept
   by UV in a small shader). Birds sit just below the cloud layer, so the
   semi-transparent clouds passing over them tint/soften them for free.

   A flock appears every ~45–75s and crosses in ~20–40s (nearer/lower = faster).
     • geese   — a rough V with natural breakup + a straggler or two
     • pigeons — a loose 10–80 bird blob

   One BufferGeometry per flock (all birds as quads, per-vertex flap phase) →
   one draw call per flock. Fades out with the dive like the clouds.
   ──────────────────────────────────────────────────────────────────────── */

import * as THREE from 'three';

const clamp01 = t => (t < 0 ? 0 : t > 1 ? 1 : t);
const rnd = (a, b) => a + Math.random() * (b - a);

const FRAMES = 8;
function makeBirdAtlas() {
  const fw = 64, fh = 64;
  const cv = document.createElement('canvas');
  cv.width = FRAMES * fw; cv.height = fh;
  const c = cv.getContext('2d');
  c.fillStyle = '#000';
  for (let f = 0; f < FRAMES; f++) {
    const cx = f * fw + fw / 2, cy = fh / 2, S = fw * 0.96;
    const a = (f / FRAMES) * Math.PI * 2;
    // top-down flap: wings appear widest at mid-stroke, foreshortened at extremes
    const tipY = (0.20 + 0.26 * (0.5 + 0.5 * Math.sin(a))) * S;   // half-span
    const headX = cx + S * 0.26, shX = cx + S * 0.08;
    // body (head toward +x) — bold so it survives at a few px
    c.beginPath(); c.ellipse(cx + S * 0.03, cy, S * 0.23, S * 0.08, 0, 0, 7); c.fill();
    // two solid swept-back wings meeting at the shoulders (reads as a bird from above)
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(shX, cy);
      c.lineTo(cx - S * 0.04, cy + s * tipY);            // wing tip, swept back + out
      c.lineTo(cx - S * 0.34, cy + s * S * 0.10);        // trailing edge toward tail
      c.lineTo(cx - S * 0.20, cy + s * S * 0.03);
      c.closePath(); c.fill();
    }
    // little head nub
    c.beginPath(); c.ellipse(headX, cy, S * 0.05, S * 0.05, 0, 0, 7); c.fill();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;   // NO mipmaps — mip-averaging was fading the tiny birds to nothing
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

const VERT = `
  uniform float uTime, uWander;
  attribute float aPhase;
  varying vec2 vUv; varying float vPhase;
  void main(){
    vUv = uv; vPhase = aPhase;
    // organic per-bird wander so the flock isn't a rigid sliding sprite sheet
    float w = aPhase * 6.2831853;
    vec3 p = position;
    p.x += sin(uTime * 1.9 + w) * uWander;
    p.z += cos(uTime * 1.5 + w * 1.7) * uWander * 0.8;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const FRAG = `
  precision highp float;
  uniform sampler2D uAtlas; uniform float uTime, uFps, uFrames, uOpacity;
  varying vec2 vUv; varying float vPhase;
  void main(){
    float fi = floor(mod(uTime * uFps + vPhase * uFrames, uFrames));
    vec2 uv = vec2((fi + vUv.x) / uFrames, vUv.y);
    float t = texture2D(uAtlas, uv).a;
    float a = smoothstep(0.32, 0.55, t) * uOpacity;   // sharpen so tiny birds stay crisp + dark
    if (a < 0.02) discard;
    gl_FragColor = vec4(0.0, 0.0, 0.0, a);        // black; clouds above do the tinting
  }
`;

export function initBirds(ctx) {
  const { scene, plate, overviewDistance, getDiveProgress, onFrame } = ctx;
  const D = overviewDistance, W = plate.w, H = plate.h;
  const SPAN = Math.max(W, H);
  const atlas = makeBirdAtlas();

  const flocks = [];
  let nextSpawn = performance.now() + rnd(2000, 4000);        // first flock shows up soon

  function formationGeese() {
    // clean, clearly-triangular V: full arms, tight spacing, minimal dropout
    const arm = Math.floor(rnd(6, 11));
    const sx = rnd(1.3, 1.6), sy = rnd(0.9, 1.12);   // sy/sx sets the wedge angle
    const pts = [[0, 0]];                            // lead bird at the apex
    for (let k = 1; k <= arm; k++) {
      const jx = rnd(-0.2, 0.2), jy = rnd(-0.16, 0.16);
      if (Math.random() < 0.95) pts.push([-k * sx + jx, -k * sy + jy]);
      if (Math.random() < 0.95) pts.push([-k * sx + jx, k * sy + jy]);
    }
    // at most one lone straggler trailing off an arm
    if (Math.random() < 0.5) {
      const s = Math.random() < 0.5 ? -1 : 1;
      pts.push([-rnd(0.55, 0.95) * arm * sx, s * rnd(0.4, 0.95) * arm * sy]);
    }
    return pts;
  }
  function formationPigeons() {
    const n = Math.floor(rnd(12, 80)), spread = rnd(3, 7), pts = [];
    for (let i = 0; i < n; i++) pts.push([rnd(-spread, spread), rnd(-spread * 0.6, spread * 0.6)]);
    return pts;
  }

  // build one flock: a flat quad per bird in a group oriented along travel dir
  function spawn(now) {
    const geese = Math.random() < 0.5;
    const depth = Math.random();                        // 0 far/high … 1 near/low
    const size = D * 0.0080 * (0.62 + depth * 0.9);     // wider depth spread → more size variety flock-to-flock
    const gap = size * (geese ? 2.4 : 2.2);             // formation spacing in world units
    const pts = geese ? formationGeese() : formationPigeons();
    const N = pts.length;

    const pos = new Float32Array(N * 4 * 3);
    const uv = new Float32Array(N * 4 * 2);
    const ph = new Float32Array(N * 4);
    const idx = new Uint16Array(N * 6);
    const h = size * 0.5;
    for (let i = 0; i < N; i++) {
      const lx = pts[i][0] * gap, lz = pts[i][1] * gap, phase = Math.random();
      const c = [[-h, -h], [h, -h], [h, h], [-h, h]];   // quad in local X/Z (flat)
      const uvs = [[0, 0], [1, 0], [1, 1], [0, 1]];
      for (let v = 0; v < 4; v++) {
        const o = (i * 4 + v);
        pos[o * 3] = lx + c[v][0]; pos[o * 3 + 1] = 0; pos[o * 3 + 2] = lz + c[v][1];
        uv[o * 2] = uvs[v][0]; uv[o * 2 + 1] = uvs[v][1];
        ph[o] = phase;
      }
      const b = i * 4;
      idx.set([b, b + 1, b + 2, b, b + 2, b + 3], i * 6);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(ph, 1));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uAtlas: { value: atlas }, uTime: { value: 0 }, uOpacity: { value: 1 },
        uWander: { value: size * (geese ? 0.5 : 0.85) },   // per-bird jitter amplitude (pigeons wander more)
        uFps: { value: geese ? rnd(5, 7) : rnd(9, 13) }, uFrames: { value: FRAMES },
      },
      vertexShader: VERT, fragmentShader: FRAG,
      transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    });

    const grp = new THREE.Group();
    const heading = rnd(0, Math.PI * 2);
    grp.rotation.y = heading;                            // local +X = travel direction
    grp.position.y = D * (0.012 + depth * 0.075);        // below the cloud layer; wider altitude spread
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false; mesh.renderOrder = 1;    // under the clouds (they tint it)
    grp.add(mesh);
    scene.add(grp);

    // straight path across the map region through a jittered center
    const fwdX = Math.cos(heading), fwdZ = -Math.sin(heading);  // world dir of local +X after rotation.y
    const perpX = Math.sin(heading), perpZ = Math.cos(heading);
    const offset = rnd(-0.35, 0.35) * SPAN;
    const cx = perpX * offset, cz = perpZ * offset;
    flocks.push({
      grp, mat, geese,
      dur: (40 - depth * 18 + rnd(-3, 3)) * 1000,
      alpha: 0.82 + depth * 0.16,
      // travel along the group's forward axis in world space
      x0: cx - fwdX * SPAN * 0.75, z0: cz - fwdZ * SPAN * 0.75,
      x1: cx + fwdX * SPAN * 0.75, z1: cz + fwdZ * SPAN * 0.75,
      // slow lateral drift of the whole flock so the path isn't a dead-straight line
      perpX, perpZ, wobSeed: rnd(0, 6.28), wobAmp: SPAN * 0.05, wobFreq: rnd(0.18, 0.32),
      t: 0,
    });
  }

  let last = performance.now();
  onFrame(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (now >= nextSpawn) { spawn(now); nextSpawn = now + rnd(45000, 75000); }
    if (!flocks.length) return;
    const ts = now / 1000;
    const dive = getDiveProgress ? clamp01(getDiveProgress()) : 0;
    for (let i = flocks.length - 1; i >= 0; i--) {
      const f = flocks[i];
      f.t += dt * 1000;
      const p = f.t / f.dur;
      if (p > 1.06) { scene.remove(f.grp); f.grp.children[0].geometry.dispose(); f.mat.dispose(); flocks.splice(i, 1); continue; }
      const wob = Math.sin(ts * f.wobFreq + f.wobSeed) * f.wobAmp;
      f.grp.position.x = f.x0 + (f.x1 - f.x0) * p + f.perpX * wob;
      f.grp.position.z = f.z0 + (f.z1 - f.z0) * p + f.perpZ * wob;
      f.mat.uniforms.uTime.value = ts;
      f.mat.uniforms.uOpacity.value = f.alpha * (1 - dive);
    }
  });

  return {};
}
