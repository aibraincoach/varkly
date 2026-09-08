import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuizContextType, QuizState, VarkScores } from '../types';
import { calculateScores as calculateScoresFromAnswers } from '../utils/scores';
import { QuizContext, defaultQuizState, getQuizStartState, normalizeQuizState } from './quiz-context';

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizState, setQuizState] = useState<QuizState>(() => {
    try {
      const saved = sessionStorage.getItem('quizState');
      if (saved) {
        return normalizeQuizState(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Could not restore quiz state:', error);
    }
    return defaultQuizState;
  });

  const navigate = useNavigate();

  useEffect(() => {
    try {
      sessionStorage.setItem('quizState', JSON.stringify(quizState));
    } catch (error) {
      console.warn('Could not save quiz state:', error);
    }
  }, [quizState]);

  const startQuiz = useCallback(() => {
    setQuizState(getQuizStartState);
    navigate('/quiz');
  }, [navigate]);

  const completeQuiz = useCallback(() => {
    setQuizState((prevState) => ({ ...prevState, isCompleted: true }));
    navigate('/results');
  }, [navigate]);

  const goToQuestion = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(12, index));
      setQuizState((prevState) => ({
        ...prevState,
        currentQuestionIndex: clamped,
        isCompleted: false,
      }));
      navigate('/quiz');
    },
    [navigate]
  );

  const resetQuiz = useCallback(() => {
    setQuizState(defaultQuizState);
    sessionStorage.removeItem('quizState');
    navigate('/');
  }, [navigate]);

  const toggleOption = useCallback((questionId: number, optionId: string) => {
    setQuizState((prevState) => {
      const currentAnswers = prevState.answers[questionId] || [];
      const nextAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter((id) => id !== optionId)
        : [...currentAnswers, optionId];

      return {
        ...prevState,
        answers: {
          ...prevState.answers,
          [questionId]: nextAnswers,
        },
      };
    });
  }, []);

  const isOptionSelected = useCallback((questionId: number, optionId: string): boolean => {
    const answers = quizState.answers[questionId] || [];
    return answers.includes(optionId);
  }, [quizState.answers]);

  const calculateScores = useCallback((): VarkScores => {
    return calculateScoresFromAnswers(quizState.answers);
  }, [quizState.answers]);

  const value: QuizContextType = {
    quizState,
    startQuiz,
    completeQuiz,
    goToQuestion,
    toggleOption,
    isOptionSelected,
    calculateScores,
    resetQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
