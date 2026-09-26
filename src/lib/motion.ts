import {Easing, interpolate} from 'remotion';

/** Cinematic curves. Camera moves use `cinematic`; arrivals use `arrive`. */
export const ease = {
  cinematic: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
  arrive: Easing.bezier(0.16, 1, 0.3, 1),
  settle: Easing.bezier(0.22, 1, 0.36, 1),
  depart: Easing.bezier(0.7, 0, 0.84, 0),
  linear: Easing.linear,
};

type EaseFn = (t: number) => number;

export const range = (frame: number, input: number[], output: number[], easing?: EaseFn) =>
  interpolate(frame, input, output, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** 0 -> 1 over [start, start + duration]. */
export const progress = (frame: number, start: number, duration: number, easing: EaseFn = ease.cinematic) =>
  range(frame, [start, start + duration], [0, 1], easing);

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Critically-damped-ish settle with a single, tiny overshoot — "mechanically precise",
 * never bouncy. Returns 0 -> 1 (peaking at ~1.012).
 */
export const precisionSettle = (frame: number, start: number, duration: number) => {
  const t = Math.min(Math.max((frame - start) / duration, 0), 1);
  if (t <= 0) return 0;
  const base = 1 - Math.pow(1 - t, 4);
  const overshoot = Math.sin(t * Math.PI) * Math.exp(-t * 3) * 0.035 * (t > 0.55 ? 1 : 0);
  return base + overshoot;
};

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Linear blend between two hex colours. */
export const mixColor = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(mix(x, y, t)).toString(16).padStart(2, '0');
  return `#${c(r1, r2)}${c(g1, g2)}${c(b1, b2)}`;
};

export const withAlpha = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
};
