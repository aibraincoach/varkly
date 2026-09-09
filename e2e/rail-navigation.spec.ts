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

  test(`rail matrix: ${surface.name}, keyboard traversal can leave the rail`, async ({ page }) => {
    await seedQuizState(page, surface.state, surface.destination);
    await surface.verify(page);

    await tabToRailPanel(page, surface.target, 'Tab');
    expect(await focusedRailPanelIndex(page)).toBe(surface.target);

    await page.keyboard.press('Tab');
    expect(await focusedRailPanelIndex(page)).not.toBe(surface.target);
  });

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
