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

Fully automated versioning and changelog generation for Quily Chat.

## What This Skill Does

When invoked, this skill **automatically**:
1. Analyzes commits since the last version tag
2. Determines the appropriate version bump (major/minor/patch)
3. Generates changelog entries grouped by type
4. Updates version.ts and CHANGELOG.md
5. Creates git commit and tag
6. Reports what was done

**No user confirmation required** - Claude makes all decisions based on conventional commit analysis.

## Version Bump Rules

| Commit Type | Bump | Example |
|-------------|------|---------|
| `feat!:` or `BREAKING CHANGE` | major | Breaking change |
| `feat:` | minor | New feature |
| `fix:` | patch | Bug fix |
| `chore:` | patch | Maintenance |
| `doc:` | patch | Documentation |
| `style:` | patch | Styling |
| `refactor:` | patch | Refactoring |
| `test:` | patch | Tests |

## Automated Workflow

When the user invokes `/release`, execute these steps immediately without asking for confirmation:

### Step 1: Execute Release

Run the release command directly:

```bash
npm run release:run
```

This will:
- Analyze all commits since the last tag
- Determine the appropriate bump type automatically
- Update version.ts with the new version
- Generate and update CHANGELOG.md
- Create a release commit: `chore(release): vX.Y.Z`
- Create a git tag: `vX.Y.Z`

### Step 2: Report Results

After execution, report:
- Previous version → New version
- Number of commits included
- Summary of changes (features, fixes, etc.)
- The commit and tag that were created

### Step 3: Remind to Push

Tell the user to push their changes:

```
git push && git push --tags
```

## Edge Cases

### No commits to release
If there are no new commits since the last tag, inform the user:
"No new commits since the last release. Nothing to do."

### Uncommitted changes warning
The script will warn if there are uncommitted changes but will proceed anyway.
These changes will be included in the release commit.

### Initial release (no previous tag)
If no version tag exists, all commits will be included and the release will use
the current VERSION value (0.1.0) as the baseline for bumping.

## CLI Commands Reference

```bash
npm run release:run              # Execute release (main command)
npm run release:prepare          # Preview only (for debugging)
npm run release:run --dry-run    # Preview without changes
npm run release:run --force major  # Force specific bump type
```

## Files Modified

- `src/lib/version.ts` - Version number
- `CHANGELOG.md` - Changelog entries
- Git commit: `chore(release): vX.Y.Z`
- Git tag: `vX.Y.Z`

## Example Session

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

---

*Last updated: 2026-01-30*
