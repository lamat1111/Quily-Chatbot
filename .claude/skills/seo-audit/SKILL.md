---
name: seo-audit
description: Audit and fix website metadata, favicons, PWA icons, and manifest configuration
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
Comprehensive audit and implementation of website metadata, favicons, PWA icons, and manifest configuration. This command verifies all required assets exist, checks their specifications, and guides creation of missing items.

This skill integrates with the `yarn icons` script for automated icon generation.
</objective>

<context>
Modern websites need multiple icon formats for different contexts:
- Browser tabs and bookmarks (favicon.ico, favicon.svg)
- iOS home screen (apple-touch-icon.png)
- Android/PWA home screen and splash (manifest icons)
- Open Graph / Twitter cards (og-image.png)

This skill audits all these requirements and helps implement missing pieces.
</context>

<icon_generation_script>

## Available Commands

```bash
yarn icons audit      # Check what files exist/missing
yarn icons generate   # Generate all icons from source files
yarn icons help       # Show detailed usage information
```

## Source Files Required

Place these files in `public/sources/`:

| File | Size | Format | Purpose |
|------|------|--------|---------|
| `icon-512.png` | 512x512 | PNG (opaque bg) | Mobile/PWA icons |
| `favicon.png` | 48x48+ | PNG (transparent) | favicon.ico |
| `favicon.svg` | Any | SVG (single color) | Browser favicon with dark mode |

## Generated Output Files

From `icon-512.png`:
- `icon-512.png` (512x512)
- `icon-512-maskable.png` (512x512 with padding)
- `icon-192.png` (192x192)
- `icon-144.png` (144x144)
- `icon-96.png` (96x96)
- `icon-72.png` (72x72)
- `apple-touch-icon.png` (180x180)

From `favicon.png`:
- `favicon.ico` (16, 32, 48px multi-resolution)

From `favicon.svg`:
- `favicon.svg` (with dark mode CSS injected)

## Generation Options

```bash
yarn icons generate --light-color "#000000" --dark-color "#ffffff"
yarn icons generate --skip-maskable    # Skip maskable icon
yarn icons generate --skip-ico         # Skip ICO generation
yarn icons generate --skip-svg         # Skip SVG processing
yarn icons generate --dry-run          # Preview without changes
```

## Dependencies

The script requires:
- `sharp` - for PNG resizing/optimization
- `png-to-ico` - for ICO file generation

Install with:
```bash
yarn add -D sharp png-to-ico
```

</icon_generation_script>

<reference_specifications>

## Complete Icon Requirements

| File | Size | Format | Purpose | Notes |
|------|------|--------|---------|-------|
| `favicon.svg` | Any | SVG | Modern browsers | Supports dark mode with CSS media query |
| `favicon.ico` | 16, 32, 48 | ICO (multi-res) | Legacy fallback | Transparent background |
| `apple-touch-icon.png` | 180x180 | PNG | iOS home screen | **Opaque background** |
| `icon-192.png` | 192x192 | PNG | Android/PWA | Manifest icon |
| `icon-512.png` | 512x512 | PNG | PWA splash | Manifest icon |
| `icon-512-maskable.png` | 512x512 | PNG | Android adaptive | 80% safe zone (padding) |
| `og-image.png` | 1200x630 | PNG/JPG | Social sharing | Open Graph image |

## Manifest Requirements

File: `public/manifest.webmanifest`

```json
{
  "name": "Full App Name",
  "short_name": "Short (12 chars)",
  "description": "App description",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## Next.js Metadata Configuration

File: `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description for SEO',
  metadataBase: new URL('https://yoursite.com'),
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    url: 'https://yoursite.com',
    siteName: 'Site Name',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Site preview' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter Title',
    description: 'Twitter Description',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.png',
  },
};
```

## SVG Favicon with Dark Mode

```svg
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <style>
    .icon-color { fill: #000000; }
    @media (prefers-color-scheme: dark) {
      .icon-color { fill: #ffffff; }
    }
  </style>
  <path class="icon-color" d="..."/>
</svg>
```

</reference_specifications>

<process>

## Step 1: Display Audit Banner

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SEO & METADATA AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Auditing website metadata, favicons, and PWA configuration...
```

## Step 2: Detect Project Type

Check for:
- `next.config.js` or `next.config.ts` → Next.js
- `vite.config.ts` → Vite/React
- `index.html` → Static HTML

## Step 3: Run Icon Audit Script

```bash
yarn icons audit
```

This shows all source and output files with their status.

## Step 4: Check Additional Files

Manually verify:
- `public/manifest.webmanifest` exists
- `public/og-image.png` exists (1200x630)
- Metadata configuration in `app/layout.tsx`

## Step 5: Generate Audit Report

Display findings:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUDIT RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Source Files (public/sources/)

| Status | File | Notes |
|--------|------|-------|
| ✅ | icon-512.png | Found |
| ❌ | favicon.png | MISSING |
| ❌ | favicon.svg | MISSING |

## Output Files (public/)

| Status | File | Notes |
|--------|------|-------|
| ✅ | favicon.svg | Found |
| ✅ | favicon.ico | Found |
| ✅ | apple-touch-icon.png | Found |
| ❌ | icon-192.png | MISSING |
| ❌ | icon-512.png | MISSING |
| ❌ | icon-512-maskable.png | MISSING |
| ✅ | og-image.png | Found |

## Configuration Files

| Status | File | Notes |
|--------|------|-------|
| ❌ | manifest.webmanifest | MISSING |
| ✅ | app/layout.tsx | Metadata configured |

## Metadata Configuration

| Status | Item | Notes |
|--------|------|-------|
| ✅ | title | "Quily Chat" |
| ✅ | description | Set |
| ❌ | manifest | NOT LINKED |
| ✅ | openGraph | Complete |
| ✅ | twitter | Complete |
| ✅ | icons | Configured |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 6: Ask User What to Fix

Use AskUserQuestion:

```
Question: "What would you like to do?"
Header: "Action"
Options:
  - label: "Generate icons"
    description: "Run yarn icons generate (requires source files)"
  - label: "Create manifest"
    description: "Create manifest.webmanifest file"
  - label: "Update metadata"
    description: "Update layout.tsx metadata configuration"
  - label: "Show setup guide"
    description: "Show instructions for creating source files"
```

## Step 7: Execute Based on User Choice

### If "Generate icons":

First check if source files exist. If not, show setup guide.

If sources exist, ask for SVG colors:

```
Question: "What colors for the SVG favicon?"
Header: "Colors"
Options:
  - label: "Black/White"
    description: "Light theme: #000000, Dark theme: #ffffff"
  - label: "Custom colors"
    description: "Enter custom hex colors"
```

Then run:
```bash
yarn icons generate --light-color "#000000" --dark-color "#ffffff"
```

### If "Create manifest":

Create `public/manifest.webmanifest` with project info from layout.tsx or package.json.

### If "Update metadata":

Edit `app/layout.tsx` to add:
- `manifest: '/manifest.webmanifest'`
- Any missing metadata fields

### If "Show setup guide":

Display the source file requirements:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SOURCE FILE SETUP GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create these files in public/sources/:

## 1. icon-512.png
   - Size: 512x512 pixels
   - Background: Opaque (solid color, NOT transparent)
   - Contains: Your logo/icon
   - Used for: All mobile device icons

## 2. favicon.png
   - Size: 48x48 pixels (or larger)
   - Background: Transparent
   - Contains: Your logo in a color suitable for browser tabs
   - Used for: favicon.ico (browser tabs)
   - Note: This may have DIFFERENT colors than icon-512.png

## 3. favicon.svg
   - Format: SVG file
   - Color: Single color (script will add dark mode)
   - Contains: Vector version of your favicon
   - Used for: Modern browsers with dark mode support

## Tips

- Start with your logo in vector format (Figma, Illustrator, etc.)
- Export PNG versions at the required sizes
- For favicon.png, choose colors that work on both
  light AND dark browser themes, or let the SVG handle it

Once created, run:

  yarn icons generate --light-color "#000000" --dark-color "#ffffff"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Step 8: Verify Changes

After any changes:
1. Re-run `yarn icons audit`
2. Check manifest.webmanifest exists
3. Verify layout.tsx configuration
4. Confirm all issues resolved

## Step 9: Final Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AUDIT COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Summary

- Icons: X/Y complete
- Manifest: ✅ Created / ✅ Valid
- Metadata: ✅ Complete

## Testing Checklist

- [ ] Test favicon in browser tab (light theme)
- [ ] Test favicon in browser tab (dark theme)
- [ ] Test "Add to Home Screen" on iOS
- [ ] Test "Install App" on Android/Chrome
- [ ] Test Open Graph: https://opengraph.xyz
- [ ] Test Twitter Card: https://cards-dev.twitter.com/validator
- [ ] Run Lighthouse PWA audit in Chrome DevTools

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

</process>

<success_criteria>
- [ ] Project type detected (Next.js, Vite, static HTML)
- [ ] Icon audit script run successfully
- [ ] Source files checked
- [ ] Output files checked
- [ ] Manifest file checked
- [ ] Metadata configuration checked
- [ ] Clear report generated
- [ ] User asked what to fix
- [ ] Appropriate action taken
- [ ] Final verification performed
</success_criteria>

<notes>
- Dependencies (sharp, png-to-ico) must be installed for icon generation
- Source files must be created manually by the user (design work)
- The script handles resizing, compression, and SVG dark mode injection
- Maskable icons require 10% padding (80% safe zone)
- SVG and ICO favicons serve different purposes (SVG: modern browsers, ICO: legacy)
- Apple Touch Icon must have opaque background (iOS requirement)
</notes>

---
*Last updated: 2026-02-03*
