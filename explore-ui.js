import * as THREE from 'three';
import { POI } from './explore-poi.js';

const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = t => t < 0 ? 0 : t > 1 ? 1 : t;
const smooth = t => t * t * (3 - 2 * t);

const PIN = '#eb5735';
const PIN_RING = 'rgba(235,87,53,.85)';

// camera elevation reference points the pin style crossfades between —
// 87° (overview) reads flat, 52° (the fly-in used when a POI opens) reads dimensional
const POLAR_FLAT = 3  * Math.PI / 180;
const POLAR_DIM  = 38 * Math.PI / 180;

/* state outline that lights up on the way in */
const OUT_TEAL  = '#8ad8d2';
const HALF_W    = 3.6;    // scene units either side of the boundary line
const LIFT      = 5;      // clearance over the terrain surface
const COAST_A   = 0.3;    // coastal / national runs read fainter than shared borders
const POI_DIST  = 1150;   // camera distance the fly-in settles at
const RAMP_FROM = 0.66;   // fraction of the descent before the teal starts arriving

const ringsOf = geom => {
  const out = [];
  if (!geom) return out;
  if (geom.type === 'Polygon') out.push(...geom.coordinates);
  else if (geom.type === 'MultiPolygon') geom.coordinates.forEach(p => out.push(...p));
  return out;
};
const postalOf = f => {
  const q = f.properties || {};
  if (q.postal) return q.postal;
  const i = q.iso_3166_2 || '';
  return i.length === 5 ? i.slice(3) : '';
};

export function init(ctx) {
  const { camera, controls, renderer, theme, lonLatToScene, heightAt, maxHeightIn } = ctx;
  const scene = ctx.scene;
  const dark = theme === 'dark';

  const C = dark ? {
    panelBg: '#0b2739', panelEdge: 'rgba(255,255,255,.09)', title: '#f2f6f8', sub: '#6fc4c8',
    body: '#a9c2d0', tagBorder: 'rgba(111,196,200,.45)', tagText: '#8fd0d3',
    slot: '#0f3247', slotLine: 'rgba(255,255,255,.055)', slotText: '#5d8ba5',
    label: '#cfe4ee', labelShadow: 'rgba(3,44,71,.9)',
    btn: 'rgba(255,255,255,.10)', btnText: '#cfe4ee', dim: 0x3f5566,
  } : {
    panelBg: '#f6f5f2', panelEdge: 'rgba(0,0,0,.10)', title: '#12222c', sub: '#1b678e',
    body: '#4a5a64', tagBorder: 'rgba(27,103,142,.35)', tagText: '#1b678e',
    slot: '#e6e4de', slotLine: 'rgba(0,0,0,.05)', slotText: '#8d9298',
    label: '#22333f', labelShadow: 'rgba(234,234,234,.9)',
    btn: 'rgba(0,0,0,.07)', btnText: '#22333f', dim: 0x6f7a82,
  };

  /* ── styles + DOM ───────────────────────────────────────────── */
  const st = document.createElement('style');
  st.textContent = `
  #pins{position:fixed;inset:0;pointer-events:none;z-index:5;--tilt:0}
  .pin{position:absolute;transform:translate(-3.5px,-50%);pointer-events:auto;cursor:pointer;
       display:flex;align-items:center;gap:7px;will-change:transform}
  .pin .d{position:relative;width:7px;height:7px;border-radius:50%;background:${PIN};flex:0 0 auto;
          box-shadow:0 0 0 1.5px ${C.labelShadow};transition:transform .2s}
  .pin .d::after{content:'';position:absolute;inset:-4px;border-radius:50%;
          border:1px solid ${PIN_RING};opacity:0;animation:pulse 3.4s ease-out infinite}
  @keyframes pulse{0%{transform:scale(.5);opacity:.75}70%{transform:scale(2.1);opacity:0}100%{opacity:0}}
  .pin .stem{position:absolute;left:50%;top:100%;width:1.6px;height:14px;background:${PIN};
          opacity:.85;transform:translateX(-50%) scaleY(var(--tilt));transform-origin:top;pointer-events:none}
  .pin .l{font:400 9.5px/1 ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:.13em;
          text-transform:uppercase;color:#eef4f7;white-space:nowrap;
          background:rgba(9,28,40,.62);border:1px solid rgba(255,255,255,.10);
          padding:5px 8px 4px;border-radius:99px;transition:opacity .25s}
  .pin:hover .d{transform:scale(1.35)}
  .pin.sel .d{width:9px;height:9px;box-shadow:0 0 0 2px ${C.labelShadow},0 0 14px ${PIN}}
  .pin.mute .l{opacity:0}
  .pin.mute:hover .l{opacity:1}
  .pin:hover{z-index:2}

  #panel{position:fixed;top:0;right:0;bottom:0;width:404px;max-width:92vw;z-index:20;
    background:${C.panelBg};border-left:1px solid ${C.panelEdge};
    transform:translateX(100%);transition:transform .62s cubic-bezier(.22,.9,.24,1);
    display:flex;flex-direction:column;overflow:hidden}
  #panel.on{transform:none}
  #panel .scroll{flex:1;overflow-y:auto;padding:0 0 30px}
  #panel .body-pad{padding:0 28px}
  #panel .slot{position:relative;aspect-ratio:4/3;background:${C.slot};
    background-image:repeating-linear-gradient(135deg,${C.slotLine} 0 1px,transparent 1px 9px);
    display:grid;place-content:center;margin:0 0 24px}
  #panel .slot span{font:400 9px/1.6 ui-monospace,Menlo,monospace;letter-spacing:.2em;
    text-transform:uppercase;color:${C.slotText};text-align:center;padding:0 24px}
  #panel .head{display:flex;align-items:baseline;justify-content:space-between;gap:14px;margin:0 0 7px}
  #panel h2{margin:0;font:700 26px/1.15 Poppins,ui-sans-serif,system-ui,sans-serif;color:${C.title};
    letter-spacing:-.01em;text-wrap:pretty}
  #panel .loc{font:600 13.5px/1.4 Poppins,ui-sans-serif,system-ui,sans-serif;color:${C.sub}}
  #panel .date{font:600 10px/1.4 Poppins,ui-sans-serif,system-ui,sans-serif;letter-spacing:.08em;
    text-transform:uppercase;color:${C.slotText};white-space:nowrap}
  #panel .tags{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 0}
  #panel .tags b{font:600 9.5px/1 Poppins,ui-sans-serif,system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase;
    color:${C.tagText};border:1px solid ${C.tagBorder};border-radius:99px;padding:6px 12px 5px;white-space:nowrap}
  #panel p{margin:20px 0 0;font:400 14px/1.72 ui-sans-serif,system-ui,Helvetica,sans-serif;
    color:${C.body};text-wrap:pretty}
  #panel .nav{display:flex;align-items:center;justify-content:center;gap:22px;
    padding:18px 0 20px;border-top:1px solid ${C.panelEdge};margin:26px 28px 0}
  #panel .nav button{background:transparent;border:1.5px solid ${C.tagBorder};color:${C.btnText};cursor:pointer;
    width:34px;height:34px;border-radius:50%;display:grid;place-content:center;padding:0}
  #panel .nav button svg{width:13px;height:13px;display:block}
  #panel .nav button:hover{background:${C.btn}}
  #panel .x{background:${C.btn};border:0;color:${C.btnText};cursor:pointer;
    width:30px;height:30px;border-radius:50%;display:grid;place-content:center;font-size:13px;line-height:1}
  #panel .x:hover{filter:brightness(1.35)}
  #panel .nav .n{font:600 12px/1 Poppins,ui-sans-serif,system-ui,sans-serif;letter-spacing:.04em;color:${C.sub};
    min-width:44px;text-align:center}
  #panel .x{position:absolute;top:16px;right:18px;z-index:2;font-size:15px}
  #panel .stripe{flex:0 0 auto;height:15px;display:flex;flex-direction:column;gap:2px;padding-top:2px}
  #panel .stripe i{display:block;height:3px;background:linear-gradient(90deg,#f06043,#4685c5 37%,#489dbd 61%,#4cc0b4)}
  #back{position:fixed;left:22px;top:20px;z-index:20;display:flex;align-items:center;gap:8px;
    font:400 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;
    color:#eef4f7;background:rgba(9,28,40,.74);border:1px solid rgba(255,255,255,.14);
    padding:9px 14px 8px;border-radius:99px;cursor:pointer;
    opacity:0;pointer-events:none;transition:opacity .4s,background .2s}
  #back.on{opacity:1;pointer-events:auto}
  #back:hover{background:rgba(9,28,40,.9)}
  `;
  document.head.appendChild(st);

  const pinLayer = document.createElement('div');
  pinLayer.id = 'pins';
  document.body.appendChild(pinLayer);

  const panel = document.createElement('div');
  panel.id = 'panel';
  panel.innerHTML = `<button class="x" title="Close">&#10005;</button>
    <div class="scroll">
      <div class="slot"><span></span></div>
      <div class="body-pad">
        <h2></h2>
        <div class="head"><div class="loc"></div><div class="date"></div></div>
        <div class="tags"></div>
        <p></p>
      </div>
    </div>
    <div class="nav">
      <button class="prev" title="Previous"><svg viewBox="0 0 24 24"><polyline points="15 5 9 12 15 19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></button>
      <div class="n"></div>
      <button class="next" title="Next"><svg viewBox="0 0 24 24"><polyline points="9 5 15 12 9 19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></polyline></svg></button>
    </div>
    <div class="stripe"><i></i><i></i><i></i></div>`;
  document.body.appendChild(panel);

  const back = document.createElement('button');
  back.id = 'back';
  back.innerHTML = '&#8592; <span>back to map</span>';
  document.body.appendChild(back);

  const $ = s => panel.querySelector(s);

  /* ── pins ───────────────────────────────────────────────────── */
  const pins = POI.map((p, i) => {
    const el = document.createElement('div');
    el.className = 'pin';
    el.innerHTML = `<i class="d"><i class="stem"></i></i><i class="l">${p.name}</i>`;
    el.querySelector('.d').style.animationDelay = (i * 0.17 % 3.4) + 's';
    el.addEventListener('click', e => { e.stopPropagation(); open(i); });
    pinLayer.appendChild(el);
    const s = lonLatToScene(p.lon, p.lat);
    return {
      poi: p, el, i,
      dot: el.querySelector('.d'), lab: el.querySelector('.l'),
      // a small disc, not a point sample — waterfront pins otherwise sink below the coast
      v: new THREE.Vector3(s.x, maxHeightIn(s.x, s.z, 8) + 2, s.z),
    };
  });

  const proj = new THREE.Vector3();
  let frame = 0;
  function layoutPins() {
    const w = innerWidth, h = innerHeight;
    const vis = [];

    for (const pn of pins) {
      proj.copy(pn.v).project(camera);
      const on = proj.z < 1 && proj.x > -1.05 && proj.x < 1.05 && proj.y > -1.05 && proj.y < 1.05;
      const x = (proj.x * 0.5 + 0.5) * w, y = (-proj.y * 0.5 + 0.5) * h;
      if (!on) { pn.el.style.display = 'none'; continue; }
      pn.el.style.display = '';
      pn.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-3.5px,-50%)`;
      vis.push({ pn, x, y, d: proj.z });
    }

    if (frame++ % 8) return;
    if (current) {
      for (const pn of pins) pn.el.classList.toggle('mute', pn !== current);
      return;
    }
    vis.sort((a, b) => a.d - b.d);

    // a dot is drawn for every pin, so all of them are obstacles before any label is
    // placed. Rects come from the elements themselves — no character-width estimate.
    const boxes = vis.map(it => {
      const r = it.pn.dot.getBoundingClientRect();
      return { x0: r.left - 2, x1: r.right + 2, y0: r.top - 2, y1: r.bottom + 2 };
    });
    for (const it of vis) {
      const r = it.pn.lab.getBoundingClientRect();
      const b = { x0: r.left - 3, x1: r.right + 3, y0: r.top - 2, y1: r.bottom + 2 };
      const hit = boxes.some(o => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0);
      it.pn.el.classList.toggle('mute', hit);
      if (!hit) boxes.push(b);
    }
  }

  /* ── camera ─────────────────────────────────────────────────── */
  const home = { pos: camera.position.clone(), tgt: controls.target.clone() };
  let fly = null;
  function flyTo(pos, tgt, ms = 1500) {
    fly = { t0: performance.now(), ms, p0: camera.position.clone(), t0v: controls.target.clone(), p1: pos, t1: tgt };
  }
  function stepFly(now) {
    if (!fly) return;
    const k = ease(clamp01((now - fly.t0) / fly.ms));
    camera.position.lerpVectors(fly.p0, fly.p1, k);
    controls.target.lerpVectors(fly.t0v, fly.t1, k);
    if (k >= 1) fly = null;
  }

  /* ── idle drift ─────────────────────────────────────────────── */
  let lastInput = performance.now(), driftT = 0, driftBase = null;
  ['pointerdown', 'wheel', 'keydown', 'pointermove'].forEach(e =>
    renderer.domElement.addEventListener(e, () => { lastInput = performance.now(); driftBase = null; }, { passive: true }));
  function stepDrift(dt, now) {
    if (current || fly || now - lastInput < 4000) { driftBase = null; return; }
    if (!driftBase) {
      const off = camera.position.clone().sub(controls.target);
      const r = off.length();
      driftBase = { r, az: Math.atan2(off.x, off.z), pol: Math.acos(Math.max(-1, Math.min(1, off.y / r))) };
      driftT = 0;
    }
    driftT += dt;
    // bounded oscillation about wherever the camera was left — the framing always returns
    const az = driftBase.az + 0.045 * Math.sin(driftT * 0.16);
    const pol = driftBase.pol + 0.020 * Math.sin(driftT * 0.11 + 1.2);
    const r = driftBase.r * (1 - 0.014 * (0.5 + 0.5 * Math.sin(driftT * 0.09)));
    const sp = Math.sin(pol), cp = Math.cos(pol);
    camera.position.set(
      controls.target.x + r * sp * Math.sin(az),
      controls.target.y + r * cp,
      controls.target.z + r * sp * Math.cos(az)
    );
  }

  /* ── map dim ────────────────────────────────────────────────── */
  const dimC = new THREE.Color(C.dim), fullC = new THREE.Color(0xffffff);
  const bgBase = scene.background.clone();
  let dimK = 0, dimApplied = -1;
  // the baked state lines live in the surface texture, so "other borders fade back"
  // is carried by pushing the whole surface a little further down as the teal arrives
  function stepDim(dt, sk) {
    const want = current ? 1 : 0;
    dimK += (want - dimK) * Math.min(1, dt * 2.6);
    const total = Math.min(1, dimK + 0.1 * sk);
    if (Math.abs(total - dimApplied) < 0.002) return;
    dimApplied = total;
    const m = ctx.getMesh() && ctx.getMesh().material;
    if (!m) return;
    m.color.copy(fullC).lerp(dimC, total);
    // the plate's outer margin is baked to the literal background colour and then
    // multiplied by material.color, so the background has to track the same product
    // or the DEM rectangle turns into a hard silhouette
    scene.background.copy(bgBase).multiply(m.color);
    if (scene.fog) scene.fog.color.copy(scene.background);
  }

  /* ── state outline ──────────────────────────────────────────── */
  const states = ctx.states || [];
  const D0 = camera.position.distanceTo(controls.target);

  // soft cross-section: transparent edges, a narrow bright core, a barely-there halo
  const gradTex = (() => {
    const cv = document.createElement('canvas'); cv.width = 4; cv.height = 64;
    const c = cv.getContext('2d');
    const g = c.createLinearGradient(0, 0, 0, 64);
    [[0, 0], [0.30, 0.14], [0.41, 0.52], [0.46, 1], [0.54, 1], [0.59, 0.52], [0.70, 0.14], [1, 0]]
      .forEach(([s, a]) => g.addColorStop(s, `rgba(255,255,255,${a})`));
    c.fillStyle = g; c.fillRect(0, 0, 4, 64);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();

  // Natural Earth shares exact vertices along state borders, so a quantised vertex
  // owned by two different features is an interior line — everything else is coast
  // or national edge, which the baked map leaves unstroked
  const vkey = (lon, lat) => Math.round(lon * 400) + ':' + Math.round(lat * 400);
  let sharedV = null;
  function shared() {
    if (sharedV) return sharedV;
    const owner = new Map();
    sharedV = new Set();
    states.forEach((f, fi) => {
      for (const ring of ringsOf(f.geometry)) for (const c of ring) {
        const k = vkey(c[0], c[1]);
        const o = owner.get(k);
        if (o === undefined) owner.set(k, fi);
        else if (o !== fi) sharedV.add(k);
      }
    });
    return sharedV;
  }

  const outlineCache = new Map();
  function outlineFor(abbr) {
    if (outlineCache.has(abbr)) return outlineCache.get(abbr);
    const mine = states.filter(f => postalOf(f) === abbr);
    if (!mine.length) { outlineCache.set(abbr, null); return null; }
    const sh = shared();

    const rings = [];
    let inCount = 0, total = 0;
    for (const f of mine) for (const ring of ringsOf(f.geometry)) {
      const pts = [];
      for (const c of ring) {
        const s = lonLatToScene(c[0], c[1]);
        const a = sh.has(vkey(c[0], c[1])) ? 1 : 0;
        total++; if (a) inCount++;
        const last = pts[pts.length - 1];
        if (last && a === last.a && Math.hypot(s.x - last.x, s.z - last.z) < 3.5) continue;
        pts.push({ x: s.x, z: s.z, a });
      }
      if (pts.length < 3) continue;
      // long straight borders carry few vertices; subdivide so the ribbon drapes
      const dense = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], q = pts[(i + 1) % pts.length];
        dense.push(p);
        const n = Math.floor(Math.hypot(q.x - p.x, q.z - p.z) / 16);
        for (let k = 1; k < n; k++)
          dense.push({ x: p.x + (q.x - p.x) * k / n, z: p.z + (q.z - p.z) * k / n, a: p.a });
      }
      rings.push(dense);
    }
    if (!rings.length) { outlineCache.set(abbr, null); return null; }
    const allIn = total > 0 && inCount / total < 0.12;   // no usable adjacency — light it all

    const pos = [], col = [], uv = [], idx = [];
    let base = 0;
    for (const r of rings) {
      const n = r.length;
      for (let i = 0; i < n; i++) {
        const p = r[i], pv = r[(i - 1 + n) % n], nx = r[(i + 1) % n];
        let dx = nx.x - pv.x, dz = nx.z - pv.z;
        const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
        const y = maxHeightIn(p.x, p.z, 6) + LIFT;
        const a = (allIn || p.a) ? 1 : COAST_A;
        pos.push(p.x - dz * HALF_W, y, p.z + dx * HALF_W);
        pos.push(p.x + dz * HALF_W, y, p.z - dx * HALF_W);
        uv.push(0, 0, 0, 1);
        col.push(1, 1, 1, a, 1, 1, 1, a);
      }
      for (let i = 0; i < n; i++) {
        const a = base + i * 2, b = a + 1, c = base + ((i + 1) % n) * 2, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
      base += n * 2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 4));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx), 1));
    g.computeBoundingSphere();
    const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({
      color: new THREE.Color(OUT_TEAL), map: gradTex, vertexColors: true,
      transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
    }));
    mesh.name = 'state_outline_' + abbr;
    mesh.renderOrder = 3;
    mesh.visible = false;
    outlineCache.set(abbr, mesh);
    return mesh;
  }

  let strokePin = null, strokeObj = null;
  function stepStroke() {
    if (!strokeObj) return 0;
    const d = camera.position.distanceTo(controls.target);
    const t = clamp01((D0 - d) / (D0 - POI_DIST));
    const k = smooth(clamp01((t - RAMP_FROM) / (1 - RAMP_FROM)));
    strokeObj.material.opacity = k;
    strokeObj.visible = k > 0.004;
    if (!current && k <= 0.004) {
      scene.remove(strokeObj);
      strokeObj = null; strokePin = null;
    }
    return k;
  }

  /* ── open / close ───────────────────────────────────────────── */
  let current = null;

  function fillPanel(pn) {
    const p = pn.poi;
    $('.slot span').textContent = 'photograph — ' + p.name;
    $('h2').textContent = p.name;
    $('.loc').textContent = p.city + ', ' + p.state;
    $('.date').textContent = p.date;
    $('.tags').innerHTML = p.tags.map(t => `<b>${t}</b>`).join('');
    $('p').textContent = p.body;
    $('.n').textContent = String(pn.i + 1).padStart(2, '0') + ' / ' + String(pins.length).padStart(2, '0');
  }

  function open(i) {
    const pn = pins[(i + pins.length) % pins.length];
    const prev = current;
    current = pn;
    pins.forEach(q => q.el.classList.toggle('sel', q === pn));
    fillPanel(pn);
    panel.classList.add('on');
    back.classList.add('on');
    document.body.classList.add('panel-open');

    const p = pn.poi, s = lonLatToScene(p.lon, p.lat);
    const groundY = heightAt(s.x, s.z);

    if (strokePin !== pn) {
      const o = outlineFor(p.state);
      if (strokeObj && strokeObj !== o) { scene.remove(strokeObj); strokeObj = null; }
      strokePin = pn;
      if (o) {
        o.material.opacity = 0; o.visible = false;
        scene.add(o);
        strokeObj = o;
      }
    }

    // descend to the marker without spinning: keep whatever azimuth the user is on
    const cur = camera.position.clone().sub(controls.target);
    const az = Math.atan2(cur.x, cur.z);
    const dist = 1150, el = 52 * Math.PI / 180;
    const focusY = groundY + 8;
    const tgt = new THREE.Vector3(s.x, focusY, s.z);
    const pos = new THREE.Vector3(
      s.x + dist * Math.cos(el) * Math.sin(az),
      focusY + dist * Math.sin(el),
      s.z + dist * Math.cos(el) * Math.cos(az)
    );
    // target stays exactly on the marker, so it sits dead-centre on screen and any
    // orbiting the user does revolves around that pin alone
    flyTo(pos, tgt, prev ? 900 : 1600);
  }

  function close() {
    if (!current) return;
    current = null;
    pins.forEach(q => { q.el.classList.remove('sel'); q.el.classList.remove('mute'); });
    panel.classList.remove('on');
    back.classList.remove('on');
    document.body.classList.remove('panel-open');
    flyTo(home.pos.clone(), home.tgt.clone(), 1400);
  }

  $('.x').addEventListener('click', close);
  back.addEventListener('click', close);
  $('.prev').addEventListener('click', () => open(current ? current.i - 1 : 0));
  $('.next').addEventListener('click', () => open(current ? current.i + 1 : 0));
  addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    else if (current && e.key === 'ArrowRight') open(current.i + 1);
    else if (current && e.key === 'ArrowLeft') open(current.i - 1);
  });
  renderer.domElement.addEventListener('pointerup', e => {
    if (current && e.button === 0 && !e.defaultPrevented) {
      // only treat a clean click (no drag) as a dismissal
      if (Math.abs(e.clientX - downAt.x) < 4 && Math.abs(e.clientY - downAt.y) < 4) close();
    }
  });
  const downAt = { x: 0, y: 0 };
  renderer.domElement.addEventListener('pointerdown', e => { downAt.x = e.clientX; downAt.y = e.clientY; });

  /* ── pin tilt (flat ↔ dimensional) ─────────────────────────────── */
  const tiltOff = new THREE.Vector3();
  function stepTilt() {
    tiltOff.copy(camera.position).sub(controls.target);
    const r = tiltOff.length();
    const cosp = r > 1e-4 ? Math.min(1, Math.max(-1, tiltOff.y / r)) : 1;
    const polar = Math.acos(cosp);
    const t = clamp01((polar - POLAR_FLAT) / (POLAR_DIM - POLAR_FLAT));
    pinLayer.style.setProperty('--tilt', t.toFixed(3));
  }

  /* ── per-frame ──────────────────────────────────────────────── */
  let last = performance.now();
  function tickAll() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    stepFly(now);
    stepDrift(dt, now);
    stepDim(dt, stepStroke());
    stepTilt();
    layoutPins();
  }
  ctx.onFrame(tickAll);
  window.__ex = { camera, controls, pins, open, close, cur: () => current };
  console.log('explore: ' + pins.length + ' markers');
}
