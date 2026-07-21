import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import importX from 'eslint-plugin-import-x';

export default defineConfig([
  {
    ignores: ['node_modules/**', '.vscode/**', '.idea/**', '**/bun.lock'],
  },
  tseslint.configs.eslintRecommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'import-x': importX,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig-base.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      // Maps multi-project tsconfig files down to ESLint
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig-base.json', './*/tsconfig.json'],
        },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Automatically turns off rules that conflict with Prettier and runs Prettier as a rule
  eslintPluginPrettierRecommended,
]);
