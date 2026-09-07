// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const nx = require('@nx/eslint-plugin');

module.exports = defineConfig([
  {
    plugins: {
      '@nx': nx,
    },
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: [
                'scope:ui',
                'scope:graphics',
                'scope:state',
                'scope:audio',
                'scope:engine',
                'scope:shared',
              ],
            },
            {
              sourceTag: 'scope:e2e',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: [
                'scope:graphics',
                'scope:state',
                'scope:audio',
                'scope:shared',
                'scope:engine',
              ],
            },
            {
              sourceTag: 'scope:graphics',
              onlyDependOnLibsWithTags: ['scope:state', 'scope:engine', 'scope:audio', 'scope:shared'],
            },
            {
              sourceTag: 'scope:state',
              onlyDependOnLibsWithTags: ['scope:engine', 'scope:shared'],
            },
            {
              sourceTag: 'scope:audio',
              onlyDependOnLibsWithTags: ['scope:engine', 'scope:shared'],
            },
            {
              sourceTag: 'scope:engine',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:engine'],
            },
          ],
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'wgl',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'wgl',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
