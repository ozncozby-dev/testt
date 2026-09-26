import React from 'react';
import {FONT} from '../config/brand';
import {ease, mix, progress, range} from '../lib/motion';

export interface KineticTypographyProps {
  lines: string[];
  /** Scene-local frame. */
  frame: number;
  start: number;
  end?: number;
  x: number;
  y: number;
  size: number;
  weight?: number;
  color: string;
  align?: 'left' | 'center';
  /** Letter-spacing in em, animated from [0] to [1] (a slow, settling tighten). */
  tracking?: [number, number];
  lineHeight?: number;
  /** Frames between successive lines. */
  stagger?: number;
  opacity?: number;
  italic?: boolean;
}

/**
 * Premium kinetic type: masked vertical reveal per line, opacity and a slow tracking
 * settle. Lines move as whole units — letters are never animated individually.
 */
export const KineticTypography: React.FC<KineticTypographyProps> = ({
  lines,
  frame,
  start,
  end,
  x,
  y,
  size,
  weight = 300,
  color,
  align = 'left',
  tracking = [0.5, 0.4],
  lineHeight = 1.35,
  stagger = 8,
  opacity = 1,
  italic = false,
}) => {
  const exit = end === undefined ? 0 : progress(frame, end, 18, ease.depart);
  if (frame < start - 1 || exit >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: align === 'center' ? 'translateX(-50%)' : undefined,
        textAlign: align,
        fontFamily: FONT,
        fontWeight: weight,
        fontSize: size,
        fontStyle: italic ? 'italic' : 'normal',
        color,
        whiteSpace: 'nowrap',
        opacity: opacity * (1 - exit),
      }}
    >
      {lines.map((line, i) => {
        const s = start + i * stagger;
        const reveal = progress(frame, s, 26, ease.arrive);
        const track = mix(tracking[0], tracking[1], progress(frame, s, 70, ease.settle)) + exit * 0.06;
        return (
          <div key={i} style={{overflow: 'hidden', lineHeight, paddingBottom: '0.08em'}}>
            <div
              style={{
                transform: `translateY(${(1 - reveal) * 105 - exit * 22}%)`,
                opacity: range(frame, [s, s + 20], [0, 1]),
                letterSpacing: `${track}em`,
                // Keep optical centring when tracking is wide.
                marginRight: align === 'center' ? `-${track}em` : undefined,
              }}
            >
              {line || ' '}
            </div>
          </div>
        );
      })}
    </div>
  );
};
