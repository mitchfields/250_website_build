// Bottom timeline — ONE single-line box (1600s … 2000s). The century axis is a
// single crisp rounded frame; the five centuries are separated only by thin
// full-height vertical tick lines (no nested/second box). A small date label sits
// top-left of each cell and a red→teal gradient ribbon runs along the bottom edge,
// masking down to the selected century when a cell is clicked and trailing off to
// the right past the frame, as if time keeps going. Everything recolours live (and
// eases, via CSS transitions) with the light/dark toggle. Mounts from us-explore.

const GRAD = 'linear-gradient(90deg,#f06043 0%,#f06043 15%,#4685c5 37%,#489dbd 64%,#4cc0b4 100%)';

// Homes span ~1000–2020; the axis starts at 1600 (earlier entries fold into the
// first cell) and runs to the 2000s so the labels stay round and readable.
const CENTURIES = [1600, 1700, 1800, 1900, 2000];
const centuryOf = y => Math.min(2000, Math.max(1600, Math.floor((y || 0) / 100) * 100));

// the bar is chrome and has to stay legible over both the light and dark map
function palette(dark) {
  return dark ? {
    bg: 'rgba(9,28,40,.72)', line: 'rgba(255,255,255,.55)', lineSoft: 'rgba(255,255,255,.22)',
    hover: 'rgba(255,255,255,.06)', on: 'rgba(255,255,255,.10)', tick: '#e8f1f6', mask: 'rgba(9,28,40,.82)',
  } : {
    bg: 'rgba(246,245,242,.9)', line: 'rgba(20,40,55,.5)', lineSoft: 'rgba(20,40,55,.2)',
    hover: 'rgba(0,0,0,.045)', on: 'rgba(0,0,0,.06)', tick: '#22333f', mask: 'rgba(246,245,242,.92)',
  };
}

function css(dark) {
  const T = palette(dark);
  const EASE = 'background-color 1s ease, border-color 1s ease, color 1s ease';
  return `
  #tl{position:fixed;left:40px;right:40px;bottom:24px;z-index:18;
      opacity:0;transition:opacity 1.1s ease;pointer-events:none}
  #tl.on{opacity:1;pointer-events:auto}

  /* ONE box — a single crisp rounded frame, nothing nested inside it */
  #tl .frame{position:relative;border:1px solid ${T.line};border-radius:6px;background:${T.bg};
      overflow:hidden;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:${EASE}}
  #tl .grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(${CENTURIES.length},1fr)}
  #tl .seg{position:relative;min-width:0;background:transparent;border:0;text-align:left;cursor:pointer;
      padding:12px 14px 13px;transition:background-color .18s}
  #tl .seg:hover{background:${T.hover}}
  #tl .seg[aria-pressed="true"]{background:${T.on}}
  #tl .seg .y{font:400 11px/1 ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:.08em;
      color:${T.tick};white-space:nowrap;transition:color 1s ease}

  /* the only interior marks: thin full-height vertical tick lines between centuries */
  #tl .div{position:absolute;top:0;bottom:0;width:1px;background:${T.line};z-index:2;pointer-events:none;transition:${EASE}}

  #tl .rule{position:absolute;left:0;right:0;bottom:0;z-index:1;height:3px;background:${GRAD}}
  #tl .rule i{position:absolute;top:0;bottom:0;background:${T.mask};transition:
      left .3s cubic-bezier(.22,.9,.24,1),width .3s cubic-bezier(.22,.9,.24,1),opacity .3s,background-color 1s ease}
  #tl .rule i.hide{opacity:0}
  /* the ribbon keeps going past the frame, fading out to the right */
  #tl .tail{position:absolute;bottom:0;right:-46px;width:130px;height:3px;pointer-events:none;
      background:linear-gradient(90deg,#4cc0b4,rgba(76,192,180,0))}
  `;
}

export function mountTimeline({ pins, onSelect, dark }) {
  let curDark = !!dark;

  const st = document.createElement('style');
  st.textContent = css(curDark);
  document.head.appendChild(st);

  const nInner = CENTURIES.length;
  const divs = Array.from({ length: nInner - 1 }, (_, i) =>
    `<span class="div" style="left:${((i + 1) / nInner) * 100}%"></span>`).join('');

  const el = document.createElement('div');
  el.id = 'tl';
  el.innerHTML = `<div class="frame">
    <div class="grid">${CENTURIES.map(c => `
      <button class="seg" data-c="${c}" aria-pressed="false" title="${c}s"><span class="y">${c}s</span></button>`).join('')}</div>
    ${divs}
    <div class="rule"><i class="hide"></i><i class="hide"></i></div>
  </div><span class="tail"></span>`;
  document.body.appendChild(el);

  const segs = [...el.querySelectorAll('.seg')];
  const [maskL, maskR] = [...el.querySelectorAll('.rule i')];
  let active = null;

  // the gradient stays whole; two masks blank the spans either side of the
  // selection, so the lit stretch is literally that century's slice of the axis
  function paintRule() {
    if (active == null) { maskL.classList.add('hide'); maskR.classList.add('hide'); return; }
    const i = CENTURIES.indexOf(active), w = 100 / CENTURIES.length;
    maskL.classList.remove('hide'); maskR.classList.remove('hide');
    maskL.style.left = '0%';                 maskL.style.width = (i * w) + '%';
    maskR.style.left = ((i + 1) * w) + '%';  maskR.style.width = (100 - (i + 1) * w) + '%';
  }

  function set(c) {
    active = active === c ? null : c;
    segs.forEach(s => s.setAttribute('aria-pressed', String(+s.dataset.c === active)));
    paintRule();
    onSelect(active);
  }

  segs.forEach(s => s.addEventListener('click', () => set(+s.dataset.c)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && active != null) set(active); });

  function setTheme(dk) { curDark = !!dk; st.textContent = css(curDark); }
  addEventListener('usmap:theme', e => setTheme(e.detail === 'dark'));

  return {
    show: () => el.classList.add('on'),
    clear: () => { if (active != null) set(active); },
    setTheme,
    century: () => active,
  };
}
