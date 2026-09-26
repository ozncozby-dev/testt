import React from 'react';
import {goldStops, type Finish} from '../../config/brand';

/** A light band travelling across the product, in the same space as piece placements. */
export interface Sweep {
  x: number;
  width: number;
  strength: number;
  color?: string;
}

export interface Placement {
  x: number;
  y: number;
  scale: number;
}

const stops = (colors: string[], offsets?: number[]) =>
  colors.map((c, i) => (
    <stop key={i} offset={offsets ? offsets[i] : i / (colors.length - 1)} stopColor={c} />
  ));

/** Cylindrical enamel shading across a vessel of radius r (key light upper-left, rim light right). */
export const BodyGradient: React.FC<{id: string; r: number; finish: Finish}> = ({id, r, finish: f}) => (
  <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={-r} y1={0} x2={r} y2={0}>
    {stops(
      [f.deep, f.dark, f.base, f.light, f.light, f.base, f.base, f.dark, f.base, f.dark, f.deep],
      [0, 0.04, 0.13, 0.25, 0.31, 0.45, 0.6, 0.8, 0.9, 0.97, 1],
    )}
  </linearGradient>
);

export const GoldGradient: React.FC<{id: string; vertical?: boolean; x1?: number; x2?: number}> = ({
  id,
  vertical,
  x1 = -1,
  x2 = 1,
}) =>
  vertical ? (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      {stops([goldStops[3], goldStops[2], goldStops[4], goldStops[1], goldStops[0]], [0, 0.2, 0.45, 0.8, 1])}
    </linearGradient>
  ) : (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x1} y1={0} x2={x2} y2={0}>
      {stops(goldStops, [0, 0.15, 0.35, 0.5, 0.72, 1])}
    </linearGradient>
  );

/** Sparse, fine speckle for the granite cooking surface. */
export const SpeckleFilter: React.FC<{id: string; seed?: number; density?: number}> = ({id, seed = 4, density = 1.4}) => (
  <filter id={id} x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency={density} numOctaves={2} seed={seed} />
    <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 11 -6.6" />
  </filter>
);

export const Blur: React.FC<{id: string; std: number}> = ({id, std}) => (
  <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation={std} />
  </filter>
);

/** A soft vertical band gradient for light sweeps. */
export const SweepGradient: React.FC<{id: string; color: string}> = ({id, color}) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stopColor={color} stopOpacity={0} />
    <stop offset="0.42" stopColor={color} stopOpacity={0.55} />
    <stop offset="0.5" stopColor={color} stopOpacity={1} />
    <stop offset="0.58" stopColor={color} stopOpacity={0.55} />
    <stop offset="1" stopColor={color} stopOpacity={0} />
  </linearGradient>
);
