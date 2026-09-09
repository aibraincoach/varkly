#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatMeasurementReport,
  measureDistAssets,
} from './lib/measureAssets.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const distDir = path.resolve(repoRoot, 'dist');

try {
  const report = await measureDistAssets(distDir);
  console.log(formatMeasurementReport(report));

  if (report.budgetStatus === 'FAIL') {
    console.error(
      `\nBudget check failed: build-based budget estimate ${report.buildBasedBudgetEstimate} bytes is not strictly less than 1,200,000 bytes.`,
    );
    process.exitCode = 1;
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Asset measurement failed: ${message}`);
  process.exitCode = 1;
}
