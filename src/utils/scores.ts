import { questions } from '../data/questions';
import type { VarkScores, VarkStyle, ScoreSummary } from '../types';

const VARK_ORDER: VarkStyle[] = ['V', 'A', 'R', 'K'];

const STYLE_NAMES: Record<VarkStyle, string> = {
  V: 'Visual',
  A: 'Auditory',
  R: 'Read/Write',
  K: 'Kinesthetic',
};

const SINGLE_STYLE_BLURBS: Record<VarkStyle, string> = {
  V: 'You process fastest through images, diagrams and layout. Ask your AI for charts, mind maps and visual metaphors.',
  A: 'You hold on to what you hear and say. Ask your AI to explain conversationally and to talk things through as a dialogue.',
  R: 'Words on a page are your medium. Ask your AI for structured text, lists, definitions and written summaries.',
  K: 'You learn by doing. Ask your AI for worked examples, step-by-step exercises and real-world cases.',
};

const NO_ANSWERS_HEADLINE = 'No answers yet.';
const NO_ANSWERS_BLURB =
  'Go back and pick the answers that sound like you. Skipped questions are fine; the profile needs at least one selection.';
const MULTIMODAL_BLURB =
  'You switch modes depending on the task. Ask your AI to mix formats: a diagram, then a worked example, then a written summary.';

export function calculateScores(answers: Record<number, string[]>): VarkScores {
  const scores: VarkScores = { V: 0, A: 0, R: 0, K: 0 };

  Object.entries(answers).forEach(([questionId, selectedOptionIds]) => {
    const question = questions.find((q) => q.id === parseInt(questionId, 10));
    if (!question) {
      return;
    }

    selectedOptionIds.forEach((optionId) => {
      const option = question.options.find((o) => o.id === optionId);
      if (option) {
        scores[option.type] += 1;
      }
    });
  });

  return scores;
}

export function getDominantStyles(scores: VarkScores): VarkStyle[] {
  const max = Math.max(scores.V, scores.A, scores.R, scores.K);
  if (max === 0) {
    return [];
  }

  return VARK_ORDER.filter((style) => scores[style] === max);
}

function buildStyleRows(scores: VarkScores): ScoreSummary['styles'] {
  const total = scores.V + scores.A + scores.R + scores.K;
  const max = Math.max(scores.V, scores.A, scores.R, scores.K);

  return VARK_ORDER.map((code) => {
    const value = scores[code];
    const pct = total === 0 ? 0 : Math.round((value / total) * 100);
    const barPct = max === 0 ? 0 : Math.round((value / max) * 100);

    return {
      code,
      name: STYLE_NAMES[code],
      value,
      pct,
      barPct,
    };
  });
}

function buildHeadline(dominant: VarkStyle[]): string {
  if (dominant.length === 0) {
    return NO_ANSWERS_HEADLINE;
  }

  if (dominant.length === 1) {
    return `You lean ${STYLE_NAMES[dominant[0]]}.`;
  }

  const names = dominant.map((style) => STYLE_NAMES[style]).join(' & ');
  return `You're multimodal: ${names}.`;
}

function buildBlurb(dominant: VarkStyle[]): string {
  if (dominant.length === 0) {
    return NO_ANSWERS_BLURB;
  }

  if (dominant.length === 1) {
    return SINGLE_STYLE_BLURBS[dominant[0]];
  }

  return MULTIMODAL_BLURB;
}

export function summarizeScores(scores: VarkScores): ScoreSummary {
  const dominant = getDominantStyles(scores);

  return {
    headline: buildHeadline(dominant),
    blurb: buildBlurb(dominant),
    styles: buildStyleRows(scores),
  };
}

export function encodeScores(scores: VarkScores): string {
  const scoresString = `${scores.V}-${scores.A}-${scores.R}-${scores.K}`;
  return btoa(scoresString).replace(/=/g, '');
}

function parseScorePart(part: string): number | null {
  if (!/^\d+$/.test(part)) {
    return null;
  }

  const value = Number(part);
  if (value < 0 || value > 13) {
    return null;
  }

  return value;
}

export function decodeScores(hash: string): VarkScores | null {
  let decoded: string;

  try {
    decoded = atob(hash);
  } catch {
    return null;
  }

  const parts = decoded.split('-');
  if (parts.length !== 4) {
    return null;
  }

  const values = parts.map(parseScorePart);
  if (values.some((value) => value === null)) {
    return null;
  }

  const [V, A, R, K] = values as [number, number, number, number];
  return { V, A, R, K };
}
