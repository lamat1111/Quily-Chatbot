# Touch Target Audit Command

Audit and fix touch targets that are too small for comfortable mobile interaction in Tailwind CSS projects.

## The Problem

The minimum recommended touch target size is **44×44px** (Apple's HIG) or **48×48dp** (Material Design). Many UI elements—buttons, links, icons—are too small on mobile, causing frustration and mis-taps.

## What This Command Audits

### Touch Target Minimum Sizes

| Element Type | Minimum Size | Tailwind Equivalent |
|--------------|--------------|---------------------|
| Buttons | 44×44px | `min-h-11 min-w-11` or `p-3` on icon buttons |
| Icon buttons | 44×44px | `w-11 h-11` or `p-3` with icon |
| Links in lists | 44px height | `min-h-11 py-3` |
| Clickable icons | 24px icon + padding = 44px | `w-6 h-6` icon inside `p-2.5` container |
| Form inputs | 44px height | `h-11` or `py-3` |

### Patterns to Audit

| Pattern | Issue | Fix |
|---------|-------|-----|
| `w-6 h-6` on clickable icon | No padding, 24px target | Wrap in `p-2.5` container or use `w-11 h-11 p-2.5` |
| `w-8 h-8` button | 32px is too small | `w-11 h-11` or `min-w-11 min-h-11` |
| `p-1` or `p-2` on buttons | Insufficient padding | `p-3` minimum for icon buttons |
| `h-8` or `h-9` on inputs | 32-36px too small | `h-11` (44px) |
| `py-1` or `py-2` on list items | Cramped tap targets | `py-3` minimum |
| `gap-1` between clickable items | Items too close | `gap-2` or `gap-3` |

### Icon Size Guidelines

| Icon Size | Container Needed | Total Touch Target |
|-----------|------------------|-------------------|
| `w-4 h-4` (16px) | `p-3.5` (14px each side) | 44px |
| `w-5 h-5` (20px) | `p-3` (12px each side) | 44px |
| `w-6 h-6` (24px) | `p-2.5` (10px each side) | 44px |

## Context Matters

**Usually needs fixing (interactive elements):**
- Navigation menu items
- Icon buttons (close, menu, settings, etc.)
- Action buttons in cards
- Links in lists or tables
- Checkbox/radio labels
- Dropdown triggers
- Sidebar collapse buttons
- Mobile hamburger menus

**Usually OK to keep small:**
- Desktop-only dense data tables
- Disabled/non-interactive elements
- Elements with hover-only interactions
- Decorative icons (non-clickable)

## Process

### Step 1: Display Audit Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TOUCH TARGET AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scanning for touch targets that may be too small on mobile...
```

### Step 2: Verify This is a Tailwind Project

Check for:
- `tailwind.config.js` or `tailwind.config.ts`
- Tailwind classes in component files

If not a Tailwind project, inform the user and exit.

### Step 3: Search for Problematic Patterns

Search in `.tsx`, `.jsx`, `.html`, `.vue`, `.svelte` files:

```bash
# Find small icon buttons (w-6, w-7, w-8 with onClick or button)
grep -rE "(w-[678]|h-[678]).*(onClick|button|Button)" --include="*.tsx" --include="*.jsx" .

# Find small padding on buttons
grep -rE "className=.*p-[12][^0-9].*button" --include="*.tsx" --include="*.jsx" .

# Find small heights on interactive elements
grep -rE "h-[89].*onClick|onClick.*h-[89]" --include="*.tsx" --include="*.jsx" .

# Find cramped list items with click handlers
grep -rE "py-[12][^0-9].*(onClick|href)" --include="*.tsx" --include="*.jsx" .
```

### Step 4: Analyze Context for Each Finding

For each file with matches:
1. Read the file
2. Determine if element is interactive (has onClick, href, button role, etc.)
3. Check if it has sufficient size/padding
4. Categorize as:
   - **NEEDS FIX**: Interactive element with target < 44px
   - **PROBABLY OK**: Non-interactive or desktop-only
   - **REVIEW**: Unclear if interactive

### Step 5: Generate Audit Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUDIT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found X touch target issues across Y files.

## Needs Fixing - Small Icon Buttons

| File | Line | Current | Element | Suggested Fix |
|------|------|---------|---------|---------------|
| components/Header.tsx | 23 | w-6 h-6 | Close button | w-11 h-11 p-2.5 |
| components/Sidebar.tsx | 45 | w-8 h-8 | Menu toggle | w-11 h-11 |

## Needs Fixing - Cramped List Items

| File | Line | Current | Element | Suggested Fix |
|------|------|---------|---------|---------------|
| components/Nav.tsx | 12 | py-1 | Nav link | py-3 |

## Needs Fixing - Small Form Inputs

| File | Line | Current | Element | Suggested Fix |
|------|------|---------|---------|---------------|
| components/Search.tsx | 8 | h-8 | Search input | h-11 |

## Probably OK (non-interactive/desktop)

| File | Line | Current | Element | Reason |
|------|------|---------|---------|--------|
| components/Table.tsx | 34 | py-1 | Table cell | Desktop data table |

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
```

### Step 7: Execute Based on User Choice

#### If "Fix all recommended":

Apply fixes to all items in the "Needs Fixing" category:
- Icon buttons: Add padding or increase size to reach 44px
- List items: Increase vertical padding to `py-3`
- Inputs: Set height to `h-11`

#### If "Review one by one":

For each finding, show context and ask:
```
Question: "What should we do with this instance?"
Header: "Fix"
Options:
  - label: "Apply fix"
    description: "Increase touch target to 44px minimum"
  - label: "Make it larger"
    description: "Go beyond minimum (48px+) for important actions"
  - label: "Skip"
    description: "Leave as-is (desktop-only or non-interactive)"
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

- components/Header.tsx: Close button enlarged
- components/Sidebar.tsx: Menu toggle enlarged
- components/Nav.tsx: Nav links padded

## Testing Checklist

- [ ] Test on mobile device or Chrome DevTools mobile emulator
- [ ] Try tapping each fixed element - should be comfortable
- [ ] Check that spacing between elements is adequate
- [ ] Verify desktop appearance is still acceptable

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Quick Reference

### Tailwind Size Equivalents

| Pixels | Tailwind |
|--------|----------|
| 40px | `w-10 h-10` |
| 44px | `w-11 h-11` |
| 48px | `w-12 h-12` |

### Common Fixes

```jsx
// Before: 24px icon, no padding
<button><Icon className="w-6 h-6" /></button>

// After: 44px touch target
<button className="p-2.5"><Icon className="w-6 h-6" /></button>
// or
<button className="w-11 h-11 flex items-center justify-center">
  <Icon className="w-6 h-6" />
</button>
```

```jsx
// Before: cramped nav link
<a className="py-1 px-2">Link</a>

// After: comfortable tap target
<a className="py-3 px-2">Link</a>
```

## Notes

- 44×44px is the minimum, but 48×48px is better for primary actions
- Always test on actual mobile devices, not just emulators
- Consider adding `active:scale-95` for tactile feedback
- Ensure adequate spacing between adjacent touch targets (at least 8px)

---
*Last updated: 2025-02-03*
