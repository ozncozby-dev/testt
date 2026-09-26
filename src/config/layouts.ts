import type {PieceId} from '../components/cookware/pieces';

/**
 * Compositions, in 3840x2160 canvas pixels.
 *  - 'side'    : elevation view, base centre at (x, y)
 *  - 'upright' : a pan stood on its rim behind the set, drawn face-on (circle), centre at (x, y)
 *  - 'top'     : overhead flat-lay, vessel centre at (x, y)
 */
export interface Slot {
  piece: PieceId;
  view: 'side' | 'upright' | 'top';
  x: number;
  y: number;
  scale: number;
  /** Parallax depth: 1 = front, smaller = further away. */
  depth: number;
  handleSide?: 'left' | 'right';
  /** Handle direction for upright/top views, degrees. */
  angle?: number;
}

/** Camera elevation shared by every side-view shot (ry/rx of rims). */
export const SIDE_TILT = 0.16;

/** Primera 7-piece hero arrangement. */
export const HERO_7: Slot[] = [
  {piece: 'frypan24', view: 'upright', x: 1270, y: 1060, scale: 0.92, depth: 0.5, angle: -128},
  {piece: 'stockpot28', view: 'side', x: 1960, y: 1500, scale: 0.95, depth: 0.65},
  {piece: 'casserole24', view: 'side', x: 1200, y: 1770, scale: 1, depth: 1},
  {piece: 'saucepan18', view: 'side', x: 2480, y: 1790, scale: 0.95, depth: 1, handleSide: 'right'},
];

/** Primera 9-piece overhead flat-lay (Scene 04). */
export const TOP_SCALE = 0.62;
export const FLATLAY_9: Slot[] = [
  {piece: 'casserole24', view: 'top', x: 1760, y: 700, scale: TOP_SCALE, depth: 1, angle: 0},
  {piece: 'saucepan18', view: 'top', x: 1760, y: 1480, scale: TOP_SCALE, depth: 1, angle: 148},
  {piece: 'stockpot28', view: 'top', x: 2450, y: 1450, scale: TOP_SCALE, depth: 1, angle: 0},
  {piece: 'frypan28', view: 'top', x: 3140, y: 720, scale: TOP_SCALE, depth: 1, angle: -32},
  {piece: 'frypan24', view: 'top', x: 3150, y: 1500, scale: TOP_SCALE, depth: 1, angle: 36},
  {piece: 'saute26', view: 'top', x: 2440, y: 670, scale: TOP_SCALE, depth: 1, angle: -112},
];
export const FLATLAY_CENTER = {x: 2450, y: 1080};
