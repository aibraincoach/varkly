import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext';
import { useToast } from '../../contexts/ToastContext';
import { questions } from '../../data/questions';
import { panels } from '../../data/panels';
import { ROUTES } from '../../constants/app';
import { usePageMeta } from '../../hooks/usePageMeta';
import { generateAIPrompts } from '../../utils/aiPrompts';
import { calculateScores, decodeScores, encodeScores, summarizeScores } from '../../utils/scores';
import type { VarkScores } from '../../types';
import PanelsHeader from './PanelsHeader';
import LandingView from './LandingView';
import QuestionView from './QuestionView';
import ResultsView from './ResultsView';
import PromptsView from './PromptsView';
import ActionRow from './ActionRow';
import PanelRail from './PanelRail';
import {
  countAnsweredQuestions,
  getCollapsedPanelGap,
  hasAnyAnswers,
  parseKeyboardCommand,
  parseRouteState,
  scoresHaveSelections,
} from './panelsLogic';

const COPY_BOTH_DELIMITER = '\n\n---\n\n';

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

const PanelsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizState, startQuiz, goToQuestion, toggleOption, isOptionSelected, resetQuiz } =
    useQuiz();
  const { addToast } = useToast();

  const routeState = parseRouteState(location.pathname, quizState.currentQuestionIndex);
  const { active, view, isShared, hash } = routeState;

  const [isMobile, setIsMobile] = useState(false);
  const [panelGap, setPanelGap] = useState(10);
  const [copiedKey, setCopiedKey] = useState('');
  const [sharedScores, setSharedScores] = useState<VarkScores | null>(null);

  const isLanding = active === -1;
  const isQuestion = active >= 0 && active < 13;
  const isResults = active === 13 && view === 'quiz';
  const isPrompts = active === 13 && view === 'prompts';

  const answeredCount = countAnsweredQuestions(quizState.answers);
  const anyAnswers = hasAnyAnswers(quizState.answers);

  const scores: VarkScores = isShared && sharedScores
    ? sharedScores
    : calculateScores(quizState.answers);

  const hasAnswers = isShared
    ? scoresHaveSelections(scores)
    : anyAnswers;

  const summary = summarizeScores(scores);
  const prompts = generateAIPrompts(scores);

  const pageTitle = isLanding
    ? 'VARK Learning Style Quiz'
    : isQuestion
      ? `Question ${String(active + 1).padStart(2, '0')}`
      : isPrompts
        ? 'Your AI Prompts'
        : 'Your VARK Profile';

  const pageDescription = isLanding
    ? 'Take the 90-second VARK quiz and discover how your brain learns best.'
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
    if (isShared && hash) {
      const decoded = decodeScores(hash);
      if (!decoded) {
        navigate(ROUTES.home, { replace: true });
        return;
      }
      setSharedScores(decoded);
    } else {
      setSharedScores(null);
    }
  }, [isShared, hash, navigate]);

  useEffect(() => {
    if (!isShared && (location.pathname === ROUTES.results || location.pathname === ROUTES.prompts)) {
      if (!anyAnswers) {
        navigate(ROUTES.home, { replace: true });
      }
    }
  }, [isShared, location.pathname, anyAnswers, navigate]);

  const copyText = useCallback(
    async (key: string, text: string, successMessage: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        addToast(successMessage);
        setTimeout(() => setCopiedKey(''), 2000);
      } catch {
        addToast('Could not copy. Please try again.', 'error');
      }
    },
    [addToast]
  );

  const handleCopyLink = useCallback(() => {
    const encoded = encodeScores(scores);
    const url = `${window.location.origin}${ROUTES.resultByHash(encoded)}`;
    copyText('link', url, 'Link copied to clipboard');
  }, [copyText, scores]);

  const handleCopySystem = useCallback(() => {
    copyText('sys', prompts.systemPrompt, 'System prompt copied');
  }, [copyText, prompts.systemPrompt]);

  const handleCopyConversation = useCallback(() => {
    copyText('conv', prompts.conversationPrompt, 'Conversation prompt copied');
  }, [copyText, prompts.conversationPrompt]);

  const handleCopyBoth = useCallback(() => {
    const combined = `${prompts.systemPrompt}${COPY_BOTH_DELIMITER}${prompts.conversationPrompt}`;
    copyText('both', combined, 'Both prompts copied');
  }, [copyText, prompts.systemPrompt, prompts.conversationPrompt]);

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

  const handleNext = useCallback(() => {
    if (isLanding) {
      startQuiz();
      return;
    }
    if (isQuestion) {
      if (active === 12) {
        goToResults();
      } else {
        goToQuestion(active + 1);
      }
      return;
    }
    if (isResults) {
      goToPrompts();
      return;
    }
    if (isPrompts) {
      handleCopyBoth();
    }
  }, [
    isLanding,
    isQuestion,
    isResults,
    isPrompts,
    active,
    startQuiz,
    goToQuestion,
    goToResults,
    goToPrompts,
    handleCopyBoth,
  ]);

  const handlePrevious = useCallback(() => {
    if (isPrompts) {
      goToResults();
      return;
    }
    if (isResults && !isShared) {
      goToQuestion(12);
      return;
    }
    if (isQuestion && active > 0) {
      goToQuestion(active - 1);
    }
  }, [isPrompts, isResults, isShared, isQuestion, active, goToResults, goToQuestion]);

  const handleSkip = useCallback(() => {
    if (isLanding) return;
    if (isResults || isPrompts) {
      resetQuiz();
      return;
    }
    if (isQuestion) {
      if (active === 12) {
        goToResults();
      } else {
        goToQuestion(active + 1);
      }
    }
  }, [isLanding, isResults, isPrompts, isQuestion, active, resetQuiz, goToResults, goToQuestion]);

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

  const handleToggleOption = useCallback(
    (optionIndex: number) => {
      if (!isQuestion) return;
      const question = questions[active];
      const option = question.options[optionIndex];
      toggleOption(question.id, option.id);
    },
    [isQuestion, active, toggleOption]
  );

  const actionHandlersRef = useRef({
    handleNext,
    handlePrevious,
    handleSkip,
    handleToggleOption,
  });
  actionHandlersRef.current = {
    handleNext,
    handlePrevious,
    handleSkip,
    handleToggleOption,
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.target instanceof HTMLButtonElement && document.activeElement === event.target) {
        return;
      }

      const command = parseKeyboardCommand(event.key, active);
      if (!command) return;

      if (command === 'previous' && (active <= 0 || (isResults && isShared))) {
        event.preventDefault();
        return;
      }

      if (command === 'toggle-1') actionHandlersRef.current.handleToggleOption(0);
      if (command === 'toggle-2') actionHandlersRef.current.handleToggleOption(1);
      if (command === 'toggle-3') actionHandlersRef.current.handleToggleOption(2);
      if (command === 'toggle-4') actionHandlersRef.current.handleToggleOption(3);
      if (command === 'next') actionHandlersRef.current.handleNext();
      if (command === 'previous') actionHandlersRef.current.handlePrevious();
      if (command === 'skip') {
        event.preventDefault();
        actionHandlersRef.current.handleSkip();
        return;
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, isResults, isShared]);

  const progressLabel = isLanding
    ? 'Varkly · VARK quiz'
    : active === 13
      ? 'Results'
      : `Question ${String(active + 1).padStart(2, '0')} / 13`;

  const nextLabel = isLanding
    ? "Let's begin"
    : isPrompts
      ? copiedKey === 'both'
        ? 'Copied both'
        : 'Copy both prompts'
      : isResults
        ? 'Get my AI prompts'
        : active === 12
          ? 'See results'
          : 'Next';

  const skipLabel = isLanding ? '' : active === 13 ? 'Retake' : 'Skip';

  const helperLine = isLanding
    ? "Your brain already knows how it works best. Let's teach your AI the same thing."
    : isPrompts
      ? 'Paste into ChatGPT, Claude, Gemini or any other AI tool.'
      : isResults
        ? 'Share of all selections, across every answered scenario.'
        : 'Select all that apply, or skip if none do.';

  const keysHint = isLanding
    ? 'enter to start'
    : isPrompts
      ? '← back to results · enter copy both'
      : isResults
        ? isShared
          ? 'enter get prompts'
          : '← review answers · enter get prompts'
        : 'keys 1–4 select · enter next · space skip';

  const previousDisabled = active <= 0 || (isResults && isShared);

  const currentQuestion = isQuestion ? questions[active] : null;
  const currentPanelTitle = isQuestion ? panels[active].title : '';

  if (isShared && !sharedScores) {
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
              onCopyLink={handleCopyLink}
              copyLinkLabel={copiedKey === 'link' ? 'Copied' : 'Copy link'}
              isShared={isShared}
            />
          )}
          {isPrompts && (
            <PromptsView
              answeredCount={answeredCount}
              isShared={isShared}
              systemPrompt={prompts.systemPrompt}
              conversationPrompt={prompts.conversationPrompt}
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
            onSkip={handleSkip}
            nextLabel={nextLabel}
            skipLabel={skipLabel}
            previousDisabled={previousDisabled}
            showSkip={!isLanding}
          />

          <p className="mt-4 mb-0 font-mono text-[11px] text-muted-4">{keysHint}</p>
        </aside>

        <PanelRail
          active={active}
          isLanding={isLanding}
          isMobile={isMobile}
          panelGap={panelGap}
          answers={quizState.answers}
          hasAnswers={hasAnswers}
          isShared={isShared}
          onPanelActivate={handlePanelActivate}
        />
      </div>
    </div>
  );
};

export default PanelsScreen;
