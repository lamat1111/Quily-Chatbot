---
type: task
title: "Implement Conversation Search Modal"
status: open
complexity: high
ai_generated: true
reviewed_by: feature-analyzer
created: 2026-01-30
updated: 2026-01-30
related_docs: []
related_tasks:
  - starred-chats-management-ui.md
---

# Implement Conversation Search Modal

> **⚠️ AI-Generated**: May contain errors. Verify before use.
> **Reviewed by**: feature-analyzer agent

**Files to Create**:
- `src/components/sidebar/SearchModal.tsx` - New search modal component
- `src/lib/utils/time.ts` - Time formatting utility for relative time groups

**Files to Modify**:
- `src/components/layout/AppLayout.tsx` - Global Ctrl/Cmd+K keyboard shortcut
- `src/components/sidebar/Sidebar.tsx` - Search button in header area (lines 96-103)

**Reference Files**:
- `src/stores/conversationStore.ts` - Conversation data structure
- `src/components/ui/ApiKeyModal.tsx` - Modal pattern reference
- `src/components/sidebar/ConversationList.tsx` - Delete dialog pattern (z-index reference)

## What & Why

Users currently have no way to search through their conversation history. As the conversation list grows (up to 50 conversations stored), finding a specific past chat becomes tedious. Following the Claude interface pattern, we need a full search modal that allows users to:

1. **Quick access via keyboard** - Ctrl+K (or Cmd+K on Mac) opens search instantly
2. **Search across all content** - Find conversations by title or message content
3. **Time-based grouping** - Results organized by "Today", "Past 7 days", "Past 30 days", "Older"
4. **Keyboard navigation** - Arrow keys to navigate, Enter to select, Escape to close

## Context

- **Existing pattern**: `ApiKeyModal.tsx` uses Radix UI Dialog with overlay and centered content
- **UI library**: Radix UI Dialog already installed and in use
- **Store structure**: Conversations have `id`, `title`, `messages[]`, `createdAt`, `updatedAt`, `starred`
- **Icons**: Use project's `Icon` component (e.g., `<Icon name="search" />`, `<Icon name="x" />`)
- **Screenshot reference**: Claude's search UI shows a centered modal with search input at top, results list below
- **Z-index coordination**: Delete dialog uses `z-50`, SearchModal should use `z-[60]` to stack above

## Architecture Decisions

1. **Global shortcut location**: `AppLayout.tsx` (not Sidebar) - ensures shortcut works even when sidebar is collapsed on mobile
2. **Search button placement**: Sidebar header section (fixed position, not in scrollable ConversationList)
3. **Modal state**: Local component state in SearchModal - no need for global store
4. **Mobile detection**: Use `window.innerWidth < 1024` (matches Tailwind `lg:` breakpoint)
5. **Search strategy**: Client-side filtering with debouncing - appropriate for max 50 conversations

## Prerequisites

- [ ] Review existing modal patterns in `ApiKeyModal.tsx` and delete confirmation in `ConversationList.tsx`

## Implementation

### Phase 1: Basic Modal + Title Search

- [ ] **Create time utility function** (`src/lib/utils/time.ts`)
  - Function: `getTimeGroup(timestamp: number): string`
  - Returns: "Today", "Past 7 days", "Past 30 days", or "Older"
  - Done when: Utility correctly categorizes timestamps

- [ ] **Create SearchModal component** (`src/components/sidebar/SearchModal.tsx`)
  - Radix Dialog with overlay (`z-[60]` for proper stacking)
  - Modal positioned near top-center of screen (not vertically centered)
  - Search input with placeholder "Search conversations..."
  - Use `<Icon name="search" />` prefix, `<Icon name="x" />` for clear button
  - Auto-focus input when modal opens
  - Done when: Modal opens/closes, input works

- [ ] **Implement title-only search** (`src/components/sidebar/SearchModal.tsx`)
  - Filter conversations by title (case-insensitive substring match)
  - Show all conversations when search is empty
  - Show "No results found" when no matches
  - Done when: Typing filters by title in real-time

- [ ] **Add search button to sidebar** (`src/components/sidebar/Sidebar.tsx`)
  - Add search icon button in header area (near "New Chat" button)
  - Use `<Icon name="search" size={18} />`
  - Opens SearchModal on click
  - Done when: Clicking button opens search modal

### Phase 2: Message Content Search + Performance

- [ ] **Add debouncing to search input** (`src/components/sidebar/SearchModal.tsx`)
  - 300ms debounce delay before filtering
  - Show loading indicator during debounce (optional)
  - Done when: Rapid typing doesn't cause lag

- [ ] **Add message content search** (`src/components/sidebar/SearchModal.tsx`)
  - Search through `messages[].content` (limit to first 100 messages per conversation)
  - Case-insensitive substring match
  - Title matches appear first, then content matches
  - Done when: Can find conversations by message text

- [ ] **Add global keyboard shortcut** (`src/components/layout/AppLayout.tsx`)
  - useEffect hook listening for keydown events
  - Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
  - Prevent default browser behavior
  - Only trigger if not focused on an input/textarea
  - Done when: Shortcut works from anywhere in app

### Phase 3: Time Grouping

- [ ] **Group results by time period** (`src/components/sidebar/SearchModal.tsx`)
  - Use `getTimeGroup()` utility on `updatedAt` timestamp
  - Groups: "Today", "Past 7 days", "Past 30 days", "Older"
  - Show group headers only when that group has results
  - Done when: Results appear under correct time headers

- [ ] **Style results list** (`src/components/sidebar/SearchModal.tsx`)
  - Each result shows: chat icon, title (truncated), time indicator (right side)
  - Hover state: `bg-surface/10`
  - Selected/focused state for keyboard navigation
  - Scrollable results area with max-height
  - Theme classes: `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700`
  - Done when: Results match Claude's search UI style

### Phase 4: Keyboard Navigation

- [ ] **Implement keyboard navigation** (`src/components/sidebar/SearchModal.tsx`)
  - Track `selectedIndex` state
  - Arrow Down: increment index (stop at last item)
  - Arrow Up: decrement index (stop at first item)
  - Enter: select highlighted result
  - Escape: close modal (Radix handles this by default)
  - Done when: Can navigate and select entirely with keyboard

- [ ] **Wire up result selection** (`src/components/sidebar/SearchModal.tsx`)
  - On selecting a result, call `setActive(conversationId)` from store
  - Close modal after selection
  - If `window.innerWidth < 1024`, also close sidebar
  - Done when: Selecting a result navigates to that conversation

## Verification

✅ **Modal opens/closes correctly**
   - Test: Press Ctrl+K → Modal opens with focused input
   - Test: Press Escape → Modal closes
   - Test: Click outside modal → Modal closes
   - Test: Click search button in sidebar → Modal opens

✅ **Search filtering works**
   - Test: Type conversation title → That conversation appears
   - Test: Type phrase from message content → Relevant conversations appear
   - Test: Clear search → All conversations shown
   - Test: No matches → "No results found" message shown
   - Test: Rapid typing → No lag (debouncing works)

✅ **Time grouping works**
   - Test: Recent conversation → Shows under "Today"
   - Test: Week-old conversation → Shows under "Past 7 days"
   - Test: Groups only appear when they have results

✅ **Keyboard navigation works**
   - Test: Arrow Down → Selection moves to next result
   - Test: Arrow Up → Selection moves to previous result
   - Test: Enter on selection → Navigates to conversation, closes modal
   - Test: Selection stops at boundaries (no wrap)

✅ **Dark/Light theme support**
   - Test: Toggle theme → Modal colors update appropriately
   - Test: Overlay, input, results all respect theme

✅ **Performance**
   - Test: Search with 50 conversations × 100 messages → Completes in <100ms
   - Test: No jank when typing quickly

✅ **Accessibility**
   - Test: Modal has proper focus trap
   - Test: Can close with Escape key
   - Test: Search input is focused on open

✅ **TypeScript compiles**
   - Run: `npx tsc --noEmit --jsx react-jsx --skipLibCheck`

## Definition of Done

- [ ] Time utility function created (`src/lib/utils/time.ts`)
- [ ] SearchModal component created with Radix Dialog
- [ ] Search filters by title and message content
- [ ] 300ms debouncing on search input
- [ ] Results grouped by time period (4 groups)
- [ ] Keyboard navigation (arrows, enter, escape)
- [ ] Global Ctrl/Cmd+K shortcut in AppLayout
- [ ] Search trigger button in sidebar header
- [ ] Result selection navigates to conversation
- [ ] Mobile: closes sidebar on selection
- [ ] Dark/light theme support
- [ ] Z-index properly coordinated (z-[60])
- [ ] TypeScript passes
- [ ] Manual testing successful
- [ ] No console errors

## Design Notes

**Modal styling (based on Claude's UI):**
- Width: `max-w-lg` (~512px)
- Position: Top third of screen (`top-[20%]` instead of `top-1/2`)
- Z-index: `z-[60]` (above existing dialogs at z-50)
- Rounded corners: `rounded-lg`
- Shadow: `shadow-xl`
- Overlay: `bg-black/50`

**Search input:**
- Full width of modal
- Search icon prefix: `<Icon name="search" className="text-secondary" />`
- Clear button when text present: `<Icon name="x" />`
- Styling: `bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-accent`

**Result items:**
- Chat icon: `<Icon name="message-square" size={16} />`
- Title text: `truncate` class, max ~40 chars visible
- Time indicator: `text-secondary text-sm` on right
- Hover: `hover:bg-surface/10`
- Selected: `bg-surface/15 ring-1 ring-accent/50`

**Group headers:**
- Styling: `text-xs text-secondary uppercase tracking-wide px-3 py-2`
- Examples: "Today", "Past 7 days", "Past 30 days", "Older"

## Known Limitations

- Search is client-side only (no server-side search)
- Message content search limited to first 100 messages per conversation for performance
- No fuzzy matching (exact substring only)
- No search result highlighting in results list

## Future Enhancements (Out of Scope)

- Highlight matched text in search results
- Search history / recent searches
- Fuzzy matching for typo tolerance
- Filter by starred conversations only
- Search within specific date range

---

_Created: 2026-01-30_
_Updated: 2026-01-30_
