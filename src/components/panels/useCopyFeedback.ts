import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { createCopyFeedbackController } from './copyFeedback';

type UseCopyFeedbackOptions = {
  addToast: (message: string, type?: 'success' | 'error') => void;
  invalidateOnPathname: string;
};

export function useCopyFeedback({ addToast, invalidateOnPathname }: UseCopyFeedbackOptions) {
  const [copiedKey, setCopiedKey] = useState('');
  const controllerRef = useRef(
    createCopyFeedbackController({
      onSuccess: (_key, message) => {
        addToast(message);
      },
      onError: () => {
        addToast('Could not copy. Please try again.', 'error');
      },
      onCopiedKeyChange: setCopiedKey,
    })
  );

  const copyText = useCallback(
    async (key: string, text: string, successMessage: string) => {
      try {
        await controllerRef.current.copy(key, text, successMessage, copyToClipboard);
      } catch {
        // Error toast is emitted by the controller for the current attempt only.
      }
    },
    [addToast]
  );

  useEffect(() => {
    controllerRef.current.invalidateForNavigation();
  }, [invalidateOnPathname]);

  useEffect(() => {
    return () => {
      controllerRef.current.dispose();
    };
  }, []);

  return { copiedKey, copyText };
}
