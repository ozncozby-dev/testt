import React from 'react';
import {AbsoluteFill} from 'remotion';

/** Seamless infinity-cove studio: vertical falloff, a soft key-light pool and a vignette. */
export const StudioBackdrop: React.FC<{
  top: string;
  bottom: string;
  glow: string;
  glowX?: number;
  glowY?: number;
  glowSize?: number;
  vignette?: number;
}> = ({top, bottom, glow, glowX = 50, glowY = 45, glowSize = 60, vignette = 0.35}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse ${glowSize}% ${glowSize * 0.9}% at ${glowX}% ${glowY}%, ${glow} 0%, transparent 100%)`}} />
    <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 70% at 50% 48%, transparent 55%, rgba(0,0,0,${vignette}) 100%)`}} />
  </AbsoluteFill>
);
