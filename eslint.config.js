// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/**',
      'dist-audit/**',
      'build/**',
      'web-build/**',
      '.expo/**',
      '.expo-shared/**',
      'node_modules/**',
      'coverage/**',
      '*.d.ts.map',
    ],
  },
]);
