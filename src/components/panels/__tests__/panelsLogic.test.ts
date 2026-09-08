import { describe, it, expect } from 'vitest';
import {
  countAnsweredQuestions,
  parseRouteState,
  parseKeyboardCommand,
  clampQuestionIndex,
  getProgressPct,
  getCollapsedPanelGap,
  getPanelSaturation,
  getResultsEyebrow,
  getPromptsEyebrow,
  scoresHaveSelections,
} from '../panelsLogic';

describe('countAnsweredQuestions', () => {
  it('counts only questions with at least one selection', () => {
    const answers = {
      0: ['1V'],
      1: [],
      2: ['2A', '2R'],
      3: [],
      5: ['6K'],
    };

    expect(countAnsweredQuestions(answers)).toBe(3);
  });

  it('returns 0 for empty answers', () => {
    expect(countAnsweredQuestions({})).toBe(0);
  });
});

describe('parseRouteState', () => {
  it('maps / to landing (-1, quiz view)', () => {
    expect(parseRouteState('/', 5)).toEqual({ active: -1, view: 'quiz', isShared: false });
  });

  it('maps /quiz to clamped current question 0–12', () => {
    expect(parseRouteState('/quiz', -1)).toEqual({ active: 0, view: 'quiz', isShared: false });
    expect(parseRouteState('/quiz', 5)).toEqual({ active: 5, view: 'quiz', isShared: false });
    expect(parseRouteState('/quiz', 12)).toEqual({ active: 12, view: 'quiz', isShared: false });
    expect(parseRouteState('/quiz', 99)).toEqual({ active: 12, view: 'quiz', isShared: false });
    expect(parseRouteState('/quiz', -5)).toEqual({ active: 0, view: 'quiz', isShared: false });
  });

  it('maps /results to 13/quiz', () => {
    expect(parseRouteState('/results', 0)).toEqual({ active: 13, view: 'quiz', isShared: false });
  });

  it('maps /r/:hash to 13/quiz shared', () => {
    expect(parseRouteState('/r/OS0yLTEtMQ', 0)).toEqual({
      active: 13,
      view: 'quiz',
      isShared: true,
      hash: 'OS0yLTEtMQ',
    });
  });

  it('maps /prompts to 13/prompts', () => {
    expect(parseRouteState('/prompts', 0)).toEqual({ active: 13, view: 'prompts', isShared: false });
  });

  it('maps /r/:hash/prompts to 13/prompts shared', () => {
    expect(parseRouteState('/r/OS0yLTEtMQ/prompts', 0)).toEqual({
      active: 13,
      view: 'prompts',
      isShared: true,
      hash: 'OS0yLTEtMQ',
    });
  });
});

describe('parseKeyboardCommand', () => {
  it('toggles 1–4 only while active 0–12', () => {
    expect(parseKeyboardCommand('1', 0)).toBe('toggle-1');
    expect(parseKeyboardCommand('2', 5)).toBe('toggle-2');
    expect(parseKeyboardCommand('3', 12)).toBe('toggle-3');
    expect(parseKeyboardCommand('4', 7)).toBe('toggle-4');
    expect(parseKeyboardCommand('1', -1)).toBeNull();
    expect(parseKeyboardCommand('2', 13)).toBeNull();
  });

  it('maps Enter and ArrowRight to next', () => {
    expect(parseKeyboardCommand('Enter', -1)).toBe('next');
    expect(parseKeyboardCommand('ArrowRight', 5)).toBe('next');
  });

  it('maps ArrowLeft to previous', () => {
    expect(parseKeyboardCommand('ArrowLeft', 5)).toBe('previous');
  });

  it('maps Space to skip', () => {
    expect(parseKeyboardCommand(' ', 5)).toBe('skip');
  });

  it('returns null for unrelated keys', () => {
    expect(parseKeyboardCommand('a', 5)).toBeNull();
    expect(parseKeyboardCommand('Escape', 5)).toBeNull();
    expect(parseKeyboardCommand('Tab', 0)).toBeNull();
  });
});

describe('clampQuestionIndex', () => {
  it('clamps to 0–12', () => {
    expect(clampQuestionIndex(-1)).toBe(0);
    expect(clampQuestionIndex(0)).toBe(0);
    expect(clampQuestionIndex(12)).toBe(12);
    expect(clampQuestionIndex(20)).toBe(12);
  });
});

describe('getProgressPct', () => {
  it('computes round(max(0, active+1)/14*100)', () => {
    expect(getProgressPct(-1)).toBe(0);
    expect(getProgressPct(0)).toBe(7);
    expect(getProgressPct(12)).toBe(93);
    expect(getProgressPct(13)).toBe(100);
  });
});

describe('getCollapsedPanelGap', () => {
  it('returns 8 on mobile', () => {
    expect(getCollapsedPanelGap(1200, true)).toBe(8);
  });

  it('caps desktop gap at 10px on wide viewports', () => {
    expect(getCollapsedPanelGap(2000, false)).toBe(10);
    expect(getCollapsedPanelGap(1600, false)).toBe(10);
  });

  it('scales desktop gap between 4 and 10px on narrower desktop widths', () => {
    expect(getCollapsedPanelGap(1100, false)).toBe(4);
    expect(getCollapsedPanelGap(1300, false)).toBe(9);
  });
});

describe('getPanelSaturation', () => {
  const answers = { 1: ['1V'] };

  it('desaturates results panel when hasAnswers is false', () => {
    expect(getPanelSaturation(13, answers, false, false)).toBe(0.3);
    expect(getPanelSaturation(13, answers, false, true)).toBe(0.3);
  });

  it('saturates results panel when hasAnswers is true', () => {
    expect(getPanelSaturation(13, answers, true, false)).toBe(1);
    expect(getPanelSaturation(13, {}, true, true)).toBe(1);
  });

  it('desaturates all shared question panels regardless of answers', () => {
    expect(getPanelSaturation(0, answers, true, true)).toBe(0);
    expect(getPanelSaturation(5, answers, true, true)).toBe(0);
  });
});

describe('scoresHaveSelections', () => {
  it('returns false for all-zero scores', () => {
    expect(scoresHaveSelections({ V: 0, A: 0, R: 0, K: 0 })).toBe(false);
  });

  it('returns true when any score is greater than zero', () => {
    expect(scoresHaveSelections({ V: 1, A: 0, R: 0, K: 0 })).toBe(true);
  });
});

describe('getResultsEyebrow', () => {
  it('uses neutral copy on shared routes', () => {
    expect(getResultsEyebrow(true, 5)).toBe('Shared VARK profile');
  });

  it('uses answered count on normal routes', () => {
    expect(getResultsEyebrow(false, 5)).toBe('Your VARK profile · 5 of 13 answered');
  });
});

describe('getPromptsEyebrow', () => {
  it('uses neutral copy on shared routes', () => {
    expect(getPromptsEyebrow(true, 5)).toBe('Shared AI prompts');
  });

  it('uses answered count on normal routes', () => {
    expect(getPromptsEyebrow(false, 8)).toBe('Your AI prompts · 8 of 13 answered');
  });
});
