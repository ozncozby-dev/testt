/**
 * Choreography constants shared by the scenes (visuals) and the soundtrack generator
 * (audio sync). Pure TS — no React/Remotion imports. All frames are scene-local.
 */
import type {PieceId} from '../components/cookware/pieces';
import {FLATLAY_9, FLATLAY_CENTER} from './layouts';

export interface Entry {
  start: number;
  duration: number;
  from: {dx?: number; dy?: number; ds?: number; rot?: number};
  motion?: 'glide' | 'precision';
  lidAt?: number;
  lidDuration?: number;
}

// Scene 02 — pieces arrive from different depths, lids seat last.
export const ASSEMBLY_7: Partial<Record<PieceId, Entry>> = {
  stockpot28: {start: -12, duration: 74, from: {ds: 0.4, dy: 140, rot: -2}, lidAt: 96, lidDuration: 30},
  frypan24: {start: -4, duration: 72, from: {ds: -0.35, dx: -380, dy: -160, rot: 10}},
  casserole24: {start: 6, duration: 70, from: {ds: -0.3, dx: -640, dy: -60, rot: 2}, lidAt: 88, lidDuration: 30},
  saucepan18: {start: 16, duration: 70, from: {ds: 0.3, dx: 700, dy: 60, rot: -2}, lidAt: 104, lidDuration: 30},
};
/** Fraction of the lid move at which it visibly seats (sound sync). */
export const LID_SEAT_AT = 0.62;

// Scene 03 — colour steps (frame at which the light band starts carrying the finish).
export const COLOR_STEPS = [
  {finish: 'sage', at: -99},
  {finish: 'granite', at: 38},
  {finish: 'ivory', at: 98},
] as const;
export const COLOR_SWEEP_FRAMES = 28;

// Scene 04 — sequential lock-in, then lids drop.
export const LOCK_DURATION = 30;
export const LOCK_TIMES: Partial<Record<PieceId, number>> = {casserole24: 4, saucepan18: 14, stockpot28: 24, frypan28: 34, frypan24: 44, saute26: 54};
export const LID_TIMES: Partial<Record<PieceId, number>> = {casserole24: 70, saucepan18: 78, stockpot28: 86};

const arrival = (piece: PieceId): Entry => {
  const slot = FLATLAY_9.find((s) => s.piece === piece)!;
  const vx = slot.x - FLATLAY_CENTER.x;
  const vy = slot.y - FLATLAY_CENTER.y;
  const len = Math.hypot(vx, vy) || 1;
  return {
    start: LOCK_TIMES[piece]!,
    duration: LOCK_DURATION,
    motion: 'precision',
    from: {dx: (vx / len) * 1500, dy: (vy / len) * 1500, rot: 24},
    lidAt: LID_TIMES[piece],
    lidDuration: 22,
  };
};
export const FLATLAY_ENTRIES: Partial<Record<PieceId, Entry>> = Object.fromEntries(
  (Object.keys(LOCK_TIMES) as PieceId[]).map((p) => [p, arrival(p)]),
);

// Scene 05 — macro shots and the geometric links between them (frames).
export const MACRO_SHOTS = [50, 46, 46, 60];
export const MACRO_LINKS = [10, 10, 12];

// Scene 07 — brand signature beats.
export const LOGO_AT = 26;
