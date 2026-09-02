import { ERAS, ERA_COUNTS } from './explore-poi.js?v=20260902c';

// Bottom timeline. Twelve segments of equal screen width but unequal year span,
// so each holds a comparable number of homes. Each cell is labelled with the
// year the bucket opens — an axis tick, never a closed range, so the glyphs can
// never outgrow a 1/12 track. Selecting a segment filters the pins; entries
// outside the lower-48 frame surface as chips above the bar, since they have no
// place on the relief.

const GRAD = 'linear-gradient(90deg,#f06043,#4685c5 37%,#489dbd 61%,#4cc0b4)';

export function mountTimeline({ pins, onSelect, openPin, dark }) {
  // same split as explore-ui's palette: the bar is chrome and has to track the
  // relief underneath it or the 8px counts drop out of sight
  const T = dark ? {
    bg: 'rgba(9,28,40,.72)', edge: 'rgba(255,255,255,.13)', cell: 'rgba(255,255,255,.09)',
    hover: 'rgba(255,255,255,.07)', on: 'rgba(255,255,255,.12)',
    tick: '#d8e6ee', tickOn: '#ffffff', count: '#8fb0c2', countOn: '#ff8163',
    chipBg: 'rgba(9,28,40,.78)', chipBgOn: 'rgba(9,28,40,.95)',
    chipText: '#e4eef4', chipEdge: 'rgba(255,255,255,.18)', mask: 'rgba(9,28,40,.78)',
  } : {
    bg: 'rgba(246,245,242,.88)', edge: 'rgba(0,0,0,.14)', cell: 'rgba(0,0,0,.09)',
    hover: 'rgba(0,0,0,.05)', on: 'rgba(0,0,0,.08)',
    tick: '#22333f', tickOn: '#0c1922', count: '#5c6870', countOn: '#c2401f',
    chipBg: 'rgba(246,245,242,.92)', chipBgOn: 'rgba(255,255,255,.98)',
    chipText: '#22333f', chipEdge: 'rgba(0,0,0,.16)', mask: 'rgba(246,245,242,.9)',
  };

  const st = document.createElement('style');
  st.textContent = `
  #tl{position:fixed;left:72px;right:72px;bottom:20px;z-index:18;
      opacity:0;transition:opacity 1.1s ease;pointer-events:none}
  #tl.on{opacity:1;pointer-events:auto}

  #tl .off{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 9px;min-height:0}
  #tl .off button{font:400 9px/1 ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:.14em;
      text-transform:uppercase;color:${T.chipText};background:${T.chipBg};cursor:pointer;
      border:1px solid ${T.chipEdge};border-radius:99px;padding:7px 12px 6px;
      display:flex;align-items:center;gap:7px;transition:background .2s,border-color .2s}
  #tl .off button:hover{background:${T.chipBgOn};border-color:#eb5735}
  #tl .off button i{width:5px;height:5px;border-radius:50%;border:1px solid #eb5735;flex:0 0 auto}

  #tl .grid{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);
      background:${T.bg};border:1px solid ${T.edge};border-radius:4px 4px 0 0;overflow:hidden}
  #tl .seg{position:relative;min-width:0;background:transparent;border:0;cursor:pointer;text-align:left;
      padding:11px 10px 12px;display:flex;flex-direction:column;gap:5px;
      border-right:1px solid ${T.cell};transition:background .18s}
  #tl .seg:last-child{border-right:0}
  #tl .seg:hover{background:${T.hover}}
  #tl .seg .y{font:400 9.5px/1 ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:.02em;
      color:${T.tick};white-space:nowrap;transition:color .18s}
  #tl .seg[aria-pressed="true"]{background:${T.on}}
  #tl .seg[aria-pressed="true"] .y{color:${T.tickOn}}

  #tl .rule{height:4px;background:${GRAD};position:relative;
      border-radius:0 0 4px 4px;overflow:hidden}
  #tl .rule i{position:absolute;top:0;bottom:0;background:${T.mask};
      transition:left .3s cubic-bezier(.22,.9,.24,1),width .3s cubic-bezier(.22,.9,.24,1),opacity .3s}
  #tl .rule i.hide{opacity:0}

  #theme, #note{bottom:106px}
  `;
  document.head.appendChild(st);

  const el = document.createElement('div');
  el.id = 'tl';
  el.innerHTML = `<div class="off"></div>
    <div class="grid">${ERAS.map(e => `
      <button class="seg" data-era="${e.id}" aria-pressed="false" title="${e.label} · ${e.name} · ${ERA_COUNTS[e.id]} home${ERA_COUNTS[e.id] === 1 ? '' : 's'}">
        <span class="y">${e.tick}</span>
      </button>`).join('')}</div>
    <div class="rule"><i class="hide"></i><i class="hide"></i></div>`;
  document.body.appendChild(el);

  const segs = [...el.querySelectorAll('.seg')];
  const tray = el.querySelector('.off');
  const [maskL, maskR] = [...el.querySelectorAll('.rule i')];
  let active = null;

  // the gradient stays whole; two masks blank the spans either side of the
  // selection, so the lit stretch is literally that era's slice of the century
  function paintRule() {
    if (!active) { maskL.classList.add('hide'); maskR.classList.add('hide'); return; }
    const i = ERAS.findIndex(e => e.id === active);
    const w = 100 / ERAS.length;
    maskL.classList.remove('hide'); maskR.classList.remove('hide');
    maskL.style.left = '0%';                 maskL.style.width = (i * w) + '%';
    maskR.style.left = ((i + 1) * w) + '%';  maskR.style.width = (100 - (i + 1) * w) + '%';
  }

  function paintTray() {
    const off = active ? pins.filter(pn => pn.poi.mode === 'off' && pn.poi.era === active) : [];
    tray.innerHTML = '';
    for (const pn of off) {
      const b = document.createElement('button');
      b.innerHTML = `<i></i>${pn.poi.name} — ${pn.poi.city}`;
      b.title = 'Outside the map frame — opens directly';
      b.addEventListener('click', () => openPin(pn.i));
      tray.appendChild(b);
    }
    tray.style.margin = off.length ? '0 0 9px' : '0';
  }

  function set(era) {
    active = active === era ? null : era;
    segs.forEach(s => s.setAttribute('aria-pressed', String(s.dataset.era === active)));
    paintRule();
    paintTray();
    onSelect(active);
  }

  segs.forEach(s => s.addEventListener('click', () => set(s.dataset.era)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && active) set(active); });

  return {
    show: () => el.classList.add('on'),
    clear: () => { if (active) set(active); },
    era: () => active,
  };
}
