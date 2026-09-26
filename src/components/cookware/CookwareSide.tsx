import React from 'react';
import {Img} from 'remotion';
import type {Finish} from '../../config/brand';
import {lidCutout, pieceCutout} from '../../config/assets';
import {PIECES, type PieceId} from './pieces';
import {BodyGradient, Blur, GoldGradient, SweepGradient, type Placement, type Sweep} from './materials';

export interface CookwareSideProps {
  piece: PieceId;
  finish: Finish;
  placement: Placement;
  /** Camera elevation: ry/rx of every rim ellipse. Share one value per shot. */
  tilt: number;
  uid: string;
  /** Lid lift in px above the rim (0 = seated). null hides the lid. */
  lidLift?: number | null;
  lidOpacity?: number;
  handleSide?: 'left' | 'right';
  sweep?: Sweep | null;
  shadowOpacity?: number;
  /** Depth-of-field blur in canvas px. */
  blur?: number;
  opacity?: number;
  rotate?: number;
}

/**
 * Studio-lit elevation of one Primera piece, drawn with its base centre at the placement
 * point. If a real cut-out exists in /public/assets it is used instead (see config/assets).
 */
export const CookwareSide: React.FC<CookwareSideProps> = ({
  piece,
  finish: f,
  placement,
  tilt,
  uid,
  lidLift = 0,
  lidOpacity = 1,
  handleSide = 'right',
  sweep,
  shadowOpacity = 0.35,
  blur = 0,
  opacity = 1,
  rotate = 0,
}) => {
  const spec = PIECES[piece];
  const w = spec.width;
  const h = spec.height;
  const rx = w / 2;
  const ry = rx * tilt;
  const rb = rx * spec.taper;
  const ryb = rb * tilt;
  const lip = Math.max(9, rx * 0.028);
  const irx = rx - lip;
  const iry = irx * tilt;
  const s = handleSide === 'right' ? 1 : -1;

  const wrapper: React.CSSProperties = {
    position: 'absolute',
    left: placement.x,
    top: placement.y,
    width: 0,
    height: 0,
    transform: `scale(${placement.scale}) rotate(${rotate}deg)`,
    transformOrigin: '0 0',
    filter: blur > 0.3 ? `blur(${blur / placement.scale}px)` : undefined,
    opacity,
  };

  const cutout = pieceCutout('side', piece, f.id);
  if (cutout) {
    const lidImg = lidCutout(piece, f.id);
    const boxW = w * 1.9;
    const boxH = h * 2;
    return (
      <div style={wrapper}>
        <Img
          src={cutout}
          style={{position: 'absolute', left: -boxW / 2, top: -boxH, width: boxW, height: boxH, objectFit: 'contain', objectPosition: 'center bottom'}}
        />
        {lidImg && lidLift !== null ? (
          <Img
            src={lidImg}
            style={{position: 'absolute', left: -boxW / 2, top: -h - (lidLift ?? 0) - h, width: boxW, height: h, objectFit: 'contain', objectPosition: 'center bottom', opacity: lidOpacity}}
          />
        ) : null}
      </div>
    );
  }

  const id = (k: string) => `${uid}-${k}`;

  const bodyPath = `M ${-rx} ${-h} L ${-rb} 0 A ${rb} ${ryb} 0 0 0 ${rb} 0 L ${rx} ${-h} A ${rx} ${ry} 0 0 1 ${-rx} ${-h} Z`;

  // Lid geometry
  const showLid = spec.lid && lidLift !== null;
  const rxl = rx + lip * 0.35;
  const ryl = rxl * tilt;
  const dh = rxl * (spec.lidDome ?? 0.2);
  const ly = -h - (lidLift ?? 0);
  const domePath = `M ${-rxl} 0 C ${-rxl} ${-dh * 0.6} ${-rxl * 0.6} ${-dh} 0 ${-dh} C ${rxl * 0.6} ${-dh} ${rxl} ${-dh * 0.6} ${rxl} 0 A ${rxl} ${ryl} 0 0 1 ${-rxl} 0 Z`;
  const kw = rxl * 0.19;
  const kh = rxl * 0.07;
  const kry = (kw / 2) * Math.max(tilt, 0.12);

  // Long handle geometry (drawn for the right side, mirrored by s)
  const hy = -h * (spec.height < 200 ? 0.62 : 0.8);
  const hl = w * (spec.handleLength ?? 0.6);
  const rise = hl * 0.1;
  const t0 = Math.min(40, h * 0.3);
  const t1 = t0 * 1.35;
  const hx0 = rx - 24;
  const hx1 = rx + hl;
  const handlePath = `M ${s * hx0} ${hy - t0 / 2} L ${s * hx1} ${hy - rise - t1 / 2} Q ${s * (hx1 + t1 * 0.95)} ${hy - rise} ${s * hx1} ${hy - rise + t1 / 2} L ${s * hx0} ${hy + t0 / 2} Z`;
  const edgeY = (x: number, top: boolean) => {
    const k = (x - hx0) / (hx1 - hx0);
    const c = hy - rise * k;
    const t = t0 + (t1 - t0) * k;
    return top ? c - t / 2 : c + t / 2;
  };
  const fx0 = rx - 6;
  const fx1 = rx + Math.max(46, hl * 0.13);
  const ferrulePath = `M ${s * fx0} ${edgeY(fx0, true) - 3} L ${s * fx1} ${edgeY(fx1, true) - 3} L ${s * fx1} ${edgeY(fx1, false) + 3} L ${s * fx0} ${edgeY(fx0, false) + 3} Z`;

  // Loop handles
  const loopY = -h + h * 0.13;
  const loopLen = rx * 0.2;
  const loopT = Math.min(56, Math.max(30, h * 0.095));

  // Sweep in local coordinates
  const sw = sweep && sweep.strength > 0.001 ? sweep : null;
  const swX = sw ? (sw.x - placement.x) / placement.scale : 0;
  const swW = sw ? sw.width / placement.scale : 0;

  return (
    <div style={wrapper}>
      <svg width={1} height={1} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} viewBox={`0 0 1 1`}>
        <defs>
          <BodyGradient id={id('body')} r={rx} finish={f} />
          <BodyGradient id={id('lidb')} r={rxl} finish={f} />
          <linearGradient id={id('ao')} gradientUnits="userSpaceOnUse" x1={0} y1={-h} x2={0} y2={ryb}>
            <stop offset="0" stopColor="#fff" stopOpacity={0.08} />
            <stop offset="0.35" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.32} />
          </linearGradient>
          <radialGradient id={id('dome')} cx="0.36" cy="0.1" r="0.9">
            <stop offset="0" stopColor="#fff" stopOpacity={0.5 * f.sheen} />
            <stop offset="0.45" stopColor="#fff" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.28} />
          </radialGradient>
          <linearGradient id={id('rim')} gradientUnits="userSpaceOnUse" x1={-rx} y1={0} x2={rx} y2={0}>
            <stop offset="0" stopColor={f.dark} />
            <stop offset="0.3" stopColor={f.light} />
            <stop offset="0.7" stopColor={f.base} />
            <stop offset="1" stopColor={f.light} />
          </linearGradient>
          <linearGradient id={id('inner')} gradientUnits="userSpaceOnUse" x1={0} y1={-h - iry} x2={0} y2={-h + iry}>
            <stop offset="0" stopColor={f.interiorLight} />
            <stop offset="0.55" stopColor={f.interior} />
            <stop offset="1" stopColor="#0c0c0d" />
          </linearGradient>
          <linearGradient id={id('handle')} gradientUnits="userSpaceOnUse" x1={0} y1={hy - t1} x2={0} y2={hy + t1 * 0.6}>
            <stop offset="0" stopColor={f.handleLight} />
            <stop offset="0.45" stopColor={f.handle} />
            <stop offset="1" stopColor="#050505" />
          </linearGradient>
          <GoldGradient id={id('goldv')} vertical />
          <GoldGradient id={id('goldk')} x1={-kw / 2} x2={kw / 2} />
          <GoldGradient id={id('goldf')} x1={Math.min(s * fx0, s * fx1)} x2={Math.max(s * fx0, s * fx1)} />
          <Blur id={id('b-shadow')} std={Math.max(14, rx * 0.06)} />
          <Blur id={id('b-contact')} std={5} />
          <Blur id={id('b-spec')} std={Math.max(6, rx * 0.022)} />
          <Blur id={id('b-crisp')} std={2.5} />
          <clipPath id={id('clip-body')}>
            <path d={bodyPath} />
          </clipPath>
          <clipPath id={id('clip-dome')}>
            <path d={domePath} transform={`translate(0 ${ly})`} />
          </clipPath>
          {sw ? <SweepGradient id={id('sweep')} color={sw.color ?? '#ffffff'} /> : null}
        </defs>

        {/* Floor shadow */}
        <ellipse cx={rx * 0.06} cy={ryb * 0.3} rx={rb * 1.12} ry={Math.max(ryb * 1.25, 18)} fill="#000" opacity={shadowOpacity} filter={`url(#${id('b-shadow')})`} />
        <ellipse cx={0} cy={0} rx={rb * 0.98} ry={Math.max(ryb * 0.9, 8)} fill="#000" opacity={shadowOpacity * 1.4} filter={`url(#${id('b-contact')})`} />

        {/* Long handle (behind the body) */}
        {spec.handle === 'long' ? (
          <g>
            <path d={handlePath} fill={`url(#${id('handle')})`} />
            <path
              d={`M ${s * hx0} ${hy - t0 / 2 + 2} L ${s * hx1} ${hy - rise - t1 / 2 + 2}`}
              stroke="#fff"
              strokeOpacity={0.22}
              strokeWidth={3}
              fill="none"
            />
            <ellipse cx={s * (hx1 - t1 * 0.25)} cy={hy - rise} rx={t1 * 0.2} ry={t1 * 0.13} fill="#000" opacity={0.55} />
            <path d={ferrulePath} fill={`url(#${id('goldf')})`} />
          </g>
        ) : null}

        {/* Body */}
        <path d={bodyPath} fill={`url(#${id('body')})`} />
        <path d={bodyPath} fill={`url(#${id('ao')})`} />
        <g clipPath={`url(#${id('clip-body')})`}>
          {/* Softbox reflections: one broad and soft, one crisp — reads as glossy enamel */}
          <rect x={-rx * 0.66} y={-h} width={rx * 0.16} height={h} fill="#fff" opacity={f.sheen * 0.3} filter={`url(#${id('b-spec')})`} />
          <rect x={-rx * 0.56} y={-h} width={rx * 0.028} height={h} fill="#fff" opacity={f.sheen * 0.75} filter={`url(#${id('b-crisp')})`} />
          <rect x={rx * 0.66} y={-h} width={rx * 0.03} height={h} fill="#fff" opacity={f.sheen * 0.35} filter={`url(#${id('b-spec')})`} />
          {sw ? (
            <rect x={swX - swW / 2} y={-h - 40} width={swW} height={h + 80} fill={`url(#${id('sweep')})`} opacity={sw.strength} transform={`skewX(-14)`} />
          ) : null}
        </g>

        {/* Rim & interior */}
        <ellipse cx={0} cy={-h} rx={rx} ry={ry} fill={`url(#${id('rim')})`} />
        <ellipse cx={0} cy={-h} rx={irx} ry={iry} fill={`url(#${id('inner')})`} />
        <path d={`M ${-rx} ${-h} A ${rx} ${ry} 0 0 0 ${rx} ${-h}`} stroke="#fff" strokeOpacity={0.55} strokeWidth={3.5} fill="none" />

        {/* Loop handles */}
        {spec.handle === 'loops'
          ? [-1, 1].map((side) => (
              <g key={side}>
                <rect
                  x={side === 1 ? rx - 12 : -rx - loopLen}
                  y={loopY}
                  width={loopLen + 12}
                  height={loopT}
                  rx={loopT / 2}
                  fill={`url(#${id('goldv')})`}
                />
                <rect
                  x={side === 1 ? rx - 12 : -rx - loopLen}
                  y={loopY + loopT * 0.62}
                  width={loopLen + 12}
                  height={loopT * 0.38}
                  rx={loopT * 0.19}
                  fill="#000"
                  opacity={0.25}
                />
              </g>
            ))
          : null}

        {/* Lid */}
        {showLid ? (
          <g transform={`translate(0 ${ly})`} opacity={lidOpacity}>
            <ellipse cx={0} cy={0} rx={rxl} ry={ryl + 7} fill="#000" opacity={0.25 * Math.max(0, 1 - (lidLift ?? 0) / 120)} />
            <path d={domePath} fill={`url(#${id('lidb')})`} />
            <path d={domePath} fill={`url(#${id('dome')})`} />
            <path d={`M ${-rxl} 0 A ${rxl} ${ryl} 0 0 0 ${rxl} 0`} stroke={f.deep} strokeOpacity={0.6} strokeWidth={10} fill="none" />
            <path d={`M ${-rxl} -3 A ${rxl} ${ryl} 0 0 0 ${rxl} -3`} stroke="#fff" strokeOpacity={0.4} strokeWidth={3} fill="none" />
            <ellipse cx={-rxl * 0.34} cy={-dh * 0.62} rx={rxl * 0.24} ry={dh * 0.16} fill="#fff" opacity={f.sheen * 0.45} filter={`url(#${id('b-spec')})`} transform={`rotate(-6 ${-rxl * 0.34} ${-dh * 0.62})`} />
            {/* Knob */}
            <ellipse cx={0} cy={-dh + 2} rx={kw * 0.62} ry={kry * 1.3} fill="#000" opacity={0.25} />
            <rect x={-kw / 2} y={-dh - kh} width={kw} height={kh} fill={`url(#${id('goldk')})`} />
            <ellipse cx={0} cy={-dh} rx={kw / 2} ry={kry} fill={`url(#${id('goldk')})`} />
            <ellipse cx={0} cy={-dh - kh} rx={kw / 2} ry={kry} fill={`url(#${id('goldv')})`} />
            <ellipse cx={0} cy={-dh - kh} rx={kw / 2} ry={kry} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={2} />
            {sw ? (
              <g clipPath={`url(#${id('clip-dome')})`} transform={`translate(0 ${-ly})`}>
                <rect x={swX - swW / 2} y={ly - dh - 60} width={swW} height={dh + 120} fill={`url(#${id('sweep')})`} opacity={sw.strength} transform="skewX(-14)" />
              </g>
            ) : null}
          </g>
        ) : null}
      </svg>
    </div>
  );
};
