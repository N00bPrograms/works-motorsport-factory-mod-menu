// WORKS Mod Menu: an Insert-key panel for WORKS: Motorsport Factory.
// Every button runs one of the game's own developer-console commands (the ` console),
// so changes go through the simulation exactly as the game's console would make them.
(() => {
  if (window.__worksModMenu) return;
  window.__worksModMenu = true;
  const HOTKEY = 'Insert'; // F8 is the game's bug-report key

  const PARTS = ['tyres', 'engine', 'gearbox', 'brakes', 'suspension', 'bodywork', 'frontWing', 'rearWing', 'chassis', 'floor', 'steeringWheel', 'rollCage'];
  const STOCK = ['steel', 'gears', 'treatedGears', 'casing', 'brakeDisc', 'treatedDisc', 'carbonFibre', 'laidCarbon', 'curedCarbon', 'trimmedCarbon', 'aluminium', 'electronics', 'weldedFrame', 'tubeFrame', 'controlUnit', 'engineBlock', 'treatedBlock', 'crankshaft', 'engineMap', 'wheelController'];
  const CARS = [['kart', 'Kart'], ['banger', 'Banger'], ['hatch', 'Hot Hatch'], ['roadster', 'Roadster'], ['saloon', 'Saloon'], ['formula', 'Formula Junior'], ['formulaChallenge', 'Formula Challenge'], ['formulaPro', 'Formula Pro'], ['formulaApex', 'Formula Apex'], ['gt', 'GT'], ['prototype', 'Prototype'], ['hypercar', 'Endurance Ultra']];
  const LABEL = s => s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

  // ---------- running console commands ----------
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function waitFor(fn, ms = 3000) {
    const end = performance.now() + ms;
    for (;;) { const v = fn(); if (v) return v; if (performance.now() > end) return null; await sleep(25); }
  }
  let queue = Promise.resolve();
  function run(cmd) {
    const job = queue.then(() => runNow(cmd));
    queue = job.catch(() => {});
    return job;
  }
  async function runNow(cmd) {
    if (typeof window.__console !== 'function') throw new Error('Load a game first (the console is only available in a running game).');
    const wasOpen = !!document.querySelector('.dev-console');
    if (!wasOpen) document.documentElement.classList.add('wmm-quiet');
    try {
      window.__console(true);
      const input = await waitFor(() => document.querySelector('.dev-console .dc-in input'));
      if (!input) throw new Error('The game console did not open.');
      await sleep(30); // let the greeting land first
      await waitFor(() => input.getAttribute('aria-busy') !== 'true');
      const out = document.querySelector('.dev-console .dc-out');
      const marker = '> ' + cmd;
      const countMarkers = () => [...out.children].filter(e => e.textContent === marker).length;
      const before = countMarkers();
      input.value = cmd;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true, cancelable: true }));
      await waitFor(() => countMarkers() > before, 2000);
      await waitFor(() => input.getAttribute('aria-busy') !== 'true', 10000);
      await sleep(30);
      const rows = [...out.children];
      let i = rows.length - 1;
      while (i >= 0 && rows[i].textContent !== marker) i--;
      return rows.slice(i + 1).map(e => ({ kind: [...e.classList].find(c => c !== 'dc-line') || 'ok', text: e.textContent }));
    } finally {
      if (!wasOpen) { window.__console(false); document.documentElement.classList.remove('wmm-quiet'); }
    }
  }

  // ---------- UI ----------
  const css = `
  html.wmm-quiet .dev-console{opacity:0!important;pointer-events:none!important}
  #wmm{position:fixed;left:16px;top:70px;z-index:2147483646;width:400px;max-height:calc(100vh - 100px);display:flex;flex-direction:column;
    background:rgba(14,16,22,.96);color:#e8eaf0;border:1px solid #3a3f4d;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.6);
    font:13px/1.35 "Segoe UI",system-ui,sans-serif;user-select:none}
  #wmm.hidden{display:none}
  #wmm .hd{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid #2a2e38;cursor:move}
  #wmm .hd b{font-size:15px;color:#ffc85a;flex:1}
  #wmm .hd .x{background:none;border:0;color:#9aa;font-size:16px;cursor:pointer;padding:0 4px}
  #wmm .st{padding:8px 12px;border-bottom:1px solid #2a2e38;color:#b8bfcc;font-size:12px;white-space:pre-line}
  #wmm .st .flag{color:#ff9a5a}
  #wmm .tabs{display:flex;flex-wrap:wrap;gap:4px;padding:8px 10px 0}
  #wmm .tabs button{flex:1;padding:6px 4px;background:#1d212b;border:1px solid #2f3442;border-bottom:0;border-radius:6px 6px 0 0;color:#aeb5c2;cursor:pointer}
  #wmm .tabs button.on{background:#2a3040;color:#ffc85a}
  #wmm .body{padding:10px 12px;overflow-y:auto;border-top:1px solid #2f3442}
  #wmm h4{margin:10px 0 6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#7f8899}
  #wmm h4:first-child{margin-top:0}
  #wmm .row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;align-items:center}
  #wmm .btn{padding:6px 10px;background:#283044;border:1px solid #3a4560;border-radius:6px;color:#e8eaf0;cursor:pointer}
  #wmm .btn:hover{background:#34405c}
  #wmm .btn.gold{background:#5a4512;border-color:#8a6a1c;color:#ffe2a0}
  #wmm .btn.warn{background:#4a2420;border-color:#7a3a30}
  #wmm input,#wmm select{background:#0c0e13;border:1px solid #3a3f4d;border-radius:6px;color:#e8eaf0;padding:6px 8px;font:inherit}
  #wmm input{width:110px}
  #wmm .grow{flex:1;min-width:0;width:auto}
  #wmm .log{margin-top:8px;padding:8px;background:#0a0c10;border:1px solid #262a33;border-radius:6px;min-height:40px;max-height:170px;overflow-y:auto;
    font:12px/1.4 Consolas,monospace;white-space:pre-wrap;user-select:text}
  #wmm .log .error{color:#ff7a7a}#wmm .log .warn{color:#ffb35a}#wmm .log .info{color:#a9b3c4}#wmm .log .ok{color:#8fe39a}#wmm .log .input{color:#ffc85a}
  #wmm .note{color:#8a93a3;font-size:11.5px;margin:4px 0 8px}
  #wmm .ft{padding:6px 12px;border-top:1px solid #2a2e38;color:#6f7889;font-size:11px}`;

  const h = (tag, props = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (k === 'class') e.className = v;
      else e.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c != null) e.append(c);
    return e;
  };

  let panel, statusEl, logEl, bodyEl, tab = 'Money';

  function log(lines) {
    for (const l of lines) logEl.append(h('div', { class: l.kind }, l.text));
    while (logEl.children.length > 200) logEl.firstChild.remove();
    logEl.scrollTop = logEl.scrollHeight;
  }
  async function exec(cmd, { quiet = false, refresh = true } = {}) {
    if (!quiet) log([{ kind: 'input', text: '> ' + cmd }]);
    try {
      const lines = await run(cmd);
      if (!quiet) log(lines);
      if (refresh) refreshStatus();
      return lines;
    } catch (e) {
      log([{ kind: 'error', text: e.message || String(e) }]);
      return [];
    }
  }
  async function refreshStatus() {
    if (typeof window.__console !== 'function') { statusEl.textContent = 'Load or start a game to use the menu.'; return; }
    const lines = await exec('status', { quiet: true, refresh: false });
    if (!lines.length) return;
    statusEl.replaceChildren(...lines.map(l => h('div', { class: l.kind === 'warn' ? 'flag' : '' }, l.text)));
  }

  const btn = (text, cmd, cls = '') => h('button', { class: 'btn ' + cls, onclick: () => exec(typeof cmd === 'function' ? cmd() : cmd) }, text);
  const sel = (opts, id) => h('select', { id }, opts.map(([v, t]) => h('option', { value: v }, t)));
  const val = id => panel.querySelector('#' + id).value.trim();

  const TABS = {
    Money: () => [
      h('h4', {}, 'Add cash'),
      h('div', { class: 'row' }, btn('+10k', 'cash 10k'), btn('+100k', 'cash 100k'), btn('+1M', 'cash 1m', 'gold'), btn('+10M', 'cash 10m', 'gold'), btn('+100M', 'cash 100m', 'gold')),
      h('h4', {}, 'Set balance'),
      h('div', { class: 'row' }, h('input', { id: 'wmm-cash', placeholder: 'e.g. 2.5m' }),
        btn('Add', () => 'cash ' + (val('wmm-cash') || '0')), btn('Set to', () => 'setcash ' + (val('wmm-cash') || '0'))),
      h('div', { class: 'note' }, 'Amounts accept 5000, 5k, 2.5m, 1b, -750.'),
      h('h4', {}, 'Debt'),
      h('div', { class: 'row' }, btn('Clear all loans', 'clearloans'), btn('Rescue from insolvency', 'rescue', 'warn')),
      h('div', { class: 'note' }, 'Rescue lifts the whole solvency slide (even a wound-up team) and writes off the loans.'),
    ],
    Team: () => [
      h('h4', {}, 'Hire'),
      h('div', { class: 'row' }, h('input', { id: 'wmm-name', class: 'grow', placeholder: 'Name (optional)' })),
      h('div', { class: 'row' }, btn('+ Mechanic', () => ('spawn mechanic ' + val('wmm-name')).trim()), btn('+ Designer', () => ('spawn designer ' + val('wmm-name')).trim())),
      h('h4', {}, 'Cars'),
      h('div', { class: 'row' }, sel(CARS, 'wmm-car'), btn('Spawn car', () => 'spawn car ' + val('wmm-car'))),
      h('div', { class: 'note' }, 'Needs a free race bay.'),
      h('h4', {}, 'Championships'),
      h('div', { class: 'row' }, btn('Unlock every series', 'unlockseries', 'gold'), btn('List series', 'series')),
      h('div', { class: 'row' }, h('input', { id: 'wmm-series', placeholder: 'series id' }), h('input', { id: 'wmm-pos', placeholder: 'pos 1–20', style: 'width:80px' }),
        btn('Record finish', () => `recordseason ${val('wmm-series')} ${val('wmm-pos') || 1}`)),
      h('div', { class: 'note' }, '"Record finish" counts as a past championship result for career qualification. Ids come from "List series".'),
      h('h4', {}, 'Trophies'),
      h('div', { class: 'row' }, btn('Spawn trophy', 'spawn trophy')),
    ],
    Parts: () => [
      h('h4', {}, 'Designs'),
      h('div', { class: 'row' }, sel(PARTS.map(p => [p, LABEL(p)]), 'wmm-design'), btn('Grant proven design', () => 'grant ' + val('wmm-design'))),
      h('div', { class: 'row' }, h('button', { class: 'btn gold', onclick: async () => { for (const p of PARTS) await exec('grant ' + p, { refresh: false }); refreshStatus(); } }, 'Grant all designs')),
      h('h4', {}, 'Boxed parts'),
      h('div', { class: 'row' }, sel(PARTS.map(p => [p, LABEL(p)]), 'wmm-part'), btn('Spawn part', () => 'spawn part ' + val('wmm-part')), btn('Worn', () => 'spawn wornpart ' + val('wmm-part'))),
      h('div', { class: 'note' }, 'Parts arrive in the delivery zone.'),
      h('h4', {}, 'Raw materials'),
      h('div', { class: 'row' }, sel(STOCK.map(s => [s, LABEL(s)]), 'wmm-stock'), h('input', { id: 'wmm-qty', placeholder: 'qty', value: '10', style: 'width:60px' }),
        btn('Deliver', () => `spawn stock ${val('wmm-stock')} ${val('wmm-qty') || 4}`)),
      h('div', { class: 'note' }, 'Materials go onto the pallet racks.'),
    ],
    Time: () => [
      h('h4', {}, 'Clock'),
      h('div', { class: 'row' }, btn('Pause', 'pause'), btn('1×', 'speed 1'), btn('5×', 'speed 5'), btn('20×', 'speed 20')),
      h('h4', {}, 'Skip'),
      h('div', { class: 'row' }, btn('To morning', 'skip morning'), btn('+1 day', 'skip 1'), btn('+7 days', 'skip 7')),
      h('div', { class: 'row' }, h('input', { id: 'wmm-days', placeholder: 'days' }), btn('Skip days', () => 'skip ' + (val('wmm-days') || 1))),
    ],
    Fix: () => [
      h('h4', {}, 'Unstick the factory'),
      h('div', { class: 'row' }, btn('Show task queue', 'tasks 30'), btn('Clear task queue', 'cleartasks', 'warn')),
      h('div', { class: 'row' }, h('input', { id: 'wmm-task', placeholder: 'task id' }), btn('Cancel task', () => 'killtask ' + val('wmm-task'))),
      h('div', { class: 'row' }, btn('Reset stuck vehicles', 'unstick'), btn('Check save', 'validate')),
      h('h4', {}, 'Console'),
      h('div', { class: 'row' }, h('input', { id: 'wmm-cmd', class: 'grow', placeholder: 'any console command, e.g. help',
        onkeydown: e => { if (e.key === 'Enter') { const c = e.target.value.trim(); if (c) { exec(c); e.target.value = ''; } } } }),
        btn('Run', () => val('wmm-cmd') || 'help')),
      h('div', { class: 'note' }, 'Avoid newgame, load and scenario here: they replace the game you have open.'),
    ],
  };

  function render() {
    panel.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.textContent === tab));
    bodyEl.replaceChildren(...TABS[tab]());
  }

  function build() {
    document.head.append(h('style', {}, css));
    statusEl = h('div', { class: 'st' }, 'Load or start a game to use the menu.');
    logEl = h('div', { class: 'log' });
    bodyEl = h('div', { class: 'body' });
    const header = h('div', { class: 'hd' }, h('b', {}, 'WORKS Mod Menu'),
      h('button', { class: 'x', title: 'Refresh', onclick: refreshStatus }, '⟳'),
      h('button', { class: 'x', title: 'Close (Insert)', onclick: toggle }, '✕'));
    panel = h('div', { id: 'wmm', class: 'hidden' },
      header, statusEl,
      h('div', { class: 'tabs' }, Object.keys(TABS).map(t => h('button', { onclick: () => { tab = t; render(); } }, t))),
      h('div', { class: 'body-wrap', style: 'display:flex;flex-direction:column;min-height:0;overflow:hidden' }, bodyEl),
      h('div', { style: 'padding:0 12px 10px' }, logEl),
      h('div', { class: 'ft' }, 'Insert toggles ·⚑ cheats flag the save as cheated (the game says flagged saves get no achievements).'));
    // keep typing in the menu away from the game's hotkeys
    for (const ev of ['keydown', 'keyup', 'keypress']) panel.addEventListener(ev, e => { if (e.key !== HOTKEY) e.stopPropagation(); });
    for (const ev of ['wheel', 'mousedown', 'pointerdown', 'click', 'contextmenu']) panel.addEventListener(ev, e => e.stopPropagation());
    // drag by the header
    header.addEventListener('mousedown', e => {
      if (e.target.tagName === 'BUTTON') return;
      const r = panel.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      const move = m => { panel.style.left = Math.max(0, m.clientX - dx) + 'px'; panel.style.top = Math.max(0, m.clientY - dy) + 'px'; };
      const up = () => { removeEventListener('mousemove', move); removeEventListener('mouseup', up); };
      addEventListener('mousemove', move); addEventListener('mouseup', up);
    });
    document.body.append(panel);
    render();
  }

  function toggle() {
    if (!panel) build();
    panel.classList.toggle('hidden');
    if (!panel.classList.contains('hidden')) refreshStatus();
  }

  window.addEventListener('keydown', e => {
    if (e.key === HOTKEY && !e.repeat) { e.preventDefault(); e.stopPropagation(); toggle(); }
  }, true);
  const ready = () => { if (!panel) build(); };
  if (document.body) ready(); else document.addEventListener('DOMContentLoaded', ready);
})();
