import React from 'react';
import {AbsoluteFill} from 'remotion';
import {mix} from '../lib/motion';

/**
 * Full-frame soft band of light. `progress` 0 -> 1 moves it across the frame.
 * Use sparingly: it is a lighting cue, not an effect.
 */
export const LightSweep: React.FC<{
  progress: number;
  angle?: number;
  /** Band width as % of the frame diagonal. */
  width?: number;
  color?: string;
  opacity?: number;
  blend?: React.CSSProperties['mixBlendMode'];
  mask?: string;
}> = ({progress, angle = 16, width = 18, color = '#FFFFFF', opacity = 0.35, blend = 'screen', mask}) => {
  if (progress <= 0 || progress >= 1) return null;
  const c = mix(-width, 100 + width, progress);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${90 + angle}deg, transparent ${c - width}%, ${color} ${c}%, transparent ${c + width}%)`,
        mixBlendMode: blend,
        opacity: opacity * Math.sin(progress * Math.PI),
        WebkitMaskImage: mask,
        maskImage: mask,
        pointerEvents: 'none',
      }}
    />
  );
};
