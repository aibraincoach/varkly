import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizContextType, QuizState, VarkScores } from '../types';
import { questions } from '../data/questions';
import { calculateScores as calculateScoresFromAnswers } from '../utils/scores';

const defaultQuizState: QuizState = {
  currentQuestionIndex: -1,
  answers: {},
  isCompleted: false,
};

function normalizeQuizState(saved: unknown): QuizState {
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

const QuizContext = createContext<QuizContextType | null>(null);

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

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
    setQuizState(defaultQuizState);
    navigate('/quiz');
  }, [navigate]);

  const resetQuiz = useCallback(() => {
    setQuizState(defaultQuizState);
    sessionStorage.removeItem('quizState');
    navigate('/');
  }, [navigate]);

  const goToNextQuestion = useCallback(() => {
    setQuizState(prevState => {
      if (prevState.currentQuestionIndex === -1) {
        return { ...prevState, currentQuestionIndex: 0 };
      }
      if (prevState.currentQuestionIndex < questions.length - 1) {
        return { ...prevState, currentQuestionIndex: prevState.currentQuestionIndex + 1 };
      }
      return { ...prevState, isCompleted: true };
    });
  }, []);

  const goToPreviousQuestion = useCallback(() => {
    setQuizState(prevState => {
      if (prevState.currentQuestionIndex > -1) {
        return { ...prevState, currentQuestionIndex: prevState.currentQuestionIndex - 1 };
      }
      return prevState;
    });
  }, []);

  const selectOption = useCallback((questionId: number, optionId: string) => {
    setQuizState((prevState) => {
      const currentAnswers = prevState.answers[questionId] || [];
      if (!currentAnswers.includes(optionId)) {
        return {
          ...prevState,
          answers: {
            ...prevState.answers,
            [questionId]: [...currentAnswers, optionId],
          },
        };
      }
      return prevState;
    });
  }, []);

  const unselectOption = useCallback((questionId: number, optionId: string) => {
    setQuizState((prevState) => {
      const currentAnswers = prevState.answers[questionId] || [];
      return {
        ...prevState,
        answers: {
          ...prevState.answers,
          [questionId]: currentAnswers.filter(id => id !== optionId),
        },
      };
    });
  }, []);

  const isOptionSelected = useCallback((questionId: number, optionId: string): boolean => {
    const answers = quizState.answers[questionId] || [];
    return answers.includes(optionId);
  }, [quizState.answers]);

  const skipQuestion = useCallback(() => {
    setQuizState(prevState => {
      if (prevState.currentQuestionIndex === -1) {
        return { ...prevState, currentQuestionIndex: 0 };
      }
      if (prevState.currentQuestionIndex < questions.length - 1) {
        return { ...prevState, currentQuestionIndex: prevState.currentQuestionIndex + 1 };
      }
      return { ...prevState, isCompleted: true };
    });
  }, []);

  const calculateScores = useCallback((): VarkScores => {
    return calculateScoresFromAnswers(quizState.answers);
  }, [quizState.answers]);

  const value: QuizContextType = {
    quizState,
    startQuiz,
    goToNextQuestion,
    goToPreviousQuestion,
    selectOption,
    unselectOption,
    isOptionSelected,
    skipQuestion,
    calculateScores,
    resetQuiz,
  };

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};
