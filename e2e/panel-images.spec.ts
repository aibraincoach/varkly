import { test, expect, type Page } from '@playwright/test';
import { panels } from '../src/data/panels';
import { expectQuestion, expectResultsSurface, seedQuizState } from './helpers';

const PANEL_IMAGE_SELECTOR = 'section[aria-label="Questions"] img';

function panelImages(page: Page) {
  return page.locator(PANEL_IMAGE_SELECTOR);
}

async function expectPanelImageHints(
  page: Page,
  activeIndex: number
): Promise<void> {
  const images = panelImages(page);
  await expect(images).toHaveCount(panels.length);

  for (let index = 0; index < panels.length; index += 1) {
    const image = images.nth(index);
    const expectedLoading =
      index === 0 || index === activeIndex ? 'eager' : 'lazy';

    await expect(image).toHaveAttribute('decoding', 'async');
    await expect(image).toHaveAttribute('loading', expectedLoading);
    await expect(image).toHaveAttribute('alt', '');
    await expect(image).toHaveAttribute('src', panels[index].image);
    await expect(image).toHaveClass(/object-cover/);
    await expect(image).toHaveAttribute('width', '400');
    await expect(image).toHaveAttribute('height', '600');
  }
}

async function imageNaturalWidth(page: Page, index: number): Promise<number> {
  return panelImages(page).nth(index).evaluate((img) => (img as HTMLImageElement).naturalWidth);
}

test('I1: landing keeps the first panel eager and the rest lazy on desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expectPanelImageHints(page, -1);
});

test('I2: an active question keeps the first and active panels eager on desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seedQuizState(
    page,
    { currentQuestionIndex: 4, answers: {}, isCompleted: false },
    '/quiz'
  );
  await expectQuestion(page, 5);
  await expectPanelImageHints(page, 4);
});

test('I3: results keeps the first and results panels eager on desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await seedQuizState(
    page,
    {
      currentQuestionIndex: 12,
      answers: { '1': ['1V'] },
      isCompleted: true,
    },
    '/results'
  );
  await expectResultsSurface(page);
  await expectPanelImageHints(page, 13);
});

async function imageResourceRequested(page: Page, src: string): Promise<boolean> {
  return page.evaluate((imageSrc) => {
    return performance
      .getEntriesByType('resource')
      .some((entry) => entry.name.includes(imageSrc));
  }, src);
}

test('I4: mobile defers off-screen panel artwork until scrolled into view', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expectPanelImageHints(page, -1);
  await expect(panelImages(page).nth(12)).toHaveAttribute('loading', 'lazy');
  expect(await imageNaturalWidth(page, 0)).toBeGreaterThan(0);

  const offScreenSrc = panels[12].image;
  const requestedBeforeScroll = await imageResourceRequested(page, offScreenSrc);
  if (!requestedBeforeScroll) {
    expect(await imageNaturalWidth(page, 12)).toBe(0);
  }

  await page.getByRole('button', { name: 'Question 13: Unwind' }).scrollIntoViewIfNeeded();
  await expect
    .poll(async () => imageNaturalWidth(page, 12), { timeout: 10_000 })
    .toBeGreaterThan(0);
});

test('I5: activating another panel renders its artwork on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const inactivePanel = panelImages(page).nth(4);
  await expect(inactivePanel).toHaveAttribute('loading', 'lazy');

  await page.getByRole('button', { name: 'Question 05: Guitar' }).click();
  await expectQuestion(page, 5);
  await expectPanelImageHints(page, 4);
  await expect(inactivePanel).toHaveAttribute('loading', 'eager');
  await expect
    .poll(async () => imageNaturalWidth(page, 4), { timeout: 10_000 })
    .toBeGreaterThan(0);
});

test('I6: desktop and mobile layouts keep the panel rail visible', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(panelImages(page).first()).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(panelImages(page).first()).toBeVisible();
  await expect(page.locator('section[aria-label="Questions"]')).toBeVisible();
});
