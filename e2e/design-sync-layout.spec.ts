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

const ONE_DOMINANT_STATE: SeededQuizState = RESULT_VARIANTS[0].state;

async function asideMetrics(page: Page) {
  return page.evaluate(() => {
    const body = document.querySelector('.panels-aside-body');
    if (!(body instanceof HTMLElement)) throw new Error('.panels-aside-body not found');
    const aside = body.closest('aside');
    if (!aside) throw new Error('aside not found');
    const clipped = Array.from(aside.querySelectorAll<HTMLElement>('h1, h1 > span, p, li, section'))
      .filter((el) => {
        const overflows =
          el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
        if (!overflows) return false;
        // leading-[1.1] title spans can report scrollHeight > clientHeight with overflow:visible
        // and no visual clipping; only flag when a clipping ancestor exists.
        let node: HTMLElement | null = el;
        while (node && node !== aside.parentElement) {
          const style = getComputedStyle(node);
          if (
            style.overflow !== 'visible' ||
            style.overflowX !== 'visible' ||
            style.overflowY !== 'visible'
          ) {
            return true;
          }
          if (node === aside) break;
          node = node.parentElement;
        }
        return false;
      })
      .map((el) => (el.textContent ?? '').trim().slice(0, 60));
    return { bodyClientHeight: body.clientHeight, bodyScrollHeight: body.scrollHeight, clipped };
  });
}

async function snapshot(page: Page, name: string) {
  fs.mkdirSync(E2E_ARTIFACT_DIR, { recursive: true });
  await page.screenshot({ path: `${E2E_ARTIFACT_DIR}/design-sync-${name}.png`, fullPage: true });
}

for (const colorScheme of ['light', 'dark'] as const) {
  for (const viewport of VIEWPORTS) {
    test(`L1: aside body never overflows and fixed-block height is shared on ${viewport.slug} (${colorScheme})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.emulateMedia({ colorScheme });
      const heights: Record<string, number> = {};

      await page.goto('/');
      await expect(page.getByText('See. Hear.')).toBeVisible();
      await expectNoHorizontalOverflow(page);
      let m = await asideMetrics(page);
      expect(m.clipped, 'landing').toEqual([]);
      expect(m.bodyScrollHeight, 'landing').toBeLessThanOrEqual(m.bodyClientHeight + 1);
      heights.landing = m.bodyClientHeight;
      await snapshot(page, `landing-${viewport.slug}-${colorScheme}`);

      await page.goto('/about');
      await expect(page.getByText('About VARK · Fleming, 1987')).toBeVisible();
      await expectNoHorizontalOverflow(page);
      m = await asideMetrics(page);
      expect(m.clipped, 'about').toEqual([]);
      expect(m.bodyScrollHeight, 'about').toBeLessThanOrEqual(m.bodyClientHeight + 1);
      heights.about = m.bodyClientHeight;
      await snapshot(page, `about-${viewport.slug}-${colorScheme}`);

      for (const variant of RESULT_VARIANTS) {
        await seedQuizState(page, variant.state, '/results');
        await expectResultsSurface(page);
        await expectNoHorizontalOverflow(page);
        m = await asideMetrics(page);
        expect(m.clipped, variant.slug).toEqual([]);
        expect(m.bodyScrollHeight, variant.slug).toBeLessThanOrEqual(m.bodyClientHeight + 1);
        heights[variant.slug] = m.bodyClientHeight;
        await snapshot(page, `${variant.slug}-${viewport.slug}-${colorScheme}`);
      }

      await seedQuizState(page, ONE_DOMINANT_STATE, '/prompts');
      await expect(page.getByText('Teach your AI how you learn.')).toBeVisible();
      await expectNoHorizontalOverflow(page);
      m = await asideMetrics(page);
      expect(m.clipped, 'prompts').toEqual([]);
      expect(m.bodyScrollHeight, 'prompts').toBeLessThanOrEqual(m.bodyClientHeight + 1);
      heights.prompts = m.bodyClientHeight;
      await snapshot(page, `prompts-${viewport.slug}-${colorScheme}`);

      if (viewport.width >= 1100) {
        expect(new Set(Object.values(heights)).size, JSON.stringify(heights)).toBe(1);
      }
    });
  }
}
