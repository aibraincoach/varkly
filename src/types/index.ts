export type QuestionOption = {
  id: string;
  text: string;
  type: 'V' | 'A' | 'R' | 'K';
};

export type Question = {
  id: number;
  scenario: string;
  options: QuestionOption[];
};

export type QuizState = {
  currentQuestionIndex: number;
  answers: Record<number, string[]>;
  isCompleted: boolean;
};

export type VarkStyle = 'V' | 'A' | 'R' | 'K';

export type VarkScores = {
  V: number;
  A: number;
  R: number;
  K: number;
};

export type ScoreStyleSummary = {
  code: VarkStyle;
  name: string;
  value: number;
  pct: number;
  barPct: number;
};

export type ScoreSummary = {
  headline: string;
  blurb: string;
  styles: ScoreStyleSummary[];
};

export type AIPrompts = {
  systemPrompt: string;
  conversationPrompt: string;
};

export type QuizContextType = {
  quizState: QuizState;
  startQuiz: () => void;
  goToQuestion: (index: number) => void;
  toggleOption: (questionId: number, optionId: string) => void;
  isOptionSelected: (questionId: number, optionId: string) => boolean;
  calculateScores: () => VarkScores;
  resetQuiz: () => void;
};
