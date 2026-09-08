import { useCallback, useEffect, useRef, useState } from 'react';
import { copyToClipboard } from '../../utils/copyToClipboard';
import { COPY_ERROR_MESSAGE, createCopyFeedbackController } from './copyFeedback';

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
        addToast(COPY_ERROR_MESSAGE, 'error');
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
    [],
  );

  useEffect(() => {
    controllerRef.current.invalidateForNavigation();
  }, [invalidateOnPathname]);

  useEffect(() => {
    const controller = controllerRef.current;
    return () => {
      controller.dispose();
    };
  }, []);

  return { copiedKey, copyText };
}
