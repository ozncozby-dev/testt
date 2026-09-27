// render.mjs — frame-by-frame deterministic render: seek(t) → screenshot → ffmpeg → mp4.
//
// Usage: node tools/render.mjs <scene> [--draft] [--scale 2] [--from 0] [--to 6] [--out file.mp4] [--crf 16] [--debug]
//   --draft   half resolution, faster preset (for the critique loop)
//   --scale   device pixel ratio (2 = 4K from a 1080p scene)
//   --debug   burn in timecode + frame number
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {openScene, grab, ffmpegPath, arg, OUT} from './common.mjs';

const name = process.argv[2];
if (!name || name.startsWith('--')) {
  console.error('usage: node tools/render.mjs <scene> [--draft] [--scale n] [--from s] [--to s] [--out file] [--debug]');
  process.exit(1);
}
const draft = !!arg('draft', false);
const scale = Number(arg('scale', 1));
const debug = !!arg('debug', false);

const {page, meta, errors, close} = await openScene(name, {scale, debug});
const {fps, totalFrames, width, height} = meta;
const f0 = Math.round(Number(arg('from', 0)) * fps);
const f1 = Math.min(totalFrames, Math.round(Number(arg('to', meta.duration)) * fps));
const outFile = path.resolve(arg('out', path.join(OUT, `${name}${draft ? '-draft' : ''}.mp4`)));
fs.mkdirSync(path.dirname(outFile), {recursive: true});

const outW = Math.round(width * scale * (draft ? 0.5 : 1));
const outH = Math.round(height * scale * (draft ? 0.5 : 1));
const ff = spawn(ffmpegPath(), [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
  '-vf', `scale=${outW}:${outH}:flags=lanczos,format=yuv420p`,
  '-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'slow', '-crf', String(arg('crf', draft ? 23 : 16)),
  '-movflags', '+faststart', '-r', String(fps), outFile,
], {stdio: ['pipe', 'inherit', 'inherit']});
const ffDone = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));
ff.stdin.on('error', () => {}); // surfaced via ffDone

const started = Date.now();
for (let f = f0; f < f1; f++) {
  const png = await grab(page, f);
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (f % fps === 0 || f === f1 - 1) {
    process.stdout.write(`\r  frame ${f + 1 - f0}/${f1 - f0}  (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  }
}
ff.stdin.end();
await ffDone;
await close();
process.stdout.write('\n');
if (errors.length) console.warn(`⚠ page errors during render:\n  ${errors.join('\n  ')}`);
console.log(`✔ ${path.relative(process.cwd(), outFile)}  ${outW}×${outH} @ ${fps}fps, ${((f1 - f0) / fps).toFixed(2)}s`);
