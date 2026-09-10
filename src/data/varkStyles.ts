import type { VarkStyleTile } from '../types';

/** Landing tiles from the 2026-09-09 design sync; blurbs are verbatim. */
export const VARK_STYLE_TILES: readonly VarkStyleTile[] = [
  { code: 'V', name: 'Visual', blurb: 'Charts, diagrams, seeing it demonstrated', dotClass: 'bg-vark-v' },
  { code: 'A', name: 'Auditory', blurb: 'Listening, discussion, verbal instructions', dotClass: 'bg-vark-a' },
  { code: 'R', name: 'Read/Write', blurb: 'Words, lists, written materials', dotClass: 'bg-vark-r' },
  { code: 'K', name: 'Kinesthetic', blurb: 'Doing, experiencing, hands-on practice', dotClass: 'bg-vark-k' },
];
