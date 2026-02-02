/**
 * Application version configuration.
 *
 * Follows semantic versioning (semver): MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes
 * - MINOR: New features (backwards compatible)
 * - PATCH: Bug fixes (backwards compatible)
 *
 * Bump versions using: yarn version:bump <major|minor|patch>
 */

export const VERSION = '0.7.0';

export const VERSION_INFO = {
  version: VERSION,
  name: 'Quily Chat',
  buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0],
};
