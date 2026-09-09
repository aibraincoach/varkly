import { test, expect, type Page } from '@playwright/test';
import {
  expectQuestion,
  expectResultsSurface,
  focusedRailPanelIndex,
  readQuizState,
  seedQuizState,
  tabToRailPanel,
  type SeededQuizState,
} from './helpers';

const QUESTION_SURFACE_STATE: SeededQuizState = {
  currentQuestionIndex: 2, // question 3
  answers: { '3': ['3V'] }, // question 3 already has an answer
  isCompleted: false,
};

const RESULTS_SURFACE_STATE: SeededQuizState = {
  currentQuestionIndex: 12,
  answers: { '1': ['1V'], '3': ['3V'], '6': ['6A'] },
  isCompleted: true,
};

type Surface = {
  name: string;
  state: SeededQuizState;
  destination: string;
  activeIndex: number;
  /** An enabled rail destination distinct from the active panel. */
  target: number;
  /** An enabled rail destination further along than target, approached first for Shift+Tab cases. */
  landmark: number;
  verify: (page: Page) => Promise<void>;
};

type Viewport = {
  name: string;
  width: number;
  height: number;
};

const VIEWPORTS: Viewport[] = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'mobile', width: 390, height: 900 },
];

const MAX_EXIT_TAB_PRESSES = 40;

const SURFACES: Surface[] = [
  {
    name: 'question 3 with an existing answer',
    state: QUESTION_SURFACE_STATE,
    destination: '/quiz',
    activeIndex: 2,
    target: 7, // Question 08
    landmark: 13, // Results — enabled because an answer exists
    verify: (page) => expectQuestion(page, 3),
  },
  {
    name: 'completed local Results',
    state: RESULTS_SURFACE_STATE,
    destination: '/results',
    activeIndex: 13,
    target: 5, // Question 06
    landmark: 12, // Question 13
    verify: (page) => expectResultsSurface(page),
  },
];

async function expectSurfaceForTarget(page: Page, target: number): Promise<void> {
  if (target === 13) {
    await expectResultsSurface(page);
  } else {
    await expectQuestion(page, target + 1);
  }
}

async function tabUntilOutsideRailControl(
  page: Page,
  startingRailIndex: number,
  direction: 'Tab' | 'Shift+Tab'
): Promise<void> {
  for (let step = 0; step < MAX_EXIT_TAB_PRESSES; step += 1) {
    await page.keyboard.press(direction);

    const focus = await page.evaluate(() => {
      const element = document.activeElement;
      if (!(element instanceof HTMLElement)) {
        return { isOutsideControl: false, railIndex: null };
      }

      const rail = element.closest('section[aria-label="Questions"]');
      const rawRailIndex =
        element instanceof HTMLButtonElement ? element.dataset.panelIndex : undefined;
      const railIndex =
        rail && rawRailIndex !== undefined && Number.isInteger(Number(rawRailIndex))
          ? Number(rawRailIndex)
          : null;

      const isEnabledControl =
        (element instanceof HTMLButtonElement && !element.disabled) ||
        (element instanceof HTMLAnchorElement && element.hasAttribute('href'));
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      const isVisible =
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0;

      return {
        isOutsideControl: !rail && isEnabledControl && isVisible,
        railIndex,
      };
    });

    if (focus.railIndex === startingRailIndex) {
      throw new Error(
        `Focus returned to starting rail panel ${startingRailIndex} via ${direction} before exiting`
      );
    }
    if (focus.isOutsideControl) return;
  }

  throw new Error(
    `Focus did not reach an enabled visible control outside the Questions rail via ${direction} within ${MAX_EXIT_TAB_PRESSES} presses`
  );
}

for (const surface of SURFACES) {
  for (const direction of ['Tab', 'Shift+Tab'] as const) {
    for (const activationKey of ['Enter', ' '] as const) {
      const keyLabel = activationKey === ' ' ? 'Space' : 'Enter';

      test(`rail matrix: ${surface.name}, reach via ${direction}, activate with ${keyLabel}`, async ({
        page,
      }) => {
        await seedQuizState(page, surface.state, surface.destination);
        await surface.verify(page);

        const before = await readQuizState(page);

        if (direction === 'Tab') {
          await tabToRailPanel(page, surface.target, 'Tab');
        } else {
          // Approach from further along the rail so Shift+Tab genuinely traverses backward.
          await tabToRailPanel(page, surface.landmark, 'Tab');
          await tabToRailPanel(page, surface.target, 'Shift+Tab');
        }

        // The active panel and any other disabled destinations were skipped: the
        // control we actually landed on is the intended, enabled target, not the
        // active panel (which is provably disabled).
        expect(await focusedRailPanelIndex(page)).toBe(surface.target);
        expect(surface.target).not.toBe(surface.activeIndex);
        await expect(
          page.locator(`button[data-panel-index="${surface.activeIndex}"]`)
        ).toBeDisabled();

        const focusedLabel = await page.evaluate(
          () => (document.activeElement as HTMLElement | null)?.getAttribute('aria-label') ?? null
        );
        const expectedLabel =
          surface.target === 13 ? 'Results' : `Question ${String(surface.target + 1).padStart(2, '0')}`;
        expect(focusedLabel).toContain(expectedLabel);

        await page.keyboard.press(activationKey);
        await expectSurfaceForTarget(page, surface.target);

        const after = await readQuizState(page);
        // No reset occurred: answers are untouched by rail navigation.
        expect(after?.answers).toEqual(before?.answers);
        // goToQuestion clears completion by contract; goToResults (target 13) does not.
        expect(after?.isCompleted).toBe(surface.target === 13 ? before?.isCompleted : false);
      });
    }
  }

  for (const direction of ['Tab', 'Shift+Tab'] as const) {
    for (const viewport of VIEWPORTS) {
      test(`rail exit: ${surface.name}, ${direction}, ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await seedQuizState(page, surface.state, surface.destination);
        await surface.verify(page);

        const pathnameBefore = new URL(page.url()).pathname;
        const stateBefore = await readQuizState(page);

        await tabToRailPanel(page, surface.target, 'Tab');
        expect(await focusedRailPanelIndex(page)).toBe(surface.target);

        await tabUntilOutsideRailControl(page, surface.target, direction);

        const expectedExit =
          direction === 'Tab'
            ? page.getByRole('link', { name: 'Skip to content' })
            : page.getByRole('button', {
                name: surface.destination === '/quiz' ? 'Skip' : 'Retake',
                exact: true,
              });
        await expect(expectedExit).toBeVisible();
        await expect(expectedExit).toBeEnabled();
        await expect(expectedExit).toBeFocused();

        expect(new URL(page.url()).pathname).toBe(pathnameBefore);
        await surface.verify(page);

        const stateAfter = await readQuizState(page);
        expect(stateAfter?.currentQuestionIndex).toBe(stateBefore?.currentQuestionIndex);
        expect(stateAfter?.answers).toEqual(stateBefore?.answers);
        expect(stateAfter?.isCompleted).toBe(stateBefore?.isCompleted);
      });
    }
  }

  for (const activationKey of ['Enter', ' '] as const) {
    const keyLabel = activationKey === ' ' ? 'Space' : 'Enter';

    test(`rail matrix: ${surface.name}, held ${keyLabel} on a focused rail button navigates once`, async ({
      page,
    }) => {
      await seedQuizState(page, surface.state, surface.destination);
      await surface.verify(page);

      await tabToRailPanel(page, surface.target, 'Tab');
      expect(await focusedRailPanelIndex(page)).toBe(surface.target);

      await page.keyboard.down(activationKey);
      await expectSurfaceForTarget(page, surface.target);

      // Held repeats must not fire a second navigation once ownership is registered.
      await page.keyboard.down(activationKey);
      await page.keyboard.down(activationKey);
      await expectSurfaceForTarget(page, surface.target);

      await page.keyboard.up(activationKey);
      await expectSurfaceForTarget(page, surface.target);
    });
  }
}
