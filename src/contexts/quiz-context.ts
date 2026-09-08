import { createContext } from 'react';
import type { QuizContextType, QuizState } from '../types';

export const defaultQuizState: QuizState = {
  currentQuestionIndex: -1,
  answers: {},
  isCompleted: false,
};

export function getFreshQuizStartState(previousState: QuizState): QuizState {
  void previousState;
  return {
    currentQuestionIndex: 0,
    answers: {},
    isCompleted: false,
  };
}

export function normalizeQuizState(saved: unknown): QuizState {
  if (typeof saved !== 'object' || saved === null) {
    return defaultQuizState;
  }

  const parsed = saved as Record<string, unknown>;

  return {
    currentQuestionIndex:
      typeof parsed.currentQuestionIndex === 'number' ? parsed.currentQuestionIndex : -1,
    answers:
      typeof parsed.answers === 'object' && parsed.answers !== null && !Array.isArray(parsed.answers)
        ? (parsed.answers as Record<number, string[]>)
        : {},
    isCompleted: typeof parsed.isCompleted === 'boolean' ? parsed.isCompleted : false,
  };
}

export const QuizContext = createContext<QuizContextType | null>(null);
