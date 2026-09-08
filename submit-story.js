/* submit-story.js — the "Share your story" modal, shared by the landing page and
   the explore map. Self-contained: injects its own styles + dialog and binds to
   any "Share your story" link on the page. No framework, no build step.

   Wiring a real backend later: set window.STORY_ENDPOINT to a URL that accepts a
   JSON POST ({ name, email, location, story }). Until then submissions are held
   in localStorage ('bof.stories') so nothing entered is lost, and the user gets a
   confirmation. */
(function () {
  'use strict';

  const THEME_KEY = 'usmap.theme';
  const isDark = () =>
    (document.documentElement.getAttribute('data-theme') === 'dark') ||
    (localStorage.getItem(THEME_KEY) === 'dark');

  const style = document.createElement('style');
  style.textContent = `
  #story-modal{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;
    padding:24px;font-family:Poppins,system-ui,sans-serif}
  #story-modal.on{display:flex}
  #story-modal .backdrop{position:absolute;inset:0;background:rgba(3,20,33,.62);
    -webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);opacity:0;transition:opacity .3s ease}
  #story-modal.on .backdrop{opacity:1}
  #story-modal .card{position:relative;width:520px;max-width:100%;max-height:90vh;overflow-y:auto;
    background:#f6f5f2;color:#12222c;border-radius:14px;padding:34px 34px 30px;
    box-shadow:0 24px 70px rgba(0,0,0,.4);transform:translateY(14px) scale(.98);opacity:0;
    transition:transform .34s cubic-bezier(.22,.9,.24,1),opacity .34s ease}
  #story-modal.on .card{transform:none;opacity:1}
  #story-modal.dark .card{background:#0b2739;color:#f2f6f8}
  #story-modal .x{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:50%;
    border:1.5px solid rgba(0,0,0,.14);background:rgba(0,0,0,.05);color:inherit;cursor:pointer;
    display:grid;place-content:center;font-size:16px;line-height:1;transition:background .2s,border-color .2s}
  #story-modal.dark .x{border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08)}
  #story-modal .x:hover{background:#eb5735;border-color:#eb5735;color:#fff}
  #story-modal .eyebrow{font:600 11px/1 ui-monospace,"SF Mono",Menlo,monospace;letter-spacing:.18em;
    text-transform:uppercase;color:#eb5735;margin:0 0 10px}
  #story-modal h2{margin:0 0 8px;font:700 27px/1.15 Poppins,system-ui,sans-serif;letter-spacing:-.01em}
  #story-modal .lede{margin:0 0 22px;font:400 14px/1.6 ui-sans-serif,system-ui,sans-serif;
    color:#4a5a64}
  #story-modal.dark .lede{color:#a9c2d0}
  #story-modal label{display:block;font:600 11px/1 Poppins,system-ui,sans-serif;letter-spacing:.04em;
    text-transform:uppercase;margin:0 0 7px;color:#4a5a64}
  #story-modal.dark label{color:#8fb0c2}
  #story-modal .row{margin:0 0 16px}
  #story-modal .two{display:flex;gap:14px}
  #story-modal .two .row{flex:1}
  #story-modal input,#story-modal textarea{width:100%;box-sizing:border-box;font:400 14px/1.5 ui-sans-serif,system-ui,sans-serif;
    color:inherit;background:#fff;border:1.5px solid rgba(0,0,0,.16);border-radius:9px;padding:11px 13px;
    transition:border-color .2s,box-shadow .2s}
  #story-modal.dark input,#story-modal.dark textarea{background:#0f3247;border-color:rgba(255,255,255,.14)}
  #story-modal textarea{resize:vertical;min-height:118px}
  #story-modal input:focus,#story-modal textarea:focus{outline:none;border-color:#eb5735;
    box-shadow:0 0 0 3px rgba(235,87,53,.18)}
  #story-modal .err{border-color:#e0492c!important}
  #story-modal .hint{font:400 11.5px/1.5 ui-sans-serif,system-ui,sans-serif;color:#8d9298;margin:6px 0 0}
  #story-modal .actions{display:flex;align-items:center;gap:14px;margin-top:22px}
  #story-modal .submit{appearance:none;border:0;cursor:pointer;font:700 14px/1 Poppins,system-ui,sans-serif;
    color:#fff;background:#eb5735;border-radius:99px;padding:14px 26px;transition:filter .2s,transform .1s}
  #story-modal .submit:hover{filter:brightness(1.07)}
  #story-modal .submit:active{transform:scale(.97)}
  #story-modal .submit[disabled]{opacity:.6;cursor:default}
  #story-modal .cancel{background:none;border:0;cursor:pointer;color:#8d9298;
    font:600 13px/1 Poppins,system-ui,sans-serif}
  #story-modal .cancel:hover{color:#eb5735}
  #story-modal .done{text-align:center;padding:16px 4px 6px}
  #story-modal .done .check{width:58px;height:58px;border-radius:50%;background:rgba(53,204,186,.16);
    display:grid;place-content:center;margin:0 auto 18px}
  #story-modal .done .check svg{width:30px;height:30px;stroke:#20b39c;fill:none;stroke-width:2.6;
    stroke-linecap:round;stroke-linejoin:round}
  @media (max-width:560px){#story-modal .two{flex-direction:column;gap:0}#story-modal .card{padding:28px 22px}}
  `;
  document.head.appendChild(style);

  const modal = document.createElement('div');
  modal.id = 'story-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Share your story');
  modal.innerHTML = `
    <div class="backdrop" data-close></div>
    <div class="card">
      <button class="x" type="button" aria-label="Close" data-close>&#10005;</button>
      <div class="form-view">
        <p class="eyebrow">Built on Freedom</p>
        <h2>Share your story</h2>
        <p class="lede">Every home has a story. Tell us about yours — a first set of keys,
          a kitchen table, a porch, a place that shaped your family — and it may be featured
          as part of our celebration of 250 years of American homes.</p>
        <form novalidate>
          <div class="two">
            <div class="row">
              <label for="story-name">Name</label>
              <input id="story-name" name="name" type="text" autocomplete="name" required>
            </div>
            <div class="row">
              <label for="story-email">Email</label>
              <input id="story-email" name="email" type="email" autocomplete="email" required>
            </div>
          </div>
          <div class="row">
            <label for="story-loc">City &amp; state <span style="text-transform:none;font-weight:400;opacity:.7">(optional)</span></label>
            <input id="story-loc" name="location" type="text" autocomplete="address-level2" placeholder="e.g. Charleston, SC">
          </div>
          <div class="row">
            <label for="story-body">Your story</label>
            <textarea id="story-body" name="story" maxlength="2500" required></textarea>
            <p class="hint">Up to 2,500 characters.</p>
          </div>
          <div class="actions">
            <button class="submit" type="submit">Submit story</button>
            <button class="cancel" type="button" data-close>Cancel</button>
          </div>
        </form>
      </div>
      <div class="done" hidden>
        <div class="check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
        <h2>Thank you</h2>
        <p class="lede" style="margin-bottom:8px">Your story has been received. We appreciate you
          sharing a piece of what home means to you.</p>
        <div class="actions" style="justify-content:center">
          <button class="submit" type="button" data-close>Close</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const card = modal.querySelector('.card');
  const form = modal.querySelector('form');
  const formView = modal.querySelector('.form-view');
  const doneView = modal.querySelector('.done');
  const submitBtn = form.querySelector('.submit');
  let lastFocus = null;

  function open(e) {
    if (e) e.preventDefault();
    lastFocus = document.activeElement;
    modal.classList.toggle('dark', isDark());
    formView.hidden = false; doneView.hidden = true;
    form.reset();
    form.querySelectorAll('.err').forEach(el => el.classList.remove('err'));
    modal.classList.add('on');
    setTimeout(() => { const f = form.querySelector('#story-name'); if (f) f.focus(); }, 60);
    document.addEventListener('keydown', onKey);
  }
  function close() {
    modal.classList.remove('on');
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', close));

  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const el = {
    name: form.querySelector('#story-name'),
    email: form.querySelector('#story-email'),
    location: form.querySelector('#story-loc'),
    story: form.querySelector('#story-body'),
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const fields = {
      name: el.name.value.trim(),
      email: el.email.value.trim(),
      location: el.location.value.trim(),
      story: el.story.value.trim(),
    };
    let bad = false;
    const mark = (input, isBad) => { input.classList.toggle('err', isBad); if (isBad) bad = true; };
    mark(el.name, !fields.name);
    mark(el.email, !emailOk(fields.email));
    mark(el.story, fields.story.length < 4);
    if (bad) { const f = form.querySelector('.err'); if (f) f.focus(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    try {
      const endpoint = window.STORY_ENDPOINT;
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...fields, submittedAt: new Date().toISOString() }),
        });
      } else {
        // No backend wired yet — hold locally so nothing is lost.
        const key = 'bof.stories';
        const all = JSON.parse(localStorage.getItem(key) || '[]');
        all.push({ ...fields, submittedAt: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(all));
      }
      formView.hidden = true;
      doneView.hidden = false;
    } catch (err) {
      console.error('story submit failed', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit story';
      alert('Sorry — something went wrong sending your story. Please try again.');
      return;
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit story';
  });

  // Bind every "Share your story" trigger on the page.
  function bind() {
    const links = document.querySelectorAll(
      'a[aria-label^="Share your story"], [data-share-story]'
    );
    links.forEach(a => { if (!a.__storyBound) { a.__storyBound = true; a.addEventListener('click', open); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();

  window.openStoryModal = open;   // expose for any custom trigger
})();
