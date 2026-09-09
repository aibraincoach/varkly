import { test, expect } from '@playwright/test';
import { calculateScores, encodeScores } from '../src/utils/scores';
import { seedQuizState } from './helpers';

const ANSWERED = {
  currentQuestionIndex: 12,
  answers: { '1': ['1V', '1R'], '2': ['2A'], '5': ['5K'] },
  isCompleted: true,
};

const BASE_URL = 'http://127.0.0.1:4173';

test('clipboard fallback uses execCommand when the Clipboard API is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const copies: string[] = [];
    (window as unknown as { __copies: string[] }).__copies = copies;
    (window as unknown as { __execCopyCalls: number }).__execCopyCalls = 0;
    (window as unknown as { __execCopyResult: boolean | null }).__execCopyResult = null;
    (window as unknown as { __selectionAtCopy: { selectionStart: number; selectionEnd: number; valueLength: number } | null }).__selectionAtCopy =
      null;

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    const originalExecCommand = document.execCommand.bind(document);
    document.execCommand = (command: string, ...args: unknown[]) => {
      if (command === 'copy') {
        (window as unknown as { __execCopyCalls: number }).__execCopyCalls += 1;
        const textarea = document.querySelector('textarea');
        if (textarea instanceof HTMLTextAreaElement) {
          copies.push(textarea.value);
          (window as unknown as { __selectionAtCopy: { selectionStart: number; selectionEnd: number; valueLength: number } }).__selectionAtCopy =
            {
              selectionStart: textarea.selectionStart,
              selectionEnd: textarea.selectionEnd,
              valueLength: textarea.value.length,
            };
        }
      }
      const result = originalExecCommand(command, ...(args as [boolean?, string?]));
      if (command === 'copy') {
        (window as unknown as { __execCopyResult: boolean }).__execCopyResult = result;
      }
      return result;
    };
  });

  await seedQuizState(page, ANSWERED, '/results');
  const exactLinkUrl = `${BASE_URL}/r/${encodeScores(calculateScores(ANSWERED.answers))}`;

  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();

  const metrics = await page.evaluate(() => ({
    copies: (window as unknown as { __copies: string[] }).__copies,
    execCopyCalls: (window as unknown as { __execCopyCalls: number }).__execCopyCalls,
    execCopyResult: (window as unknown as { __execCopyResult: boolean | null }).__execCopyResult,
    selectionAtCopy: (window as unknown as {
      __selectionAtCopy: { selectionStart: number; selectionEnd: number; valueLength: number } | null;
    }).__selectionAtCopy,
    textareaCount: document.querySelectorAll('textarea').length,
  }));

  expect(metrics.execCopyCalls).toBe(1);
  expect(metrics.execCopyResult).toBe(true);
  expect(metrics.copies).toHaveLength(1);
  expect(metrics.copies[0]).toBe(exactLinkUrl);
  expect(metrics.selectionAtCopy).toEqual({
    selectionStart: 0,
    selectionEnd: exactLinkUrl.length,
    valueLength: exactLinkUrl.length,
  });
  expect(metrics.textareaCount).toBe(0);
});
