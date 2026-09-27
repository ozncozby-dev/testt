// stage.js — mounts a scene and exposes the seek(t) contract to the renderer.
//
// A scene module default-exports:
//   {
//     meta:  { title, width, height, fps, duration },   // duration in seconds
//     setup(root) { ... },   // build DOM once. No animation here.
//     seek(t)     { ... },   // set EVERY animated property from t (seconds). Pure.
//   }
//
// Modes (query string):
//   (none)      preview: scaled to fit, transport controls, real-time playback
//   ?render=1   renderer: native size, no chrome — driven by tools/render.mjs
//   ?t=2.5      open at a given time
//   ?debug=1    burn in timecode + frame number
//
// The wall clock is used ONLY by the preview transport below. Scene code never sees it.

export async function mount(scene) {
  const params = new URLSearchParams(location.search);
  const renderMode = params.has('render');
  const debug = params.has('debug');
  const {width, height, fps, duration} = scene.meta;

  document.documentElement.classList.add(renderMode ? 'is-render' : 'is-preview');
  document.title = scene.meta.title ?? 'scene';

  const viewport = document.createElement('div');
  viewport.className = 'viewport';
  const stage = document.createElement('div');
  stage.id = 'stage';
  stage.style.cssText = `width:${width}px;height:${height}px;position:relative;overflow:hidden;`;
  viewport.append(stage);
  document.body.append(viewport);

  scene.setup(stage);

  let burnIn = null;
  if (debug) {
    burnIn = document.createElement('div');
    burnIn.style.cssText =
      'position:absolute;right:24px;bottom:20px;font:500 22px/1 ui-monospace,monospace;color:#0f0;' +
      'background:rgba(0,0,0,.6);padding:6px 10px;z-index:9999;';
    stage.append(burnIn);
  }

  const totalFrames = Math.round(duration * fps);
  let current = 0;
  const seek = (t) => {
    current = Math.min(Math.max(t, 0), duration);
    scene.seek(current);
    if (burnIn) burnIn.textContent = `${current.toFixed(3)}s  f${String(Math.round(current * fps)).padStart(4, '0')}`;
  };

  await document.fonts.ready;
  seek(Number(params.get('t') ?? 0));

  window.__stage = {
    meta: {...scene.meta, totalFrames},
    seek,
    /** Frame-accurate seek used by the renderer. Resolves after layout + paint. */
    seekFrame: (f) =>
      new Promise((resolve) => {
        seek(f / fps);
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      }),
  };

  if (!renderMode) buildTransport({viewport, stage, seek, get: () => current, meta: scene.meta});
  window.__stageReady = true;
}

function buildTransport({viewport, stage, seek, get, meta}) {
  const {width, height, fps, duration} = meta;
  const fit = () => {
    const s = Math.min((innerWidth - 32) / width, (innerHeight - 96) / height);
    stage.style.transform = `scale(${s})`;
    stage.style.transformOrigin = 'top left';
    viewport.style.width = `${width * s}px`;
    viewport.style.height = `${height * s}px`;
  };
  addEventListener('resize', fit);
  fit();

  const bar = document.createElement('div');
  bar.className = 'transport';
  bar.innerHTML = `
    <button data-act="play" title="Space">▶</button>
    <input type="range" min="0" max="${duration}" step="${1 / fps}" value="0">
    <span class="tc">0.000s</span>`;
  document.body.append(bar);
  const btn = bar.querySelector('button');
  const range = bar.querySelector('input');
  const tc = bar.querySelector('.tc');

  let playing = false;
  let t0 = 0, wall0 = 0;
  const show = () => {
    range.value = get();
    tc.textContent = `${get().toFixed(3)}s · f${Math.round(get() * fps)}`;
  };
  const tick = (now) => {
    if (!playing) return;
    let t = t0 + (now - wall0) / 1000;
    if (t > duration) { t0 = 0; wall0 = now; t = 0; }
    seek(t);
    show();
    requestAnimationFrame(tick);
  };
  const toggle = () => {
    playing = !playing;
    btn.textContent = playing ? '❚❚' : '▶';
    if (playing) { t0 = get() >= duration ? 0 : get(); wall0 = performance.now(); requestAnimationFrame(tick); }
  };
  btn.onclick = toggle;
  range.oninput = () => { playing && toggle(); seek(Number(range.value)); show(); };
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); toggle(); }
    if (e.code === 'ArrowRight') { playing && toggle(); seek(get() + 1 / fps); show(); }
    if (e.code === 'ArrowLeft') { playing && toggle(); seek(get() - 1 / fps); show(); }
  });
  show();
}
