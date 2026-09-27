// motion.js — pure, time-addressable motion primitives.
//
// Every function here is a pure function of its inputs. Nothing reads the clock,
// nothing keeps state between calls. That is what makes seek(t) possible: any frame
// can be computed directly, in any order, and always produces the same pixels.
//
// Time is always in SECONDS. Frames are a render concern, not a motion concern.

// ---------------------------------------------------------------- basics

export const clamp = (x, lo = 0, hi = 1) => (x < lo ? lo : x > hi ? hi : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => (a === b ? 0 : (x - a) / (b - a));
export const mapRange = (x, a0, a1, b0, b1, ease = linear) =>
  lerp(b0, b1, ease(clamp(invLerp(a0, a1, x))));

/** 0 → 1 progress over [start, start + duration], clamped. */
export const progress = (t, start, duration) => clamp((t - start) / duration);

// ---------------------------------------------------------------- easing

export const linear = (x) => x;

/** CSS-style cubic-bezier(x1, y1, x2, y2). Solves x(u) = t with Newton + bisection. */
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u) => ((ax * u + bx) * u + cx) * u;
  const sy = (u) => ((ay * u + by) * u + cy) * u;
  const dx = (u) => (3 * ax * u + 2 * bx) * u + cx;
  const solve = (x) => {
    let u = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(u) - x;
      if (Math.abs(e) < 1e-7) return u;
      const d = dx(u);
      if (Math.abs(d) < 1e-6) break;
      u -= e / d;
    }
    let lo = 0, hi = 1;
    u = x;
    for (let i = 0; i < 40; i++) {
      const e = sx(u) - x;
      if (Math.abs(e) < 1e-7) break;
      if (e > 0) hi = u; else lo = u;
      u = (lo + hi) / 2;
    }
    return u;
  };
  return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)));
}

/** House curves. Pick by intent, not by look. */
export const ease = {
  linear,
  /** Things entering and coming to rest. */
  out: cubicBezier(0.16, 1, 0.3, 1),
  /** Things leaving. */
  in: cubicBezier(0.7, 0, 0.84, 0),
  /** Camera moves and big position changes that start and end at rest. */
  inOut: cubicBezier(0.65, 0, 0.35, 1),
  /** Gentle UI-style settle. */
  settle: cubicBezier(0.22, 1, 0.36, 1),
};

/** Eased value between `from` and `to` over [start, start + duration]. */
export const tween = (t, start, duration, from, to, easing = ease.inOut) =>
  lerp(from, to, easing(progress(t, start, duration)));

// ---------------------------------------------------------------- closed-form springs
//
// A damped harmonic oscillator  m·x'' + c·x' + k·x = 0  has an exact analytic solution.
// We evaluate it directly at time t instead of integrating frame by frame, so a spring
// is a pure function of time — seekable, deterministic, frame-rate independent.

/**
 * Physical spring. Returns f(tSeconds) → value, going from `from` to `to`.
 *   stiffness k, damping c, mass m, velocity v0 (units of the from→to distance per second).
 */
export function spring({stiffness = 170, damping = 26, mass = 1, velocity = 0, from = 0, to = 1} = {}) {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const e0 = -1; // normalised displacement from rest at t = 0
  const v0 = velocity;
  let disp;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const A = e0;
    const B = (v0 + zeta * w0 * e0) / wd;
    disp = (t) => Math.exp(-zeta * w0 * t) * (A * Math.cos(wd * t) + B * Math.sin(wd * t));
  } else if (zeta === 1) {
    disp = (t) => Math.exp(-w0 * t) * (e0 + (v0 + w0 * e0) * t);
  } else {
    const s = Math.sqrt(zeta * zeta - 1);
    const r1 = -w0 * (zeta - s);
    const r2 = -w0 * (zeta + s);
    const C2 = (v0 - r1 * e0) / (r2 - r1);
    const C1 = e0 - C2;
    disp = (t) => C1 * Math.exp(r1 * t) + C2 * Math.exp(r2 * t);
  }
  const f = (t) => (t <= 0 ? from : lerp(from, to, 1 + disp(t)));
  f.zeta = zeta;
  f.omega = w0;
  /** Seconds after which |displacement| (as a fraction of from→to) stays below eps. */
  f.settleTime = (eps = 0.001, horizon = 30) => {
    let last = 0;
    for (let t = 0; t <= horizon; t += 0.001) if (Math.abs(disp(t)) > eps) last = t;
    return last + 0.001;
  };
  return f;
}

/**
 * Designer-friendly spring: `duration` is the perceptual period (seconds), `bounce`
 * is 0 (critically damped, no overshoot) … 0.5 (lively). Negative = overdamped.
 */
export function springByFeel({duration = 0.5, bounce = 0, velocity = 0, from = 0, to = 1} = {}) {
  const stiffness = Math.pow((2 * Math.PI) / duration, 2);
  const zeta = 1 - bounce;
  const damping = 2 * zeta * Math.sqrt(stiffness);
  return spring({stiffness, damping, mass: 1, velocity, from, to});
}

/** Named house springs. Scenes should use these, not ad-hoc numbers. */
export const springs = {
  /** Precise, no overshoot. Default for UI and type. */
  snap: {duration: 0.45, bounce: 0},
  /** One small overshoot. Arrivals that should feel physical. */
  settle: {duration: 0.6, bounce: 0.15},
  /** Visible bounce. Use sparingly — one per scene at most. */
  pop: {duration: 0.5, bounce: 0.35},
  /** Slow, heavy. Large objects and camera. */
  heavy: {duration: 1.1, bounce: 0.05},
};

/** Spring value at time t for a spring that starts at `start`. */
export const springAt = (t, start, preset = springs.snap, from = 0, to = 1) =>
  springByFeel({...preset, from, to})(t - start);

// ---------------------------------------------------------------- keyframe tracks

/**
 * Keyframe track: [[time, value, easeIntoThisKey?], ...] sorted by time.
 * Holds the first/last value outside the range.
 */
export function track(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e = ease.inOut] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        return lerp(v0, v1, e(invLerp(t0, t1, t)));
      }
    }
    return keys[keys.length - 1][1];
  };
}

/** Start time of item i in a stagger that begins at `start`. */
export const stagger = (i, start, each = 0.06) => start + i * each;

// ---------------------------------------------------------------- deterministic randomness

/** Seeded PRNG (mulberry32). Use instead of Math.random — always. */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 1-D value noise, pure function of (x, seed). Range ≈ [-1, 1]. */
export function noise1(x, seed = 0) {
  const hash = (n) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u);
}

// ---------------------------------------------------------------- color

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const mixColor = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`;
};

export const withAlpha = (hex, alpha) => `rgba(${hexToRgb(hex).join(',')},${alpha})`;
