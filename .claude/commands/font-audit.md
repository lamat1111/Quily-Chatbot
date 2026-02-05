# Font Audit Command

Audit and fix small font sizes for mobile readability in Tailwind CSS projects.

## The Problem

`text-xs` in Tailwind is 0.75rem (12px), which is often too small on mobile devices—especially those with high pixel density. The minimum comfortable reading size on mobile is generally `text-sm` (14px).

## The Mobile Bump Scale

On screens below `sm` (640px), bump everything up one tier:

| Mobile (< 640px) | Desktop (≥ 640px) | Tailwind Pattern |
|------------------|-------------------|------------------|
| `text-sm` (14px) | `text-xs` (12px) | `text-sm sm:text-xs` |
| `text-base` (16px) | `text-sm` (14px) | `text-base sm:text-sm` |

## Patterns to Audit

| Pattern | Issue | Fix |
|---------|-------|-----|
| `text-xs` | Too small on mobile | `text-sm sm:text-xs` |
| `text-sm` | One size too small on mobile | `text-base sm:text-sm` |
| `text-[10px]` | Way too small | `text-sm` or remove |
| `text-[11px]` | Too small | `text-sm sm:text-xs` |
| `text-[12px]` | Same as text-xs | `text-sm sm:text-xs` |
| `text-[0.75rem]` | Same as text-xs | `text-sm sm:text-xs` |
| `text-[13px]` | Between xs and sm | `text-sm sm:text-xs` |
| `text-[14px]` | Same as text-sm | `text-base sm:text-sm` |
| `text-[0.875rem]` | Same as text-sm | `text-base sm:text-sm` |

## Context Matters

Not all small text needs fixing. Evaluate context:

**Usually needs the mobile bump (readable content):**
- Sidebar navigation items
- Source citations / references
- Body text or descriptions
- Form labels
- List items
- Links users need to tap
- Card content
- Modal/dialog text
- Error messages
- Help text

**Usually OK to keep at original size (decorative/non-essential):**
- Badge labels (e.g., "NEW", "BETA")
- Timestamps in dense UIs
- Character counters
- Keyboard shortcut hints
- Decorative/non-essential labels
- Footnote markers
- Icon labels that have visual redundancy

## Process

### Step 1: Display Audit Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 MOBILE TYPOGRAPHY AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scanning for font sizes that may be too small on mobile...
```

### Step 2: Verify This is a Tailwind Project

Check for:
- `tailwind.config.js` or `tailwind.config.ts`
- Tailwind classes in component files

If not a Tailwind project, inform the user and exit.

### Step 3: Search for Problematic Patterns

Search for these patterns in `.tsx`, `.jsx`, `.html`, `.vue`, `.svelte` files:

```bash
# Find text-xs usage (needs bump to text-sm on mobile)
grep -r "text-xs" --include="*.tsx" --include="*.jsx" --include="*.vue" --include="*.svelte" .

# Find text-sm usage (needs bump to text-base on mobile)
grep -r "text-sm" --include="*.tsx" --include="*.jsx" --include="*.vue" --include="*.svelte" .

# Find arbitrary small sizes
grep -rE "text-\[(10|11|12|13|14)px\]" --include="*.tsx" --include="*.jsx" .
grep -rE "text-\[0\.(75|875)rem\]" --include="*.tsx" --include="*.jsx" .
```

**Important:** Exclude patterns that already have a mobile bump (e.g., `text-sm sm:text-xs` or `text-base sm:text-sm`).

### Step 4: Analyze Context for Each Finding

For each file with matches:
1. Read the file
2. Identify the component/element context
3. Categorize as:
   - **NEEDS FIX**: Readable content (sidebar items, body text, links, labels)
   - **PROBABLY OK**: Badges, hints, decorative elements
   - **REVIEW**: Unclear context, needs user input

### Step 5: Generate Audit Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUDIT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found X instances of potentially small text across Y files.

## Needs Fixing - text-xs → text-sm (readable content)

| File | Line | Current | Context | Suggested Fix |
|------|------|---------|---------|---------------|
| components/Sidebar.tsx | 45 | text-xs | Navigation item | text-sm sm:text-xs |

## Needs Fixing - text-sm → text-base (readable content)

| File | Line | Current | Context | Suggested Fix |
|------|------|---------|---------|---------------|
| components/Card.tsx | 12 | text-sm | Card description | text-base sm:text-sm |

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

### Step 6: Ask User What to Do

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

### Step 7: Execute Based on User Choice

#### If "Fix all recommended":

Apply the mobile bump pattern to all items in the "Needs Fixing" category.

For each fix:
1. Read the file
2. Find the exact line
3. Replace with the appropriate fix
4. Confirm the change

#### If "Review one by one":

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
  - label: "Apply mobile bump"
    description: "Add responsive prefix (e.g., text-sm sm:text-xs or text-base sm:text-sm)"
  - label: "Bump permanently"
    description: "Change to larger size everywhere (e.g., text-sm or text-base)"
  - label: "Skip"
    description: "Leave as-is (decorative/non-essential text)"
```

#### If "Show me the code":

Display each finding with surrounding code context (5-10 lines before/after).

#### If "Setup fluid typography":

Add fluid font utilities to `tailwind.config.js`:

```javascript
// In tailwind.config.js theme.extend.fontSize:
fontSize: {
  'xs-safe': ['clamp(0.8125rem, 0.75rem + 0.2vw, 0.75rem)', { lineHeight: '1rem' }],
  'sm-fluid': ['clamp(0.875rem, 0.8rem + 0.3vw, 0.875rem)', { lineHeight: '1.25rem' }],
}
```

### Step 8: Verify Changes

After applying fixes:
1. Re-run the search to confirm fixes were applied
2. Show summary of changes made

### Step 9: Final Summary

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

## Notes

- `text-sm sm:text-xs` = 14px on mobile, 12px on screens ≥ 640px
- `text-base sm:text-sm` = 16px on mobile, 14px on screens ≥ 640px
- Tailwind is mobile-first: unprefixed classes apply to all sizes, `sm:` applies at 640px+
- Always preserve other classes on the element (colors, spacing, etc.)

---
*Last updated: 2025-02-03*
