import React from 'react';
import {AbsoluteFill} from 'remotion';
import {palette} from '../config/brand';
import {HEIGHT, WIDTH} from '../config/timeline';
import {ease, mix, progress, range} from '../lib/motion';

export const REVEAL_CIRCLE = {cx: 2750, cy: 1150, r: 1250};

/**
 * Scene 01 — geometry before product. In near-darkness a single reflection travels
 * along the rim of a Primera lid, revealing its curve; the dome and the knob only
 * hint at themselves. The same circle later becomes the transition portal.
 */
export const ProductReveal: React.FC<{frame: number; duration: number}> = ({frame, duration}) => {
  const {cx, cy, r} = REVEAL_CIRCLE;
  const C = 2 * Math.PI * r;

  // Very slow macro camera: push + a whisper of rotation.
  const cam = progress(frame, 0, duration, ease.soft);
  const scale = mix(1, 1.1, cam);
  const rot = mix(1.2, -0.8, cam);

  // The reflection travels from upper-left down around the rim (degrees, SVG clockwise from 3 o'clock).
  const travel = progress(frame, 4, 78, ease.cinematic);
  const theta = mix(248, 118, travel);
  const dash = (len: number) => {
    const start = (theta / 360) * C - len / 2;
    return {strokeDasharray: `${len} ${C}`, strokeDashoffset: -start};
  };
  const lightIn = range(frame, [2, 16], [0, 1]);
  const trailLen = Math.max(0, ((248 - theta) / 360) * C);

  const dome = range(frame, [26, 90], [0, 1], ease.soft);
  const knob = range(frame, [48, 92], [0, 1], ease.soft);

  return (
    <AbsoluteFill style={{background: palette.black}}>
      <AbsoluteFill style={{transform: `scale(${scale}) rotate(${rot}deg)`, transformOrigin: `${cx}px ${cy}px`}}>
        <svg width={WIDTH} height={HEIGHT}>
          <defs>
            <radialGradient id="s01-dome" cx={cx - r * 0.35} cy={cy - r * 0.45} r={r * 1.3} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#2A2A2D" />
              <stop offset="0.45" stopColor="#161618" />
              <stop offset="1" stopColor="#09090A" />
            </radialGradient>
            <radialGradient id="s01-knob" cx={cx - 60} cy={cy - 70} r={260} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#D9C39A" />
              <stop offset="0.5" stopColor="#8A6E42" />
              <stop offset="1" stopColor="#2A2016" />
            </radialGradient>
            <filter id="s01-b4" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={4} /></filter>
            <filter id="s01-b16" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={16} /></filter>
            <filter id="s01-b60" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={60} /></filter>
          </defs>

          {/* Dome, barely there */}
          <circle cx={cx} cy={cy} r={r} fill="url(#s01-dome)" opacity={dome * 0.9} />
          {/* Lid flange step */}
          <circle cx={cx} cy={cy} r={r * 0.88} fill="none" stroke="#fff" strokeOpacity={0.05 * dome} strokeWidth={3} />
          {/* Knob hint */}
          <circle cx={cx} cy={cy} r={170} fill="url(#s01-knob)" opacity={knob * 0.35} />
          <circle cx={cx} cy={cy} r={124} fill="none" stroke={palette.goldLight} strokeOpacity={knob * 0.25} strokeWidth={3} />

          {/* The rim, dark metal */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#151517" strokeWidth={36} />
          <circle cx={cx} cy={cy} r={r - 30} fill="none" stroke="#0E0E0F" strokeWidth={8} />

          {/* The rim that the light has already touched stays faintly lit */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#8C8578"
            strokeWidth={5}
            opacity={0.35 * lightIn}
            strokeDasharray={`${trailLen} ${C}`}
            strokeDashoffset={-(118 / 360) * C - ((theta - 118) / 360) * C}
          />

          {/* Travelling reflection: glow, body, core */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={palette.gold} strokeWidth={90} opacity={0.2 * lightIn} filter="url(#s01-b60)" {...dash(2200)} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EDE3D0" strokeWidth={22} opacity={0.45 * lightIn} filter="url(#s01-b16)" {...dash(1200)} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FFFFFF" strokeWidth={7} opacity={0.95 * lightIn} filter="url(#s01-b4)" {...dash(520)} />
          {/* Secondary glint on the inner lip, trailing the main one */}
          <circle
            cx={cx}
            cy={cy}
            r={r - 30}
            fill="none"
            stroke="#FFFFFF"
            strokeWidth={3}
            opacity={0.5 * lightIn * range(frame, [18, 40], [0, 1])}
            filter="url(#s01-b4)"
            strokeDasharray={`300 ${C}`}
            strokeDashoffset={-(((theta + 14) / 360) * 2 * Math.PI * (r - 30) - 150)}
          />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
