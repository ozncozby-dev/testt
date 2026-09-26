import {continueRender, delayRender, staticFile} from 'remotion';

/*
 * Inter (SIL OFL), self-hosted from /public/fonts so renders are deterministic and
 * work offline. Swap for a licensed Neue Haas Grotesk / Helvetica Neue by replacing
 * the files and FAMILY below.
 */
const FAMILY = 'LP Inter';
const WEIGHTS = ['200', '300', '400', '500'];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading Inter');
  Promise.all(
    WEIGHTS.map((w) => {
      const face = new FontFace(FAMILY, `url(${staticFile(`fonts/inter-latin-${w}-normal.woff2`)}) format('woff2')`, {weight: w});
      document.fonts.add(face);
      return face.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}

export const FONT = `"${FAMILY}", "Helvetica Neue", Helvetica, Arial, sans-serif`;

export const palette = {
  black: '#070708',
  ink: '#0E0E10',
  charcoal: '#1B1B1E',
  charcoalLift: '#2A2A2E',
  offWhite: '#F4F1EC',
  stone: '#E4DCCF',
  stoneDeep: '#CFC4B3',
  beige: '#D8CEBF',
  gold: '#B89B6A',
  goldLight: '#DCC69C',
  textDark: '#1D1C1A',
  textLight: '#EFEAE2',
};

/** Brushed gold-tone used for knobs, loop handles and ferrules. */
export const goldStops = ['#5E4726', '#9C7C47', '#D9BF8A', '#F1E2BD', '#C9A869', '#7D6135'];

export type FinishId = 'onyx' | 'sage' | 'granite' | 'ivory';

export interface Finish {
  id: FinishId;
  name: string;
  base: string;
  light: string;
  dark: string;
  deep: string;
  /** Specular strength 0-1: how glossy the enamel reads. */
  sheen: number;
  interior: string;
  interiorLight: string;
  handle: string;
  handleLight: string;
}

/**
 * PLACEHOLDER FINISHES — replace the hex values with colours sampled from the
 * real Primera SKUs (and add/remove entries) once product photography is supplied.
 */
export const finishes: Record<FinishId, Finish> = {
  onyx: {
    id: 'onyx', name: 'Onyx',
    base: '#26262A', light: '#6A6A70', dark: '#141416', deep: '#08080A', sheen: 0.55,
    interior: '#1A1A1C', interiorLight: '#3A3A3E', handle: '#1C1C1F', handleLight: '#4A4A50',
  },
  sage: {
    id: 'sage', name: 'Sage',
    base: '#8E9B87', light: '#B4C0AC', dark: '#6A7862', deep: '#47523F', sheen: 0.5,
    interior: '#232426', interiorLight: '#44464A', handle: '#2A2C2B', handleLight: '#5A5E5A',
  },
  granite: {
    id: 'granite', name: 'Granite',
    base: '#8C8984', light: '#B5B1AA', dark: '#686661', deep: '#44433F', sheen: 0.48,
    interior: '#222224', interiorLight: '#434347', handle: '#2A2A2C', handleLight: '#5B5B60',
  },
  ivory: {
    id: 'ivory', name: 'Ivory',
    base: '#E2D6C1', light: '#F1E9DA', dark: '#C2B39B', deep: '#998A71', sheen: 0.6,
    interior: '#232325', interiorLight: '#46464A', handle: '#2B2A28', handleLight: '#5E5B55',
  },
};

/** Every word on screen lives here. */
export const copy = {
  s01: 'PRECISION IN EVERY DETAIL',
  s02Title: 'PRIMERA',
  s02Sub: '7 PIECE COLLECTION',
  s03Title: 'YOUR KITCHEN. YOUR STYLE.',
  s03Sub: 'Available in multiple finishes',
  s04Lines: ['MORE PIECES.', 'MORE POSSIBILITIES.'],
  s04Title: 'PRIMERA',
  s04Sub: '9 PIECE COLLECTION',
  s05Words: ['CRAFTED', 'BALANCED', '', 'REFINED'],
  s06a: 'MADE FOR EVERYDAY MOMENTS',
  s06b: 'DESIGNED TO ELEVATE THEM.',
  brand: 'LUXURY PRIME',
  tagline: 'Elevate the Everyday.',
  /** Set to e.g. 'luxuryprime.ae' to show it under the tagline. Empty = hidden. */
  website: 'luxuryprime.ae',
};
