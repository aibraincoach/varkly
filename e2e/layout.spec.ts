import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import {
  E2E_ARTIFACT_DIR,
  expectNoHorizontalOverflow,
  expectQuestion,
  expectResultsSurface,
  KEYBOARD_FOCUS_NOTE,
  LEGACY_SHARED_HASH,
  seedQuizState,
  ZERO_SHARED_HASH,
} from './helpers';

const EMPTY_HELPER = 'Choose at least one answer to get your AI prompts.';

const COMPLETED_EMPTY = {
  currentQuestionIndex: 12,
  answers: {},
  isCompleted: true,
};

const VIEWPORTS = [
  { label: 'desktop', slug: 'desktop', width: 1440, height: 900 },
  { label: 'mobile 390px', slug: 'mobile-390', width: 390, height: 844 },
];

const ANSWERED = {
  currentQuestionIndex: 12,
  answers: { '1': ['1V', '1R'], '2': ['2V'], '5': ['5V'] },
  isCompleted: true,
};

for (const viewport of VIEWPORTS) {
  test(`U1: hints, actions and footer stay visible without horizontal overflow on ${viewport.label}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const footer = page.getByRole('contentinfo');

    await page.goto('/');
    await expect(page.getByText('enter to start')).toBeVisible();
    await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toBeVisible();
    await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
    for (const blurb of [
      'Charts, diagrams, seeing it demonstrated',
      'Listening, discussion, verbal instructions',
      'Words, lists, written materials',
      'Doing, experiencing, hands-on practice',
    ]) {
      await expect(page.getByText(blurb)).toBeVisible();
    }
    await expect(footer).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.getByRole('button', { name: "Let's begin" }).click();
    await expectQuestion(page, 1);
    await expect(page.getByText('keys 1–4 select · enter next · space skip')).toBeVisible();
    await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skip' })).toBeVisible();
    await expect(footer).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await seedQuizState(page, ANSWERED, '/results');
    await expectResultsSurface(page);
    await expect(page.getByText('Learning tips for Visual learners')).toBeVisible();
    await expect(page.getByText('Use color-coding and highlighters in your notes')).toBeVisible();
    await expect(
      page.getByText('← review answers · enter get prompts · space retake')
    ).toBeVisible();
    await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get my AI prompts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible();
    await expect(footer).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto('/prompts');
    await expect(
      page.getByText('← back to results · enter copy both · space retake')
    ).toBeVisible();
    await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy both prompts' })).toBeVisible();
    await expect(footer).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto(`/r/${LEGACY_SHARED_HASH}`);
    await expect(page.getByText('enter get prompts · space retake')).toBeVisible();
    await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toBeVisible();
    await expect(footer).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await seedQuizState(page, COMPLETED_EMPTY, '/results');
    await expectResultsSurface(page);
    await expect(page.getByRole('button', { name: 'Answer questions' })).toBeVisible();
    await expect(page.getByText(EMPTY_HELPER)).toBeVisible();
    await expect(page.getByText('Complete more questions to see your results!')).toBeVisible();
    await expect(
      page.getByText('← review questions · enter answer questions · space retake')
    ).toBeVisible();
    await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible();
    await expect(footer).toBeVisible();
    await expectNoHorizontalOverflow(page);
    fs.mkdirSync(E2E_ARTIFACT_DIR, { recursive: true });
    await page.screenshot({
      path: `${E2E_ARTIFACT_DIR}/u1-empty-local-${viewport.slug}.png`,
      fullPage: true,
    });

    await page.goto(`/r/${ZERO_SHARED_HASH}`);
    await expect(page.getByRole('button', { name: 'Take quiz' })).toBeVisible();
    await expect(page.getByText(EMPTY_HELPER)).toBeVisible();
    await expect(page.getByText('enter take quiz · space retake')).toBeVisible();
    await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible();
    await expect(footer).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({
      path: `${E2E_ARTIFACT_DIR}/u1-empty-shared-${viewport.slug}.png`,
      fullPage: true,
    });
  });
}
