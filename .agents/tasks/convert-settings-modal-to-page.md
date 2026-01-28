---
type: task
title: "Convert Settings Modal to Standalone Settings Page"
status: open
complexity: medium
ai_generated: true
reviewed_by: null
created: 2025-01-28
updated: 2025-01-28
related_docs: []
related_tasks: ["ai-chat-renaming-feature.md"]
---

# Convert Settings Modal to Standalone Settings Page

> **AI-Generated**: May contain errors. Verify before use.

**Files**:
- `app/settings/page.tsx` (CREATE)
- `src/components/sidebar/Sidebar.tsx:178-192` (MODIFY)
- `src/components/ui/SettingsModal.tsx` (DELETE)
- `src/stores/settingsStore.ts` (DELETE)

## What & Why

**Current State**: Settings are displayed in a Radix UI Dialog modal (`SettingsModal.tsx`) that opens when clicking the "Settings" button in the sidebar. The modal contains provider selection, API key management, model selection with expandable dropdowns, and advanced settings.

**Desired State**: Settings should be a standalone page at `/settings`, following the same layout pattern as the existing About (`/about`) and Links (`/links`) pages. This provides a better UX with more screen real estate, clearer section organization via cards, and consistent navigation patterns.

**Value**: Better user experience with full-page layout, improved visual organization with card-based sections, consistent navigation with other pages, and simplified state management (no modal open/close state needed).

## Context

- **Existing pattern**: `app/about/page.tsx` and `app/links/page.tsx` use identical layout structure: `<Sidebar />` + main content area with `pt-14 lg:pt-0` responsive padding and `max-w-3xl` centered container
- **Current modal features** (lines 172-612 of SettingsModal.tsx):
  1. Provider Selection - 2-column grid of provider buttons (OpenRouter, Chutes)
  2. OpenRouter API Key - Password input, save/clear buttons, validation feedback
  3. Chutes Session - OAuth sign in/out with user display
  4. Model Selection - Expandable accordion dropdowns for both providers
  5. Advanced Settings (Chutes) - Custom model URL and embedding model config
  6. Clear Confirmation - Nested overlay dialog
- **Constraints**: Must preserve all existing functionality; Chutes OAuth redirects to `/` after login
- **Dependencies**: None - can be implemented independently

## Implementation

### Phase 1: Create Settings Page

- [ ] **Create `app/settings/page.tsx`**
  - Done when: Page renders at `/settings` with all settings sections
  - Reference: Follow exact layout pattern from `app/links/page.tsx:71-77`

  **Page Structure**:
  ```tsx
  'use client';
  import { Sidebar } from '@/src/components/sidebar/Sidebar';

  export default function SettingsPage() {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-12 w-full">
            {/* Page header */}
            {/* Provider Selection Card */}
            {/* Authentication Card */}
            {/* Model Selection Card */}
            {/* Advanced Settings Card (Chutes only) */}
          </div>
        </main>
      </div>
    );
  }
  ```

- [ ] **Migrate state and hooks from SettingsModal** (`lines 29-73`)
  - Done when: All `useLocalStorage`, `useChutesSession`, `useChutesModels` hooks working
  - Copy: All state variables including `chutesModelListOpen` (line 52)
  - Remove: `open`/`setOpen`, `storeIsOpen`/`closeSettings`, `handleOpenChange`
  - Remove: Dialog-related imports and components

- [ ] **Migrate callbacks** (`lines 117-147`)
  - Done when: `handleSaveApiKey`, `handleClearApiKey`, `confirmClearApiKey` work
  - Copy: All callback implementations as-is

- [ ] **Create Page Header section**
  - Done when: Title and description render
  ```tsx
  <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
  <p className="text-text-secondary mb-8">
    Configure your AI provider, API key, and preferred model.
  </p>
  ```

### Phase 2: Create Card-Based Sections

Each section uses this card pattern (matching Links page):
```tsx
<section className="mb-8">
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
    <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
      <Icon name="..." size={20} className="text-accent" />
      Section Title
    </h2>
    {/* Content */}
  </div>
</section>
```

- [ ] **Provider Selection Card** (migrate from `lines 172-213`)
  - Done when: Provider grid renders and switching works
  - Icon: `zap`
  - Content: Same 2-column grid of provider buttons

- [ ] **Authentication Card** (migrate from `lines 215-342`)
  - Done when: API key input and Chutes OAuth work
  - Conditional rendering based on `isOpenRouter` / `isChutes`
  - Icons: `key` for OpenRouter, `user` for Chutes
  - Include status indicator dot in header

- [ ] **Model Selection Card** (migrate from `lines 347-611`)
  - Done when: Both model dropdowns expand/collapse correctly
  - Icon: `cpu`
  - OpenRouter: Expandable accordion (lines 357-432)
  - Chutes: Expandable accordion (lines 448-527) - **NOTE: This is now accordion-style, not a simple select**
  - Increase `max-h-64` to `max-h-96` for more breathing room

- [ ] **Advanced Settings Card** (Chutes only) (migrate from `lines 534-608`)
  - Done when: Custom URL and embedding model config render
  - Make standalone card instead of collapsible toggle
  - Icon: `sliders`
  - Only show when `isChutes && isChutesSignedIn`
  - Includes: Custom Model URL input + Embedding Model selector

### Phase 3: Handle Clear Confirmation

- [ ] **Convert clear confirmation to inline banner** (migrate from `lines 614-643`)
  - Done when: Clear confirmation shows inline, not as overlay
  - Replace fixed overlay with inline warning banner in Authentication Card:
  ```tsx
  {showClearConfirm && (
    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <h3 className="text-sm font-semibold text-text-primary mb-1">Clear API Key?</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Are you sure you want to remove your API key?
      </p>
      <div className="flex gap-2">
        <button onClick={() => setShowClearConfirm(false)} ...>Cancel</button>
        <button onClick={confirmClearApiKey} ...>Clear Key</button>
      </div>
    </div>
  )}
  ```

### Phase 4: Update Sidebar Navigation

- [ ] **Replace modal trigger with Link** (`src/components/sidebar/Sidebar.tsx:178-192`)
  - Done when: Clicking Settings navigates to `/settings`
  - Remove: `import { SettingsModal }` (line 8)
  - Replace `<SettingsModal>` wrapper with:
  ```tsx
  <Link
    href="/settings"
    onClick={() => setSidebarOpen(false)}
    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
      text-text-secondary
      hover:bg-surface/10 dark:hover:bg-surface/15
      transition-colors text-left"
  >
    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
    <span className="flex-1">Settings</span>
    <Icon name="settings" size={16} className="text-gray-400" />
  </Link>
  ```
  - Note: `Link` import already exists at line 4

### Phase 5: Cleanup

- [ ] **Delete `src/components/ui/SettingsModal.tsx`**
  - Done when: File removed, no import errors
  - Verify: Only imported in Sidebar.tsx (already removed in Phase 4)

- [ ] **Delete `src/stores/settingsStore.ts`**
  - Done when: File removed, no import errors
  - Verify: Only used by SettingsModal.tsx (already deleted)

## Verification

**Feature works as expected**:
- [ ] Navigate to `/settings` from sidebar
- [ ] All settings sections render correctly
- [ ] Provider switching works (OpenRouter <-> Chutes)
- [ ] API key save/validate/clear flow works
- [ ] Chutes sign in/out works (note: redirects to `/` after OAuth)
- [ ] OpenRouter model dropdown expands/collapses and selection works
- [ ] Chutes model dropdown expands/collapses and selection works
- [ ] Advanced settings visible only for signed-in Chutes users
- [ ] Clear confirmation inline banner works
- [ ] Mobile responsive (sidebar closes, proper spacing)

**TypeScript compiles**:
- [ ] Run: `npx tsc --noEmit --jsx react-jsx --skipLibCheck`

**Build succeeds**:
- [ ] Run: `yarn build`

## Definition of Done

- [ ] All phases complete
- [ ] Settings page fully functional at `/settings`
- [ ] Old modal and store deleted
- [ ] Sidebar links to `/settings` instead of opening modal
- [ ] TypeScript passes
- [ ] Build succeeds
- [ ] Manual testing on desktop and mobile

## Notes

- **OAuth redirect**: After Chutes OAuth login, users land on `/` (home page), not back at settings. This is acceptable for now; can be enhanced later with `returnTo` cookie if needed.
- **Related task**: The `ai-chat-renaming-feature.md` task references `SettingsModal.tsx` multiple times. If that task is still pending, update references to point to the new settings page.
- **Unused file**: `src/components/ui/ApiKeyModal.tsx` exists but appears unused. Consider cleaning up separately.

---

_Created: 2025-01-28_
