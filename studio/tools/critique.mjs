// critique.mjs — "look at your own frames". Renders key stills + a labelled contact sheet
// into critique/<scene>/round-N/ and scaffolds critique.md from the rubric.
// Claude then OPENS sheet.png (and individual stills), fills in critique.md, fixes the scene,
// and runs this again for the next round.
//
// Usage: node tools/critique.mjs <scene> [--every 0.5] [--at 0.8,1.2,3.9]
import fs from 'node:fs';
import path from 'node:path';
import {openScene, grab, arg, STUDIO} from './common.mjs';

const name = process.argv[2];
if (!name || name.startsWith('--')) { console.error('usage: node tools/critique.mjs <scene> [--every s] [--at t1,t2]'); process.exit(1); }

const base = path.join(STUDIO, 'critique', name);
fs.mkdirSync(base, {recursive: true});
const round = fs.readdirSync(base).filter((d) => /^round-\d+$/.test(d)).length + 1;
const dir = path.join(base, `round-${round}`);
fs.mkdirSync(dir, {recursive: true});

const {page, meta, close, errors} = await openScene(name);
const {fps, duration, totalFrames} = meta;
const at = arg('at', null);
const every = Number(arg('every', 0.5));
const times = at
  ? String(at).split(',').map(Number)
  : Array.from({length: Math.floor(duration / every) + 1}, (_, i) => +(i * every).toFixed(3));
const frames = [...new Set(times.map((t) => Math.min(totalFrames - 1, Math.round(t * fps))))];

const stills = [];
for (const f of frames) {
  const png = await grab(page, f);
  const file = `f${String(f).padStart(4, '0')}.png`;
  fs.writeFileSync(path.join(dir, file), png);
  stills.push({f, t: f / fps, file, b64: png.toString('base64')});
}

// contact sheet: 4 columns, 25%-ish thumbnails — also the "does it read on a phone" test
const cols = 4, thumbW = 480, thumbH = Math.round((thumbW * meta.height) / meta.width);
const html = `<body style="margin:0;background:#181818;font:500 14px ui-monospace,monospace;color:#bbb">
  <div style="display:grid;grid-template-columns:repeat(${cols},${thumbW}px);gap:12px;padding:12px">
  ${stills.map((s) => `<figure style="margin:0"><img src="data:image/png;base64,${s.b64}" style="width:${thumbW}px;height:${thumbH}px;display:block">
    <figcaption style="padding:4px 0">${s.t.toFixed(2)}s · f${s.f}</figcaption></figure>`).join('')}
  </div></body>`;
await page.setViewportSize({width: cols * thumbW + (cols + 1) * 12, height: 400});
await page.setContent(html);
await page.screenshot({path: path.join(dir, 'sheet.png'), fullPage: true});
await close();

const rubric = fs.readFileSync(path.join(STUDIO, 'critique', '_rubric.md'), 'utf8');
fs.writeFileSync(path.join(dir, 'critique.md'), `# ${name} — critique round ${round}

Contact sheet: \`sheet.png\` · stills: ${stills.map((s) => `\`${s.file}\` (${s.t.toFixed(2)}s)`).join(', ')}
${errors.length ? `\n⚠ Page errors: ${errors.join('; ')}\n` : ''}
${rubric}`);

console.log(`✔ round ${round}: ${stills.length} stills + sheet → ${path.relative(process.cwd(), dir)}/`);
console.log(`  next: open sheet.png, fill in critique.md, fix, re-run.`);
