import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {finishes} from '../config/brand';
import {plate} from '../config/assets';
import {HEIGHT, WIDTH} from '../config/timeline';
import {ease, mix, progress, range} from '../lib/motion';
import {CookwareSide} from './cookware/CookwareSide';

const W = WIDTH;
const H = HEIGHT;
const COUNTER_Y = 1500;

/** Soft rising steam: a few blurred, slowly undulating ribbons. */
const Steam: React.FC<{frame: number; x: number; y: number; width: number}> = ({frame, x, y, width}) => {
  const wisps = [0, 1, 2, 3];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="steam-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={26} /></filter>
        <linearGradient id="steam-fade" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.2" stopColor="#fff" stopOpacity={1} />
          <stop offset="0.7" stopColor="#fff" stopOpacity={0.5} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {wisps.map((i) => {
        const phase = frame / 30 + i * 1.7;
        const ox = x + (i - 1.5) * (width / 5);
        const rise = ((frame * 1.6 + i * 60) % 220) - 60;
        const pts = Array.from({length: 9}, (_, k) => {
          const yy = y - k * 110 - rise;
          const xx = ox + Math.sin(phase + k * 0.7) * (18 + k * 9);
          return `${xx},${yy}`;
        });
        return (
          <polyline
            key={i}
            points={pts.join(' ')}
            fill="none"
            stroke="url(#steam-fade)"
            strokeWidth={70 - i * 8}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.26 + 0.06 * Math.sin(phase * 0.8)}
            filter="url(#steam-blur)"
          />
        );
      })}
    </svg>
  );
};

/**
 * Scene 06 — the collection at home. If assets/plates/kitchen.jpg exists it is used as
 * the environment; otherwise a minimal architectural kitchen is built from light:
 * warm plaster, window light falling across the wall, a fluted stone island.
 */
export const LifestyleScene: React.FC<{frame: number; duration: number}> = ({frame, duration}) => {
  const cam = progress(frame, -12, duration + 22, ease.soft);
  const push = mix(1.0, 1.085, cam);
  const origin = {x: 2050, y: 1350};
  const sun = mix(0, 70, cam);
  const photo = plate('kitchen');
  const f = finishes.ivory;

  if (photo) {
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <Img src={photo} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${push})`, transformOrigin: `${origin.x}px ${origin.y}px`}} />
      </AbsoluteFill>
    );
  }

  const flutes = Array.from({length: Math.ceil(W / 56)}, (_, i) => i * 56);
  return (
    <AbsoluteFill style={{background: '#D9CBB6', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${origin.x}px ${origin.y}px`}}>
        {/* Wall */}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #E6D9C6 0%, #DCCBB3 55%, #CDB99E 100%)'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 18% 20%, rgba(255,240,215,0.65) 0%, transparent 70%)'}} />
        {/* Tall joinery on the right */}
        <div style={{position: 'absolute', left: 3260, top: 0, width: 700, height: COUNTER_Y, background: 'linear-gradient(90deg, #BFAE96 0%, #B3A189 100%)'}} />
        <div style={{position: 'absolute', left: 3258, top: 0, width: 4, height: COUNTER_Y, background: 'rgba(0,0,0,0.12)'}} />
        <div style={{position: 'absolute', left: 3600, top: 0, width: 3, height: COUNTER_Y, background: 'rgba(0,0,0,0.1)'}} />
        {/* Sunlight through a window, falling across the wall */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: 'soft-light'}}>
          <defs>
            <filter id="sun-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={34} /></filter>
          </defs>
          <g transform={`translate(${sun} 0)`} filter="url(#sun-blur)" opacity={0.95}>
            <polygon points="1850,60 2500,60 2230,1380 1580,1380" fill="#FFF5DF" />
            <polygon points="2580,60 3230,60 2960,1380 2310,1380" fill="#FFF5DF" />
          </g>
        </svg>
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="sun-blur2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={40} /></filter>
          </defs>
          <g transform={`translate(${sun} 0)`} filter="url(#sun-blur2)" opacity={0.28}>
            <polygon points="1850,60 2500,60 2230,1380 1580,1380" fill="#FFF3DA" />
            <polygon points="2580,60 3230,60 2960,1380 2310,1380" fill="#FFF3DA" />
          </g>
        </svg>
        {/* Island: worktop plane, bull-nose edge, fluted front */}
        <div style={{position: 'absolute', left: 0, top: COUNTER_Y - 90, width: W, height: 90, background: 'linear-gradient(180deg, #E9E2D7 0%, #F4EFE7 100%)'}} />
        <div style={{position: 'absolute', left: 0, top: COUNTER_Y, width: W, height: 6, background: 'rgba(255,255,255,0.85)'}} />
        <div style={{position: 'absolute', left: 0, top: COUNTER_Y + 6, width: W, height: 40, background: 'linear-gradient(180deg, #D8CFC2 0%, #BEB3A4 100%)'}} />
        <div style={{position: 'absolute', left: 0, top: COUNTER_Y + 46, width: W, height: H - COUNTER_Y, background: 'linear-gradient(180deg, #9E8F7C 0%, #7F705E 100%)'}}>
          <svg width={W} height={H - COUNTER_Y} style={{position: 'absolute', inset: 0}}>
            {flutes.map((x) => (
              <g key={x}>
                <rect x={x} y={0} width={28} height={H} fill="#fff" opacity={0.06} />
                <rect x={x + 50} y={0} width={4} height={H} fill="#000" opacity={0.12} />
              </g>
            ))}
          </svg>
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 30%)'}} />
        </div>
        {/* Long evening shadows cast by the cookware */}
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          <defs>
            <filter id="cast" x="-30%" y="-100%" width="160%" height="300%"><feGaussianBlur stdDeviation={22} /></filter>
          </defs>
          <ellipse cx={1880} cy={COUNTER_Y - 42} rx={520} ry={34} fill="#3A2C1C" opacity={0.28} filter="url(#cast)" />
          <ellipse cx={2640} cy={COUNTER_Y - 30} rx={380} ry={26} fill="#3A2C1C" opacity={0.24} filter="url(#cast)" />
        </svg>
        <CookwareSide uid="s06-cas" piece="casserole24" finish={f} tilt={0.14} placement={{x: 1600, y: COUNTER_Y - 50, scale: 1.05}} shadowOpacity={0.3} />
        <CookwareSide uid="s06-sauce" piece="saucepan18" finish={f} tilt={0.14} placement={{x: 2420, y: COUNTER_Y - 36, scale: 0.88}} lidLift={null} handleSide="right" shadowOpacity={0.3} />
        <Steam frame={frame + 40} x={2420} y={COUNTER_Y - 36 - 360 * 0.88} width={420} />
        {/* Warm grade */}
        <AbsoluteFill style={{background: 'linear-gradient(115deg, rgba(255,196,120,0.18) 0%, rgba(255,196,120,0) 55%)', mixBlendMode: 'soft-light'}} />
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 45% 45%, transparent 55%, rgba(40,25,10,0.28) 100%)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#FFE7C2', opacity: range(frame, [-12, 10], [0.25, 0]), mixBlendMode: 'soft-light'}} />
    </AbsoluteFill>
  );
};
