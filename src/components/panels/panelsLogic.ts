export type PanelsView = 'quiz' | 'prompts';

export type RouteState = {
  active: number;
  view: PanelsView;
  isShared: boolean;
  hash?: string;
};

export type KeyboardCommand =
  | 'toggle-1'
  | 'toggle-2'
  | 'toggle-3'
  | 'toggle-4'
  | 'next'
  | 'previous'
  | 'skip';

export function countAnsweredQuestions(answers: Record<number, string[]>): number {
  return Object.values(answers).filter((selections) => selections.length > 0).length;
}

export function clampQuestionIndex(index: number): number {
  return Math.max(0, Math.min(12, index));
}

export function parseRouteState(pathname: string, questionIndex: number): RouteState {
  const sharedPromptsMatch = pathname.match(/^\/r\/([^/]+)\/prompts$/);
  if (sharedPromptsMatch) {
    return {
      active: 13,
      view: 'prompts',
      isShared: true,
      hash: sharedPromptsMatch[1],
    };
  }

  const sharedResultsMatch = pathname.match(/^\/r\/([^/]+)$/);
  if (sharedResultsMatch) {
    return {
      active: 13,
      view: 'quiz',
      isShared: true,
      hash: sharedResultsMatch[1],
    };
  }

  if (pathname === '/prompts') {
    return { active: 13, view: 'prompts', isShared: false };
  }

  if (pathname === '/results') {
    return { active: 13, view: 'quiz', isShared: false };
  }

  if (pathname === '/quiz') {
    return { active: clampQuestionIndex(questionIndex), view: 'quiz', isShared: false };
  }

  return { active: -1, view: 'quiz', isShared: false };
}

export function parseKeyboardCommand(key: string, active: number): KeyboardCommand | null {
  const normalizedKey = key.length === 1 ? key.toLowerCase() : key;

  if (active >= 0 && active < 13) {
    if (normalizedKey === '1') return 'toggle-1';
    if (normalizedKey === '2') return 'toggle-2';
    if (normalizedKey === '3') return 'toggle-3';
    if (normalizedKey === '4') return 'toggle-4';
  }

  if (normalizedKey === 'Enter' || normalizedKey === 'ArrowRight') return 'next';
  if (normalizedKey === 'ArrowLeft') return 'previous';
  if (normalizedKey === ' ') return 'skip';

  return null;
}

export function getProgressPct(active: number): number {
  return Math.round((Math.max(0, active + 1) / 14) * 100);
}

export function hasAnyAnswers(answers: Record<number, string[]>): boolean {
  return countAnsweredQuestions(answers) > 0;
}

export function getPanelSaturation(
  panelIndex: number,
  answers: Record<number, string[]>,
  answeredCount: number,
  isShared: boolean
): number {
  const isResults = panelIndex === 13;
  if (isResults) {
    return answeredCount > 0 ? 1 : 0.3;
  }

  if (isShared) {
    return 0;
  }

  const questionId = panelIndex + 1;
  const done = !!(answers[questionId] && answers[questionId].length > 0);
  return done ? 1 : 0;
}

export function getCollapsedPanelGap(windowWidth: number, isMobile: boolean): number {
  if (isMobile) {
    return 8;
  }
  return Math.max(4, Math.round((windowWidth - 1100) / 40) + 4);
}
