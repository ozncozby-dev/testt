// Generates a TEMP score + sound design (public/audio/primera-temp.wav) synchronised to
// the film's timeline. It is a placeholder to judge rhythm and timing — replace it with
// a licensed or commissioned track at public/audio/soundtrack.wav for delivery.
//
// Usage: node scripts/generate-soundtrack.mjs [--print]
import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';

const bundled = await build({
  entryPoints: [path.resolve('src/config/soundCues.ts')],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'neutral',
});
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const cues = mod.buildCues();
const DURATION = mod.FILM_SECONDS;

if (process.argv.includes('--print')) {
  for (const c of cues) console.log(`${c.t.toFixed(2).padStart(6)}s  ${c.kind.padEnd(8)} ${c.note}`);
}

const SR = 48000;
const N = Math.ceil(DURATION * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const sendL = new Float32Array(N); // reverb send
const sendR = new Float32Array(N);
const TAU = Math.PI * 2;

// Deterministic noise
let seed = 1234567;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296 * 2 - 1;
};

const put = (i, v, pan = 0, send = 0) => {
  if (i < 0 || i >= N) return;
  const gl = Math.cos((pan + 1) * Math.PI / 4);
  const gr = Math.sin((pan + 1) * Math.PI / 4);
  L[i] += v * gl;
  R[i] += v * gr;
  sendL[i] += v * gl * send;
  sendR[i] += v * gr * send;
};

const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// ------------------------------------------------------------ music bed
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
// D major world: Dadd9 -> Bm(add11) -> Gmaj9 -> Dadd9
const chords = [
  {t: 0, notes: [38, 45, 52, 57, 64]},
  {t: 14.5, notes: [35, 47, 54, 57, 64]},
  {t: 25.5, notes: [31, 43, 50, 54, 57, 62]},
  {t: 30.8, notes: [38, 45, 50, 54, 57, 64, 69]},
];
const padLevel = (t) => {
  const build = 0.22 + 0.5 * smooth(t / 30);
  const intro = smooth(t / 3.5);
  const outro = 1 - smooth((t - (DURATION - 2.2)) / 2.2);
  return build * intro * outro;
};
for (let ci = 0; ci < chords.length; ci++) {
  const c = chords[ci];
  const start = c.t;
  const end = ci + 1 < chords.length ? chords[ci + 1].t : DURATION;
  const xf = 1.6;
  const i0 = Math.max(0, Math.floor((start - xf) * SR));
  const i1 = Math.min(N, Math.ceil((end + xf) * SR));
  c.notes.forEach((n, vi) => {
    const f = midi(n);
    const phase0 = vi * 1.3;
    const g = (n < 40 ? 0.5 : 0.22) / Math.sqrt(c.notes.length);
    const pan = ((vi % 2) * 2 - 1) * 0.25 * (vi / c.notes.length);
    for (let i = i0; i < i1; i++) {
      const t = i / SR;
      const fadeIn = ci === 0 ? 1 : smooth((t - (start - xf)) / (2 * xf));
      const fadeOut = ci + 1 < chords.length ? 1 - smooth((t - (end - xf)) / (2 * xf)) : 1;
      const lfo = 1 + 0.15 * Math.sin(TAU * 0.07 * t + vi);
      const v =
        Math.sin(TAU * f * t + phase0) +
        0.6 * Math.sin(TAU * f * 1.0035 * t + phase0 * 2) +
        0.18 * Math.sin(TAU * f * 2 * t);
      put(i, v * g * lfo * fadeIn * fadeOut * padLevel(t) * 0.5, pan, 0.35);
    }
  });
}

// Soft pulse — a heartbeat-slow low tone that enters with colour and leaves before the logo
const BPM = 84;
const beat = 60 / BPM;
for (let t0 = 9.0; t0 < 29.6; t0 += beat) {
  const barPos = Math.round((t0 - 9) / beat) % 4;
  const g = (barPos === 0 ? 0.3 : 0.18) * smooth((t0 - 9) / 3) * (1 - smooth((t0 - 27.5) / 2));
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < SR * 0.5; k++) {
    const t = k / SR;
    const f = 62 * (1 + 0.5 * Math.exp(-t * 30));
    put(i0 + k, Math.sin(TAU * f * t) * Math.exp(-t * 7) * g, 0, 0.05);
  }
}
// Pluck motif (pentatonic, very quiet) over the product scenes
const motif = [74, 81, 78, 76, 74, 69, 71, 76];
let mi = 0;
for (let t0 = 9.0; t0 < 29.0; t0 += beat / 2) {
  if (Math.round((t0 - 9) / (beat / 2)) % 3 === 2) continue;
  const n = motif[mi++ % motif.length] - (t0 > 14.5 && t0 < 25.5 ? 2 : 0);
  const f = midi(n);
  const g = 0.045 * smooth((t0 - 9) / 4) * (1 - smooth((t0 - 27) / 2));
  const pan = mi % 2 ? -0.35 : 0.35;
  const i0 = Math.floor(t0 * SR);
  for (let k = 0; k < SR * 0.9; k++) {
    const t = k / SR;
    const v = (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t)) * Math.exp(-t * 5.5) * Math.min(1, t * 400);
    put(i0 + k, v * g, pan, 0.6);
  }
}

// ------------------------------------------------------------ sound design
const svf = () => {
  let lp = 0, bp = 0;
  return (x, fc, q) => {
    const f = 2 * Math.sin(Math.PI * Math.min(fc, SR / 6) / SR);
    const hp = x - lp - q * bp;
    bp += f * hp;
    lp += f * bp;
    return bp;
  };
};

const fx = {
  shimmer(c) {
    const dur = c.dur ?? 2;
    const partials = [1, 1.5, 2.01, 2.76, 3.93, 5.4];
    const base = 1480;
    const filt = svf();
    for (let k = 0; k < dur * SR; k++) {
      const t = k / SR;
      const p = t / dur;
      const env = Math.sin(Math.PI * Math.min(1, p)) ** 1.5;
      let v = 0;
      partials.forEach((m, j) => (v += Math.sin(TAU * base * m * t + j) * (0.5 / (j + 1))));
      const air = filt(rnd(), 5000 + 3000 * p, 0.3) * 0.8;
      const pan = (c.pan ?? 0) + p * 1.0;
      put(Math.floor(c.t * SR) + k, (v * 0.06 + air * 0.12) * env * (c.gain ?? 1), Math.max(-1, Math.min(1, pan)), 0.7);
    }
  },
  whoosh(c) {
    const dur = c.dur ?? 1;
    const filt = svf();
    for (let k = 0; k < dur * SR; k++) {
      const t = k / SR;
      const p = t / dur;
      const env = Math.sin(Math.PI * p) ** 2;
      const fc = 250 + 1800 * Math.sin(Math.PI * p);
      const v = filt(rnd(), fc, 0.5) * env * 0.5 * (c.gain ?? 1);
      put(Math.floor(c.t * SR) + k, v, -0.6 + 1.2 * p, 0.3);
    }
  },
  place(c) {
    for (let k = 0; k < SR * 0.8; k++) {
      const t = k / SR;
      const f = 70 + 60 * Math.exp(-t * 25);
      const body = Math.sin(TAU * f * t) * Math.exp(-t * 16) * 0.55;
      const ring = (Math.sin(TAU * 2140 * t) + 0.6 * Math.sin(TAU * 3310 * t) + 0.4 * Math.sin(TAU * 4720 * t)) * Math.exp(-t * 7) * 0.035;
      const tick = k < SR * 0.004 ? rnd() * 0.25 * (1 - k / (SR * 0.004)) : 0;
      put(Math.floor(c.t * SR) + k, (body + ring + tick) * (c.gain ?? 1), c.pan ?? 0, 0.35);
    }
  },
  click(c) {
    const filt = svf();
    for (let k = 0; k < SR * 0.25; k++) {
      const t = k / SR;
      const n = filt(rnd(), 4200, 0.2) * Math.exp(-t * 400) * 0.5;
      const tone = (Math.sin(TAU * 2900 * t) * 0.5 + Math.sin(TAU * 1250 * t) * 0.35) * Math.exp(-t * 60);
      const thump = Math.sin(TAU * 95 * t) * Math.exp(-t * 35) * 0.35;
      put(Math.floor(c.t * SR) + k, (n + tone * 0.35 + thump) * (c.gain ?? 1) * 0.6, c.pan ?? 0, 0.25);
    }
  },
  tick(c) {
    fx.whoosh({t: c.t - 0.2, dur: 0.45, gain: 0.35});
    fx.click({t: c.t, gain: (c.gain ?? 1) * 0.6, pan: 0});
  },
  swell(c) {
    const dur = c.dur ?? 4;
    const filt = svf();
    for (let k = 0; k < dur * SR; k++) {
      const t = k / SR;
      const p = t / dur;
      const env = smooth(p / 0.3) * (1 - smooth((p - 0.5) / 0.5));
      const v = (Math.sin(TAU * midi(55) * t) + Math.sin(TAU * midi(62) * t) * 0.7 + filt(rnd(), 900, 0.6) * 0.4) * env;
      put(Math.floor(c.t * SR) + k, v * 0.07 * (c.gain ?? 1), 0, 0.6);
    }
  },
  rise(c) {
    const dur = c.dur ?? 1.5;
    const filt = svf();
    let ph = 0;
    for (let k = 0; k < dur * SR; k++) {
      const t = k / SR;
      const p = t / dur;
      const f = 220 * Math.pow(4, p);
      ph += TAU * f / SR;
      const env = p * p;
      const v = (Math.sin(ph) * 0.4 + filt(rnd(), 800 + 5000 * p, 0.4) * 0.6) * env;
      put(Math.floor(c.t * SR) + k, v * 0.16 * (c.gain ?? 1), 0, 0.5);
    }
  },
  chime(c) {
    const dur = c.dur ?? 3;
    const notes = [midi(74), midi(81), midi(62)];
    const partials = [1, 2, 2.76, 5.4];
    for (let k = 0; k < dur * SR; k++) {
      const t = k / SR;
      let v = 0;
      notes.forEach((f, ni) => partials.forEach((m, j) => (v += Math.sin(TAU * f * m * t + ni) * Math.exp(-t * (1.2 + j * 1.6)) / ((j + 1) * (ni + 1)))));
      const sub = Math.sin(TAU * midi(38) * t) * Math.exp(-t * 1.1) * 0.6;
      put(Math.floor(c.t * SR) + k, (v * 0.09 + sub * 0.12) * (c.gain ?? 1) * Math.min(1, t * 300), 0, 0.8);
    }
  },
};

for (const c of cues) fx[c.kind](c);

// ------------------------------------------------------------ reverb (Schroeder)
const reverb = (input, offset) => {
  const out = new Float32Array(N);
  const combs = [1557, 1617, 1491, 1422].map((d) => ({d: d + offset, buf: new Float32Array(d + offset), i: 0, fb: 0.84, lp: 0}));
  const aps = [225, 556].map((d) => ({d, buf: new Float32Array(d), i: 0}));
  for (let n = 0; n < N; n++) {
    let s = 0;
    for (const c of combs) {
      const y = c.buf[c.i];
      c.lp = y * 0.7 + c.lp * 0.3;
      c.buf[c.i] = input[n] + c.lp * c.fb;
      c.i = (c.i + 1) % c.d;
      s += y;
    }
    s *= 0.25;
    for (const a of aps) {
      const b = a.buf[a.i];
      const y = -s + b;
      a.buf[a.i] = s + b * 0.5;
      a.i = (a.i + 1) % a.d;
      s = y;
    }
    out[n] = s;
  }
  return out;
};
const wetL = reverb(sendL, 0);
const wetR = reverb(sendR, 23);

// ------------------------------------------------------------ master
let peak = 0;
for (let n = 0; n < N; n++) {
  L[n] = Math.tanh((L[n] + wetL[n] * 0.9) * 1.2);
  R[n] = Math.tanh((R[n] + wetR[n] * 0.9) * 1.2);
  peak = Math.max(peak, Math.abs(L[n]), Math.abs(R[n]));
}
const norm = 0.85 / (peak || 1);
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write('data', 36);
buf.writeUInt32LE(N * 4, 40);
for (let n = 0; n < N; n++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[n] * norm)) * 32767), 44 + n * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[n] * norm)) * 32767), 46 + n * 4);
}
const out = path.resolve('public/audio/primera-temp.wav');
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, buf);
console.log(`wrote ${out} (${DURATION.toFixed(2)}s, ${cues.length} cues, peak ${peak.toFixed(2)})`);
