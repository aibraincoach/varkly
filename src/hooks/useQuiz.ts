import { useContext } from 'react';
import { QuizContext } from '../contexts/quiz-context';

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
