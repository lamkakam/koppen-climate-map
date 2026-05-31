import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const isSupportedTypeScriptRule = (ruleName) => {
  if (!ruleName.startsWith('@typescript-eslint/')) {
    return true;
  }

  return ruleName.replace('@typescript-eslint/', '') in tseslint.plugin.rules;
};

const airbnbConfigs = fixupConfigRules(
  compat.extends('airbnb', 'airbnb/hooks', 'airbnb-typescript'),
).map((config) => ({
  ...config,
  rules: Object.fromEntries(
    Object.entries(config.rules ?? {}).filter(([ruleName]) => isSupportedTypeScriptRule(ruleName)),
  ),
}));

const disabledTypeScriptRules = Object.fromEntries(
  Object.keys(tseslint.plugin.rules).map((ruleName) => [`@typescript-eslint/${ruleName}`, 'off']),
);

export default tseslint.config(
  {
    ignores: ['dist', 'coverage', 'node_modules', 'playwright-report', 'test-results'],
  },
  js.configs.recommended,
  ...airbnbConfigs,
  {
    files: ['**/*.{js,cjs,mjs}'],
    rules: disabledTypeScriptRules,
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['tests/e2e/*.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: true,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            null: {
              message: 'Use undefined instead of null.',
              fixWith: 'undefined',
            },
          },
        },
      ],
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/setupTests.ts',
            'eslint.config.js',
            'playwright.config.ts',
            'postcss.config.js',
            'tailwind.config.ts',
            'vite.config.ts',
            'tests/**/*.ts',
          ],
        },
      ],
      'jsx-a11y/control-has-associated-label': 'error',
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
        },
      ],
      'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
      'react/jsx-props-no-spreading': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-default-props': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'src/setupTests.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...vitest.environments.env.globals,
      },
    },
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
  {
    files: ['tests/e2e/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      playwright,
    },
    rules: {
      ...playwright.configs['flat/recommended'].rules,
    },
  },
  {
    files: ['*.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
        },
      ],
      'import/no-unresolved': 'off',
    },
  },
);
