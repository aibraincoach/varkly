import { test, expect } from '@playwright/test';
import {
  assertDocumentSentinel,
  AUDITORY_SHARED_HASH,
  clipboardWrites,
  expectQuestion,
  expectResultsSurface,
  installDocumentSentinel,
  INVALID_SHARED_HASH,
  LEGACY_SHARED_HASH,
  navigateSameDocument,
  optionAt,
  readQuizState,
  readQuizStateBytes,
  resetSeenText,
  seedQuizState,
  seenText,
  stubClipboard,
  watchForText,
  ZERO_SHARED_HASH,
} from './helpers';

const EMPTY_HELPER = 'Choose at least one answer to get your AI prompts.';
const PROMPT_MARKER = 'System prompt';
const VISUAL_HEADLINE = 'You lean Visual.';
const AUDITORY_HEADLINE = 'You lean Auditory.';
const SHARED_PROFILE_LABEL = 'Shared VARK profile';

const COMPLETED_EMPTY = {
  currentQuestionIndex: 12,
  answers: {},
  isCompleted: true,
};

test('R1 and R2: skipping all thirteen questions lands on a reloadable empty result', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Let's begin" }).click();

  for (let questionNumber = 1; questionNumber <= 13; questionNumber += 1) {
    await expectQuestion(page, questionNumber);
    await page.getByRole('button', { name: 'Skip' }).click();
  }

  await expect(page).toHaveURL(/\/results$/);
  await expectResultsSurface(page);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('No answers yet.');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Go back and pick the answers that sound like you.'
  );
  await expect(page.getByText('0 · 0%')).toHaveCount(4);
  await expect(page.getByText(EMPTY_HELPER)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Answer questions' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retake' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible();
  await expect(
    page.getByText('← review questions · enter answer questions · space retake')
  ).toBeVisible();

  // R2 — the completed-but-empty profile survives a reload.
  await page.reload();
  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByRole('button', { name: 'Answer questions' })).toBeVisible();
  expect((await readQuizState(page))?.isCompleted).toBe(true);
});

test('R3: recovering from an empty result produces a normal result and prompts', async ({
  page,
}) => {
  await seedQuizState(page, COMPLETED_EMPTY, '/results');
  await page.getByRole('button', { name: 'Answer questions' }).click();

  await expectQuestion(page, 1);
  await optionAt(page, 0).click();
  await expect(optionAt(page, 0)).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Results' }).click();
  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(VISUAL_HEADLINE);

  await page.getByRole('button', { name: 'Get my AI prompts' }).click();
  await expect(page).toHaveURL(/\/prompts$/);
  await expect(page.getByText(PROMPT_MARKER, { exact: true })).toBeVisible();
  await expect(page.getByText('Conversation prompt', { exact: true })).toBeVisible();
});

test('R4: a fresh visitor is sent home from results and prompts with no personalized content', async ({
  page,
}) => {
  await watchForText(page, [PROMPT_MARKER, VISUAL_HEADLINE, 'Your VARK profile']);

  await page.goto('/results');
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
  expect(await seenText(page)).toEqual([]);

  await page.goto('/prompts');
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
  expect(await seenText(page)).toEqual([]);
});

test('R5: a completed but empty profile is redirected from prompts without flashing them', async ({
  page,
}) => {
  await watchForText(page, [PROMPT_MARKER]);
  await seedQuizState(page, COMPLETED_EMPTY, '/prompts');

  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByRole('button', { name: 'Answer questions' })).toBeVisible();
  await expect(page.getByText(EMPTY_HELPER)).toBeVisible();
  expect(await seenText(page)).toEqual([]);
});

test('R6: an all-zero shared link renders an empty result and offers the quiz', async ({ page }) => {
  await watchForText(page, [PROMPT_MARKER]);
  await page.goto(`/r/${ZERO_SHARED_HASH}`);

  await expect(page.getByText('Shared VARK profile')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('No answers yet.');
  await expect(page.getByText('0 · 0%')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Take quiz' })).toBeVisible();
  await expect(page.getByText('enter take quiz · space retake')).toBeVisible();

  await page.goto(`/r/${ZERO_SHARED_HASH}/prompts`);
  await expect(page).toHaveURL(new RegExp(`/r/${ZERO_SHARED_HASH}$`));
  expect(await seenText(page)).toEqual([]);

  await page.getByRole('button', { name: 'Take quiz' }).click();
  await expect(page).toHaveURL(/\/quiz$/);
  await expectQuestion(page, 1);
});

test('R7: local answers never leak into an all-zero shared profile', async ({ page }) => {
  await watchForText(page, [PROMPT_MARKER, VISUAL_HEADLINE]);
  await seedQuizState(
    page,
    { currentQuestionIndex: 3, answers: { '1': ['1V'], '2': ['2V'] }, isCompleted: false },
    `/r/${ZERO_SHARED_HASH}`
  );

  await expect(page.getByText('Shared VARK profile')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('No answers yet.');
  await expect(page.getByText('0 · 0%')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Take quiz' })).toBeVisible();

  await page.goto(`/r/${ZERO_SHARED_HASH}/prompts`);
  await expect(page).toHaveURL(new RegExp(`/r/${ZERO_SHARED_HASH}$`));
  expect(await seenText(page)).toEqual([]);
});

test('R8: the legacy share hash still decodes to V9 A2 R1 K1 with matching prompts', async ({
  page,
}) => {
  await stubClipboard(page);
  await page.goto(`/r/${LEGACY_SHARED_HASH}`);

  await expect(page.getByRole('heading', { level: 1 })).toContainText(VISUAL_HEADLINE);
  await expect(page.getByText('9 · 69%')).toBeVisible();
  await expect(page.getByText('2 · 15%')).toBeVisible();
  await expect(page.getByText('1 · 8%')).toHaveCount(2);

  await page.getByRole('button', { name: 'Get my AI prompts' }).click();
  await expect(page).toHaveURL(new RegExp(`/r/${LEGACY_SHARED_HASH}/prompts$`));

  const systemPrompt = await page.locator('pre').first().textContent();
  const conversationPrompt = await page.locator('pre').nth(1).textContent();
  expect(systemPrompt).toContain('I am a visual learner (VARK: V=9, A=2, R=1, K=1).');
  expect(conversationPrompt).toContain("I'm a Visual learner");

  await page.getByRole('button', { name: 'Copy both prompts' }).click();
  await expect(page.getByRole('button', { name: 'Copied both' })).toBeVisible();

  const writes = await clipboardWrites(page);
  expect(writes).toHaveLength(1);
  expect(writes[0]).toBe(`${systemPrompt}\n\n---\n\n${conversationPrompt}`);
});

test('R9: an invalid share hash replaces to home without showing any prior profile', async ({
  page,
}) => {
  await watchForText(page, [PROMPT_MARKER, VISUAL_HEADLINE, SHARED_PROFILE_LABEL]);

  await page.goto(`/r/${LEGACY_SHARED_HASH}`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(VISUAL_HEADLINE);
  expect(await seenText(page)).toContain(VISUAL_HEADLINE);

  await page.goto(`/r/${INVALID_SHARED_HASH}`);
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
  expect(await seenText(page)).toEqual([]);

  await page.goto(`/r/${INVALID_SHARED_HASH}/prompts`);
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
  expect(await seenText(page)).toEqual([]);
});

test('R10: same-document shared-route transitions decode synchronously without reload', async ({
  page,
}) => {
  const localAnswers = {
    currentQuestionIndex: 3,
    answers: { '1': ['1V'], '2': ['2V'] },
    isCompleted: false,
  };

  await watchForText(page, [
    PROMPT_MARKER,
    VISUAL_HEADLINE,
    AUDITORY_HEADLINE,
    SHARED_PROFILE_LABEL,
    EMPTY_HELPER,
  ]);

  await seedQuizState(page, localAnswers, `/r/${LEGACY_SHARED_HASH}`);
  const seededBytes = await readQuizStateBytes(page);
  expect(seededBytes).not.toBeNull();

  const sentinelId = await installDocumentSentinel(page);

  await expect(page).toHaveURL(new RegExp(`/r/${LEGACY_SHARED_HASH}$`));
  await expect(page.getByRole('heading', { level: 1 })).toContainText(VISUAL_HEADLINE);
  await expect(page.getByText('9 · 69%')).toBeVisible();
  await expect(page.getByText(SHARED_PROFILE_LABEL)).toBeVisible();
  await assertDocumentSentinel(page, sentinelId);
  expect(await readQuizStateBytes(page)).toBe(seededBytes);

  await resetSeenText(page);
  await navigateSameDocument(page, `/r/${AUDITORY_SHARED_HASH}`);
  await expect(page).toHaveURL(new RegExp(`/r/${AUDITORY_SHARED_HASH}$`));
  await expect(page.getByRole('heading', { level: 1 })).toContainText(AUDITORY_HEADLINE);
  await expect(page.getByRole('heading', { level: 1 })).not.toContainText(VISUAL_HEADLINE);
  await expect(page.getByText('9 · 69%')).toBeVisible();
  await assertDocumentSentinel(page, sentinelId);
  const afterAuditory = await seenText(page);
  expect(afterAuditory).not.toContain(VISUAL_HEADLINE);
  expect(afterAuditory).not.toContain(PROMPT_MARKER);
  expect(afterAuditory).not.toContain(EMPTY_HELPER);
  expect(await readQuizStateBytes(page)).toBe(seededBytes);

  await resetSeenText(page);
  await navigateSameDocument(page, `/r/${ZERO_SHARED_HASH}/prompts`);
  await expect(page).toHaveURL(new RegExp(`/r/${ZERO_SHARED_HASH}$`));
  await expect(page.getByRole('heading', { level: 1 })).toContainText('No answers yet.');
  await expect(page.getByText('0 · 0%')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'Take quiz' })).toBeVisible();
  await expect(page.getByText(PROMPT_MARKER)).toHaveCount(0);
  await assertDocumentSentinel(page, sentinelId);
  const afterZero = await seenText(page);
  expect(afterZero).not.toContain(VISUAL_HEADLINE);
  expect(afterZero).not.toContain(AUDITORY_HEADLINE);
  expect(afterZero).not.toContain(PROMPT_MARKER);
  expect(await readQuizStateBytes(page)).toBe(seededBytes);

  await resetSeenText(page);
  await navigateSameDocument(page, `/r/${INVALID_SHARED_HASH}`);
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
  await assertDocumentSentinel(page, sentinelId);
  expect(await seenText(page)).toEqual([]);
  expect(await readQuizStateBytes(page)).toBe(seededBytes);
});
