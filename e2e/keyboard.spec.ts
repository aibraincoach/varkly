import { test, expect } from '@playwright/test';
import {
  clipboardWrites,
  expectQuestion,
  expectResultsSurface,
  optionAt,
  readQuizState,
  seedQuizState,
  stubClipboard,
} from './helpers';

const AT_FIRST_QUESTION = {
  currentQuestionIndex: 0,
  answers: {},
  isCompleted: false,
};

const AT_LAST_QUESTION = {
  currentQuestionIndex: 12,
  answers: { '1': ['1V'] },
  isCompleted: false,
};

const ANSWERED = {
  currentQuestionIndex: 12,
  answers: { '1': ['1V', '1R'], '2': ['2A'], '5': ['5K'] },
  isCompleted: true,
};

test('K1: clicking an option then pressing Enter advances exactly once and keeps the selection', async ({
  page,
}) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  const firstOption = optionAt(page, 0);
  await firstOption.click();
  await expect(firstOption).toHaveAttribute('aria-pressed', 'true');
  await expect(firstOption).toBeFocused();

  await page.keyboard.press('Enter');

  await expectQuestion(page, 2);
  expect((await readQuizState(page))?.answers).toEqual({ '1': ['1V'] });
});

test('K2: tabbing to an option then pressing Enter advances once without toggling it', async ({
  page,
}) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  // Skip link, then the Varkly logo link, then the first option.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  const firstOption = optionAt(page, 0);
  await expect(firstOption).toBeFocused();
  await expect(firstOption).toHaveAttribute('aria-pressed', 'false');

  await page.keyboard.press('Enter');

  await expectQuestion(page, 2);
  expect((await readQuizState(page))?.answers).toEqual({});
});

test('K3: clicking an option then pressing Space skips once and never toggles on key up', async ({
  page,
}) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  const firstOption = optionAt(page, 0);
  await firstOption.click();
  await expect(firstOption).toHaveAttribute('aria-pressed', 'true');
  await expect(firstOption).toBeFocused();

  await page.keyboard.press(' ');

  await expectQuestion(page, 2);
  expect((await readQuizState(page))?.answers).toEqual({ '1': ['1V'] });
});

test('K4: with an option focused each digit toggles its own option and reverses', async ({
  page,
}) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  const firstOption = optionAt(page, 0);
  await firstOption.focus();
  await expect(firstOption).toBeFocused();

  const digits = ['1', '2', '3', '4'];
  for (let index = 0; index < digits.length; index += 1) {
    const option = optionAt(page, index);

    await page.keyboard.press(digits[index]);
    await expect(option).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press(digits[index]);
    await expect(option).toHaveAttribute('aria-pressed', 'false');
  }

  await expectQuestion(page, 1);
  expect((await readQuizState(page))?.answers).toEqual({ '1': [] });
});

test('K5: on a question the shortcuts win over a focused Next, Previous or rail button', async ({
  page,
}) => {
  await seedQuizState(page, { currentQuestionIndex: 2, answers: {}, isCompleted: false }, '/quiz');
  await expectQuestion(page, 3);

  const next = page.getByRole('button', { name: 'Next' });
  await next.focus();
  await expect(next).toBeFocused();
  await page.keyboard.press('1');
  await expect(optionAt(page, 0)).toHaveAttribute('aria-pressed', 'true');
  await expectQuestion(page, 3);

  const previous = page.getByRole('button', { name: 'Previous' });
  await previous.focus();
  await expect(previous).toBeFocused();
  // Space is the skip shortcut, so it must move forward even though Previous holds focus.
  await page.keyboard.press(' ');
  await expectQuestion(page, 4);

  const railPanel = page.getByRole('button', { name: 'Question 08: Trip' });
  await railPanel.focus();
  await expect(railPanel).toBeFocused();
  // Enter is the next shortcut, so it must not open panel 8.
  await page.keyboard.press('Enter');
  await expectQuestion(page, 5);
});

test('K6: arrow keys step one question at a time and respect both boundaries', async ({ page }) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  const next = page.getByRole('button', { name: 'Next' });
  await next.focus();
  await expect(next).toBeFocused();

  await page.keyboard.press('ArrowLeft');
  await expectQuestion(page, 1);

  await page.keyboard.press('ArrowRight');
  await expectQuestion(page, 2);

  await page.keyboard.press('ArrowLeft');
  await expectQuestion(page, 1);

  await seedQuizState(page, AT_LAST_QUESTION, '/quiz');
  await expectQuestion(page, 13);

  const skip = page.getByRole('button', { name: 'Skip' });
  await skip.focus();
  await expect(skip).toBeFocused();

  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/\/results$/);
  await expectResultsSurface(page);
});

test('K7: held Enter and Space fire one action per press and never reach Retake', async ({
  page,
}) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await page.keyboard.up('Enter');
  await expectQuestion(page, 2);

  await seedQuizState(page, AT_LAST_QUESTION, '/quiz');
  await expectQuestion(page, 13);

  await page.keyboard.down(' ');
  await page.keyboard.down(' ');
  await page.keyboard.down(' ');
  await page.keyboard.up(' ');

  await expect(page).toHaveURL(/\/results$/);
  const state = await readQuizState(page);
  expect(state?.isCompleted).toBe(true);
  expect(state?.answers).toEqual({ '1': ['1V'] });
});

test('K8: editable targets and modified shortcuts change neither state nor route', async ({
  page,
}) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  for (const combination of [
    'Control+Enter',
    'Meta+ArrowRight',
    'Alt+ArrowRight',
    'Shift+ArrowRight',
    'Control+1',
    'Shift+1',
  ]) {
    await page.keyboard.press(combination);
  }
  await expectQuestion(page, 1);
  expect((await readQuizState(page))?.answers).toEqual({});

  // The app renders no form fields, so the editable-target guard is exercised
  // against real elements appended outside the React root.
  await page.evaluate(() => {
    const textarea = document.createElement('textarea');
    textarea.id = 'e2e-textarea';
    const editable = document.createElement('div');
    editable.id = 'e2e-contenteditable';
    editable.setAttribute('contenteditable', 'true');
    document.body.append(textarea, editable);
  });

  for (const selector of ['#e2e-textarea', '#e2e-contenteditable']) {
    const field = page.locator(selector);
    await field.focus();
    await expect(field).toBeFocused();

    await page.keyboard.press('1');
    await page.keyboard.press('Enter');
    await page.keyboard.press(' ');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');

    await expectQuestion(page, 1);
    expect((await readQuizState(page))?.answers).toEqual({});
  }
});

test('K9: activating a focused copy button runs the native action only', async ({ page }) => {
  await stubClipboard(page);
  await seedQuizState(page, ANSWERED, '/results');
  await expectResultsSurface(page);

  const copyLink = page.getByRole('button', { name: 'Copy link' });
  await copyLink.focus();
  await expect(copyLink).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  await expect(page).toHaveURL(/\/results$/);
  const resultsWrites = await clipboardWrites(page);
  expect(resultsWrites).toHaveLength(1);
  expect(resultsWrites[0]).toContain('/r/');

  await seedQuizState(page, ANSWERED, '/prompts');
  const systemCopy = page.getByRole('button', { name: 'Copy', exact: true }).first();
  await systemCopy.focus();
  await expect(systemCopy).toBeFocused();
  await page.keyboard.press(' ');

  await expect(page).toHaveURL(/\/prompts$/);
  const systemPrompt = await page.locator('pre').first().textContent();
  const promptWrites = await clipboardWrites(page);
  expect(promptWrites).toHaveLength(1);
  expect(promptWrites[0]).toBe(systemPrompt);
  expect((await readQuizState(page))?.answers).toEqual(ANSWERED.answers);
});

test('K10: with the page focused Enter opens prompts and Space retakes, clearing state', async ({
  page,
}) => {
  await seedQuizState(page, ANSWERED, '/results');
  await expectResultsSurface(page);
  await expect(page.locator('body')).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/prompts$/);

  await page.keyboard.press(' ');
  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  expect(await readQuizState(page)).toEqual({
    currentQuestionIndex: -1,
    answers: {},
    isCompleted: false,
  });
});

test('K12: Next focused on question 1 + held Enter ends on question 2', async ({ page }) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  const next = page.getByRole('button', { name: 'Next' });
  await next.focus();
  await expect(next).toBeFocused();

  await page.keyboard.down('Enter');
  await expectQuestion(page, 2);

  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await expectQuestion(page, 2);

  await page.keyboard.up('Enter');
  await expectQuestion(page, 2);
});

test('K13: Previous focused on question 2 + held Enter ends on question 3', async ({ page }) => {
  await seedQuizState(page, { currentQuestionIndex: 1, answers: {}, isCompleted: false }, '/quiz');
  await expectQuestion(page, 2);

  const previous = page.getByRole('button', { name: 'Previous' });
  await previous.focus();
  await expect(previous).toBeFocused();

  await page.keyboard.down('Enter');
  await expectQuestion(page, 3);

  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await expectQuestion(page, 3);

  await page.keyboard.up('Enter');
  await expectQuestion(page, 3);
});

test('K14: Previous focused on question 2 + held Space ends on question 3 after release', async ({
  page,
}) => {
  await seedQuizState(page, { currentQuestionIndex: 1, answers: {}, isCompleted: false }, '/quiz');
  await expectQuestion(page, 2);

  const previous = page.getByRole('button', { name: 'Previous' });
  await previous.focus();
  await expect(previous).toBeFocused();

  await page.keyboard.down(' ');
  await expectQuestion(page, 3);

  await page.keyboard.down(' ');
  await page.keyboard.down(' ');
  await expectQuestion(page, 3);

  await page.keyboard.up(' ');
  await expectQuestion(page, 3);
});

test('K15: focused rail button + held Enter advances one question without opening the rail destination', async ({
  page,
}) => {
  await seedQuizState(page, { currentQuestionIndex: 2, answers: {}, isCompleted: false }, '/quiz');
  await expectQuestion(page, 3);

  const railPanel = page.getByRole('button', { name: 'Question 08: Trip' });
  await railPanel.focus();
  await expect(railPanel).toBeFocused();

  await page.keyboard.down('Enter');
  await expectQuestion(page, 4);

  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await expectQuestion(page, 4);

  await page.keyboard.up('Enter');
  await expectQuestion(page, 4);
});

test('K16: See results focused on question 13 + held Enter ends on results without prompts or copy', async ({
  page,
}) => {
  await seedQuizState(page, AT_LAST_QUESTION, '/quiz');
  await expectQuestion(page, 13);

  const seeResults = page.getByRole('button', { name: 'See results' });
  await seeResults.focus();
  await expect(seeResults).toBeFocused();

  await page.keyboard.down('Enter');
  await expect(page).toHaveURL(/\/results$/);
  await expectResultsSurface(page);

  await page.keyboard.down('Enter');
  await page.keyboard.down('Enter');
  await expect(page).toHaveURL(/\/results$/);
  await expect(page.getByRole('button', { name: 'Get my AI prompts' })).toBeVisible();

  await page.keyboard.up('Enter');
  await expect(page).toHaveURL(/\/results$/);
  expect((await readQuizState(page))?.isCompleted).toBe(true);
});

test('K17: Skip focused on question 13 + held Space ends on results without Retake', async ({
  page,
}) => {
  await seedQuizState(page, AT_LAST_QUESTION, '/quiz');
  await expectQuestion(page, 13);

  const skip = page.getByRole('button', { name: 'Skip' });
  await skip.focus();
  await expect(skip).toBeFocused();

  await page.keyboard.down(' ');
  await expect(page).toHaveURL(/\/results$/);
  await expectResultsSurface(page);

  await page.keyboard.down(' ');
  await page.keyboard.down(' ');
  await expect(page).toHaveURL(/\/results$/);
  await expect(page).not.toHaveURL(/127\.0\.0\.1:4173\/$/);

  await page.keyboard.up(' ');
  await expect(page).toHaveURL(/\/results$/);
  expect((await readQuizState(page))?.isCompleted).toBe(true);
});

test('K18: after a held shortcut releases, the next press performs its normal action', async ({
  page,
}) => {
  await seedQuizState(page, AT_LAST_QUESTION, '/quiz');
  await expectQuestion(page, 13);

  const seeResults = page.getByRole('button', { name: 'See results' });
  await seeResults.focus();
  await expect(seeResults).toBeFocused();

  await page.keyboard.down('Enter');
  await expect(page).toHaveURL(/\/results$/);
  await page.keyboard.up('Enter');
  await expect(page).toHaveURL(/\/results$/);

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/prompts$/);
});

test('K19: window blur while a key is owned resets ownership so fresh presses work', async ({
  page,
}) => {
  await seedQuizState(page, AT_FIRST_QUESTION, '/quiz');
  await expectQuestion(page, 1);

  const next = page.getByRole('button', { name: 'Next' });
  await next.focus();
  await expect(next).toBeFocused();

  await page.keyboard.down('Enter');
  await expectQuestion(page, 2);

  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.keyboard.up('Enter');
  await expectQuestion(page, 2);

  await next.focus();
  await expect(next).toBeFocused();
  await page.keyboard.press('Enter');
  await expectQuestion(page, 3);
});

test('K11: Enter on the focused logo follows the link and nothing else', async ({ page }) => {
  await seedQuizState(page, ANSWERED, '/results');
  await expectResultsSurface(page);

  const logo = page.getByRole('link', { name: /Varkly/ });
  await logo.focus();
  await expect(logo).toBeFocused();

  await page.keyboard.press('Enter');

  await expect(page).toHaveURL(/127\.0\.0\.1:4173\/$/);
  await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
  const state = await readQuizState(page);
  expect(state?.answers).toEqual(ANSWERED.answers);
  expect(state?.isCompleted).toBe(true);
});
