import path from 'node:path';
import { expect, type Locator, type Page } from '@playwright/test';

export const E2E_ARTIFACT_DIR = path.join(
  process.cwd(),
  '.superpowers/sdd/varkly-close-review-findings/artifacts'
);

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
/** btoa('2-9-1-1') without padding — a valid profile with Auditory dominance. */
export const AUDITORY_SHARED_HASH = 'Mi05LTEtMQ';
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

/** Clears the MutationObserver buffer in place so the observer keeps its captured array reference. */
export async function resetSeenText(page: Page): Promise<void> {
  await page.evaluate(() => {
    const seen = (window as unknown as { __seen?: string[] }).__seen;
    if (!seen) {
      throw new Error(
        'MutationObserver seen buffer is missing — call watchForText before resetSeenText'
      );
    }
    seen.length = 0;
  });
}

export async function readQuizStateBytes(page: Page): Promise<string | null> {
  return page.evaluate(() => window.sessionStorage.getItem('quizState'));
}

/** Installs a window sentinel once; identity must survive same-document route changes. */
export async function installDocumentSentinel(page: Page): Promise<string> {
  return page.evaluate(() => {
    const sentinel = { id: `e2e-${String(Date.now())}` };
    (window as unknown as { __docSentinel: { id: string } }).__docSentinel = sentinel;
    return sentinel.id;
  });
}

export async function assertDocumentSentinel(page: Page, expectedId: string): Promise<void> {
  const current = await page.evaluate(() => {
    const sentinel = (window as unknown as { __docSentinel?: { id: string } }).__docSentinel;
    return sentinel?.id ?? null;
  });
  expect(current).toBe(expectedId);
}

/**
 * Same-document route change via History API plus a browser history event.
 * React Router picks up the new pathname without a full document reload.
 */
export async function navigateSameDocument(page: Page, pathname: string): Promise<void> {
  await page.evaluate((path) => {
    window.history.pushState(window.history.state, '', path);
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
  }, pathname);
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
}
