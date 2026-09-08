import { test, expect } from '@playwright/test';
import {
  expectQuestion,
  expectResultsSurface,
  optionAt,
  readQuizState,
  seedQuizState,
} from './helpers';

const PARTIAL_ANSWERS = { '1': ['1V', '1R'], '2': ['2A'] };

async function answerFirstTwoQuestions(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's begin" }).click();
  await expectQuestion(page, 1);

  await optionAt(page, 0).click();
  await optionAt(page, 2).click();
  await page.getByRole('button', { name: 'Next' }).click();

  await expectQuestion(page, 2);
  await optionAt(page, 1).click();
}

test('S1: leaving through the logo and starting again keeps every answer', async ({ page }) => {
  await answerFirstTwoQuestions(page);

  await page.getByRole('link', { name: /Varkly/ }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);

  const afterLanding = await readQuizState(page);
  expect(afterLanding?.answers).toEqual(PARTIAL_ANSWERS);
  expect(afterLanding?.currentQuestionIndex).toBe(1);

  await page.getByRole('button', { name: "Let's begin" }).click();
  await expectQuestion(page, 1);

  const afterRestart = await readQuizState(page);
  expect(afterRestart).toEqual({
    currentQuestionIndex: 0,
    answers: PARTIAL_ANSWERS,
    isCompleted: false,
  });
  await expect(optionAt(page, 0)).toHaveAttribute('aria-pressed', 'true');
  await expect(optionAt(page, 2)).toHaveAttribute('aria-pressed', 'true');
  await expect(optionAt(page, 1)).toHaveAttribute('aria-pressed', 'false');
});

test('S2: leaving results through the logo and starting again keeps every answer', async ({
  page,
}) => {
  await seedQuizState(
    page,
    { currentQuestionIndex: 12, answers: PARTIAL_ANSWERS, isCompleted: true },
    '/results'
  );
  await expectResultsSurface(page);

  await page.getByRole('link', { name: /Varkly/ }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  expect((await readQuizState(page))?.answers).toEqual(PARTIAL_ANSWERS);

  await page.getByRole('button', { name: "Let's begin" }).click();
  await expectQuestion(page, 1);

  expect(await readQuizState(page)).toEqual({
    currentQuestionIndex: 0,
    answers: PARTIAL_ANSWERS,
    isCompleted: false,
  });
  await expect(optionAt(page, 0)).toHaveAttribute('aria-pressed', 'true');
  await expect(optionAt(page, 2)).toHaveAttribute('aria-pressed', 'true');
});

test('S3: reloading mid-quiz restores the question index and the selections', async ({ page }) => {
  await answerFirstTwoQuestions(page);

  await page.reload();

  await expectQuestion(page, 2);
  await expect(optionAt(page, 1)).toHaveAttribute('aria-pressed', 'true');
  expect((await readQuizState(page))?.answers).toEqual(PARTIAL_ANSWERS);
});

test('S4: Retake by click and by Space clears the state through a reload', async ({ page }) => {
  await seedQuizState(
    page,
    { currentQuestionIndex: 12, answers: PARTIAL_ANSWERS, isCompleted: true },
    '/results'
  );
  await page.getByRole('button', { name: 'Retake' }).click();
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);

  await page.reload();
  expect(await readQuizState(page)).toEqual({
    currentQuestionIndex: -1,
    answers: {},
    isCompleted: false,
  });
  await page.goto('/results');
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);

  await seedQuizState(
    page,
    { currentQuestionIndex: 12, answers: PARTIAL_ANSWERS, isCompleted: true },
    '/results'
  );
  await expectResultsSurface(page);
  await expect(page.locator('body')).toBeFocused();
  await page.keyboard.press(' ');
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);

  await page.reload();
  expect(await readQuizState(page)).toEqual({
    currentQuestionIndex: -1,
    answers: {},
    isCompleted: false,
  });
  await page.goto('/results');
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
});
