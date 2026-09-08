import { describe, it, expect } from 'vitest';
import {
  calculateScores,
  getDominantStyles,
  summarizeScores,
  encodeScores,
  decodeScores,
} from '../scores';
import type { VarkScores } from '../../types';

describe('calculateScores', () => {
  it('tallies multi-question multi-select answers from real option IDs', () => {
    const answers = {
      1: ['1V', '1A'],
      2: ['2V', '2K'],
      3: ['3R'],
    };

    expect(calculateScores(answers)).toEqual({ V: 2, A: 1, R: 1, K: 1 });
  });

  it('ignores unknown question keys and option IDs', () => {
    const answers = {
      1: ['1V', 'not-an-option'],
      999: ['1V'],
      2: ['2A'],
    };

    expect(calculateScores(answers)).toEqual({ V: 1, A: 1, R: 0, K: 0 });
  });

  it('returns zero scores for empty answers', () => {
    expect(calculateScores({})).toEqual({ V: 0, A: 0, R: 0, K: 0 });
  });
});

describe('getDominantStyles', () => {
  it('returns an empty array when all scores are zero', () => {
    expect(getDominantStyles({ V: 0, A: 0, R: 0, K: 0 })).toEqual([]);
  });

  it('returns a single dominant style', () => {
    expect(getDominantStyles({ V: 5, A: 2, R: 1, K: 0 })).toEqual(['V']);
  });

  it('returns tied styles in stable V, A, R, K order', () => {
    expect(getDominantStyles({ V: 5, A: 5, R: 1, K: 0 })).toEqual(['V', 'A']);
  });
});

describe('summarizeScores', () => {
  it('returns exact no-answers copy and zero pct/bar math', () => {
    const summary = summarizeScores({ V: 0, A: 0, R: 0, K: 0 });

    expect(summary.headline).toBe('No answers yet.');
    expect(summary.blurb).toBe(
      'Go back and pick the answers that sound like you. Skipped questions are fine; the profile needs at least one selection.',
    );
    expect(summary.styles).toEqual([
      { code: 'V', name: 'Visual', value: 0, pct: 0, barPct: 0 },
      { code: 'A', name: 'Auditory', value: 0, pct: 0, barPct: 0 },
      { code: 'R', name: 'Read/Write', value: 0, pct: 0, barPct: 0 },
      { code: 'K', name: 'Kinesthetic', value: 0, pct: 0, barPct: 0 },
    ]);
  });

  it('returns exact single Visual copy and pct/bar math', () => {
    const summary = summarizeScores({ V: 9, A: 2, R: 1, K: 1 });

    expect(summary.headline).toBe('You lean Visual.');
    expect(summary.blurb).toBe(
      'You process fastest through images, diagrams and layout. Ask your AI for charts, mind maps and visual metaphors.',
    );
    expect(summary.styles).toEqual([
      { code: 'V', name: 'Visual', value: 9, pct: 69, barPct: 100 },
      { code: 'A', name: 'Auditory', value: 2, pct: 15, barPct: 22 },
      { code: 'R', name: 'Read/Write', value: 1, pct: 8, barPct: 11 },
      { code: 'K', name: 'Kinesthetic', value: 1, pct: 8, barPct: 11 },
    ]);
  });

  it('returns exact Visual and Auditory tie copy and pct/bar math', () => {
    const summary = summarizeScores({ V: 6, A: 6, R: 1, K: 0 });

    expect(summary.headline).toBe("You're multimodal: Visual & Auditory.");
    expect(summary.blurb).toBe(
      'You switch modes depending on the task. Ask your AI to mix formats: a diagram, then a worked example, then a written summary.',
    );
    expect(summary.styles).toEqual([
      { code: 'V', name: 'Visual', value: 6, pct: 46, barPct: 100 },
      { code: 'A', name: 'Auditory', value: 6, pct: 46, barPct: 100 },
      { code: 'R', name: 'Read/Write', value: 1, pct: 8, barPct: 17 },
      { code: 'K', name: 'Kinesthetic', value: 0, pct: 0, barPct: 0 },
    ]);
  });
});

describe('encodeScores and decodeScores', () => {
  const sampleScores: VarkScores = { V: 9, A: 2, R: 1, K: 1 };

  it('encodes scores in the share-link compatibility format', () => {
    expect(encodeScores(sampleScores)).toBe('OS0yLTEtMQ');
  });

  it('decodes the compatibility hash', () => {
    expect(decodeScores('OS0yLTEtMQ')).toEqual(sampleScores);
  });

  it('round-trips encoded scores', () => {
    const scores: VarkScores = { V: 4, A: 3, R: 2, K: 1 };
    expect(decodeScores(encodeScores(scores))).toEqual(scores);
  });

  it('rejects malformed base64', () => {
    expect(decodeScores('!!!not-base64!!!')).toBeNull();
  });

  it('rejects wrong part count', () => {
    expect(decodeScores(btoa('9-2-1').replace(/=/g, ''))).toBeNull();
  });

  it('rejects non-numeric values', () => {
    expect(decodeScores(btoa('9-2-x-1').replace(/=/g, ''))).toBeNull();
  });

  it('rejects fractional values', () => {
    expect(decodeScores(btoa('9-2.5-1-1').replace(/=/g, ''))).toBeNull();
  });

  it('rejects negative values', () => {
    expect(decodeScores(btoa('-1-2-1-1').replace(/=/g, ''))).toBeNull();
  });

  it('rejects values greater than 13', () => {
    expect(decodeScores(btoa('14-2-1-1').replace(/=/g, ''))).toBeNull();
  });
});
