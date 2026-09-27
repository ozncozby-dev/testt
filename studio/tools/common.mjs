// Shared helpers for the studio CLI tools: static server, browser, ffmpeg resolution.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {chromium} from 'playwright';

export const STUDIO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const OUT = path.join(STUDIO, 'out');

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.wav': 'audio/wav',
};

/** Static server rooted at studio/ (ES modules don't load over file://). Binds to localhost only. */
export function serve(port = 0) {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const file = path.normalize(path.join(STUDIO, decodeURIComponent(url.pathname)));
    if (file !== STUDIO && !file.startsWith(STUDIO + path.sep)) { res.writeHead(403).end(); return; }
    fs.stat(file, (err, st) => {
      if (err || !st.isFile()) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, {'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store'});
      fs.createReadStream(file).pipe(res);
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve({server, port: server.address().port})));
}

export function sceneDir(name) {
  const dir = path.join(STUDIO, 'scenes', name);
  if (!fs.existsSync(path.join(dir, 'index.html'))) {
    const all = fs.readdirSync(path.join(STUDIO, 'scenes')).filter((d) => !d.startsWith('_'));
    throw new Error(`Scene "${name}" not found. Available: ${all.join(', ')}`);
  }
  return dir;
}

/** Launch Chromium and open a scene in render mode. Returns {browser, page, meta, close}. */
export async function openScene(name, {scale = 1, debug = false} = {}) {
  sceneDir(name);
  const {server, port} = await serve();
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--font-render-hinting=none', '--disable-lcd-text', '--force-color-profile=srgb'],
  });
  const page = await browser.newPage({deviceScaleFactor: scale});
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(`http://127.0.0.1:${port}/scenes/${name}/index.html?render=1${debug ? '&debug=1' : ''}`);
  try {
    await page.waitForFunction(() => window.__stageReady === true, null, {timeout: 15000});
  } catch {
    throw new Error(`Scene failed to mount.\n${errors.join('\n')}`);
  }
  const meta = await page.evaluate(() => window.__stage.meta);
  await page.setViewportSize({width: meta.width, height: meta.height});
  const close = async () => { await browser.close(); server.close(); };
  return {browser, page, meta, errors, close};
}

/** Seek to a frame and return a PNG buffer of the stage. */
export async function grab(page, frame) {
  await page.evaluate((f) => window.__stage.seekFrame(f), frame);
  return page.locator('#stage').screenshot({type: 'png', animations: 'disabled'});
}

/** Pixel diff of two PNG buffers (decoded in the page). Returns {bbox:[x0,y0,x1,y1]|null, max, count}. */
export async function diffPng(page, a, b) {
  return page.evaluate(async ([A, B]) => {
    const load = async (b64) => createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const [ia, ib] = await Promise.all([load(A), load(B)]);
    const px = (img) => {
      const c = new OffscreenCanvas(img.width, img.height);
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      return g.getImageData(0, 0, img.width, img.height).data;
    };
    const da = px(ia), db = px(ib), w = ia.width;
    let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1, max = 0, count = 0;
    for (let i = 0; i < da.length; i += 4) {
      const d = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2]));
      if (!d) continue;
      count++;
      max = Math.max(max, d);
      const p = i / 4, x = p % w, y = (p - x) / w;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    return {bbox: count ? [x0, y0, x1, y1] : null, max, count};
  }, [a.toString('base64'), b.toString('base64')]);
}

/** Resolve an ffmpeg with libx264: $FFMPEG_PATH → @ffmpeg-installer/ffmpeg → system ffmpeg. */
export function ffmpegPath() {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  try {
    return createRequire(import.meta.url)('@ffmpeg-installer/ffmpeg').path;
  } catch {
    return 'ffmpeg';
  }
}

export function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : v;
}
