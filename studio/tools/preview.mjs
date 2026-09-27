// preview.mjs — serve the studio for live preview in a browser.
// Usage: node tools/preview.mjs [--port 5173]
import fs from 'node:fs';
import path from 'node:path';
import {serve, STUDIO, arg} from './common.mjs';

const {port} = await serve(Number(arg('port', 5173)));
const scenes = fs.readdirSync(path.join(STUDIO, 'scenes')).filter((d) => fs.existsSync(path.join(STUDIO, 'scenes', d, 'index.html')));
console.log('Preview (Space = play/pause, ←/→ = step one frame, ?t=2.5 to open at a time, ?debug=1 for timecode):');
for (const s of scenes) console.log(`  http://127.0.0.1:${port}/scenes/${s}/index.html`);
