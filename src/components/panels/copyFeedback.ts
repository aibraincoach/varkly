export const COPY_FEEDBACK_DURATION_MS = 2000;

export const COPY_ERROR_MESSAGE = 'Could not copy. Please try again.';

type CopyFeedbackCallbacks = {
  onSuccess: (key: string, message: string) => void;
  onError: () => void;
  onCopiedKeyChange?: (key: string) => void;
};

export function createCopyFeedbackController(callbacks: CopyFeedbackCallbacks) {
  let generation = 0;
  let copiedKey = '';
  let timeoutId: number | undefined;

  const setCopiedKey = (key: string) => {
    copiedKey = key;
    callbacks.onCopiedKeyChange?.(key);
  };

  const clearTimer = () => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  const invalidate = () => {
    generation += 1;
    clearTimer();
    setCopiedKey('');
  };

  const copy = async (
    key: string,
    text: string,
    successMessage: string,
    copyToClipboardFn: (value: string) => Promise<void>
  ): Promise<void> => {
    generation += 1;
    const attemptGeneration = generation;
    setCopiedKey('');
    clearTimer();

    try {
      await copyToClipboardFn(text);
      if (attemptGeneration !== generation) {
        return;
      }

      setCopiedKey(key);
      callbacks.onSuccess(key, successMessage);
      timeoutId = window.setTimeout(() => {
        if (attemptGeneration !== generation) {
          return;
        }
        setCopiedKey('');
        timeoutId = undefined;
      }, COPY_FEEDBACK_DURATION_MS);
    } catch (error) {
      if (attemptGeneration !== generation) {
        return;
      }
      callbacks.onError();
      throw error;
    }
  };

  return {
    copy,
    getCopiedKey: () => copiedKey,
    invalidateForNavigation: invalidate,
    dispose: invalidate,
  };
}
