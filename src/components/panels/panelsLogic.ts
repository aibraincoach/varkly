import type { VarkScores } from '../../types';

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

export type PanelsSurface = 'landing' | 'question' | 'results' | 'prompts';

export type PageSurface = Exclude<PanelsSurface, 'question'>;

export type QuestionAction =
  | { kind: 'toggle'; optionIndex: number }
  | { kind: 'next' }
  | { kind: 'complete' }
  | { kind: 'previous' }
  | { kind: 'skip' }
  | { kind: 'none' };

export type PageAction =
  | 'start-quiz'
  | 'open-prompts'
  | 'open-results'
  | 'open-first-question'
  | 'open-last-question'
  | 'copy-both'
  | 'retake'
  | 'none';

export type FocusRole = 'button' | 'link' | 'none';

export const KEYBOARD_FOCUS_NOTE =
  'With a button focused, Enter or Space activates it. With a link focused, Enter follows it.';

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

export function getPanelsSurface(active: number, view: PanelsView): PanelsSurface {
  if (active === 13) {
    return view === 'prompts' ? 'prompts' : 'results';
  }
  return active < 0 ? 'landing' : 'question';
}

export function resolveQuestionAction(command: KeyboardCommand, active: number): QuestionAction {
  switch (command) {
    case 'toggle-1':
      return { kind: 'toggle', optionIndex: 0 };
    case 'toggle-2':
      return { kind: 'toggle', optionIndex: 1 };
    case 'toggle-3':
      return { kind: 'toggle', optionIndex: 2 };
    case 'toggle-4':
      return { kind: 'toggle', optionIndex: 3 };
    case 'next':
      return active === 12 ? { kind: 'complete' } : { kind: 'next' };
    case 'skip':
      return active === 12 ? { kind: 'complete' } : { kind: 'skip' };
    case 'previous':
      return active <= 0 ? { kind: 'none' } : { kind: 'previous' };
  }
}

export function resolvePageAction(
  surface: PageSurface,
  isShared: boolean,
  hasSelections: boolean,
  command: KeyboardCommand
): PageAction {
  if (command !== 'next' && command !== 'previous' && command !== 'skip') {
    return 'none';
  }

  if (surface === 'landing') {
    return command === 'next' ? 'start-quiz' : 'none';
  }

  if (surface === 'prompts') {
    if (command === 'next') return 'copy-both';
    if (command === 'previous') return 'open-results';
    return 'retake';
  }

  if (command === 'skip') {
    return 'retake';
  }

  if (command === 'previous') {
    if (isShared) return 'none';
    return 'open-last-question';
  }

  if (hasSelections) {
    return 'open-prompts';
  }

  return isShared ? 'start-quiz' : 'open-first-question';
}

export function focusOwnsKey(role: FocusRole, key: string): boolean {
  if (role === 'button') return key === 'Enter' || key === ' ';
  if (role === 'link') return key === 'Enter';
  return false;
}

export function getKeysHint(
  surface: PanelsSurface,
  isShared: boolean,
  hasSelections: boolean
): string {
  if (surface === 'landing') {
    return 'enter to start';
  }

  if (surface === 'question') {
    return 'keys 1–4 select · enter next · space skip';
  }

  if (surface === 'prompts') {
    return '← back to results · enter copy both · space retake';
  }

  if (hasSelections) {
    return isShared
      ? 'enter get prompts · space retake'
      : '← review answers · enter get prompts · space retake';
  }

  return isShared
    ? 'enter take quiz · space retake'
    : '← review questions · enter answer questions · space retake';
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
  hasAnswers: boolean,
  isShared: boolean
): number {
  const isResults = panelIndex === 13;
  if (isResults) {
    return hasAnswers ? 1 : 0.3;
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
  const scaled = Math.max(4, Math.round((windowWidth - 1100) / 40) + 4);
  return Math.min(10, scaled);
}

export function scoresHaveSelections(scores: VarkScores): boolean {
  return scores.V + scores.A + scores.R + scores.K > 0;
}

export function getResultsEyebrow(isShared: boolean, answeredCount: number): string {
  if (isShared) {
    return 'Shared VARK profile';
  }
  return `Your VARK profile · ${answeredCount} of 13 answered`;
}

export function getPromptsEyebrow(isShared: boolean, answeredCount: number): string {
  if (isShared) {
    return 'Shared AI prompts';
  }
  return `Your AI prompts · ${answeredCount} of 13 answered`;
}
