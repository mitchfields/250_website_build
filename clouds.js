/* Shared volumetric mist field.
   One raymarched noise volume, drawn as a screen-space overlay: the landing
   page and the map both mount it so the clouds are literally the same
   element across the click, not a lookalike. */

const VERT = `#version 300 es
precision highp float;
void main(){
vec2 p = vec2(float((gl_VertexID & 1) << 2) - 1.0, float((gl_VertexID & 2) << 1) - 1.0);
gl_Position = vec4(p, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform float uCov;      // how much of the masked band the mist fills
uniform float uScale;    // wisp size
uniform float uDrift;    // drift speed
uniform float uOpacity;  // strength over the map
uniform float uThick;    // sheet depth (parallax between wisps)
uniform float uInner;    // vignette start (0 centre → 1 edge)
uniform float uOuter;    // vignette full strength
uniform float uSStr;     // cast-shadow darkness
uniform float uSPace;    // shadow drift relative to the cloud
uniform float uSOff;     // how far the shadow lags the cloud
uniform int   uSSteps;
uniform float uMask;     // 1 = edge vignette, 0 = mist fills the whole frame
uniform float uZoom;     // <1 pulls the camera into the sheets (fly-through)
uniform float uTravel;   // distance flown through the field
uniform vec3  uShadowCol;
uniform int   uSteps;
uniform vec3  uMistCol;
uniform vec3  uShadeCol;

const mat3 M3 = mat3( 0.00, 0.80, 0.60,
                   -0.80, 0.36,-0.48,
                   -0.60,-0.48, 0.64);

float hash13(vec3 p3){
p3 = fract(p3 * 0.1031);
p3 += dot(p3, p3.zyx + 31.32);
return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec3 x){
vec3 i = floor(x);
vec3 f = fract(x);
f = f * f * (3.0 - 2.0 * f);
float a = hash13(i + vec3(0.0, 0.0, 0.0));
float b = hash13(i + vec3(1.0, 0.0, 0.0));
float c = hash13(i + vec3(0.0, 1.0, 0.0));
float d = hash13(i + vec3(1.0, 1.0, 0.0));
float e = hash13(i + vec3(0.0, 0.0, 1.0));
float g = hash13(i + vec3(1.0, 0.0, 1.0));
float h = hash13(i + vec3(0.0, 1.0, 1.0));
float k = hash13(i + vec3(1.0, 1.0, 1.0));
return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y),
           mix(mix(e, g, f.x), mix(h, k, f.x), f.y), f.z);
}

float fbm2(vec3 p){
float s = 0.5 * vnoise(p); p = M3 * p * 2.03;
s += 0.25 * vnoise(p);
return s / 0.75;
}
float fbm3(vec3 p){
float s = 0.5 * vnoise(p); p = M3 * p * 2.03;
s += 0.25 * vnoise(p);     p = M3 * p * 2.05;
s += 0.125 * vnoise(p);
return s / 0.875;
}
float fbm4(vec3 p){
float s = 0.5 * vnoise(p); p = M3 * p * 2.03;
s += 0.25 * vnoise(p);     p = M3 * p * 2.05;
s += 0.125 * vnoise(p);    p = M3 * p * 2.02;
s += 0.0625 * vnoise(p);
return s / 0.9375;
}

// Mist space: flattened vertically so the field reads as stacked sheets, and
// sheared with height so upper wisps slide over lower ones — that shear is
// what a single 2D noise layer cannot give you.
vec3 mSpace(vec3 p, float h, float tm){
vec3 q = p;
q.x += tm * uDrift * (0.010 + h * 0.020);
q.z += tm * uDrift * (0.005 + h * 0.008) + uTravel;
q.y *= 2.6;
return q * uScale;
}

float mistDensity(vec3 p, float tm){
float h = clamp(p.y / max(uThick, 0.001), 0.0, 1.0);
vec3 q = mSpace(p, h, tm);
q += (fbm2(q * 0.5) - 0.5) * 1.1;               // warp: torn, tendril edges
float n = fbm4(q);
// broad modulation so some regions are thick banks and others a thin veil
float band = fbm2(vec3(q.x * 0.22, 4.7, q.z * 0.22));
float thr = mix(0.74, 0.28, uCov) + (band - 0.5) * 0.30;
// wide feather: mist has no silhouette, it fades out over a long ramp
float d = smoothstep(thr, thr + 0.34, n);
if(d <= 0.002) return 0.0;
d *= smoothstep(0.0, 0.22, h) * (1.0 - smoothstep(0.55, 1.0, h));
d -= fbm3(q * 3.6) * 0.22;                      // torn edges
d -= fbm2(q * 11.0) * 0.10;                     // fine break-up
return max(d, 0.0) * 2.6;
}

// One raymarch through the sheets. Returns premultiplied colour in .xyz and
// coverage in .w, so the same field can be walked twice — once for the cloud
// and once, offset and at its own pace, for the shadow it throws on the map.
vec4 marchMist(vec2 uvp, float tm, int steps){
vec3 ro = vec3(0.0, 1.05 + uThick, 0.0);
vec3 rd = normalize(vec3(uvp.x * 0.55, -1.0, -uvp.y * 0.55));

float ta = (uThick - ro.y) / rd.y;
float tb = (0.0 - ro.y) / rd.y;
float dt = (tb - ta) / float(steps);
// Interleaved gradient noise, rotated per frame by a golden-ratio offset:
// white noise pinned to pixels reads as sensor grain, and per-frame white
// noise shimmers. This spreads the error spatially and averages in motion.
float ign = fract(52.9829189 * fract(0.06711056 * gl_FragCoord.x + 0.00583715 * gl_FragCoord.y));
float jit = fract(ign + fract(floor(uTime * 60.0) * 0.61803399));
float t = ta + dt * jit;

vec3  acc = vec3(0.0);
float T = 1.0;

for(int i = 0; i < 64; i++){
  if(i >= steps) break;
  vec3 p = ro + rd * t;
  float d = mistDensity(p, tm);
  if(d <= 0.002){ t += dt * 1.8; continue; }
  float h = clamp(p.y / max(uThick, 0.001), 0.0, 1.0);
  // diffuse, overcast shading: brighter on top, cooler and darker underneath
  vec3 lum = mix(uShadeCol, uMistCol, smoothstep(0.05, 0.55, h));
  lum *= 0.90 + 0.24 * (1.0 - exp(-d * 2.2));
  float dT = exp(-d * 9.5 * dt);
  acc += lum * T * (1.0 - dT);
  T *= dT;
  if(T < 0.02) break;
  t += dt;
}
return vec4(acc, 1.0 - T);
}

void main(){
vec2 uv = (gl_FragCoord.xy * 2.0 - uRes) / uRes.y;

// edge mask: 0 through the middle of the frame, 1 at the borders and
// strongest in the corners, with its boundary chewed up by slow noise so it
// never reads as a drawn oval.
vec2 dd = abs(gl_FragCoord.xy / uRes * 2.0 - 1.0);
float e = max(max(dd.x, dd.y), length(dd) * 0.76);
e += (fbm2(vec3(gl_FragCoord.xy / uRes.y * 1.9, uTime * 0.02)) - 0.5) * 0.34;
float mask = mix(1.0, smoothstep(uInner, uOuter, e), uMask);
if(mask <= 0.004){ fragColor = vec4(0.0); return; }

vec2 uvz = uv * uZoom;                 // magnify the field as we sit inside it
vec4 m = marchMist(uvz, uTime, uSteps);
float aM = m.w * uOpacity * mask;
vec3  cM = clamp(m.w > 0.001 ? m.xyz / m.w : vec3(0.0), 0.0, 1.0);

// shadow: same silhouette, pushed along the wind and drifting at its own pace
float aS = 0.0;
if(uSStr > 0.002){
  vec4 s = marchMist(uvz + vec2(0.62, 0.40) * uSOff, uTime * uSPace, uSSteps);
  aS = s.w * uSStr * mask;
}

// shadow sits on the map, cloud sits over the shadow
float alpha = aM + aS * (1.0 - aM);
vec3  c = cM * aM + uShadowCol * aS * (1.0 - aM);

fragColor = vec4(c, alpha);   // premultiplied, composites over the map
}
`;

export const TINTS = {
  dark:  { mist: [0.84, 0.92, 0.96], shade: [0.28, 0.46, 0.58], shadow: [0.01, 0.08, 0.14] },
  light: { mist: [0.86, 0.88, 0.91], shade: [0.55, 0.59, 0.65], shadow: [0.26, 0.31, 0.38] },
};

/* mount({ theme, params }) → { canvas, frame }
   params() returns the live field values each frame:
     cov scale drift opacity thick inner outer      — the mist itself
     shadow shadowOff shadowPace                    — the shadow it casts
     mask (1 = edge vignette, 0 = full cover) zoom travel */
/* Performance notes: this is a full-screen raymarch, so cost scales with
   buffer pixels × steps. Mist has no hard edges, so it tolerates a small
   buffer stretched up by the compositor far better than it tolerates fewer
   steps (which band). Hence a low res default, a modest step count, and a
   frame cap — the field drifts slowly enough that 30fps is indistinguishable
   from 60 while halving the work. */
export function mountClouds({ theme = 'light', params, host = document.body,
                              zIndex = 4, steps = 26, res = 0.62, maxDpr = 1.25,
                              fps = 30 } = {}) {
  const TINT = TINTS[theme] || TINTS.light;

  const cv = document.createElement('canvas');
  Object.assign(cv.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    display: 'block', pointerEvents: 'none', zIndex: String(zIndex),
  });
  host.appendChild(cv);

  const gl = cv.getContext('webgl2', {
    alpha: true, premultipliedAlpha: true, antialias: false,
    depth: false, stencil: false, powerPreference: 'high-performance',
  });
  if (!gl) return { canvas: cv, frame: () => {} };

  const mk = (type, srcTxt) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, srcTxt); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (err) { console.warn('mist disabled:', err.message); return { canvas: cv, frame: () => {} }; }
  gl.useProgram(prog);
  gl.disable(gl.DEPTH_TEST);

  const U = {};
  for (let i = 0, n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS); i < n; i++) {
    const info = gl.getActiveUniform(prog, i);
    U[info.name] = gl.getUniformLocation(prog, info.name);
  }

  const t0 = performance.now();
  const minDelta = 1000 / fps;
  let last = -1e9;

  function frame() {
    if (document.hidden) return;
    const now = performance.now();
    if (now - last < minDelta) return;
    last = now;

    const P = params();
    const scale = res * Math.min(devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(cv.clientWidth * scale));
    const h = Math.max(1, Math.round(cv.clientHeight * scale));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    gl.viewport(0, 0, w, h);

    gl.uniform2f(U.uRes, w, h);
    gl.uniform1f(U.uTime, (now - t0) / 1000);
    gl.uniform1f(U.uCov, P.cov);
    gl.uniform1f(U.uScale, P.scale);
    gl.uniform1f(U.uDrift, P.drift);
    gl.uniform1f(U.uOpacity, P.opacity);
    gl.uniform1f(U.uThick, P.thick);
    gl.uniform1f(U.uInner, P.inner);
    gl.uniform1f(U.uOuter, Math.max(P.outer, P.inner + 0.02));
    gl.uniform1f(U.uMask, P.mask ?? 1);
    gl.uniform1f(U.uZoom, P.zoom ?? 1);
    gl.uniform1f(U.uTravel, P.travel ?? 0);
    gl.uniform1f(U.uSStr, P.shadow);
    gl.uniform1f(U.uSOff, P.shadowOff);
    gl.uniform1f(U.uSPace, P.shadowPace);
    gl.uniform1i(U.uSSteps, Math.max(12, Math.round(steps * 0.6)));
    gl.uniform1i(U.uSteps, steps);
    gl.uniform3f(U.uMistCol, TINT.mist[0], TINT.mist[1], TINT.mist[2]);
    gl.uniform3f(U.uShadeCol, TINT.shade[0], TINT.shade[1], TINT.shade[2]);
    gl.uniform3f(U.uShadowCol, TINT.shadow[0], TINT.shadow[1], TINT.shadow[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  return { canvas: cv, frame };
}
