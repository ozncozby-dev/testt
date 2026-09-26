/**
 * Piece catalogue and set contents.
 *
 * PLACEHOLDER CONTENTS — confirm against the real Primera SKU sheets. Each lid counts
 * as a piece (industry convention), so:
 *   7 pc = frypan 24 + saucepan 18 (+lid) + casserole 24 (+lid) + stockpot 28 (+lid)
 *   9 pc = 7 pc + frypan 28 + sauté 26
 */

export type PieceId = 'stockpot28' | 'casserole24' | 'saucepan18' | 'frypan24' | 'frypan28' | 'saute26';

export interface PieceSpec {
  id: PieceId;
  /** Rim diameter in canvas px at scale 1. */
  width: number;
  /** Body height in canvas px at scale 1. */
  height: number;
  /** Bottom radius as a fraction of rim radius (flare). */
  taper: number;
  handle: 'loops' | 'long';
  /** Long-handle length as a fraction of rim diameter. */
  handleLength?: number;
  lid: boolean;
  /** Lid dome height as a fraction of lid radius. */
  lidDome?: number;
}

export const PIECES: Record<PieceId, PieceSpec> = {
  stockpot28: {id: 'stockpot28', width: 880, height: 560, taper: 0.97, handle: 'loops', lid: true, lidDome: 0.27},
  casserole24: {id: 'casserole24', width: 800, height: 360, taper: 0.96, handle: 'loops', lid: true, lidDome: 0.27},
  saucepan18: {id: 'saucepan18', width: 600, height: 360, taper: 0.96, handle: 'long', handleLength: 0.95, lid: true, lidDome: 0.3},
  frypan24: {id: 'frypan24', width: 860, height: 150, taper: 0.8, handle: 'long', handleLength: 0.62, lid: false},
  frypan28: {id: 'frypan28', width: 1000, height: 165, taper: 0.8, handle: 'long', handleLength: 0.58, lid: false},
  saute26: {id: 'saute26', width: 920, height: 230, taper: 0.9, handle: 'long', handleLength: 0.6, lid: false},
};

export const SET_7: PieceId[] = ['frypan24', 'saucepan18', 'casserole24', 'stockpot28'];
export const SET_9: PieceId[] = [...SET_7, 'frypan28', 'saute26'];
