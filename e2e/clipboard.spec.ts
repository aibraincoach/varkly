import { test, expect } from '@playwright/test';
import { seedQuizState } from './helpers';

const ANSWERED = {
  currentQuestionIndex: 12,
  answers: { '1': ['1V', '1R'], '2': ['2A'], '5': ['5K'] },
  isCompleted: true,
};

test('clipboard fallback uses execCommand when the Clipboard API is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    const copies: string[] = [];
    (window as unknown as { __copies: string[] }).__copies = copies;
    (window as unknown as { __execCopyCalls: number }).__execCopyCalls = 0;

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
        }
      }
      return originalExecCommand(command, ...(args as [boolean?, string?]));
    };
  });

  await seedQuizState(page, ANSWERED, '/results');
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();

  const metrics = await page.evaluate(() => ({
    copies: (window as unknown as { __copies: string[] }).__copies,
    execCopyCalls: (window as unknown as { __execCopyCalls: number }).__execCopyCalls,
    textareaCount: document.querySelectorAll('textarea').length,
  }));

  expect(metrics.execCopyCalls).toBeGreaterThanOrEqual(1);
  expect(metrics.copies).toHaveLength(1);
  expect(metrics.copies[0]).toContain('/r/');
  expect(metrics.textareaCount).toBe(0);
});
