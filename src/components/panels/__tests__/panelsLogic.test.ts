import { describe, it, expect } from 'vitest';
import {
  countAnsweredQuestions,
  parseRouteState,
  parseKeyboardCommand,
  clampQuestionIndex,
  getProgressPct,
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
