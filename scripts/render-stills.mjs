// Renders review stills (default: key frames of every scene) at reduced scale.
// Usage: node scripts/render-stills.mjs [frame ...] [--scale=0.25]
import path from 'node:path';
import fs from 'node:fs';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const args = process.argv.slice(2);
const scaleArg = args.find((a) => a.startsWith('--scale='));
const scale = scaleArg ? Number(scaleArg.split('=')[1]) : 0.25;
const frames = args.filter((a) => !a.startsWith('--')).map(Number);
const defaults = [20, 60, 88, 120, 200, 262, 300, 340, 420, 470, 540, 600, 640, 660, 700, 745, 790, 840, 900, 940, 990, 1030];
const list = frames.length ? frames : defaults;

const outDir = path.resolve('out/stills');
fs.mkdirSync(outDir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || null;
const composition = await selectComposition({serveUrl, id: 'LuxuryPrimeFilm', browserExecutable});
for (const frame of list) {
  const output = path.join(outDir, `f${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, frame, output, scale, browserExecutable});
  console.log('rendered', output);
}
