import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../hooks/useQuiz';
import { useToast } from '../../hooks/useToast';
import { questions } from '../../data/questions';
import { panels } from '../../data/panels';
import { ROUTES } from '../../constants/app';
import { usePageMeta } from '../../hooks/usePageMeta';
import { generateAIPrompts } from '../../utils/aiPrompts';
import { calculateScores, decodeScores, encodeScores, getDominantStyles, summarizeScores } from '../../utils/scores';
import { buildExplanation } from '../../utils/explanation';
import type { VarkScores } from '../../types';
import PanelsHeader from './PanelsHeader';
import LandingView from './LandingView';
import AboutView from './AboutView';
import QuestionView from './QuestionView';
import ResultsView from './ResultsView';
import PromptsView from './PromptsView';
import ActionRow from './ActionRow';
import PanelRail from './PanelRail';
import { useCopyFeedback } from './useCopyFeedback';
import {
  countAnsweredQuestions,
  focusOwnsKey,
  getCollapsedPanelGap,
  getKeysHint,
  getPanelsSurface,
  hasAnyAnswers,
  parseKeyboardCommand,
  parseRouteState,
  resolvePageAction,
  resolveQuestionAction,
  scoresHaveSelections,
  KEYBOARD_FOCUS_NOTE,
  RAIL_FOCUS_NOTE,
} from './panelsLogic';
import type { FocusRole, KeyboardCommand, PageAction, QuestionAction } from './panelsLogic';

const COPY_BOTH_DELIMITER = '\n\n---\n\n';
const ZERO_SCORES: VarkScores = { V: 0, A: 0, R: 0, K: 0 };

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

function getFocusRole(target: EventTarget | null): FocusRole {
  if (!(target instanceof Element)) return 'none';
  const activation = target.closest('button, a[href]');
  if (!activation) return 'none';
  if (activation instanceof HTMLButtonElement && activation.disabled) return 'none';
  return activation.tagName === 'A' ? 'link' : 'button';
}

function isModifiedOrComposing(event: KeyboardEvent): boolean {
  return (
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.shiftKey ||
    event.isComposing ||
    event.keyCode === 229
  );
}

function getKeyIdentifier(event: KeyboardEvent): string {
  return event.code || event.key;
}

function getEnabledRailPanelIndex(target: EventTarget | null): number | null {
  if (!(target instanceof Element)) return null;
  const button = target.closest('button[data-panel-index]');
  if (!(button instanceof HTMLButtonElement) || button.disabled) return null;
  const raw = button.dataset.panelIndex;
  if (raw === undefined) return null;
  const index = Number(raw);
  if (!Number.isInteger(index) || index < 0 || index >= panels.length) return null;
  return index;
}

const PanelsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    quizState,
    startQuiz,
    completeQuiz,
    goToQuestion,
    toggleOption,
    isOptionSelected,
    resetQuiz,
  } = useQuiz();
  const { addToast } = useToast();

  const routeState = parseRouteState(location.pathname, quizState.currentQuestionIndex);
  const { active, view, isShared, hash } = routeState;
  const surface = getPanelsSurface(active, view);

  const [isMobile, setIsMobile] = useState(false);
  const [panelGap, setPanelGap] = useState(10);
  const { copiedKey, copyText } = useCopyFeedback({
    addToast,
    invalidateOnPathname: location.pathname,
  });

  const isLanding = surface === 'landing';
  const isAbout = surface === 'about';
  const isQuestion = surface === 'question';
  const isResults = surface === 'results';
  const isPrompts = surface === 'prompts';

  // Decoded from the current URL every render so a previous hash can never govern this route.
  const sharedScores = isShared && hash ? decodeScores(hash) : null;

  const answeredCount = countAnsweredQuestions(quizState.answers);
  const canViewLocalResults = hasAnyAnswers(quizState.answers) || quizState.isCompleted;

  const scores: VarkScores = isShared
    ? sharedScores ?? ZERO_SCORES
    : calculateScores(quizState.answers);
  const hasAnswers = scoresHaveSelections(scores);

  const summary = summarizeScores(scores);
  const explanation = buildExplanation(getDominantStyles(scores));
  const prompts = hasAnswers ? generateAIPrompts(scores) : null;
  const systemPrompt = prompts ? prompts.systemPrompt : null;
  const conversationPrompt = prompts ? prompts.conversationPrompt : null;

  let redirectTarget: string | null = null;
  if (isShared) {
    if (!sharedScores) {
      redirectTarget = ROUTES.home;
    } else if (isPrompts && !hasAnswers && hash) {
      redirectTarget = ROUTES.resultByHash(hash);
    }
  } else if (isResults && !canViewLocalResults) {
    redirectTarget = ROUTES.home;
  } else if (isPrompts && !hasAnswers) {
    redirectTarget = canViewLocalResults ? ROUTES.results : ROUTES.home;
  }

  const pageTitle = isLanding
    ? 'VARK Learning Style Quiz'
    : isAbout
      ? 'About VARK'
      : isQuestion
        ? `Question ${String(active + 1).padStart(2, '0')}`
        : isPrompts
          ? 'Your AI Prompts'
          : 'Your VARK Profile';

  const pageDescription = isLanding
    ? 'Take the 90-second VARK quiz and discover how your brain learns best.'
    : isAbout
      ? 'What VARK measures, what it does not, and why Varkly uses it anyway.'
      : isQuestion
        ? 'Answer each scenario to build your VARK learning profile.'
        : isPrompts
          ? 'Copy personalized AI prompts built from your VARK scores.'
          : 'View your VARK learning style results and share your profile.';

  usePageMeta(pageTitle, pageDescription);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 1100;
      setIsMobile(mobile);
      setPanelGap(getCollapsedPanelGap(window.innerWidth, mobile));
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (redirectTarget) {
      navigate(redirectTarget, { replace: true });
    }
  }, [redirectTarget, navigate]);

  const handleCopyLink = useCallback(() => {
    const encoded = encodeScores(scores);
    const url = `${window.location.origin}${ROUTES.resultByHash(encoded)}`;
    copyText('link', url, 'Link copied to clipboard');
  }, [copyText, scores]);

  const handleCopySystem = useCallback(() => {
    if (!systemPrompt) return;
    copyText('sys', systemPrompt, 'System prompt copied');
  }, [copyText, systemPrompt]);

  const handleCopyConversation = useCallback(() => {
    if (!conversationPrompt) return;
    copyText('conv', conversationPrompt, 'Conversation prompt copied');
  }, [copyText, conversationPrompt]);

  const handleCopyBoth = useCallback(() => {
    if (!systemPrompt || !conversationPrompt) return;
    const combined = `${systemPrompt}${COPY_BOTH_DELIMITER}${conversationPrompt}`;
    copyText('both', combined, 'Both prompts copied');
  }, [copyText, systemPrompt, conversationPrompt]);

  const goToResults = useCallback(() => {
    if (isShared && hash) {
      navigate(ROUTES.resultByHash(hash));
    } else {
      navigate(ROUTES.results);
    }
  }, [isShared, hash, navigate]);

  const goToPrompts = useCallback(() => {
    if (isShared && hash) {
      navigate(ROUTES.resultPromptsByHash(hash));
    } else {
      navigate(ROUTES.prompts);
    }
  }, [isShared, hash, navigate]);

  const goToLanding = useCallback(() => navigate(ROUTES.home), [navigate]);
  const goToAbout = useCallback(() => navigate(ROUTES.about), [navigate]);

  const handleToggleOption = useCallback(
    (optionIndex: number) => {
      if (!isQuestion) return;
      const question = questions[active];
      const option = question.options[optionIndex];
      if (!option) return;
      toggleOption(question.id, option.id);
    },
    [isQuestion, active, toggleOption]
  );

  const runQuestionAction = useCallback(
    (action: QuestionAction) => {
      switch (action.kind) {
        case 'toggle':
          handleToggleOption(action.optionIndex);
          return;
        case 'next':
        case 'skip':
          goToQuestion(active + 1);
          return;
        case 'previous':
          goToQuestion(active - 1);
          return;
        case 'complete':
          completeQuiz();
          return;
        case 'none':
          return;
      }
    },
    [active, completeQuiz, goToQuestion, handleToggleOption]
  );

  const runPageAction = useCallback(
    (action: PageAction) => {
      switch (action) {
        case 'start-quiz':
          startQuiz();
          return;
        case 'open-landing':
          goToLanding();
          return;
        case 'open-about':
          goToAbout();
          return;
        case 'open-prompts':
          goToPrompts();
          return;
        case 'open-results':
          goToResults();
          return;
        case 'open-first-question':
          goToQuestion(0);
          return;
        case 'open-last-question':
          goToQuestion(12);
          return;
        case 'copy-both':
          handleCopyBoth();
          return;
        case 'retake':
          resetQuiz();
          return;
        case 'none':
          return;
      }
    },
    [goToAbout, goToLanding, goToPrompts, goToQuestion, goToResults, handleCopyBoth, resetQuiz, startQuiz]
  );

  const runCommand = useCallback(
    (command: KeyboardCommand) => {
      if (surface === 'question') {
        runQuestionAction(resolveQuestionAction(command, active));
        return;
      }
      runPageAction(resolvePageAction(surface, isShared, hasAnswers, command));
    },
    [active, hasAnswers, isShared, runPageAction, runQuestionAction, surface]
  );

  const handleNext = useCallback(() => runCommand('next'), [runCommand]);
  const handlePrevious = useCallback(() => runCommand('previous'), [runCommand]);
  const handleSkip = useCallback(() => runCommand('skip'), [runCommand]);

  const handleTertiary = useCallback(() => {
    if (isLanding) {
      runPageAction('open-about');
      return;
    }
    handleSkip();
  }, [handleSkip, isLanding, runPageAction]);

  const handlePanelActivate = useCallback(
    (panelIndex: number) => {
      if (panelIndex === 13) {
        goToResults();
        return;
      }
      goToQuestion(panelIndex);
    },
    [goToQuestion, goToResults]
  );

  const isRedirecting = redirectTarget !== null;

  const keyboardContextRef = useRef({
    surface,
    active,
    isRedirecting,
    runCommand,
    activatePanel: handlePanelActivate,
  });
  keyboardContextRef.current = {
    surface,
    active,
    isRedirecting,
    runCommand,
    activatePanel: handlePanelActivate,
  };

  useEffect(() => {
    const ownedKeys = new Set<string>();

    const onKeyDown = (event: KeyboardEvent) => {
      const keyId = getKeyIdentifier(event);

      if (ownedKeys.has(keyId)) {
        event.preventDefault();
        return;
      }

      const {
        surface: currentSurface,
        active: currentActive,
        isRedirecting: redirecting,
        runCommand: execute,
        activatePanel,
      } = keyboardContextRef.current;
      if (redirecting) return;
      if (event.defaultPrevented) return;
      if (isModifiedOrComposing(event)) return;
      if (isEditableTarget(event.target)) return;

      if (event.key === 'Enter' || event.key === ' ') {
        const railPanelIndex = getEnabledRailPanelIndex(event.target);
        if (railPanelIndex !== null) {
          event.preventDefault();
          if (event.repeat) return;
          ownedKeys.add(keyId);
          activatePanel(railPanelIndex);
          return;
        }
      }

      if (event.repeat) return;

      const command = parseKeyboardCommand(event.key, currentActive);
      if (!command) return;

      if (
        currentSurface !== 'question' &&
        focusOwnsKey(getFocusRole(event.target), event.key)
      ) {
        return;
      }

      event.preventDefault();
      ownedKeys.add(keyId);
      execute(command);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const keyId = getKeyIdentifier(event);
      if (!ownedKeys.has(keyId)) return;
      event.preventDefault();
      ownedKeys.delete(keyId);
    };

    const onBlur = () => {
      ownedKeys.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      ownedKeys.clear();
    };
  }, []);

  const progressLabel = isLanding
    ? 'Varkly · VARK quiz'
    : isAbout
      ? 'About VARK'
      : active === 13
        ? 'Results'
        : `Question ${String(active + 1).padStart(2, '0')} / 13`;

  const emptyResultsPrimaryLabel = isShared ? 'Take quiz' : 'Answer questions';

  const nextLabel = isLanding || isAbout
    ? "Let's begin"
    : isPrompts
      ? copiedKey === 'both'
        ? 'Copied both'
        : 'Copy both prompts'
      : isResults
        ? hasAnswers
          ? 'Get my AI prompts'
          : emptyResultsPrimaryLabel
        : active === 12
          ? 'See results'
          : 'Next';

  const skipLabel = isLanding ? 'About VARK' : active === 13 ? 'Retake' : 'Skip';

  const helperLine = isLanding
    ? "Your brain already knows how it works best. Let's teach your AI the same thing."
    : isAbout
      ? 'VARK is a preference inventory, not a diagnosis. Treat your result as a starting point.'
      : isPrompts
        ? 'Paste into ChatGPT, Claude, Gemini or any other AI tool.'
        : isResults
          ? hasAnswers
            ? 'Share of all selections, across every answered scenario.'
            : 'Choose at least one answer to get your AI prompts.'
          : 'Select all that apply, or skip if none do.';

  const keysHint = getKeysHint(surface, isShared, hasAnswers);

  const previousDisabled =
    surface === 'question'
      ? resolveQuestionAction('previous', active).kind === 'none'
      : resolvePageAction(surface, isShared, hasAnswers, 'previous') === 'none';

  const currentQuestion = isQuestion ? questions[active] : null;
  const currentPanelTitle = isQuestion ? panels[active].title : '';

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ground">
        <div className="w-10 h-10 border-2 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-[clamp(16px,3vw,48px)] pb-8">
      <PanelsHeader progressLabel={progressLabel} active={active} />

      <div
        className={
          isMobile
            ? 'flex flex-col gap-7 flex-1'
            : 'grid grid-cols-[minmax(360px,460px)_minmax(0,1fr)] gap-[clamp(24px,3vw,56px)] flex-1 items-start'
        }
      >
        <aside className={isMobile ? 'pt-2 max-w-[600px]' : 'pt-[clamp(8px,2vh,24px)]'}>
          {isLanding && <LandingView />}
          {isAbout && <AboutView />}
          {isQuestion && currentQuestion && (
            <QuestionView
              question={currentQuestion}
              panelTitle={currentPanelTitle}
              questionNumber={active + 1}
              isOptionSelected={(optionId) => isOptionSelected(currentQuestion.id, optionId)}
              onToggleOption={(optionId) => toggleOption(currentQuestion.id, optionId)}
            />
          )}
          {isResults && (
            <ResultsView
              answeredCount={answeredCount}
              summary={summary}
              explanation={explanation}
              onCopyLink={handleCopyLink}
              copyLinkLabel={copiedKey === 'link' ? 'Copied' : 'Copy link'}
              isShared={isShared}
            />
          )}
          {isPrompts && systemPrompt && conversationPrompt && (
            <PromptsView
              answeredCount={answeredCount}
              isShared={isShared}
              systemPrompt={systemPrompt}
              conversationPrompt={conversationPrompt}
              sysCopyLabel={copiedKey === 'sys' ? 'Copied' : 'Copy'}
              convCopyLabel={copiedKey === 'conv' ? 'Copied' : 'Copy'}
              sysCopied={copiedKey === 'sys'}
              convCopied={copiedKey === 'conv'}
              onCopySystem={handleCopySystem}
              onCopyConversation={handleCopyConversation}
            />
          )}

          <p className="mt-3 mb-0 text-xs leading-[15px] text-muted-3">{helperLine}</p>

          <ActionRow
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSkip={handleTertiary}
            nextLabel={nextLabel}
            skipLabel={skipLabel}
            previousDisabled={previousDisabled}
            showSkip={!isAbout}
          />

          <p className="mt-4 mb-0 font-mono text-[11px] text-muted-4">{keysHint}</p>
          {!isQuestion && (
            <p className="mt-1.5 mb-0 max-w-[46ch] font-mono text-[11px] leading-[1.5] text-muted-4">
              {KEYBOARD_FOCUS_NOTE}
            </p>
          )}
          {isQuestion && (
            <p className="mt-1.5 mb-0 max-w-[46ch] font-mono text-[11px] leading-[1.5] text-muted-4">
              {RAIL_FOCUS_NOTE}
            </p>
          )}
        </aside>

        <PanelRail
          active={active}
          isLanding={active === -1}
          isMobile={isMobile}
          panelGap={panelGap}
          answers={quizState.answers}
          hasAnswers={hasAnswers}
          canOpenResults={isShared || canViewLocalResults}
          isShared={isShared}
          onPanelActivate={handlePanelActivate}
        />
      </div>
    </div>
  );
};

export default PanelsScreen;
