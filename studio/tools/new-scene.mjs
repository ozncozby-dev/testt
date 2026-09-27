// new-scene.mjs — scaffold scenes/<name>/ with index.html, scene.js and a brief to fill in.
// Usage: node tools/new-scene.mjs <name> [--w 1920] [--h 1080] [--fps 30] [--dur 6]
import fs from 'node:fs';
import path from 'node:path';
import {STUDIO, arg} from './common.mjs';

const name = process.argv[2];
if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error('usage: node tools/new-scene.mjs <kebab-name> [--w 1920] [--h 1080] [--fps 30] [--dur 6]');
  process.exit(1);
}
const dir = path.join(STUDIO, 'scenes', name);
if (fs.existsSync(dir)) { console.error(`scenes/${name} already exists`); process.exit(1); }
const [w, h, fps, dur] = [arg('w', 1920), arg('h', 1080), arg('fps', 30), arg('dur', 6)].map(Number);

fs.mkdirSync(dir, {recursive: true});
fs.mkdirSync(path.join(STUDIO, 'references', name), {recursive: true});
fs.writeFileSync(path.join(dir, 'index.html'),
  fs.readFileSync(path.join(STUDIO, 'scenes', 'test-card', 'index.html'), 'utf8').replace('<title>test-card</title>', `<title>${name}</title>`));
fs.writeFileSync(path.join(dir, 'brief.md'),
  fs.readFileSync(path.join(STUDIO, 'briefs', '_template.md'), 'utf8').replace('<scene-name>', name)
    .replace('| Resolution | 1920×1080 |', `| Resolution | ${w}×${h} |`).replace('| FPS | 30 |', `| FPS | ${fps} |`)
    .replace('| Duration | 6.0 s |', `| Duration | ${dur} s |`));
fs.writeFileSync(path.join(dir, 'scene.js'), `// ${name} — implements brief.md. Every animated property is set in seek(t).
import {springAt, springs, tween, ease, progress, stagger} from '../../lib/motion.js';

// Beat sheet (seconds) — keep in sync with brief.md §6.
const T = {intro: 0};
const r = {};

export default {
  meta: {title: '${name}', width: ${w}, height: ${h}, fps: ${fps}, duration: ${dur}},

  setup(root) {
    root.style.background = '#F2EFE9';
    // Build the DOM once here. No animation, no timers.
  },

  seek(t) {
    // Set every animated property as a pure function of t.
  },
};
`);
console.log(`✔ scenes/${name}/ created (index.html, scene.js, brief.md) + references/${name}/`);
console.log('  next: fill in brief.md and drop references, THEN build the scene.');
