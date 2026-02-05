# Mobile Audit Command

Comprehensive audit and fix for mobile UX issues in Tailwind CSS projects. Combines typography and touch target audits into one workflow.

## What This Command Fixes

### 1. Typography (Mobile Bump Scale)

| Pattern | Issue | Fix |
|---------|-------|-----|
| `text-xs` | Too small on mobile | `text-sm sm:text-xs` |
| `text-sm` | One size too small on mobile | `text-base sm:text-sm` |
| `text-[10-12px]` | Too small | `text-sm sm:text-xs` |
| `text-[13-14px]` | Same as text-sm | `text-base sm:text-sm` |

### 2. Touch Targets (44px Minimum)

| Pattern | Issue | Fix |
|---------|-------|-----|
| `w-6 h-6` on buttons | 24px target | Add `p-2.5` or use `w-11 h-11` |
| `w-8 h-8` buttons | 32px target | `w-11 h-11` |
| `p-1`, `p-2` on icon buttons | < 44px | `p-2.5` or `p-3` |
| `py-1`, `py-2` on links | Cramped | `py-3` |
| `h-8`, `h-9` on inputs | < 44px | `h-11` |

## Process

### Step 1: Display Audit Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 MOBILE UX AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scanning for mobile UX issues...
 • Typography (font sizes too small)
 • Touch targets (interactive elements too small)
```

### Step 2: Verify This is a Tailwind Project

Check for `tailwind.config.js` or `tailwind.config.ts`. Exit if not found.

### Step 3: Run Both Audits

#### Typography Search

```bash
# Find text-xs and text-sm that need mobile bump
grep -rE "text-xs|text-sm" --include="*.tsx" --include="*.jsx" .

# Exclude already-fixed patterns
# Skip lines containing "sm:text-xs" or "sm:text-sm"
```

#### Touch Target Search

```bash
# Find small interactive elements
grep -rE "(w-[5678]|h-[5678]).*(onClick|button|href)" --include="*.tsx" --include="*.jsx" .
grep -rE "p-[12][^0-9].*(onClick|button)" --include="*.tsx" --include="*.jsx" .
grep -rE "py-[12][^0-9].*(onClick|href)" --include="*.tsx" --include="*.jsx" .
grep -rE "h-[89].*(input|Input)" --include="*.tsx" --include="*.jsx" .
```

### Step 4: Analyze and Categorize

For each finding:
1. Read the file context
2. Determine if it's readable content / interactive element
3. Categorize as NEEDS FIX, PROBABLY OK, or REVIEW

**Typography - Usually needs fixing:**
- Sidebar items, nav links, body text, labels, citations, help text, card content, modal text

**Typography - Usually OK to skip:**
- Badges, timestamps, character counters, keyboard hints

**Touch targets - Usually needs fixing:**
- Icon buttons, nav items, form inputs, action buttons, close buttons

**Touch targets - Usually OK to skip:**
- Desktop-only dense tables, non-interactive icons, hover-only elements

### Step 5: Generate Combined Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUDIT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Typography Issues

Found X font size issues across Y files.

### Needs Fixing

| File | Line | Current | Context | Fix |
|------|------|---------|---------|-----|
| Sidebar.tsx | 45 | text-xs | Nav item | text-sm sm:text-xs |
| Card.tsx | 12 | text-sm | Description | text-base sm:text-sm |

### Probably OK (decorative)

| File | Line | Current | Reason |
|------|------|---------|--------|
| Badge.tsx | 8 | text-xs | Badge label |

---

## Touch Target Issues

Found X touch target issues across Y files.

### Needs Fixing

| File | Line | Current | Element | Fix |
|------|------|---------|---------|-----|
| Header.tsx | 23 | w-6 h-6 | Close button | p-2.5 wrapper |
| Nav.tsx | 12 | py-1 | Nav link | py-3 |

### Probably OK (non-interactive)

| File | Line | Current | Reason |
|------|------|---------|--------|
| Icon.tsx | 5 | w-6 h-6 | Decorative icon |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: X typography + Y touch target issues found
```

### Step 6: Ask User How to Proceed

```
Question: "How would you like to proceed?"
Header: "Action"
Options:
  - label: "Fix all recommended"
    description: "Apply all fixes automatically"
  - label: "Review one by one"
    description: "Go through each finding individually"
  - label: "Fix typography only"
    description: "Only fix font size issues"
  - label: "Fix touch targets only"
    description: "Only fix touch target issues"
```

### Step 7: Apply Fixes

For each fix:
1. Read the file
2. Apply the appropriate pattern
3. Preserve all other classes

**Typography fixes:**
- `text-xs` → `text-sm sm:text-xs`
- `text-sm` → `text-base sm:text-sm`

**Touch target fixes:**
- Small icon buttons: wrap icon in padding or increase button size
- Small list items: increase `py-` to `py-3`
- Small inputs: change to `h-11`

### Step 8: Verify and Summarize

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUDIT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Summary

Typography:
- Issues found: X
- Fixed: Y
- Skipped: Z

Touch Targets:
- Issues found: X
- Fixed: Y
- Skipped: Z

## Files Modified

- components/Sidebar.tsx (3 typography, 1 touch target)
- components/Header.tsx (2 touch targets)
- components/Card.tsx (2 typography)

## Testing Checklist

- [ ] Test on mobile device or Chrome DevTools (iPhone SE, 375px)
- [ ] Verify text is readable without zooming
- [ ] Tap each button/link - should be comfortable, no mis-taps
- [ ] Check desktop appearance is unchanged
- [ ] Run the app and check for visual regressions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Notes

- This command combines `/font-audit` and `/touch-target-audit`
- For focused audits, use the individual commands
- The mobile bump scale: larger on mobile, smaller on desktop (Tailwind is mobile-first)
- 44×44px is the minimum touch target per Apple HIG and WCAG

---
*Last updated: 2025-02-03*
