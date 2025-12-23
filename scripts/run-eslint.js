#!/usr/bin/env node
'use strict';

const { ESLint } = require('eslint');

(async function main() {
  try {
    // Do NOT pass `extensions` or `useEslintrc` — removed in ESLint v9.
    const eslint = new ESLint({
      cwd: process.cwd(),
      // If you want automatic fixes you can set fix: true here.
      // fix: false,
    });

    // Lint all JS/TS/JSX/TSX files (your eslint config/ignores apply)
    const patterns = ['**/*.{js,jsx,ts,tsx}'];

    const results = await eslint.lintFiles(patterns);

    // If you want to write fixes to disk, uncomment:
    // await ESLint.outputFixes(results);

    const formatter = await eslint.loadFormatter('stylish');
    const output = formatter.format(results);
    if (output) console.log(output);

    const errorCount = results.reduce((sum, r) => sum + r.errorCount, 0);
    const warningCount = results.reduce((sum, r) => sum + r.warningCount, 0);

    console.error(`ESLint: ${errorCount} errors, ${warningCount} warnings`);
    process.exit(errorCount > 0 ? 1 : 0);
  } catch (err) {
    console.error('ESLint run failed:', err);
    process.exit(2);
  }
})();
