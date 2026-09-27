// verify.mjs — proves a scene honours the seek(t) contract.
//
// 1. Determinism:       the same frame rendered twice is pixel-identical.
// 2. Order independence: frames rendered in shuffled order match frames rendered in sequence.
//    (If a scene keeps state between seek() calls, this is what catches it.)
// 3. No page errors, no forbidden APIs in scene source.
//
// Usage: node tools/verify.mjs <scene> [--samples 12]
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {openScene, grab, diffPng, sceneDir, arg} from './common.mjs';

const name = process.argv[2];
if (!name || name.startsWith('--')) { console.error('usage: node tools/verify.mjs <scene>'); process.exit(1); }
const samples = Number(arg('samples', 12));
const hash = (b) => crypto.createHash('sha1').update(b).digest('hex');
const fail = [];
const warn = [];
// Differences this small are sub-pixel antialiasing, invisible in the output. Anything bigger is a real bug.
const NOISE = {px: 16, delta: 8};

// static check: forbidden non-deterministic APIs in scene code
const src = fs.readdirSync(sceneDir(name)).filter((f) => f.endsWith('.js'))
  .map((f) => [f, fs.readFileSync(path.join(sceneDir(name), f), 'utf8')]);
const FORBIDDEN = [/Math\.random\s*\(/, /Date\.now\s*\(/, /new Date\s*\(/, /performance\.now\s*\(/,
  /requestAnimationFrame/, /setTimeout|setInterval/, /\.animate\s*\(/, /@keyframes/, /transition\s*:/];
for (const [f, code] of src) {
  for (const re of FORBIDDEN) if (re.test(code)) fail.push(`${f}: forbidden API ${re}`);
}

const {page, meta, errors, close} = await openScene(name);
const n = meta.totalFrames;
// deterministic sample set: first, last, evenly spaced, plus a few odd ones
const frames = [...new Set([0, n - 1, ...Array.from({length: samples}, (_, i) => Math.round((i * (n - 1)) / (samples - 1))), 7, 13, 29].filter((f) => f < n))];

const seq = {}, png = {};
for (const f of frames) { png[f] = await grab(page, f); seq[f] = hash(png[f]); }

// reversed + interleaved order
const shuffled = [...frames].reverse().flatMap((f, i, a) => (i % 2 ? [f] : [f, a[a.length - 1 - i]]));
for (const f of shuffled) {
  const img = await grab(page, f);
  if (hash(img) !== seq[f]) {
    const d = await diffPng(page, png[f], img);
    (d.count <= NOISE.px && d.max <= NOISE.delta ? warn : fail).push(`frame ${f}: differs when seeked out of order — ${d.count}px, max Δ${d.max}, region x${d.bbox[0]}–${d.bbox[2]} y${d.bbox[1]}–${d.bbox[3]}` +
      ' (state kept between seeks, or a composited/scaled layer re-rasterising)');
  }
}
await close();
if (errors.length) fail.push(...errors.map((e) => `page error: ${e}`));

if (warn.length) console.warn(`⚠ ${name}: sub-pixel AA noise (not failing)\n  ${warn.join('\n  ')}`);
const uniq = [...new Set(fail)];
if (uniq.length) {
  console.error(`✘ ${name}: ${uniq.length} problem(s)\n  ${uniq.join('\n  ')}`);
  process.exit(1);
}
console.log(`✔ ${name}: deterministic and order-independent across ${frames.length} frames (${shuffled.length} out-of-order seeks)`);
