import { expect, type Locator, type Page } from '@playwright/test';

export type SeededQuizState = {
  currentQuestionIndex: number;
  answers: Record<string, string[]>;
  isCompleted: boolean;
};

export const DEFAULT_QUIZ_STATE: SeededQuizState = {
  currentQuestionIndex: -1,
  answers: {},
  isCompleted: false,
};

/** btoa('9-2-1-1') without padding — the share hash shipped before the panels redesign. */
export const LEGACY_SHARED_HASH = 'OS0yLTEtMQ';
/** btoa('0-0-0-0') without padding — a valid link to an all-zero profile. */
export const ZERO_SHARED_HASH = 'MC0wLTAtMA';
/** btoa('not-valid') — decodes cleanly but is not four score parts. */
export const INVALID_SHARED_HASH = 'bm90LXZhbGlk';

export const KEYBOARD_FOCUS_NOTE =
  'With a button focused, Enter or Space activates it. With a link focused, Enter follows it.';

/**
 * Seeds sessionStorage once from the landing route, then navigates so the provider
 * boots from the seeded state exactly as it would after a real reload.
 */
export async function seedQuizState(
  page: Page,
  state: SeededQuizState,
  destination: string
): Promise<void> {
  await page.goto('/');
  await page.evaluate((serialized) => {
    window.sessionStorage.setItem('quizState', serialized);
  }, JSON.stringify(state));
  await page.goto(destination);
}

export async function readQuizState(page: Page): Promise<SeededQuizState | null> {
  return page.evaluate(() => {
    const raw = window.sessionStorage.getItem('quizState');
    return raw ? (JSON.parse(raw) as SeededQuizState) : null;
  });
}

export function optionAt(page: Page, index: number): Locator {
  return page.locator('button[aria-pressed]').nth(index);
}

export function progressLabel(page: Page): Locator {
  return page.locator('header span.font-mono');
}

export async function expectQuestion(page: Page, questionNumber: number): Promise<void> {
  const label = `Question ${String(questionNumber).padStart(2, '0')} / 13`;
  await expect(progressLabel(page)).toHaveText(label);
}

export async function expectResultsSurface(page: Page): Promise<void> {
  await expect(progressLabel(page)).toHaveText('Results');
}

export async function stubClipboard(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const copies: string[] = [];
    (window as unknown as { __copies: string[] }).__copies = copies;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: (text: string) => {
          copies.push(text);
          return Promise.resolve();
        },
      },
    });
  });
}

export function clipboardWrites(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __copies: string[] }).__copies);
}

export async function resetClipboardWrites(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as unknown as { __copies: string[] }).__copies = [];
  });
}

/**
 * Records any of `needles` that ever reach the document, so a redirect can be proven
 * to have happened without a one-frame flash of the guarded content.
 */
export async function watchForText(page: Page, needles: string[]): Promise<void> {
  await page.addInitScript((list: string[]) => {
    const seen: string[] = [];
    (window as unknown as { __seen: string[] }).__seen = seen;

    const check = () => {
      const text = document.body ? document.body.textContent ?? '' : '';
      for (const needle of list) {
        if (text.includes(needle) && !seen.includes(needle)) {
          seen.push(needle);
        }
      }
    };

    const start = () => {
      check();
      new MutationObserver(check).observe(document, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('readystatechange', start, { once: true });
    } else {
      start();
    }
  }, needles);
}

export function seenText(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __seen: string[] }).__seen);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
}
