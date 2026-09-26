import React from 'react';
import {AbsoluteFill} from 'remotion';
import type {Finish} from '../config/brand';
import type {Slot} from '../config/layouts';
import type {Entry} from '../config/choreography';
import {ease, mix, precisionSettle, progress, range} from '../lib/motion';
import {CookwareSide} from './cookware/CookwareSide';
import {CookwareTop} from './cookware/CookwareTop';
import type {Sweep} from './cookware/materials';
import {PIECES, type PieceId} from './cookware/pieces';

/**
 * Entry choreography: `from` is the offset the piece starts at relative to its slot
 * (ds < 0 = further away, > 0 = nearer camera); `lidAt` is when the lid seats/drops.
 */
export type EntrySpec = Entry;

export interface ProductAssemblyProps {
  slots: Slot[];
  finish: Finish;
  frame: number;
  tilt: number;
  uid: string;
  /** Per-piece entry choreography. Omit for a settled composition. */
  entries?: Partial<Record<PieceId, EntrySpec>>;
  /** Horizontal camera offset used for depth parallax (px). */
  camX?: number;
  sweep?: Sweep | null;
  /** Outward drift away from a centre point: 0 = none. */
  expand?: {x: number; y: number; amount: number};
  shadowOpacity?: number;
  /** Max depth-of-field blur for pieces travelling in depth. */
  dof?: number;
}

const LID_FLOAT = 340;

/**
 * Places Primera pieces into a composition and choreographs their arrival from
 * different depths. Works for side-view hero sets and overhead flat-lays.
 */
export const ProductAssembly: React.FC<ProductAssemblyProps> = ({
  slots,
  finish,
  frame,
  tilt,
  uid,
  entries,
  camX = 0,
  sweep = null,
  expand,
  shadowOpacity,
  dof = 70,
}) => {
  const ordered = slots
    .map((slot, i) => ({slot, i}))
    .sort((a, b) => {
      if (a.slot.view === 'top' && entries) {
        return (entries[a.slot.piece]?.start ?? 0) - (entries[b.slot.piece]?.start ?? 0);
      }
      const za = a.slot.view === 'upright' ? -1 : a.slot.y;
      const zb = b.slot.view === 'upright' ? -1 : b.slot.y;
      return za - zb;
    });

  return (
    <AbsoluteFill>
      {ordered.map(({slot, i}) => {
        const e = entries?.[slot.piece];
        let t = 1;
        if (e) {
          t = e.motion === 'precision' ? precisionSettle(frame, e.start, e.duration) : progress(frame, e.start, e.duration, ease.arrive);
        }
        const inv = 1 - t;
        const dx = (e?.from.dx ?? 0) * inv;
        const dy = (e?.from.dy ?? 0) * inv;
        const ds = (e?.from.ds ?? 0) * inv;
        const rot = (e?.from.rot ?? 0) * inv;
        const parallax = camX * (slot.depth - 0.8) * 2;
        let x = slot.x + dx + parallax;
        let y = slot.y + dy;
        if (expand && expand.amount) {
          x += (slot.x - expand.x) * expand.amount;
          y += (slot.y - expand.y) * expand.amount * 0.6;
        }
        const scale = slot.scale * (1 + ds);
        const blur = Math.min(Math.abs(ds) * dof * 1.6, dof);
        const opacity = e ? range(frame, [e.start - 1, e.start + Math.min(14, e.duration * 0.4)], [0, 1]) : 1;
        const key = `${uid}-${i}`;

        const spec = PIECES[slot.piece];
        if (slot.view === 'side') {
          let lidLift: number | null = spec.lid ? 0 : null;
          let lidOpacity = 1;
          if (spec.lid && e?.lidAt !== undefined) {
            const seat = progress(frame, e.lidAt, e.lidDuration ?? 30, ease.settle);
            const float = mix(LID_FLOAT + 90, LID_FLOAT, progress(frame, e.start, e.lidAt - e.start, ease.soft));
            lidLift = mix(float, 0, seat);
            lidOpacity = range(frame, [e.start + 8, e.start + 28], [0, 1]);
          }
          return (
            <CookwareSide
              key={key}
              uid={key}
              piece={slot.piece}
              finish={finish}
              tilt={tilt}
              placement={{x, y, scale}}
              handleSide={slot.handleSide}
              lidLift={lidLift}
              lidOpacity={lidOpacity}
              sweep={sweep}
              blur={blur}
              opacity={opacity}
              rotate={rot}
              shadowOpacity={(shadowOpacity ?? 0.34) * t}
            />
          );
        }

        let lidScale: number | null = null;
        let lidOpacity = 1;
        if (slot.view === 'top' && spec.lid) {
          lidScale = 1;
          if (e?.lidAt !== undefined) {
            const k = precisionSettle(frame, e.lidAt, e.lidDuration ?? 20);
            lidScale = mix(1.25, 1, k);
            lidOpacity = range(frame, [e.lidAt, e.lidAt + 4], [0, 1]);
          }
        }
        return (
          <CookwareTop
            key={key}
            uid={key}
            piece={slot.piece}
            finish={finish}
            placement={{x, y, scale}}
            angle={(slot.angle ?? 0) + rot}
            lidScale={lidScale}
            lidOpacity={lidOpacity}
            blur={blur}
            opacity={opacity}
            shadowOpacity={slot.view === 'upright' ? 0.18 : shadowOpacity ?? 0.55}
          />
        );
      })}
    </AbsoluteFill>
  );
};
