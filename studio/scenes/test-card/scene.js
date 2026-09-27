// test-card — pipeline smoke test. See brief.md for the beat sheet this implements.
import {springAt, springs, tween, ease, progress, stagger, mixColor, clamp} from '../../lib/motion.js';

const C = {ink: '#0E0E10', paper: '#F2EFE9', accent: '#FF4D1F', mute: '#8A8780'};
const W = 1920, H = 1080, M = 96;
const COL = (W - 2 * M) / 4; // 432
const WORDS = ['Brief', 'Build', 'Look', 'Fix'];
const CARDS = [
  ['01', 'Brief', 'write it down'],
  ['02', 'Build', 'seek(t) scenes'],
  ['03', 'Look', 'render & critique'],
  ['04', 'Fix', "iterate, don't restart"],
];

// Beat sheet (seconds) — keep in sync with brief.md §6.
const T = {grid: 0, index: 0.35, bar: 0.6, headline: 0.8, cards: 2.4, focus: 3.8, out: 4.6, back: 4.95, lockup: 5.25};

const el = (tag, css = '', text = '') => {
  const n = document.createElement(tag);
  n.style.cssText = css;
  if (text) n.textContent = text;
  return n;
};
/** Masked line: outer clips, inner moves. The only way type enters in this scene. */
const mask = (css, innerCss, text) => {
  const outer = el('div', `position:absolute;overflow:hidden;${css}`);
  const inner = el('div', innerCss, text);
  outer.append(inner);
  return {outer, inner};
};

const r = {}; // node refs

export default {
  meta: {title: 'test-card', width: W, height: H, fps: 30, duration: 6},

  setup(root) {
    root.style.background = C.paper;
    root.style.fontFamily = 'Inter, sans-serif';
    root.style.color = C.ink;

    // hairline grid: 5 verticals + 2 horizontals
    r.vlines = [0, 1, 2, 3, 4].map((i) => {
      const n = el('div', `position:absolute;left:${M + i * COL}px;top:${M}px;width:1px;height:0;background:${C.ink}22;`);
      root.append(n);
      return n;
    });
    r.hlines = [200, 800].map((y) => {
      const n = el('div', `position:absolute;left:${M}px;top:${y}px;width:0;height:1px;background:${C.ink}22;`);
      root.append(n);
      return n;
    });

    // index labels, top row
    r.index = [0, 1, 2, 3].map((i) => {
      const m = mask(`left:${M + i * COL + 20}px;top:${M + 24}px;height:24px;`,
        `font:500 16px/24px Inter;letter-spacing:.18em;color:${C.mute};`, `0${i + 1} — 04`);
      root.append(m.outer);
      return m;
    });

    // accent bar (signature)
    r.bar = el('div', `position:absolute;left:${M}px;top:560px;width:0;height:14px;background:${C.accent};`);
    root.append(r.bar);

    // headline words, one per column
    r.words = WORDS.map((w, i) => {
      const m = mask(`left:${M + i * COL + 16}px;top:600px;height:200px;width:${COL - 16}px;`,
        `font:200 176px/200px Inter;letter-spacing:-.04em;`, w);
      root.append(m.outer);
      return m;
    });

    // step cards
    r.cards = CARDS.map(([n, title, sub], i) => {
      const card = el('div', `position:absolute;left:${M + i * COL + 12}px;top:820px;width:${COL - 24}px;height:164px;` +
        `padding:22px 28px;background:${C.ink}0D;`);
      const num = el('div', `font:500 16px/1 Inter;letter-spacing:.18em;`, n);
      const t = el('div', `font:300 44px/1 Inter;letter-spacing:-.02em;margin-top:20px;`, title);
      const s = el('div', `font:400 24px/1.2 Inter;margin-top:10px;opacity:.8;`, sub);
      card.append(num, t, s);
      root.append(card);
      return {card, num, t, s};
    });

    // lockup: sits on the headline baseline, bracketed by the returning bar
    r.lockup = mask(`left:${M + 16}px;top:600px;height:200px;`,
      `font:200 136px/200px Inter;letter-spacing:-.04em;white-space:nowrap;`, 'seek(t) studio');
    root.append(r.lockup.outer);
  },

  seek(t) {
    // grid draws in
    // Hard edges animate geometry (width/height), never scale — see CLAUDE.md "raster rules".
    r.vlines.forEach((n, i) => { n.style.height = `${tween(t, stagger(i, T.grid, 0.04), 0.9, 0, H - 2 * M, ease.out)}px`; });
    r.hlines.forEach((n, i) => { n.style.width = `${tween(t, stagger(i, T.grid + 0.1, 0.08), 1.1, 0, W - 2 * M, ease.out)}px`; });

    // index labels: in with snap, out with the headline
    const outP = ease.in(progress(t, T.out, 0.5));
    r.index.forEach((m, i) => {
      const inP = springAt(t, stagger(i, T.index, 0.06), springs.snap);
      m.inner.style.transform = `translateY(${(1 - inP) * 110 - outP * 110}%)`;
    });

    // accent bar: heavy sweep in, retract from the right on out
    const barIn = springAt(t, T.bar, springs.heavy);
    const barOut = ease.in(progress(t, T.out, 0.35));
    // Geometry, not scaleX: a scaled edge antialiases differently depending on raster history.
    const full = W - 2 * M;
    const barBack = springAt(t, T.back, springs.settle);
    if (t < T.back) {
      r.bar.style.left = `${M + full * barOut}px`;
      r.bar.style.width = `${full * clamp(t < T.out ? barIn : 1 - barOut, 0, 1.2)}px`;
    } else {
      // bookend: the bar sweeps back in from the left and brackets the lockup
      r.bar.style.left = `${M}px`;
      r.bar.style.width = `${full * clamp(barBack, 0, 1.2)}px`;
    }

    // headline: each word waits for the bar to pass its column, then masks up
    r.words.forEach((m, i) => {
      const start = stagger(i, T.headline, 0.12);
      const inP = springAt(t, start, springs.snap);
      const wOut = ease.in(progress(t, stagger(i, T.out, 0.05), 0.45));
      m.inner.style.transform = `translateY(${(1 - inP) * 105 - wOut * 105}%)`;
      m.inner.style.color = mixColor(C.ink, C.accent, i === 2 ? ease.inOut(progress(t, T.focus, 0.3)) : 0);
    });

    // cards: settle up from below, drop out on exit
    r.cards.forEach((c, i) => {
      const inP = springAt(t, stagger(i, T.cards, 0.08), springs.settle);
      const cOut = ease.in(progress(t, stagger(i, T.out + 0.1, 0.05), 0.5));
      const y = (1 - inP) * 320 + cOut * 360;
      c.card.style.transform = `translateY(${y}px)`;
      const f = i === 2 ? springAt(t, T.focus, springs.snap) : 0;
      const fc = clamp(f);
      c.card.style.background = fc > 0 ? mixColor('#E4E1DB', C.accent, fc) : `${C.ink}0D`;
      c.card.style.color = mixColor(C.ink, C.paper, fc);
      c.s.style.opacity = String(0.8 + 0.2 * fc);
      c.card.style.transform += ` scale(${1 + 0.04 * Math.sin(Math.PI * clamp(f))})`;
    });

    // lockup
    const lk = springAt(t, T.lockup, springs.snap);
    r.lockup.inner.style.transform = `translateY(${(1 - lk) * 110}%)`;
  },
};
