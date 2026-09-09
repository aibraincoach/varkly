import { test, expect, type Page } from '@playwright/test';

async function htmlTheme(page: Page): Promise<string | null> {
  return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
}

async function bodyBackground(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

test('T1: with no stored preference the theme follows the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  expect(await htmlTheme(page)).toBe('dark');
  expect(await bodyBackground(page)).toBe('rgb(18, 18, 22)');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();

  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => htmlTheme(page)).toBe('light');
  await expect.poll(() => bodyBackground(page)).toBe('rgb(243, 243, 245)');
});

test('T2: the header toggle flips the theme and the choice survives a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await htmlTheme(page)).toBe('light');

  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  expect(await htmlTheme(page)).toBe('dark');
  expect(await page.evaluate(() => localStorage.getItem('varkly-theme'))).toBe('dark');

  await page.reload();
  expect(await htmlTheme(page)).toBe('dark');
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
});

test('T3: a stored preference is applied before first paint (no light flash)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('varkly-theme', 'dark'));

  await page.addInitScript(() => {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        (window as unknown as { __firstTheme: string | null }).__firstTheme =
          document.documentElement.getAttribute('data-theme');
      },
      { once: true }
    );
  });
  await page.goto('/');
  const firstTheme = await page.evaluate(
    () => (window as unknown as { __firstTheme: string | null }).__firstTheme
  );
  expect(firstTheme).toBe('dark');
});

test('T4: an explicit preference wins over a later system change', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.emulateMedia({ colorScheme: 'light' });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await htmlTheme(page)).toBe('dark');
});
