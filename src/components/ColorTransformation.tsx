import React from 'react';
import {AbsoluteFill} from 'remotion';
import {finishes, type FinishId} from '../config/brand';
import {HEIGHT} from '../config/timeline';
import {ease, mix, progress} from '../lib/motion';
import {ProductAssembly, type ProductAssemblyProps} from './ProductAssembly';

export interface ColorStep {
  finish: FinishId;
  /** Frame at which the light band starts carrying this finish across. */
  at: number;
}

/**
 * Material/colour transformation: a band of light travels across the set and the new
 * finish exists only behind it. Never a cross-fade.
 */
export const ColorTransformation: React.FC<
  Omit<ProductAssemblyProps, 'finish' | 'sweep'> & {
    steps: ColorStep[];
    sweepFrames: number;
    fromX: number;
    toX: number;
  }
> = ({steps, sweepFrames, fromX, toX, frame, uid, ...rest}) => {
  // Current = last step whose sweep has completed; next = the one sweeping now.
  let current = 0;
  steps.forEach((s, i) => {
    if (i > 0 && frame >= s.at + sweepFrames) current = i;
  });
  const next = steps.findIndex((s, i) => i > 0 && frame >= s.at && frame < s.at + sweepFrames);
  const sweeping = next > 0;
  const p = sweeping ? progress(frame, steps[next].at, sweepFrames, ease.cinematic) : 0;
  const edge = mix(fromX, toX, p);
  // Soft, slightly leaning seam that rides inside the light band (mask positions in px).
  const leanDeg = 9;
  const k = Math.cos((leanDeg * Math.PI) / 180);
  const off = (HEIGHT / 2) * Math.sin((leanDeg * Math.PI) / 180);
  const seamAt = edge * k + off;
  const seam = `linear-gradient(${90 + leanDeg}deg, #000 ${seamAt - 70}px, transparent ${seamAt + 70}px)`;
  const band = {x: edge, width: 560, strength: sweeping ? Math.sin(p * Math.PI) * 0.75 : 0, color: '#FFFFFF'};
  const base = sweeping ? steps[next - 1].finish : steps[current].finish;

  return (
    <AbsoluteFill>
      <ProductAssembly {...rest} frame={frame} uid={`${uid}-a`} finish={finishes[base]} sweep={band} />
      {sweeping ? (
        <AbsoluteFill style={{WebkitMaskImage: seam, maskImage: seam}}>
          <ProductAssembly {...rest} frame={frame} uid={`${uid}-b`} finish={finishes[steps[next].finish]} sweep={band} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
