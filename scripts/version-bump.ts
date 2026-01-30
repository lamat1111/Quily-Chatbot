#!/usr/bin/env tsx
/**
 * Version bump script for Quily Chat.
 *
 * Usage:
 *   yarn version:bump patch   # 0.1.0 -> 0.1.1
 *   yarn version:bump minor   # 0.1.0 -> 0.2.0
 *   yarn version:bump major   # 0.1.0 -> 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';

const VERSION_FILE = path.join(__dirname, '../src/lib/version.ts');

type BumpType = 'major' | 'minor' | 'patch';

function parseVersion(version: string): [number, number, number] {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return parts as [number, number, number];
}

function bumpVersion(current: string, type: BumpType): string {
  const [major, minor, patch] = parseVersion(current);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

function getCurrentVersion(): string {
  const content = fs.readFileSync(VERSION_FILE, 'utf-8');
  const match = content.match(/VERSION\s*=\s*['"]([^'"]+)['"]/);
  if (!match) {
    throw new Error('Could not find VERSION in version.ts');
  }
  return match[1];
}

function updateVersionFile(newVersion: string): void {
  let content = fs.readFileSync(VERSION_FILE, 'utf-8');
  content = content.replace(
    /VERSION\s*=\s*['"][^'"]+['"]/,
    `VERSION = '${newVersion}'`
  );
  fs.writeFileSync(VERSION_FILE, content);
}

function main() {
  const bumpType = process.argv[2] as BumpType;

  if (!['major', 'minor', 'patch'].includes(bumpType)) {
    console.error('Usage: yarn version:bump <major|minor|patch>');
    console.error('');
    console.error('Examples:');
    console.error('  yarn version:bump patch   # 0.1.0 -> 0.1.1');
    console.error('  yarn version:bump minor   # 0.1.0 -> 0.2.0');
    console.error('  yarn version:bump major   # 0.1.0 -> 1.0.0');
    process.exit(1);
  }

  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, bumpType);

  updateVersionFile(newVersion);

  console.log(`✓ Version bumped: ${currentVersion} → ${newVersion}`);
}

main();
