import { execSync } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

/** Fixed gzip level for reproducible JS/CSS compression measurements. */
export const GZIP_LEVEL = 6;

/** Strict upper bound for the build-based budget estimate (bytes). */
export const BUDGET_LIMIT_BYTES = 1_200_000;

/** Panel WebP paths under dist/, matching `src/data/panels.ts` image slugs. */
export const PANEL_WEBP_RELATIVE_PATHS = [
  'panels/01-furniture.webp',
  'panels/02-recipe.webp',
  'panels/03-directions.webp',
  'panels/04-presentation.webp',
  'panels/05-guitar.webp',
  'panels/06-meeting.webp',
  'panels/07-phone-number.webp',
  'panels/08-trip.webp',
  'panels/09-new-app.webp',
  'panels/10-names.webp',
  'panels/11-dinner.webp',
  'panels/12-complaint.webp',
  'panels/13-unwind.webp',
  'panels/14-results.webp',
];

export const OG_IMAGE_RELATIVE_PATH = 'og-image.png';

const PANEL_IMAGE_DECLARATION_RE = /image:\s*'\/panels\/([^']+\.webp)'/g;

/**
 * @param {string} sourceText
 * @returns {string[]}
 */
export function extractPanelImagePathsFromPanelsSource(sourceText) {
  const paths = [];
  for (const match of sourceText.matchAll(PANEL_IMAGE_DECLARATION_RE)) {
    paths.push(`panels/${match[1]}`);
  }
  return paths;
}

/**
 * @param {Buffer} buffer
 * @param {number} [level]
 * @returns {number}
 */
export function gzipByteLength(buffer, level = GZIP_LEVEL) {
  return gzipSync(buffer, { level }).byteLength;
}

/**
 * @param {string} distDir
 * @returns {Promise<string[]>}
 */
async function collectFilesByExtension(distDir, extension) {
  const matches = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(extension) && !entry.name.endsWith(`${extension}.map`)) {
        matches.push(absolutePath);
      }
    }
  }

  await walk(distDir);
  return matches.sort((left, right) => left.localeCompare(right));
}

/**
 * @param {string} distDir
 * @returns {Promise<Array<{ relativePath: string, rawBytes: number, gzipBytes: number }>>}
 */
export async function measureJsCssAssets(distDir) {
  const jsFiles = await collectFilesByExtension(distDir, '.js');
  const cssFiles = await collectFilesByExtension(distDir, '.css');
  const assetPaths = [...jsFiles, ...cssFiles].sort((left, right) => left.localeCompare(right));

  const assets = [];
  for (const absolutePath of assetPaths) {
    const buffer = await readFile(absolutePath);
    assets.push({
      relativePath: path.relative(distDir, absolutePath).split(path.sep).join('/'),
      rawBytes: buffer.byteLength,
      gzipBytes: gzipByteLength(buffer),
    });
  }

  return assets;
}

/**
 * @param {string} distDir
 * @returns {Promise<{ files: Array<{ relativePath: string, rawBytes: number }>, rawTotal: number }>}
 */
export async function measurePanelWebps(distDir) {
  const files = [];

  for (const relativePath of PANEL_WEBP_RELATIVE_PATHS) {
    const absolutePath = path.join(distDir, relativePath);
    let fileStat;
    try {
      fileStat = await stat(absolutePath);
    } catch {
      throw new Error(`Missing required panel WebP asset: ${relativePath}`);
    }
    if (!fileStat.isFile()) {
      throw new Error(`Expected panel WebP file at ${relativePath}`);
    }

    const buffer = await readFile(absolutePath);
    files.push({
      relativePath,
      rawBytes: buffer.byteLength,
    });
  }

  const rawTotal = files.reduce((sum, file) => sum + file.rawBytes, 0);
  return { files, rawTotal };
}

/**
 * @param {string} distDir
 * @returns {Promise<{ relativePath: string, rawBytes: number }>}
 */
export async function measureOgImage(distDir) {
  const relativePath = OG_IMAGE_RELATIVE_PATH;
  const absolutePath = path.join(distDir, relativePath);

  let fileStat;
  try {
    fileStat = await stat(absolutePath);
  } catch {
    throw new Error(`Missing required OG image asset: ${relativePath}`);
  }
  if (!fileStat.isFile()) {
    throw new Error(`Expected OG image file at ${relativePath}`);
  }

  const buffer = await readFile(absolutePath);
  return {
    relativePath,
    rawBytes: buffer.byteLength,
  };
}

/**
 * @param {number} jsCssGzipTotal
 * @param {number} panelWebpRawTotal
 * @returns {number}
 */
export function calculateBuildBasedBudgetEstimate(jsCssGzipTotal, panelWebpRawTotal) {
  return jsCssGzipTotal + panelWebpRawTotal;
}

/**
 * @param {number} budgetEstimate
 * @returns {boolean}
 */
export function isWithinBudget(budgetEstimate) {
  return budgetEstimate < BUDGET_LIMIT_BYTES;
}

/**
 * @returns {string}
 */
export function resolveGitCommitSha() {
  try {
    const sha = execSync('git rev-parse HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!sha) {
      throw new Error('git rev-parse HEAD returned an empty SHA');
    }
    return sha;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to resolve source commit SHA from git: ${message}`);
  }
}

/**
 * @param {object} report
 * @returns {string}
 */
export function formatMeasurementReport(report) {
  const lines = [
    'Varkly asset measurement (build-based budget estimate; not observed transfer weight)',
    `source commit: ${report.commitSha}`,
    `node version: ${report.nodeVersion}`,
    `gzip level: ${report.gzipLevel}`,
    '',
    'JS/CSS assets (raw + gzip):',
  ];

  for (const asset of report.jsCssAssets) {
    lines.push(
      `  ${asset.relativePath}  raw=${asset.rawBytes}  gzip=${asset.gzipBytes}`,
    );
  }

  lines.push(
    '',
    `JS/CSS gzip subtotal: ${report.jsCssGzipSubtotal}`,
    '',
    'Panel WebP assets (raw only; 14 panels):',
  );

  for (const panel of report.panelWebps.files) {
    lines.push(`  ${panel.relativePath}  raw=${panel.rawBytes}`);
  }

  lines.push(
    '',
    `panel WebP raw subtotal (14 files): ${report.panelWebpRawSubtotal}`,
    '',
    `build-based budget estimate (JS/CSS gzip + 14 panel WebPs raw): ${report.buildBasedBudgetEstimate}`,
    `budget limit (strict < ${BUDGET_LIMIT_BYTES} bytes): ${report.budgetStatus}`,
    '',
    'Excluded from build-based budget estimate: fonts, source maps, HTML, icons, OG image.',
    `OG image (reported separately, raw): ${report.ogImage.relativePath}  raw=${report.ogImage.rawBytes}`,
  );

  return lines.join('\n');
}

/**
 * @param {string} distDir
 * @returns {Promise<{
 *   commitSha: string,
 *   nodeVersion: string,
 *   gzipLevel: number,
 *   jsCssAssets: Array<{ relativePath: string, rawBytes: number, gzipBytes: number }>,
 *   jsCssGzipSubtotal: number,
 *   panelWebps: { files: Array<{ relativePath: string, rawBytes: number }>, rawTotal: number },
 *   panelWebpRawSubtotal: number,
 *   buildBasedBudgetEstimate: number,
 *   budgetStatus: 'PASS' | 'FAIL',
 *   ogImage: { relativePath: string, rawBytes: number },
 * }>}
 */
export async function measureDistAssets(distDir) {
  let distStat;
  try {
    distStat = await stat(distDir);
  } catch {
    throw new Error(`Missing dist directory: ${distDir}`);
  }
  if (!distStat.isDirectory()) {
    throw new Error(`Expected dist directory at ${distDir}`);
  }

  const commitSha = resolveGitCommitSha();
  const jsCssAssets = await measureJsCssAssets(distDir);
  if (jsCssAssets.length === 0) {
    throw new Error(`No built .js or .css assets found under ${distDir}`);
  }

  const jsCssGzipSubtotal = jsCssAssets.reduce((sum, asset) => sum + asset.gzipBytes, 0);
  const panelWebps = await measurePanelWebps(distDir);
  const ogImage = await measureOgImage(distDir);
  const buildBasedBudgetEstimate = calculateBuildBasedBudgetEstimate(
    jsCssGzipSubtotal,
    panelWebps.rawTotal,
  );

  return {
    commitSha,
    nodeVersion: process.version,
    gzipLevel: GZIP_LEVEL,
    jsCssAssets,
    jsCssGzipSubtotal,
    panelWebps,
    panelWebpRawSubtotal: panelWebps.rawTotal,
    buildBasedBudgetEstimate,
    budgetStatus: isWithinBudget(buildBasedBudgetEstimate) ? 'PASS' : 'FAIL',
    ogImage,
  };
}
