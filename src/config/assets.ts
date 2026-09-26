import {getStaticFiles, staticFile} from 'remotion';
import type {FinishId} from './brand';
import type {PieceId} from '../components/cookware/pieces';

/**
 * ASSET SLOTS
 *
 * The film ships with procedural, studio-lit stand-ins for every product shot so it
 * renders end-to-end without photography. Drop real Luxury Prime assets into
 * /public/assets using the file names below and they replace the stand-ins
 * automatically — no code changes. Images are always drawn with object-fit:contain
 * (cut-outs) or cover (full-frame plates); they are never stretched.
 *
 *  Cut-outs (transparent PNG/WebP, product only, shot straight on, base at bottom edge):
 *    assets/pieces/side/<pieceId>-<finishId>.png   e.g. stockpot28-onyx.png
 *    assets/pieces/side/<pieceId>-lid-<finishId>.png   (optional separate lid)
 *    assets/pieces/top/<pieceId>-<finishId>.png    top-down, centred on the vessel
 *  Full-frame plates (JPG, 16:9, >= 3840px wide):
 *    assets/plates/kitchen.jpg        Scene 06 lifestyle environment
 *    assets/plates/macro-lid.jpg      Scene 05 detail 1
 *    assets/plates/macro-handle.jpg   Scene 05 detail 2
 *    assets/plates/macro-interior.jpg Scene 05 detail 3
 *    assets/plates/macro-base.jpg     Scene 05 detail 4
 *  Brand:
 *    assets/brand/logo.svg (or .png)  Luxury Prime logo mark for the end card
 *  Audio:
 *    audio/soundtrack.wav|mp3         Licensed / composed score. Falls back to the
 *                                     generated temp track audio/primera-temp.wav.
 */

const has = (path: string) => getStaticFiles().some((f) => f.name === path);

const firstExisting = (candidates: string[]): string | null => {
  const hit = candidates.find(has);
  return hit ? staticFile(hit) : null;
};

const imgExt = ['png', 'webp'];
const plateExt = ['jpg', 'jpeg', 'png', 'webp'];

export const pieceCutout = (view: 'side' | 'top', piece: PieceId, finish: FinishId) =>
  firstExisting(imgExt.map((e) => `assets/pieces/${view}/${piece}-${finish}.${e}`));

export const lidCutout = (piece: PieceId, finish: FinishId) =>
  firstExisting(imgExt.map((e) => `assets/pieces/side/${piece}-lid-${finish}.${e}`));

export type PlateId = 'kitchen' | 'macro-lid' | 'macro-handle' | 'macro-interior' | 'macro-base';

export const plate = (id: PlateId) => firstExisting(plateExt.map((e) => `assets/plates/${id}.${e}`));

export const logoAsset = () => firstExisting(['svg', 'png', 'webp'].map((e) => `assets/brand/logo.${e}`));

export const soundtrackAsset = () =>
  firstExisting(['audio/soundtrack.wav', 'audio/soundtrack.mp3', 'audio/primera-temp.wav']);
