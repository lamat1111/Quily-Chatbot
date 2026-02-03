---
name: font-audit
description: Audit and fix small font sizes for mobile readability in Tailwind CSS projects
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
---

<objective>
Audit a Tailwind CSS project for font sizes that are too small on mobile devices, and refactor them to be mobile-friendly. This skill finds `text-xs`, arbitrary small sizes like `text-[10px]`, and other problematic patterns, then applies fixes following mobile typography best practices.
</objective>

<context>
## The Problem

`text-xs` in Tailwind is 0.75rem (12px), which is often too small on mobile devices—especially those with high pixel density. The minimum comfortable reading size on mobile is generally `text-sm` (14px).

## The Solution

- Use `text-sm` as the minimum for readable content on mobile
- For text that CAN be smaller on larger screens: `text-sm sm:text-xs`
- Reserve `text-xs` only for badges, decorative labels, or desktop-only UI
- Consider fluid typography with `clamp()` for smoother scaling

## What This Skill Audits

| Pattern | Issue | Fix |
|---------|-------|-----|
| `text-xs` | Too small on mobile | `text-sm sm:text-xs` or just `text-sm` |
| `text-[10px]` | Way too small | `text-sm` or remove |
| `text-[11px]` | Too small | `text-sm` or `text-xs` |
| `text-[12px]` | Same as text-xs | `text-sm sm:text-xs` |
| `text-[0.75rem]` | Same as text-xs | `text-sm sm:text-xs` |

## Context Matters

Not all `text-xs` needs fixing. The skill should evaluate context:

**Usually needs fixing:**
- Sidebar navigation items
- Source citations / references
- Body text or descriptions
- Form labels
- List items
- Links users need to tap

**Usually OK to keep small:**
- Badge labels (e.g., "NEW", "BETA")
- Timestamps in dense UIs
- Character counters
- Keyboard shortcut hints
- Decorative/non-essential labels
</context>

<process>

## Step 1: Display Audit Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 MOBILE TYPOGRAPHY AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scanning for font sizes that may be too small on mobile...
```

## Step 2: Verify This is a Tailwind Project

Check for:
- `tailwind.config.js` or `tailwind.config.ts`
- Tailwind classes in component files

If not a Tailwind project, inform the user and exit.

## Step 3: Search for Problematic Patterns

Search for these patterns in `.tsx`, `.jsx`, `.html`, `.vue`, `.svelte` files:

```bash
# Find text-xs usage
grep -r "text-xs" --include="*.tsx" --include="*.jsx" --include="*.vue" --include="*.svelte" .

# Find arbitrary small sizes
grep -rE "text-\[(10|11|12)px\]" --include="*.tsx" --include="*.jsx" .
grep -rE "text-\[0\.7[0-5]rem\]" --include="*.tsx" --include="*.jsx" .
```

## Step 4: Analyze Context for Each Finding

For each file with matches:
1. Read the file
2. Identify the component/element context
3. Categorize as:
   - **NEEDS FIX**: Readable content (sidebar items, body text, links, labels)
   - **PROBABLY OK**: Badges, hints, decorative elements
   - **REVIEW**: Unclear context, needs user input

## Step 5: Generate Audit Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUDIT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found X instances of potentially small text across Y files.

## Needs Fixing (readable content)

| File | Line | Current | Context | Suggested Fix |
|------|------|---------|---------|---------------|
| components/Sidebar.tsx | 45 | text-xs | Navigation item | text-sm sm:text-xs |
| components/Sources.tsx | 23 | text-xs | Citation text | text-sm |

## Probably OK (decorative/badges)

| File | Line | Current | Context | Reason |
|------|------|---------|---------|--------|
| components/Badge.tsx | 12 | text-xs | Badge label | Small by design |

## Needs Review (unclear context)

| File | Line | Current | Context |
|------|------|---------|---------|
| components/Widget.tsx | 78 | text-xs | Unknown element |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 6: Ask User What to Do

Use AskUserQuestion:

```
Question: "How would you like to proceed?"
Header: "Action"
Options:
  - label: "Fix all recommended"
    description: "Apply fixes to all items marked 'Needs Fixing'"
  - label: "Review one by one"
    description: "Go through each finding and decide individually"
  - label: "Show me the code"
    description: "Show the actual code snippets for context"
  - label: "Setup fluid typography"
    description: "Add fluid font sizes to tailwind.config.js instead"
```

## Step 7: Execute Based on User Choice

### If "Fix all recommended":

Apply the pattern `text-sm sm:text-xs` (or just `text-sm` where appropriate) to all items in the "Needs Fixing" category.

For each fix:
1. Read the file
2. Find the exact line
3. Replace `text-xs` with the appropriate fix
4. Confirm the change

### If "Review one by one":

For each finding, show:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
File: components/Sidebar.tsx:45

Context: Navigation item in sidebar

Current code:
  <span className="text-xs text-muted-foreground">
    {item.label}
  </span>

Suggested fix:
  <span className="text-sm sm:text-xs text-muted-foreground">
    {item.label}
  </span>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Then ask:
```
Question: "What should we do with this instance?"
Header: "Fix"
Options:
  - label: "Apply fix"
    description: "Change to text-sm sm:text-xs"
  - label: "Use text-sm only"
    description: "Change to text-sm (always 14px)"
  - label: "Skip"
    description: "Leave as text-xs"
```

### If "Show me the code":

Display each finding with surrounding code context (5-10 lines before/after).

### If "Setup fluid typography":

Add fluid font utilities to `tailwind.config.js`:

```javascript
// In tailwind.config.js theme.extend.fontSize:
fontSize: {
  'xs-safe': ['clamp(0.8125rem, 0.75rem + 0.2vw, 0.75rem)', { lineHeight: '1rem' }],
  'sm-fluid': ['clamp(0.875rem, 0.8rem + 0.3vw, 0.875rem)', { lineHeight: '1.25rem' }],
}
```

Then explain the user can use `text-xs-safe` instead of `text-xs` for a minimum floor of ~13px.

## Step 8: Verify Changes

After applying fixes:
1. Re-run the search to confirm fixes were applied
2. Show summary of changes made

## Step 9: Final Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUDIT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Summary

- Files scanned: X
- Issues found: Y
- Issues fixed: Z
- Skipped: W

## Changes Made

- components/Sidebar.tsx: 3 fixes applied
- components/Sources.tsx: 2 fixes applied

## Testing Checklist

- [ ] Test on mobile device or Chrome DevTools mobile emulator
- [ ] Check sidebar readability
- [ ] Check source citations readability
- [ ] Verify desktop appearance unchanged (text should be smaller)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</process>

<success_criteria>
- [ ] Confirmed this is a Tailwind project
- [ ] Searched for all problematic font size patterns
- [ ] Analyzed context for each finding
- [ ] Categorized findings (needs fix / probably ok / review)
- [ ] Generated clear audit report
- [ ] Asked user how to proceed
- [ ] Applied fixes based on user choice
- [ ] Verified changes were applied
- [ ] Provided testing checklist
</success_criteria>

<notes>
- The pattern `text-sm sm:text-xs` means: 14px on mobile, 12px on screens >= 640px
- Tailwind is mobile-first, so unprefixed classes apply to all sizes, `sm:` applies at 640px+
- Some projects may prefer just `text-sm` everywhere for simplicity
- Fluid typography with `clamp()` is more elegant but requires config changes
- Always preserve other classes on the element (colors, spacing, etc.)
</notes>

---
*Last updated: 2026-02-03*
