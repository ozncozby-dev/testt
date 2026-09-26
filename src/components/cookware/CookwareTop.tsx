import React from 'react';
import {Img} from 'remotion';
import type {Finish} from '../../config/brand';
import {pieceCutout} from '../../config/assets';
import {PIECES, type PieceId} from './pieces';
import {Blur, GoldGradient, SpeckleFilter, type Placement} from './materials';

export interface CookwareTopProps {
  piece: PieceId;
  finish: Finish;
  placement: Placement;
  uid: string;
  /** Rotation of the whole piece (handle direction), degrees. 0 = handle to the right. */
  angle?: number;
  /** null = no lid. 1 = seated, >1 = still above the vessel (bigger, softer shadow). */
  lidScale?: number | null;
  lidOpacity?: number;
  opacity?: number;
  blur?: number;
  shadowOpacity?: number;
}

/** Overhead view of one piece — key light from the upper left. Origin = vessel centre. */
export const CookwareTop: React.FC<CookwareTopProps> = ({
  piece,
  finish: f,
  placement,
  uid,
  angle = 0,
  lidScale = null,
  lidOpacity = 1,
  opacity = 1,
  blur = 0,
  shadowOpacity = 0.5,
}) => {
  const spec = PIECES[piece];
  const r = spec.width / 2;
  const id = (k: string) => `${uid}-${k}`;

  const wrapper: React.CSSProperties = {
    position: 'absolute',
    left: placement.x,
    top: placement.y,
    width: 0,
    height: 0,
    transform: `scale(${placement.scale})`,
    transformOrigin: '0 0',
    opacity,
    filter: blur > 0.3 ? `blur(${blur / placement.scale}px)` : undefined,
  };

  const cutout = pieceCutout('top', piece, f.id);
  if (cutout) {
    const box = spec.width * 2.4;
    return (
      <div style={wrapper}>
        <Img src={cutout} style={{position: 'absolute', left: -box / 2, top: -box / 2, width: box, height: box, objectFit: 'contain', transform: `rotate(${angle}deg)`}} />
      </div>
    );
  }

  const hl = spec.width * (spec.handleLength ?? 0.6);
  const ht = 58;
  const lift = lidScale === null ? 0 : Math.max(0, lidScale - 1);
  const lr = r * 0.975;
  const kr = r * 0.13;
  // Light comes from the upper left; rotate shading back so it stays fixed when the piece turns.
  const lightFix = -angle;

  return (
    <div style={wrapper}>
      <svg width={1} height={1} viewBox="0 0 1 1" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <defs>
          <linearGradient id={id('rim')} x1="0" y1="0" x2="1" y2="1" gradientTransform={`rotate(${lightFix} 0.5 0.5)`}>
            <stop offset="0" stopColor={f.light} />
            <stop offset="0.35" stopColor={f.base} />
            <stop offset="0.7" stopColor={f.dark} />
            <stop offset="1" stopColor={f.deep} />
          </linearGradient>
          <radialGradient id={id('lid')} cx="0.38" cy="0.34" r="0.75" gradientTransform={`rotate(${lightFix} 0.5 0.5)`}>
            <stop offset="0" stopColor={f.light} />
            <stop offset="0.45" stopColor={f.base} />
            <stop offset="1" stopColor={f.dark} />
          </radialGradient>
          <radialGradient id={id('floor')} cx="0.42" cy="0.4" r="0.7">
            <stop offset="0" stopColor={f.interiorLight} />
            <stop offset="1" stopColor={f.interior} />
          </radialGradient>
          <linearGradient id={id('wall')} x1="0" y1="0" x2="1" y2="1" gradientTransform={`rotate(${lightFix} 0.5 0.5)`}>
            <stop offset="0" stopColor="#0a0a0b" />
            <stop offset="0.5" stopColor={f.interior} />
            <stop offset="1" stopColor={f.interiorLight} />
          </linearGradient>
          <linearGradient id={id('handle')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={f.handleLight} />
            <stop offset="0.5" stopColor={f.handle} />
            <stop offset="1" stopColor="#050505" />
          </linearGradient>
          <radialGradient id={id('knob')} cx="0.35" cy="0.32" r="0.8" gradientTransform={`rotate(${lightFix} 0.5 0.5)`}>
            <stop offset="0" stopColor="#F4E6C4" />
            <stop offset="0.4" stopColor="#CDAE73" />
            <stop offset="0.8" stopColor="#8C6E3E" />
            <stop offset="1" stopColor="#5E4726" />
          </radialGradient>
          <GoldGradient id={id('goldv')} vertical />
          <SpeckleFilter id={id('speck')} seed={spec.width} />
          <Blur id={id('shadow')} std={r * 0.07} />
          <Blur id={id('lidshadow')} std={10 + lift * 160} />
          <Blur id={id('spec')} std={r * 0.05} />
          <clipPath id={id('floorclip')}>
            <circle r={r * 0.86} />
          </clipPath>
        </defs>

        {/* Shadow — offset down-right, away from the key light */}
        <g transform={`translate(${r * 0.07} ${r * 0.1})`}>
          <circle r={r * 1.0} fill="#000" opacity={shadowOpacity} filter={`url(#${id('shadow')})`} />
        </g>

        <g transform={`rotate(${angle})`}>
          {spec.handle === 'long' ? (
            <g>
              <rect x={r - 30} y={-ht / 2} width={hl + 30} height={ht} rx={ht / 2} fill="#000" opacity={shadowOpacity * 0.7} filter={`url(#${id('shadow')})`} transform={`translate(${r * 0.05} ${r * 0.07})`} />
              <rect x={r - 30} y={-ht / 2} width={hl + 30} height={ht} rx={ht / 2} fill={`url(#${id('handle')})`} />
              <ellipse cx={r + hl - ht * 0.55} cy={0} rx={ht * 0.2} ry={ht * 0.16} fill="#000" opacity={0.6} />
              <rect x={r - 10} y={-ht / 2 - 4} width={Math.max(48, hl * 0.13)} height={ht + 8} rx={6} fill={`url(#${id('goldv')})`} />
            </g>
          ) : (
            [-1, 1].map((side) => (
              <rect key={side} x={side === 1 ? r - 16 : -r - r * 0.16} y={-r * 0.12} width={r * 0.16 + 16} height={r * 0.24} rx={r * 0.08} fill={`url(#${id('goldv')})`} />
            ))
          )}

          {/* Vessel rim */}
          <circle r={r} fill={`url(#${id('rim')})`} />
          <circle r={r - 2} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />

          {/* Open vessel: cooking surface */}
          {lidScale === null || lidOpacity < 1 ? (
            <g>
              <circle r={r * 0.94} fill={`url(#${id('wall')})`} />
              <circle r={r * 0.8} fill={`url(#${id('floor')})`} />
              <g clipPath={`url(#${id('floorclip')})`}>
                <rect x={-r} y={-r} width={r * 2} height={r * 2} filter={`url(#${id('speck')})`} opacity={0.16} />
              </g>
              {[0.2, 0.35, 0.5].map((k) => (
                <circle key={k} r={r * k} fill="none" stroke="#fff" strokeOpacity={0.035} strokeWidth={2} />
              ))}
              <ellipse cx={-r * 0.3} cy={-r * 0.34} rx={r * 0.34} ry={r * 0.16} fill="#fff" opacity={0.06} filter={`url(#${id('spec')})`} transform={`rotate(${-35 + lightFix})`} />
            </g>
          ) : null}
        </g>

        {/* Lid (does not rotate with handle so its light stays fixed) */}
        {lidScale !== null ? (
          <g opacity={lidOpacity}>
            <g transform={`translate(${r * (0.03 + lift * 0.5)} ${r * (0.04 + lift * 0.7)})`}>
              <circle r={lr} fill="#000" opacity={0.45 * (1 - Math.min(lift * 2, 0.7))} filter={`url(#${id('lidshadow')})`} />
            </g>
            <g transform={`scale(${lidScale})`}>
              <circle r={lr} fill={`url(#${id('lid')})`} />
              <circle r={lr * 0.9} fill="none" stroke="#000" strokeOpacity={0.12} strokeWidth={4} />
              <circle r={lr * 0.9 - 4} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={2} />
              <circle r={lr - 3} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={3} />
              <ellipse cx={-lr * 0.3} cy={-lr * 0.32} rx={lr * 0.36} ry={lr * 0.2} fill="#fff" opacity={f.sheen * 0.4} filter={`url(#${id('spec')})`} transform="rotate(-38)" />
              <circle r={kr * 1.12} fill="#000" opacity={0.22} transform={`translate(${kr * 0.25} ${kr * 0.3})`} filter={`url(#${id('spec')})`} />
              <circle r={kr} fill={`url(#${id('knob')})`} />
              <circle r={kr * 0.72} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={2} />
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
};
