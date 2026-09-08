import { describe, it, expect } from 'vitest';
import { getFreshQuizStartState } from '../quiz-context';
import type { QuizState } from '../../types';

describe('getFreshQuizStartState', () => {
  it('resets nonempty answers, currentQuestionIndex to 0, and isCompleted to false', () => {
    const prior: QuizState = {
      currentQuestionIndex: 7,
      answers: {
        1: ['1V', '1A'],
        3: ['3R'],
        8: ['8K'],
      },
      isCompleted: true,
    };

    expect(getFreshQuizStartState(prior)).toEqual({
      currentQuestionIndex: 0,
      answers: {},
      isCompleted: false,
    });
  });
});
