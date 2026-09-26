import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {copy, finishes, FONT, goldStops, palette, type Finish} from '../config/brand';
import {plate, type PlateId} from '../config/assets';
import {HEIGHT, WIDTH} from '../config/timeline';
import {MACRO_LINKS, MACRO_SHOTS} from '../config/choreography';
import {ease, mix, progress} from '../lib/motion';
import {circlePortal, lightSweepWipe} from './CameraTransition';
import {KineticTypography} from './KineticTypography';
import {SpeckleFilter} from './cookware/materials';

/*
 * Scene 05 — four macro details, each ~1s, linked by the geometry of the previous
 * frame:  lid rim arc  -> (light sweep along the arc) -> handle line
 *         handle line  -> (sweep along the handle axis) -> cooking surface
 *         surface disc -> (circle portal)               -> base disc
 */

const SHOTS = MACRO_SHOTS;
const LINKS = MACRO_LINKS;
export const MACRO_TOTAL = SHOTS.reduce((a, b) => a + b, 0) - LINKS.reduce((a, b) => a + b, 0);

const W = WIDTH;
const H = HEIGHT;

const PlateOr: React.FC<{id: PlateId; frame: number; dur: number; children: React.ReactNode}> = ({id, frame, dur, children}) => {
  const src = plate(id);
  if (!src) return <>{children}</>;
  const s = mix(1.0, 1.06, progress(frame, 0, dur, ease.soft));
  return (
    <AbsoluteFill style={{background: palette.black}}>
      <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})`}} />
    </AbsoluteFill>
  );
};

const Word: React.FC<{text: string; frame: number; x?: number}> = ({text, frame, x = 300}) =>
  text ? (
    <KineticTypography lines={[text]} frame={frame} start={6} x={x} y={300} size={80} weight={300} color={palette.textLight} tracking={[0.72, 0.56]} />
  ) : null;

const goldDefs = (id: string, cx: number, cy: number, r: number) => (
  <radialGradient id={id} cx={cx - r * 0.3} cy={cy - r * 0.35} r={r * 1.25} gradientUnits="userSpaceOnUse">
    <stop offset="0" stopColor={goldStops[3]} />
    <stop offset="0.35" stopColor={goldStops[2]} />
    <stop offset="0.7" stopColor={goldStops[1]} />
    <stop offset="1" stopColor={goldStops[0]} />
  </radialGradient>
);

// ---------------------------------------------------------------- 1. lid & edge
const LidEdge: React.FC<{f: Finish; dur: number}> = ({f, dur}) => {
  const frame = useCurrentFrame();
  const cx = 2620;
  const cy = 1880;
  const R = 1700;
  const cam = progress(frame, 0, dur, ease.soft);
  const sweep = progress(frame, 2, dur - 4, ease.cinematic);
  const sx = mix(cx - R * 1.3, cx + R * 1.1, sweep);
  return (
    <PlateOr id="macro-lid" frame={frame} dur={dur}>
      <AbsoluteFill style={{background: palette.ink}}>
        <AbsoluteFill style={{transform: `scale(${mix(1.0, 1.07, cam)}) rotate(${mix(-2, 2, cam)}deg)`, transformOrigin: `${cx}px ${cy}px`}}>
          <svg width={W} height={H}>
            <defs>
              <radialGradient id="m1-dome" cx={cx - R * 0.45} cy={cy - R * 0.6} r={R * 1.5} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={f.light} />
                <stop offset="0.4" stopColor={f.base} />
                <stop offset="1" stopColor={f.deep} />
              </radialGradient>
              {goldDefs('m1-gold', cx, cy, 240)}
              <linearGradient id="m1-sweep" gradientUnits="userSpaceOnUse" x1={sx - 420} y1={0} x2={sx + 420} y2={0} gradientTransform={`rotate(-20 ${sx} ${cy})`}>
                <stop offset="0" stopColor="#fff" stopOpacity={0} />
                <stop offset="0.5" stopColor="#fff" stopOpacity={0.5} />
                <stop offset="1" stopColor="#fff" stopOpacity={0} />
              </linearGradient>
              <clipPath id="m1-clip"><circle cx={cx} cy={cy} r={R} /></clipPath>
              <filter id="m1-b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={24} /></filter>
            </defs>
            <circle cx={cx + 40} cy={cy + 60} r={R} fill="#000" opacity={0.6} filter="url(#m1-b)" />
            <circle cx={cx} cy={cy} r={R} fill="url(#m1-dome)" />
            {/* Flange: steel lip + fine highlight */}
            <circle cx={cx} cy={cy} r={R - 34} fill="none" stroke={f.deep} strokeOpacity={0.55} strokeWidth={60} />
            <circle cx={cx} cy={cy} r={R - 4} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={5} />
            <circle cx={cx} cy={cy} r={R * 0.86} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={3} />
            {/* Knob */}
            <circle cx={cx + 30} cy={cy + 40} r={270} fill="#000" opacity={0.35} filter="url(#m1-b)" />
            <circle cx={cx} cy={cy} r={240} fill="url(#m1-gold)" />
            <circle cx={cx} cy={cy} r={180} fill="none" stroke="#fff" strokeOpacity={0.4} strokeWidth={3} />
            <circle cx={cx} cy={cy} r={236} fill="none" stroke={goldStops[0]} strokeOpacity={0.6} strokeWidth={5} />
            <g clipPath="url(#m1-clip)">
              <rect x={0} y={0} width={W} height={H} fill="url(#m1-sweep)" />
            </g>
          </svg>
        </AbsoluteFill>
        <Word text={copy.s05Words[0]} frame={frame} />
      </AbsoluteFill>
    </PlateOr>
  );
};

// ---------------------------------------------------------------- 2. handle connection
const HandleJoint: React.FC<{f: Finish; dur: number}> = ({f, dur}) => {
  const frame = useCurrentFrame();
  const cam = progress(frame, 0, dur, ease.soft);
  const tx = mix(60, -120, cam);
  const bodyR = 1500;
  const bx = 1150; // vessel wall edge
  const hy = 1240;
  const sweep = progress(frame, 0, dur, ease.cinematic);
  const sx = mix(-400, W + 400, sweep);
  const t0 = 330;
  const t1 = 420;
  const top = (x: number) => hy - mix(t0, t1, (x - bx) / (W - bx)) / 2 - (x - bx) * 0.09;
  const bot = (x: number) => hy + mix(t0, t1, (x - bx) / (W - bx)) / 2 - (x - bx) * 0.09;
  const fx0 = bx - 40;
  const fx1 = bx + 380;
  return (
    <PlateOr id="macro-handle" frame={frame} dur={dur}>
      <AbsoluteFill style={{background: '#101011'}}>
        <AbsoluteFill style={{transform: `translateX(${tx}px) scale(1.04)`}}>
          <svg width={W} height={H}>
            <defs>
              <linearGradient id="m2-body" gradientUnits="userSpaceOnUse" x1={bx - bodyR} y1={0} x2={bx} y2={0}>
                <stop offset="0" stopColor={f.dark} />
                <stop offset="0.45" stopColor={f.light} />
                <stop offset="0.75" stopColor={f.base} />
                <stop offset="0.95" stopColor={f.dark} />
                <stop offset="1" stopColor={f.deep} />
              </linearGradient>
              <linearGradient id="m2-handle" gradientUnits="userSpaceOnUse" x1={0} y1={hy - 280} x2={0} y2={hy + 160}>
                <stop offset="0" stopColor={f.handleLight} />
                <stop offset="0.4" stopColor={f.handle} />
                <stop offset="1" stopColor="#030303" />
              </linearGradient>
              <linearGradient id="m2-gold" gradientUnits="userSpaceOnUse" x1={0} y1={hy - 260} x2={0} y2={hy + 220}>
                <stop offset="0" stopColor={goldStops[3]} />
                <stop offset="0.25" stopColor={goldStops[2]} />
                <stop offset="0.55" stopColor={goldStops[4]} />
                <stop offset="1" stopColor={goldStops[0]} />
              </linearGradient>
              <linearGradient id="m2-sweep" gradientUnits="userSpaceOnUse" x1={sx - 380} y1={0} x2={sx + 380} y2={0}>
                <stop offset="0" stopColor="#fff" stopOpacity={0} />
                <stop offset="0.5" stopColor="#fff" stopOpacity={0.35} />
                <stop offset="1" stopColor="#fff" stopOpacity={0} />
              </linearGradient>
              <filter id="m2-b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={30} /></filter>
            </defs>
            {/* Vessel wall */}
            <rect x={bx - bodyR} y={-100} width={bodyR} height={H + 200} fill="url(#m2-body)" />
            <rect x={bx - 520} y={-100} width={70} height={H + 200} fill="#fff" opacity={f.sheen * 0.4} filter="url(#m2-b)" />
            {/* Handle shadow on the wall */}
            <path d={`M ${bx - 180} ${bot(bx) + 40} L ${bx} ${bot(bx)} L ${bx} ${bot(bx) + 160} Z`} fill="#000" opacity={0.35} filter="url(#m2-b)" />
            {/* Handle */}
            <path d={`M ${bx - 20} ${top(bx - 20)} L ${W + 200} ${top(W + 200)} L ${W + 200} ${bot(W + 200)} L ${bx - 20} ${bot(bx - 20)} Z`} fill="url(#m2-handle)" />
            <path d={`M ${bx} ${top(bx) + 6} L ${W + 200} ${top(W + 200) + 6}`} stroke="#fff" strokeOpacity={0.3} strokeWidth={5} />
            {/* Gold ferrule where handle meets body */}
            <path d={`M ${fx0} ${top(fx0) - 14} L ${fx1} ${top(fx1) - 14} L ${fx1} ${bot(fx1) + 14} L ${fx0} ${bot(fx0) + 14} Z`} fill="url(#m2-gold)" />
            <path d={`M ${fx1} ${top(fx1) - 14} L ${fx1} ${bot(fx1) + 14}`} stroke={goldStops[0]} strokeWidth={6} />
            <path d={`M ${fx1 - 8} ${top(fx1 - 8) - 12} L ${fx1 - 8} ${bot(fx1 - 8) + 12}`} stroke="#fff" strokeOpacity={0.45} strokeWidth={3} />
            <rect x={0} y={0} width={W} height={H} fill="url(#m2-sweep)" style={{mixBlendMode: 'screen'}} />
          </svg>
        </AbsoluteFill>
        <Word text={copy.s05Words[1]} frame={frame} x={2250} />
      </AbsoluteFill>
    </PlateOr>
  );
};

// ---------------------------------------------------------------- 3. cooking surface
export const SURFACE_CENTER = {x: 1920, y: 1180};
const Surface: React.FC<{f: Finish; dur: number}> = ({f, dur}) => {
  const frame = useCurrentFrame();
  const {x: cx, y: cy} = SURFACE_CENTER;
  const cam = progress(frame, 0, dur + 12, ease.soft);
  const s = mix(1.0, 1.1, cam);
  const reflect = progress(frame, 0, dur + 12, ease.cinematic);
  return (
    <PlateOr id="macro-interior" frame={frame} dur={dur}>
      <AbsoluteFill style={{background: '#0B0B0C'}}>
        <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${cx}px ${cy}px`}}>
          <svg width={W} height={H}>
            <defs>
              <radialGradient id="m3-floor" cx={cx - 500} cy={cy - 500} r={2600} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={f.interiorLight} />
                <stop offset="0.5" stopColor={f.interior} />
                <stop offset="1" stopColor="#060607" />
              </radialGradient>
              <linearGradient id="m3-wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0A0A0B" />
                <stop offset="0.7" stopColor={f.interiorLight} />
                <stop offset="1" stopColor={f.interior} />
              </linearGradient>
              <radialGradient id="m3-refl" cx={mix(cx - 1400, cx + 1400, reflect)} cy={cy - 380} r={900} gradientUnits="userSpaceOnUse" gradientTransform={`scale(1 0.45) translate(0 ${cy * 1.2})`}>
                <stop offset="0" stopColor="#fff" stopOpacity={0.16} />
                <stop offset="1" stopColor="#fff" stopOpacity={0} />
              </radialGradient>
              <SpeckleFilter id="m3-speck" density={0.55} seed={11} />
              <clipPath id="m3-clip"><ellipse cx={cx} cy={cy + 300} rx={2600} ry={1500} /></clipPath>
            </defs>
            {/* Curved inner wall at the far edge */}
            <rect x={0} y={0} width={W} height={H} fill="url(#m3-wall)" />
            <ellipse cx={cx} cy={cy + 300} rx={2600} ry={1500} fill="url(#m3-floor)" />
            <g clipPath="url(#m3-clip)">
              <rect x={0} y={0} width={W} height={H} filter="url(#m3-speck)" opacity={0.2} />
              {[500, 820, 1140, 1460].map((r) => (
                <ellipse key={r} cx={cx} cy={cy + 300} rx={r} ry={r * 0.577} fill="none" stroke="#fff" strokeOpacity={0.04} strokeWidth={3} />
              ))}
              <rect x={0} y={0} width={W} height={H} fill="url(#m3-refl)" />
            </g>
            <ellipse cx={cx} cy={cy + 300} rx={2600} ry={1500} fill="none" stroke="#fff" strokeOpacity={0.12} strokeWidth={4} />
          </svg>
        </AbsoluteFill>
      </AbsoluteFill>
    </PlateOr>
  );
};

// ---------------------------------------------------------------- 4. base & finish
const Base: React.FC<{f: Finish; dur: number}> = ({f, dur}) => {
  const frame = useCurrentFrame();
  const cx = 1920;
  const cy = 1080;
  const R = 1180;
  const cam = progress(frame, 0, dur, ease.soft);
  const rot = mix(8, -4, cam);
  const s = mix(1.08, 1.0, cam);
  const rings = Array.from({length: 64}, (_, i) => 120 + i * 11.5);
  const glint = progress(frame, 4, dur - 8, ease.cinematic);
  return (
    <PlateOr id="macro-base" frame={frame} dur={dur}>
      <AbsoluteFill style={{background: palette.black}}>
        <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${cx}px ${cy}px`}}>
          <svg width={W} height={H}>
            <defs>
              <linearGradient id="m4-steel" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#D8D6D2" />
                <stop offset="0.35" stopColor="#8F8D89" />
                <stop offset="0.5" stopColor="#C9C7C3" />
                <stop offset="0.75" stopColor="#6E6C69" />
                <stop offset="1" stopColor="#3C3B39" />
              </linearGradient>
              <radialGradient id="m4-enamel" cx={cx - R * 0.3} cy={cy - R * 0.35} r={R * 1.6} gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={f.light} />
                <stop offset="0.5" stopColor={f.base} />
                <stop offset="1" stopColor={f.deep} />
              </radialGradient>
              <path id="m4-text" d={`M ${cx - 1020} ${cy} A 1020 1020 0 1 1 ${cx + 1020} ${cy} A 1020 1020 0 1 1 ${cx - 1020} ${cy}`} />
              <filter id="m4-b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={40} /></filter>
            </defs>
            <circle cx={cx} cy={cy} r={R + 180} fill="url(#m4-enamel)" />
            <circle cx={cx} cy={cy} r={R + 176} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={4} />
            <g transform={`rotate(${rot} ${cx} ${cy})`}>
              <circle cx={cx} cy={cy} r={R - 60} fill="url(#m4-steel)" />
              {rings.map((r, i) => (
                <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={i % 2 ? '#000' : '#fff'} strokeOpacity={0.06} strokeWidth={2} />
              ))}
              <text fill="#000" fillOpacity={0.28} fontSize={54} letterSpacing={30} style={{fontFamily: FONT, fontWeight: 400}}>
                <textPath href="#m4-text" startOffset="0">
                  LUXURY PRIME · PRIMERA COLLECTION · LUXURY PRIME · PRIMERA COLLECTION ·
                </textPath>
              </text>
              <circle cx={cx} cy={cy} r={R - 60} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={6} />
            </g>
            <ellipse
              cx={mix(cx - R, cx + R, glint)}
              cy={mix(cy - R * 0.6, cy + R * 0.4, glint)}
              rx={380}
              ry={120}
              fill="#fff"
              opacity={0.28 * Math.sin(glint * Math.PI)}
              filter="url(#m4-b)"
              transform={`rotate(-35 ${cx} ${cy})`}
            />
          </svg>
        </AbsoluteFill>
        <Word text={copy.s05Words[3]} frame={frame} />
      </AbsoluteFill>
    </PlateOr>
  );
};

/** Four connected macro details. Frame 0 = start of the scene sequence. */
export const MacroDetailScene: React.FC<{finish?: Finish}> = ({finish = finishes.ivory}) => {
  const f = finish;
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SHOTS[0]}>
        <LidEdge f={f} dur={SHOTS[0]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={linearTiming({durationInFrames: LINKS[0], easing: ease.cinematic})} presentation={lightSweepWipe({angle: -20, tint: '#FFFFFF', soft: 14})} />
      <TransitionSeries.Sequence durationInFrames={SHOTS[1]}>
        <HandleJoint f={f} dur={SHOTS[1]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition timing={linearTiming({durationInFrames: LINKS[1], easing: ease.cinematic})} presentation={lightSweepWipe({angle: -5, tint: '#F4EBDD', soft: 14})} />
      <TransitionSeries.Sequence durationInFrames={SHOTS[2]}>
        <Surface f={f} dur={SHOTS[2]} />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        timing={linearTiming({durationInFrames: LINKS[2]})}
        presentation={circlePortal({cx: SURFACE_CENTER.x, cy: SURFACE_CENTER.y + 300, r0: 500, aspectFrom: 0.577, zoom: 3, rimColor: '#D9D6D0'})}
      />
      <TransitionSeries.Sequence durationInFrames={SHOTS[3]}>
        <Base f={f} dur={SHOTS[3]} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

