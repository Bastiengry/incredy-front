// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    rules: {
      // Note: you must disable the base rule as it can report incorrect errors
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error',
    },
  },
  {
    rules: {
      // Note: you must disable the base rule as it can report incorrect errors
      'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
    files: [
      'src/**/*.test.js',
      'src/**/*.test.jsx',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
    ],
  },
);
