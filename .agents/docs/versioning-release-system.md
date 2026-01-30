---
type: doc
title: "Automated Versioning and Release System"
status: done
ai_generated: true
reviewed_by: null
created: 2026-01-30
updated: 2026-01-30
related_docs:
  - .claude/skills/release/SKILL.md
related_tasks: []
---

# Automated Versioning and Release System

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

The versioning and release system provides automated semantic versioning with changelog generation for the Quily Chat project. It analyzes conventional commits to determine version bumps, generates formatted changelogs with commit links, and creates git tags—all triggered by a single `/release` command or CLI invocation.

## Architecture

### Key Components

```
src/lib/version.ts          # Version configuration (source of truth)
scripts/version-bump.ts     # Manual version bump utility
scripts/release/            # Release automation suite
├── types.ts                # TypeScript interfaces
├── git.ts                  # Git operations (Windows-compatible)
├── commit-parser.ts        # Conventional commit analysis
├── changelog.ts            # Changelog generation
└── index.ts                # CLI entry point
.claude/skills/release/     # Claude skill definition
└── SKILL.md
CHANGELOG.md                # Generated changelog (created on first release)
```

### Data Flow

```
Git commits (conventional format)
    ↓
git.ts: getCommitsSince(lastTag)
    ↓
commit-parser.ts: categorizeCommits() + detectBumpType()
    ↓
changelog.ts: generateChangelogEntry()
    ↓
index.ts: updateVersionFile() + writeChangelog()
    ↓
git.ts: createCommit() + createTag()
    ↓
Output: version.ts updated, CHANGELOG.md updated, git tag created
```

## Version Configuration

The version is stored in `src/lib/version.ts`:

```typescript
export const VERSION = '0.1.0';

export const VERSION_INFO = {
  version: VERSION,
  name: 'Quily Chat',
  buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0],
};
```

The `VERSION` constant follows semantic versioning (semver):
- **MAJOR**: Breaking changes (incompatible API changes)
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes (backwards compatible)

Import this anywhere in the app to display the current version:

```typescript
import { VERSION } from '@/src/lib/version';
// Use in UI: `v${VERSION}`
```

## Conventional Commits

The system relies on [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Supported Types and Their Impact

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | minor | `feat: add dark mode toggle` |
| `feat!:` | **major** | `feat!: redesign API response format` |
| `fix:` | patch | `fix: handle null user case` |
| `chore:` | patch | `chore: update dependencies` |
| `doc:` / `docs:` | patch | `doc: update README` |
| `style:` | patch | `style: fix button alignment` |
| `refactor:` | patch | `refactor: simplify auth logic` |
| `test:` / `tests:` | patch | `test: add unit tests for parser` |
| `BREAKING CHANGE` in body | **major** | Any commit with this in body |

### Breaking Change Detection

Breaking changes are detected via:
1. Exclamation mark before colon: `feat!:` or `fix!:`
2. `BREAKING CHANGE:` in commit body
3. `BREAKING-CHANGE:` in commit body

## Release Automation

### CLI Commands

```bash
# Preview what would be released (no changes made)
yarn release:prepare

# Execute release (bump + changelog + commit + tag)
yarn release:run

# Preview without making changes
yarn release:run --dry-run

# Force a specific bump type
yarn release:run --force major
yarn release:run --force minor
yarn release:run --force patch

# Skip git tag creation
yarn release:run --skip-tag

# Skip git commit (just update files)
yarn release:run --skip-commit
```

### What `yarn release:run` Does

1. **Analyzes commits** since the last version tag (`v*.*.*`)
2. **Determines bump type** based on conventional commit prefixes
3. **Updates `src/lib/version.ts`** with the new version
4. **Generates changelog entry** with categorized commits and links
5. **Updates `CHANGELOG.md`** (creates if doesn't exist)
6. **Creates git commit**: `chore(release): vX.Y.Z`
7. **Creates git tag**: `vX.Y.Z`

### Changelog Format

Generated changelogs follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-01-30

### Breaking Changes
- **api**: Redesign response format ([abc1234](https://github.com/user/repo/commit/abc1234))

### Features
- Add dark mode toggle ([def5678](https://github.com/user/repo/commit/def5678))
- **auth**: Implement OAuth flow ([ghi9012](https://github.com/user/repo/commit/ghi9012))

### Bug Fixes
- Handle null user case ([jkl3456](https://github.com/user/repo/commit/jkl3456))

### Maintenance
- Update dependencies ([mno7890](https://github.com/user/repo/commit/mno7890))
```

## Claude Skill: `/release`

The `/release` skill provides a fully automated release workflow through Claude.

### Usage

Simply type `/release` in chat. Claude will:
1. Run `yarn release:run` immediately (no confirmation needed)
2. Report the results (version bump, commits included, changelog preview)
3. Remind you to push: `git push && git push --tags`

### Skill Configuration

Located at `.claude/skills/release/SKILL.md`:

```yaml
---
name: release
description: Automated semantic versioning and changelog generation
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---
```

### Example Session

```
User: /release

Claude: Running automated release...

✅ Release v0.2.0 created successfully!

📊 Summary:
  Version: 0.1.0 → 0.2.0 (minor bump)
  Commits: 25
  ✨ 8 features  🐛 4 fixes  📝 3 docs  🔧 10 chores

📝 Created:
  Commit: chore(release): v0.2.0
  Tag: v0.2.0

📤 Next step - push your changes:
  git push && git push --tags
```

## Manual Version Bumping

For manual version changes without the full release process:

```bash
yarn version:bump patch   # 0.1.0 → 0.1.1
yarn version:bump minor   # 0.1.0 → 0.2.0
yarn version:bump major   # 0.1.0 → 1.0.0
```

This only updates `src/lib/version.ts` without changelog or git operations.

## Replicating This System

To add this versioning system to another project:

### Step 1: Create Version File

Create `src/lib/version.ts` (adjust path as needed):

```typescript
export const VERSION = '0.1.0';

export const VERSION_INFO = {
  version: VERSION,
  name: 'Your App Name',
  buildDate: process.env.NEXT_PUBLIC_BUILD_DATE || new Date().toISOString().split('T')[0],
};
```

### Step 2: Copy Release Scripts

Copy the entire `scripts/release/` directory:
- `types.ts` - TypeScript interfaces
- `git.ts` - Git operations (Windows-compatible)
- `commit-parser.ts` - Conventional commit parsing
- `changelog.ts` - Changelog generation
- `index.ts` - CLI entry point

Update the `VERSION_FILE` path in `index.ts` if your version file is in a different location.

### Step 3: Add Dependencies

Ensure these dependencies are installed:

```bash
yarn add -D commander ora chalk tsx
```

### Step 4: Add npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "version:bump": "tsx scripts/version-bump.ts",
    "release": "tsx scripts/release/index.ts",
    "release:prepare": "tsx scripts/release/index.ts prepare",
    "release:run": "tsx scripts/release/index.ts run"
  }
}
```

### Step 5: Create Claude Skill (Optional)

If using Claude Code, create `.claude/skills/release/SKILL.md`:

```markdown
---
name: release
description: Automated semantic versioning and changelog generation
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

# Release Management

When the user invokes `/release`, run `yarn release:run` and report results.
```

### Step 6: Adopt Conventional Commits

Ensure your team uses conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `chore:` for maintenance
- `feat!:` or `BREAKING CHANGE` for breaking changes

## Technical Decisions

### Why a Separate Version File?

Using `src/lib/version.ts` instead of `package.json` version:
- **Importable in code**: Can display version in UI directly
- **Independent of npm**: Version isn't tied to npm package lifecycle
- **Single source of truth**: One place to update, one place to read

### Why Custom Implementation vs semantic-release?

- **Simpler**: No complex configuration or plugins needed
- **Transparent**: Easy to understand and modify
- **Lightweight**: No external service dependencies
- **Controlled**: Doesn't auto-push; user decides when to push

### Windows Compatibility

The `git.ts` module uses `spawnSync` with custom delimiters instead of shell pipes to ensure Windows compatibility. The delimiters (`<<<FIELD>>>` and `<<<COMMIT>>>`) are unlikely to appear in commit messages.

## Known Limitations

- **Initial release**: If no git tags exist, all commits are included (may be large)
- **Non-conventional commits**: Commits without type prefix are categorized as "Other"
- **Scope parsing**: Scopes like `feat(auth):` are preserved but not used for grouping
- **Monorepo**: Not designed for multi-package monorepos (single version file)

## Related Documentation

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

_Created: 2026-01-30_
