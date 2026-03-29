const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ── Firebase v10 fix for Expo / React Native ─────────────────────
// Firebase uses package.json "exports" field that Metro doesn't
// understand by default. This tells Metro to resolve it correctly.
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

config.resolver.unstable_enablePackageExports = false;

module.exports = config;
