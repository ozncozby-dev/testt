import React from 'react';
import {AbsoluteFill} from 'remotion';
import {linearTiming, type TransitionPresentation, type TransitionPresentationComponentProps} from '@remotion/transitions';
import {HEIGHT, WIDTH, type TransitionSpec} from '../config/timeline';
import {ease, mix, range} from '../lib/motion';

/*
 * Custom camera transitions. None of them is a plain cross-fade: each one is a single
 * continuous camera move shared by the outgoing and the incoming shot.
 */

// ---------------------------------------------------------------- circle portal
type PortalProps = {cx: number; cy: number; r0: number; aspectFrom: number; zoom: number; rimColor: string};

const CirclePortalView: React.FC<TransitionPresentationComponentProps<PortalProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: {cx, cy, r0, aspectFrom, zoom, rimColor},
}) => {
  // Accelerating push through the object (camera "flies through" the circle).
  const push = Math.pow(p, 2.2);
  const s = mix(1, zoom, push);
  if (presentationDirection === 'exiting') {
    return (
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${cx}px ${cy}px`}}>{children}</AbsoluteFill>
    );
  }
  const rx = r0 * s;
  const aspect = mix(aspectFrom, 1, range(p, [0, 0.75], [0, 1], ease.soft));
  const ry = rx * aspect;
  const inOpacity = range(p, [0, 0.45], [0, 1], ease.soft);
  const settle = mix(1.14, 1, ease.arrive(p));
  const rimOpacity = range(p, [0, 0.15, 0.75, 1], [0, 0.85, 0.35, 0]);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: `ellipse(${rx}px ${ry}px at ${cx}px ${cy}px)`,
          opacity: inOpacity,
        }}
      >
        <AbsoluteFill style={{transform: `scale(${settle})`, transformOrigin: `${cx}px ${cy}px`}}>{children}</AbsoluteFill>
      </AbsoluteFill>
      <svg width={WIDTH} height={HEIGHT} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        <defs>
          <filter id="portal-rim-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={6} />
          </filter>
        </defs>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={rimColor} strokeWidth={10 + s * 2} opacity={rimOpacity * 0.5} filter="url(#portal-rim-blur)" />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={rimColor} strokeWidth={3} opacity={rimOpacity} />
      </svg>
    </AbsoluteFill>
  );
};

export const circlePortal = (props: PortalProps): TransitionPresentation<PortalProps> => ({component: CirclePortalView, props});

// ---------------------------------------------------------------- light sweep wipe
type SweepProps = {angle: number; tint: string; soft: number};

const LightSweepView: React.FC<TransitionPresentationComponentProps<SweepProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: {angle, tint, soft},
}) => {
  const edge = mix(-soft - 5, 100 + soft + 5, p);
  const dir = 90 + angle;
  if (presentationDirection === 'exiting') {
    // Outgoing shot drifts on, slightly over-exposed as the light reaches it.
    return (
      <AbsoluteFill style={{transform: `scale(${mix(1, 1.04, p)})`, filter: `brightness(${mix(1, 1.25, p)})`}}>{children}</AbsoluteFill>
    );
  }
  const mask = `linear-gradient(${dir}deg, #000 ${edge - soft}%, transparent ${edge}%)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask}}>
        <AbsoluteFill style={{transform: `scale(${mix(1.05, 1, p)})`}}>{children}</AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(${dir}deg, transparent ${edge - soft * 1.2}%, ${tint} ${edge - soft * 0.45}%, transparent ${edge + soft * 0.3}%)`,
          mixBlendMode: 'screen',
          opacity: range(p, [0, 0.12, 0.85, 1], [0, 0.9, 0.9, 0]),
        }}
      />
    </AbsoluteFill>
  );
};

export const lightSweepWipe = (props: SweepProps): TransitionPresentation<SweepProps> => ({component: LightSweepView, props});

// ---------------------------------------------------------------- depth dissolve
type DepthProps = {direction: 'push' | 'pull'; blur: number};

const DepthDissolveView: React.FC<TransitionPresentationComponentProps<DepthProps>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
  passedProps: {direction, blur},
}) => {
  const k = direction === 'push' ? 1 : -1;
  if (presentationDirection === 'exiting') {
    const q = ease.depart(p);
    return (
      <AbsoluteFill style={{transform: `scale(${1 + 0.1 * k * q})`, filter: `blur(${blur * q}px)`, opacity: 1 - range(p, [0.25, 1], [0, 1])}}>
        {children}
      </AbsoluteFill>
    );
  }
  const q = ease.arrive(p);
  return (
    <AbsoluteFill style={{transform: `scale(${1 - 0.07 * k * (1 - q)})`, filter: `blur(${blur * (1 - q)}px)`, opacity: range(p, [0, 0.6], [0, 1], ease.soft)}}>
      {children}
    </AbsoluteFill>
  );
};

export const depthDissolve = (props: DepthProps): TransitionPresentation<DepthProps> => ({component: DepthDissolveView, props});

// ---------------------------------------------------------------- factory
/** Build the presentation + timing pair for a timeline TransitionSpec. */
export const transitionFor = (spec: TransitionSpec) => {
  const timing = linearTiming({durationInFrames: spec.frames});
  switch (spec.kind) {
    case 'circlePortal':
      return {
        timing,
        presentation: circlePortal({
          cx: spec.cx,
          cy: spec.cy,
          r0: spec.r0,
          aspectFrom: spec.aspectFrom ?? 1,
          zoom: spec.zoom ?? 4,
          rimColor: spec.rimColor ?? '#FFFFFF',
        }) as unknown as TransitionPresentation<Record<string, unknown>>,
      };
    case 'lightSweep':
      return {timing, presentation: lightSweepWipe({angle: spec.angle, tint: spec.tint, soft: 22}) as unknown as TransitionPresentation<Record<string, unknown>>};
    case 'depthDissolve':
      return {timing, presentation: depthDissolve({direction: spec.direction, blur: 18}) as unknown as TransitionPresentation<Record<string, unknown>>};
  }
};
