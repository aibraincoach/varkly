import { describe, it, expect } from 'vitest';
import { getQuizStartState } from '../quiz-context';
import type { QuizState } from '../../types';

describe('getQuizStartState', () => {
  it('preserves nonempty answers while reopening at question 0', () => {
    const prior: QuizState = {
      currentQuestionIndex: 7,
      answers: {
        1: ['1V', '1A'],
        3: ['3R'],
        8: ['8K'],
      },
      isCompleted: true,
    };

    expect(getQuizStartState(prior)).toEqual({
      currentQuestionIndex: 0,
      answers: {
        1: ['1V', '1A'],
        3: ['3R'],
        8: ['8K'],
      },
      isCompleted: false,
    });
  });

  it('preserves empty selection arrays alongside answered questions', () => {
    const prior: QuizState = {
      currentQuestionIndex: 4,
      answers: {
        1: [],
        2: ['2V'],
        3: [],
      },
      isCompleted: false,
    };

    expect(getQuizStartState(prior)).toEqual({
      currentQuestionIndex: 0,
      answers: {
        1: [],
        2: ['2V'],
        3: [],
      },
      isCompleted: false,
    });
  });

  it('returns the default-shaped start state when the previous state has no answers', () => {
    const prior: QuizState = {
      currentQuestionIndex: -1,
      answers: {},
      isCompleted: false,
    };

    expect(getQuizStartState(prior)).toEqual({
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
    });
  });

  it('clears completion from a finished previous run without dropping its answers', () => {
    const prior: QuizState = {
      currentQuestionIndex: 12,
      answers: { 13: ['13K'] },
      isCompleted: true,
    };

    const next = getQuizStartState(prior);

    expect(next.isCompleted).toBe(false);
    expect(next.currentQuestionIndex).toBe(0);
    expect(next.answers).toEqual({ 13: ['13K'] });
  });

  it('never mutates the input state or its answer object', () => {
    const prior: QuizState = {
      currentQuestionIndex: 5,
      answers: { 2: ['2A'] },
      isCompleted: true,
    };
    const snapshot = JSON.parse(JSON.stringify(prior)) as QuizState;

    const next = getQuizStartState(prior);

    expect(prior).toEqual(snapshot);
    expect(next).not.toBe(prior);
    expect(next.answers).not.toBe(prior.answers);
  });
});
