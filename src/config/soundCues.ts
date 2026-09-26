/**
 * Sound-design cue sheet, derived from the timeline + choreography so picture and
 * sound can never drift apart. Consumed by scripts/generate-soundtrack.mjs and useful
 * as a spotting list for a composer / sound designer.
 */
import {FPS, SCENES, TOTAL_FRAMES, TRANSITIONS, sceneTiming, toGlobal} from './timeline';
import {ASSEMBLY_7, COLOR_STEPS, FLATLAY_ENTRIES, LID_SEAT_AT, LOGO_AT, MACRO_LINKS, MACRO_SHOTS} from './choreography';

export type CueKind = 'shimmer' | 'whoosh' | 'place' | 'click' | 'tick' | 'swell' | 'rise' | 'chime';

export interface Cue {
  /** Seconds from film start. */
  t: number;
  kind: CueKind;
  dur?: number;
  gain?: number;
  pan?: number;
  note: string;
}

const sec = (frame: number) => frame / FPS;

export const buildCues = (): Cue[] => {
  const cues: Cue[] = [];

  // 01 — metallic reflection travelling across the rim (left -> right).
  cues.push({t: 0.12, kind: 'shimmer', dur: 2.8, gain: 1, pan: -0.5, note: 'S01 light travels the rim'});

  // Every scene boundary is a camera move: a soft whoosh centred on the cut.
  TRANSITIONS.forEach((tr, i) => {
    const cut = sceneTiming(SCENES[i + 1].id).globalStart;
    const dur = sec(tr.frames) + 0.5;
    cues.push({t: sec(cut) - dur * 0.6, kind: 'whoosh', dur, gain: tr.kind === 'circlePortal' ? 0.9 : 0.6, note: `T${i + 1} ${tr.kind}`});
  });

  // 02 — lids seat.
  Object.values(ASSEMBLY_7).forEach((e, i) => {
    if (e?.lidAt === undefined) return;
    const f = toGlobal('collectionForms', e.lidAt + (e.lidDuration ?? 30) * LID_SEAT_AT);
    cues.push({t: sec(f), kind: 'place', gain: 0.9, pan: [-0.35, 0.1, 0.4][i % 3], note: 'S02 lid seats'});
  });

  // 03 — each finish change is carried by a light band.
  COLOR_STEPS.slice(1).forEach((s) => {
    cues.push({t: sec(toGlobal('colorPersonality', s.at)), kind: 'shimmer', dur: 1.3, gain: 0.55, pan: -0.6, note: `S03 finish -> ${s.finish}`});
  });

  // 04 — precise lock-ins, then lids drop.
  Object.entries(FLATLAY_ENTRIES).forEach(([, e]) => {
    if (!e) return;
    cues.push({t: sec(toGlobal('morePossibilities', e.start + e.duration * 0.5)), kind: 'click', gain: 0.8, pan: 0.2, note: 'S04 piece locks'});
    if (e.lidAt !== undefined) {
      cues.push({t: sec(toGlobal('morePossibilities', e.lidAt + 9)), kind: 'place', gain: 0.7, note: 'S04 lid drops'});
    }
  });

  // 05 — geometric links between macro shots.
  const pre = sceneTiming('materialDetails').preRoll;
  let seqStart = 0;
  MACRO_LINKS.forEach((l, i) => {
    seqStart += MACRO_SHOTS[i] - l;
    const centre = seqStart + l / 2 - pre;
    cues.push({t: sec(toGlobal('materialDetails', centre)), kind: 'tick', gain: 0.7, note: `S05 link ${i + 1}`});
  });

  // 06 — warmth arrives.
  cues.push({t: sec(sceneTiming('productToHome').globalStart) - 0.4, kind: 'swell', dur: 4.5, gain: 0.7, note: 'S06 into the home'});

  // 07 — soft tonal rise, then the signature.
  const logo = toGlobal('brandSignature', LOGO_AT);
  cues.push({t: sec(logo) - 1.6, kind: 'rise', dur: 1.6, gain: 0.6, note: 'S07 rise before logo'});
  cues.push({t: sec(logo) + 0.05, kind: 'chime', dur: 3.5, gain: 0.9, note: 'S07 logo'});

  return cues.sort((a, b) => a.t - b.t);
};

export const FILM_SECONDS = TOTAL_FRAMES / FPS;
