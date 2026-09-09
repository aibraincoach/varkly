/**
 * Application constants — single source of truth for branding and routes.
 */

export const APP = {
  name: 'Varkly',
  tagline: 'VARK Learning Style Quiz',
  description: 'Take the 90-second VARK quiz and get a personalized prompt that makes ChatGPT, Claude, or any AI adapt to how your brain actually works.',
  quizQuestionCount: 13,
  quizEstimatedSeconds: 90,
} as const;

export const ROUTES = {
  home: '/',
  quiz: '/quiz',
  results: '/results',
  resultByHash: (hash: string) => `/r/${hash}`,
} as const;

export const STORAGE_KEYS = {
  quizState: 'quizState',
} as const;
