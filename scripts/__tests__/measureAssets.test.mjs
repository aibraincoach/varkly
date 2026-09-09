import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  BUDGET_LIMIT_BYTES,
  GZIP_LEVEL,
  PANEL_WEBP_RELATIVE_PATHS,
  calculateBuildBasedBudgetEstimate,
  extractPanelImagePathsFromPanelsSource,
  formatMeasurementReport,
  gzipByteLength,
  isWithinBudget,
  measureDistAssets,
  measureJsCssAssets,
  measurePanelWebps,
} from '../lib/measureAssets.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

test('GZIP_LEVEL is fixed at 6', () => {
  assert.equal(GZIP_LEVEL, 6);
});

test('PANEL_WEBP_RELATIVE_PATHS matches panels.ts image declarations in order', async () => {
  const panelsSource = await readFile(path.join(repoRoot, 'src/data/panels.ts'), 'utf8');
  const fromPanelsTs = extractPanelImagePathsFromPanelsSource(panelsSource);

  assert.equal(fromPanelsTs.length, 14);
  assert.deepEqual(fromPanelsTs, [...PANEL_WEBP_RELATIVE_PATHS]);
});

test('gzipByteLength uses the fixed gzip level 6', () => {
  const sample = Buffer.from('repeatable gzip payload for asset measurement');
  const compressed = gzipByteLength(sample);
  const expected = gzipByteLength(sample, GZIP_LEVEL);

  assert.equal(compressed, expected);
  assert.ok(compressed > 0);
});

test('measureJsCssAssets collects and sorts js/css files deterministically', async () => {
  const distDir = await mkdtemp(path.join(os.tmpdir(), 'varkly-measure-'));
  try {
    await mkdir(path.join(distDir, 'assets'), { recursive: true });
    await writeFile(path.join(distDir, 'assets', 'z-last.js'), 'console.log("z");');
    await writeFile(path.join(distDir, 'assets', 'a-first.css'), '.x{color:red}');
    await writeFile(path.join(distDir, 'assets', 'bundle.js.map'), '{"version":3}');

    const assets = await measureJsCssAssets(distDir);

    assert.deepEqual(
      assets.map((asset) => asset.relativePath),
      ['assets/a-first.css', 'assets/z-last.js'],
    );
    assert.equal(assets[0].rawBytes, Buffer.byteLength('.x{color:red}'));
    assert.equal(assets[1].gzipBytes, gzipByteLength(Buffer.from('console.log("z");')));
  } finally {
    await rm(distDir, { recursive: true, force: true });
  }
});

test('measurePanelWebps sums exactly the 14 configured panel assets', async () => {
  const distDir = await mkdtemp(path.join(os.tmpdir(), 'varkly-measure-'));
  try {
    await mkdir(path.join(distDir, 'panels'), { recursive: true });

    let expectedTotal = 0;
    for (const relativePath of PANEL_WEBP_RELATIVE_PATHS) {
      const contents = `webp-${relativePath}`;
      expectedTotal += Buffer.byteLength(contents);
      await writeFile(path.join(distDir, relativePath), contents);
    }
    await writeFile(path.join(distDir, 'panels', '99-unrelated.webp'), 'ignore-me');

    const result = await measurePanelWebps(distDir);

    assert.equal(result.files.length, 14);
    assert.equal(result.rawTotal, expectedTotal);
  } finally {
    await rm(distDir, { recursive: true, force: true });
  }
});

test('measurePanelWebps fails clearly when a required panel asset is missing', async () => {
  const distDir = await mkdtemp(path.join(os.tmpdir(), 'varkly-measure-'));
  try {
    await mkdir(path.join(distDir, 'panels'), { recursive: true });
    await writeFile(path.join(distDir, PANEL_WEBP_RELATIVE_PATHS[0]), 'only-one');

    await assert.rejects(
      () => measurePanelWebps(distDir),
      /Missing required panel WebP asset: panels\/02-recipe\.webp/,
    );
  } finally {
    await rm(distDir, { recursive: true, force: true });
  }
});

test('calculateBuildBasedBudgetEstimate and budget pass/fail boundaries', () => {
  assert.equal(calculateBuildBasedBudgetEstimate(100, 200), 300);
  assert.equal(isWithinBudget(BUDGET_LIMIT_BYTES - 1), true);
  assert.equal(isWithinBudget(BUDGET_LIMIT_BYTES), false);
  assert.equal(isWithinBudget(BUDGET_LIMIT_BYTES + 1), false);
});

test('measureDistAssets fails clearly when dist is missing required assets', async () => {
  const distDir = await mkdtemp(path.join(os.tmpdir(), 'varkly-measure-'));
  try {
    await assert.rejects(
      () => measureDistAssets(distDir),
      /No built \.js or \.css assets found/,
    );
  } finally {
    await rm(distDir, { recursive: true, force: true });
  }
});

test('formatMeasurementReport labels exclusions and budget status', () => {
  const report = {
    commitSha: 'abc123',
    nodeVersion: 'v22.0.0',
    gzipLevel: GZIP_LEVEL,
    jsCssAssets: [
      { relativePath: 'assets/app.js', rawBytes: 10, gzipBytes: 6 },
    ],
    jsCssGzipSubtotal: 6,
    panelWebps: {
      files: [{ relativePath: 'panels/01-furniture.webp', rawBytes: 4 }],
      rawTotal: 4,
    },
    panelWebpRawSubtotal: 4,
    buildBasedBudgetEstimate: 10,
    budgetStatus: 'PASS',
    ogImage: { relativePath: 'og-image.png', rawBytes: 99 },
  };

  const output = formatMeasurementReport(report);

  assert.match(output, /build-based budget estimate \(JS\/CSS gzip \+ 14 panel WebPs raw\): 10/);
  assert.match(output, /Excluded from build-based budget estimate: fonts, source maps, HTML, icons, OG image\./);
  assert.match(output, /not observed transfer weight/);
  assert.match(output, /OG image \(reported separately, raw\): og-image\.png  raw=99/);
  assert.match(output, /budget limit \(strict < 1200000 bytes\): PASS/);
});
