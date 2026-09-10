import { test, expect } from '@playwright/test';
import { expectQuestion, KEYBOARD_FOCUS_NOTE, progressLabel } from './helpers';

const ABOUT_HEADLINE = 'A language for how you like things explained.';
const LANDING_MARKER = 'See. Hear.';

test('A1: the landing tertiary button opens /about and ← returns to landing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'About VARK' }).click();

  await expect(page).toHaveURL(/\/about$/);
  await expect(progressLabel(page)).toHaveText('About VARK');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(ABOUT_HEADLINE);
  await expect(page.getByText('About VARK · Fleming, 1987')).toBeVisible();
  await expect(page.getByText('It measures preference, not ability.')).toBeVisible();
  await expect(page.getByText('The evidence is mixed.')).toBeVisible();
  await expect(page.getByText('Why Varkly uses it anyway.')).toBeVisible();
  await expect(
    page.getByText('VARK is a preference inventory, not a diagnosis. Treat your result as a starting point.')
  ).toBeVisible();
  await expect(page.getByText('← back · enter to start')).toBeVisible();
  await expect(page.getByText(KEYBOARD_FOCUS_NOTE)).toBeVisible();
  await expect(page.getByRole('button', { name: "Let's begin" })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'About VARK' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Previous' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(LANDING_MARKER)).toBeVisible();
});

test('A2: Enter on /about starts the quiz and a reload stays on /about', async ({ page }) => {
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(ABOUT_HEADLINE);

  await page.reload();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(ABOUT_HEADLINE);

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/quiz$/);
  await expectQuestion(page, 1);
});

test('A3: Space on the landing view does nothing', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Space');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText(LANDING_MARKER)).toBeVisible();
});
