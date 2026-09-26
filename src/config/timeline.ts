/**
 * Central timeline. Every scene length, transition and sound cue derives from here.
 * Change `seconds` on a scene or `frames` on a transition and the whole film re-flows.
 *
 * Transitions overlap the boundary between two scenes symmetrically: half of the
 * transition happens before the nominal cut point, half after. Scene components receive
 * a `preRoll` so that their local frame 0 is always the nominal scene start.
 *
 * NOTE: keep this file free of React/Remotion imports — the soundtrack generator
 * (scripts/generate-soundtrack.mjs) bundles and evaluates it in plain Node.
 */

export const FPS = 30;
export const WIDTH = 3840;
export const HEIGHT = 2160;

export type SceneId =
  | 'firstLight'
  | 'collectionForms'
  | 'colorPersonality'
  | 'morePossibilities'
  | 'materialDetails'
  | 'productToHome'
  | 'brandSignature';

export type TransitionSpec =
  | {
      kind: 'circlePortal';
      frames: number;
      /** Portal centre in outgoing-scene canvas pixels. */
      cx: number;
      cy: number;
      /** Radius of the circular object the camera flies through, at the cut. */
      r0: number;
      /** ry/rx at the start — < 1 when the circle is seen in perspective (a lid). */
      aspectFrom?: number;
      /** How far the outgoing camera pushes in. */
      zoom?: number;
      rimColor?: string;
    }
  | {kind: 'lightSweep'; frames: number; angle: number; tint: string}
  | {kind: 'depthDissolve'; frames: number; direction: 'push' | 'pull'};

export interface SceneSpec {
  id: SceneId;
  label: string;
  seconds: number;
}

export const SCENES: SceneSpec[] = [
  {id: 'firstLight', label: '01 The First Light', seconds: 3},
  {id: 'collectionForms', label: '02 The Collection Forms', seconds: 6},
  {id: 'colorPersonality', label: '03 Colour as Personality', seconds: 6},
  {id: 'morePossibilities', label: '04 More Possibilities', seconds: 6},
  {id: 'materialDetails', label: '05 Material Details', seconds: 5},
  {id: 'productToHome', label: '06 From Product to Home', seconds: 5},
  {id: 'brandSignature', label: '07 Brand Signature', seconds: 4},
];

/** TRANSITIONS[i] joins SCENES[i] -> SCENES[i + 1]. Frame counts must be even. */
export const TRANSITIONS: TransitionSpec[] = [
  // 01 -> 02: fly through the rim of the lid seen in the dark.
  {kind: 'circlePortal', frames: 24, cx: 2560, cy: 1180, r0: 1250 * 1.1, zoom: 3.2, rimColor: '#E9DCC0'},
  // 02 -> 03: object match-cut through the stockpot lid (seen in perspective).
  {kind: 'circlePortal', frames: 24, cx: 1905, cy: 1010, r0: 470, aspectFrom: 0.2, zoom: 5, rimColor: '#FFFFFF'},
  // 03 -> 04: camera rises from eye level to overhead while pieces expand outward.
  {kind: 'depthDissolve', frames: 20, direction: 'push'},
  // 04 -> 05: through the stockpot lid (top view — a true circle) into the macro world.
  {kind: 'circlePortal', frames: 18, cx: 2410, cy: 1330, r0: 300, zoom: 6, rimColor: '#D9C39A'},
  // 05 -> 06: warm sunlight sweeps the studio away and reveals the kitchen.
  {kind: 'lightSweep', frames: 22, angle: 18, tint: '#FFE9C7'},
  // 06 -> 07: camera pulls back into the quiet studio.
  {kind: 'depthDissolve', frames: 20, direction: 'pull'},
];

export const sceneFrames = SCENES.map((s) => Math.round(s.seconds * FPS));
export const TOTAL_FRAMES = sceneFrames.reduce((a, b) => a + b, 0);

export interface SceneTiming {
  index: number;
  /** Frames of the incoming transition that play before the nominal scene start. */
  preRoll: number;
  /** Nominal scene length. */
  frames: number;
  /** Sequence length inside the TransitionSeries (nominal + half of each adjacent transition). */
  duration: number;
  /** Nominal global start frame. */
  globalStart: number;
}

export const sceneTiming = (id: SceneId): SceneTiming => {
  const index = SCENES.findIndex((s) => s.id === id);
  const before = TRANSITIONS[index - 1]?.frames ?? 0;
  const after = TRANSITIONS[index]?.frames ?? 0;
  const globalStart = sceneFrames.slice(0, index).reduce((a, b) => a + b, 0);
  return {
    index,
    preRoll: before / 2,
    frames: sceneFrames[index],
    duration: sceneFrames[index] + before / 2 + after / 2,
    globalStart,
  };
};

/** Convert a scene-local frame (0 = nominal scene start) to a global frame. */
export const toGlobal = (id: SceneId, localFrame: number) => sceneTiming(id).globalStart + localFrame;
