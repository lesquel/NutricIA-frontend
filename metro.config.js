// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable package.json "exports" field resolution (required by react-i18next
// v15+ and other modern ESM packages that publish subpath exports).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
