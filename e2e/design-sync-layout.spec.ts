import fs from 'node:fs';
import { test, expect, type Page } from '@playwright/test';
import {
  E2E_ARTIFACT_DIR,
  expectNoHorizontalOverflow,
  expectResultsSurface,
  seedQuizState,
  type SeededQuizState,
} from './helpers';

const VIEWPORTS = [
  { slug: 'desktop-1440', width: 1440, height: 900 },
  { slug: 'desktop-1100', width: 1100, height: 900 },
  { slug: 'mobile-390', width: 390, height: 844 },
];

const RESULT_VARIANTS: Array<{ slug: string; state: SeededQuizState }> = [
  {
    slug: 'results-one-dominant',
    state: { currentQuestionIndex: 12, answers: { '1': ['1V'], '2': ['2V'], '3': ['3V'] }, isCompleted: true },
  },
  {
    slug: 'results-two-dominant',
    state: { currentQuestionIndex: 12, answers: { '1': ['1V', '1K'], '2': ['2V', '2K'] }, isCompleted: true },
  },
  {
    slug: 'results-balanced',
    state: {
      currentQuestionIndex: 12,
      answers: { '1': ['1V', '1A', '1R', '1K'] },
      isCompleted: true,
    },
  },
  {
    slug: 'results-empty',
    state: { currentQuestionIndex: 12, answers: {}, isCompleted: true },
  },
];

async function bodyMetrics(page: Page) {
  return page.evaluate(() => {
    const body = document.querySelector('.panels-aside-body');
    if (!(body instanceof HTMLElement)) throw new Error('.panels-aside-body not found');
    return { scrollHeight: body.scrollHeight, clientHeight: body.clientHeight };
  });
}

async function actionRowTop(page: Page): Promise<number> {
  const box = await page.getByRole('button', { name: 'Previous' }).boundingBox();
  if (!box) throw new Error('Previous button has no bounding box');
  return Math.round(box.y);
}

async function snapshot(page: Page, name: string) {
  fs.mkdirSync(E2E_ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${E2E_ARTIFACT_DIR}/design-sync-${name}.png`, fullPage: true });
}

for (const viewport of VIEWPORTS) {
  test(`L1: aside body never overflows and the action row never moves on ${viewport.slug}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const rowTops: Record<string, number> = {};

    await page.goto('/');
    await expect(page.getByText('See. Hear.')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    let metrics = await bodyMetrics(page);
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
    rowTops.landing = await actionRowTop(page);
    await snapshot(page, `landing-${viewport.slug}`);

    await page.goto('/about');
    await expect(page.getByText('About VARK · Fleming, 1987')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    metrics = await bodyMetrics(page);
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 1);
    rowTops.about = await actionRowTop(page);
    await snapshot(page, `about-${viewport.slug}`);

    for (const variant of RESULT_VARIANTS) {
      await seedQuizState(page, variant.state, '/results');
      await expectResultsSurface(page);
      await expectNoHorizontalOverflow(page);
      metrics = await bodyMetrics(page);
      expect(metrics.scrollHeight, variant.slug).toBeLessThanOrEqual(metrics.clientHeight + 1);
      rowTops[variant.slug] = await actionRowTop(page);
      await snapshot(page, `${variant.slug}-${viewport.slug}`);
    }

    if (viewport.width >= 1100) {
      const tops = Object.values(rowTops);
      expect(new Set(tops).size, JSON.stringify(rowTops)).toBe(1);
    }
  });
}
