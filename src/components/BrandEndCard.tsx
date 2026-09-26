import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import {copy, finishes, FONT, palette} from '../config/brand';
import {logoAsset} from '../config/assets';
import {HERO_7, SIDE_TILT} from '../config/layouts';
import {HEIGHT, WIDTH} from '../config/timeline';
import {ease, mix, progress, range} from '../lib/motion';
import {KineticTypography} from './KineticTypography';
import {ProductAssembly} from './ProductAssembly';
import {StudioBackdrop} from './StudioBackdrop';

/** Placeholder monogram, used only until assets/brand/logo.svg is supplied. */
const Monogram: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <defs>
      <linearGradient id="mono-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#EADBB8" />
        <stop offset="0.5" stopColor={palette.gold} />
        <stop offset="1" stopColor="#7D6135" />
      </linearGradient>
    </defs>
    <circle cx={100} cy={100} r={96} fill="none" stroke="url(#mono-gold)" strokeWidth={2} />
    <circle cx={100} cy={100} r={88} fill="none" stroke="url(#mono-gold)" strokeWidth={0.75} opacity={0.6} />
    <text x={100} y={121} textAnchor="middle" fontFamily={FONT} fontWeight={200} fontSize={62} letterSpacing={6} fill="url(#mono-gold)">
      LP
    </text>
  </svg>
);

const FLOOR_Y = 1795;
const GROUP_SCALE = 0.6;
const GROUP_ORIGIN = {x: 1920, y: 1790};

/**
 * Final scene — stillness. Hero set on a dark studio floor with a faint reflection;
 * a slow light passes over the products, then the brand signature resolves and the
 * frame returns to darkness through the reflection.
 */
export const BrandEndCard: React.FC<{frame: number; duration: number; logoAt?: number}> = ({frame, duration, logoAt = 26}) => {
  const f = finishes.ivory;
  const settle = mix(1.025, 1, progress(frame, -10, 60, ease.arrive));
  const sweepP = progress(frame, 0, 86, ease.cinematic);
  const sweepX = mix(-600, WIDTH + 600, sweepP);
  const fadeOut = range(frame, [duration - 26, duration - 4], [1, 0], ease.soft);
  const glint = range(frame, [duration - 34, duration - 20, duration], [0, 1, 0]);
  const logo = logoAsset();
  const logoIn = progress(frame, logoAt, 30, ease.arrive);

  const group = (mirror: boolean) => (
    <AbsoluteFill
      style={{
        transform: `translate(0px, ${mirror ? 2 * (FLOOR_Y - GROUP_ORIGIN.y) : 0}px) scale(${GROUP_SCALE * settle}, ${GROUP_SCALE * settle * (mirror ? -1 : 1)})`,
        transformOrigin: `${GROUP_ORIGIN.x}px ${mirror ? GROUP_ORIGIN.y : GROUP_ORIGIN.y}px`,
      }}
    >
      <ProductAssembly
        slots={HERO_7}
        finish={f}
        frame={frame}
        tilt={SIDE_TILT * 0.85}
        uid={mirror ? 's07-m' : 's07'}
        sweep={{x: sweepX, width: 700, strength: 0.55 * Math.sin(sweepP * Math.PI), color: '#FFF6E6'}}
        shadowOpacity={mirror ? 0 : 0.5}
      />
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{background: palette.black}}>
      <AbsoluteFill style={{opacity: fadeOut}}>
        <StudioBackdrop top="#1F1F22" bottom="#0A0A0B" glow="rgba(255,248,235,0.08)" glowY={70} glowSize={55} vignette={0.55} />
        {/* Reflection on the studio floor */}
        <AbsoluteFill
          style={{
            opacity: 0.16,
            WebkitMaskImage: `linear-gradient(180deg, transparent ${(FLOOR_Y / HEIGHT) * 100}%, #000 ${(FLOOR_Y / HEIGHT) * 100 + 1}%, transparent ${(FLOOR_Y / HEIGHT) * 100 + 9}%)`,
            maskImage: `linear-gradient(180deg, transparent ${(FLOOR_Y / HEIGHT) * 100}%, #000 ${(FLOOR_Y / HEIGHT) * 100 + 1}%, transparent ${(FLOOR_Y / HEIGHT) * 100 + 9}%)`,
          }}
        >
          {group(true)}
        </AbsoluteFill>
        {group(false)}

        {/* Signature */}
        <div
          style={{
            position: 'absolute',
            left: WIDTH / 2,
            top: 330,
            transform: `translate(-50%, 0) scale(${mix(0.985, 1, logoIn)})`,
            opacity: logoIn,
            filter: `blur(${(1 - logoIn) * 6}px)`,
          }}
        >
          {logo ? <Img src={logo} style={{height: 240, width: 'auto', objectFit: 'contain'}} /> : <Monogram size={240} />}
        </div>
        <KineticTypography lines={[copy.brand]} frame={frame} start={logoAt + 14} x={WIDTH / 2} y={660} size={104} weight={300} color={palette.textLight} align="center" tracking={[0.8, 0.52]} />
        <KineticTypography lines={[copy.tagline]} frame={frame} start={logoAt + 30} x={WIDTH / 2} y={840} size={54} weight={200} color={palette.goldLight} align="center" tracking={[0.14, 0.06]} />
        {copy.website ? (
          <KineticTypography lines={[copy.website]} frame={frame} start={logoAt + 42} x={WIDTH / 2} y={960} size={32} weight={400} color={palette.textLight} align="center" tracking={[0.4, 0.3]} opacity={0.5} />
        ) : null}
      </AbsoluteFill>
      {/* Last light: a thin reflection on the floor line fading into darkness */}
      <div
        style={{
          position: 'absolute',
          left: WIDTH / 2 - 1100,
          top: FLOOR_Y - 2,
          width: 2200,
          height: 4,
          background: 'linear-gradient(90deg, transparent, rgba(255,244,225,0.9), transparent)',
          filter: 'blur(2px)',
          opacity: glint * 0.7,
        }}
      />
    </AbsoluteFill>
  );
};
