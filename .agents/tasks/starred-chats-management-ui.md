---
type: task
title: "Starred Chats and Chat Management UI"
status: open
complexity: medium
ai_generated: true
reviewed_by: feature-analyzer
created: 2026-01-30
updated: 2026-01-30
related_docs: []
related_tasks: []
---

# Starred Chats and Chat Management UI

> **⚠️ AI-Generated**: May contain errors. Verify before use.
> **Reviewed by**: feature-analyzer agent

**Files**:
- `src/stores/conversationStore.ts` - Add `starred` field and actions
- `src/components/sidebar/ConversationList.tsx` - Starred/Recent sections + dropdown menus
- `src/components/chat/ChatHeader.tsx` - New header component with title and dropdown
- `src/components/chat/ChatContainer.tsx` - Integrate ChatHeader into chat area

## What & Why

Currently the sidebar shows a flat list of conversations sorted by date. Users cannot organize or manage their chats effectively. Following the Claude interface pattern, we need:

1. **Starred/Recent organization** - Important chats pinned to a "Starred" section at the top
2. **Dropdown menus** - Each chat has a context menu with: Star/Unstar, Rename, Delete
3. **Chat header with title** - Display current chat name at top-left of chat area with same dropdown
4. **Manual rename** - Users can rename chats via the dropdown menu

## Context

- **Existing pattern**: `ConversationList.tsx` renders chats with hover-revealed delete button
- **UI library**: Radix UI Dialog already in use - use Radix DropdownMenu for menus
- **Icons**: Use project's `Icon` component from `@/src/components/ui/Icon` for all icons (e.g., `<Icon name="star" size={16} />`)
- **Store actions**: `updateTitle()` and `deleteConversation()` already exist
- **Approach**: Keep it simple - implement inline first, extract components only if duplication warrants it

## Prerequisites

- [ ] Install `@radix-ui/react-dropdown-menu` (not currently installed, only `@radix-ui/react-dialog` exists)

## Implementation

### Phase 1: Store Updates

- [ ] **Add `starred` field to Conversation type** (`src/stores/conversationStore.ts`)
  - Add `starred: boolean` to `Conversation` interface
  - Default to `false` for new conversations
  - Handle migration: existing conversations without `starred` should default to `false`
  - Done when: TypeScript types updated, existing data works

- [ ] **Add `toggleStarred(id)` action** (`src/stores/conversationStore.ts`)
  - Toggle `starred` field for given conversation
  - Done when: Action toggles starred state and persists

- [ ] **Fix chat list ordering** (`src/components/sidebar/ConversationList.tsx`)
  - Currently sorts by `updatedAt`, causing chats to jump to top when selected
  - Change to sort by `createdAt` (newest first) for stable positioning
  - Chats stay in place when clicked, only new chats appear at top
  - Done when: Clicking a chat doesn't reorder the list

### Phase 2: Sidebar Dropdown Menus + Sections

- [ ] **Add dropdown menu to conversation items** (`src/components/sidebar/ConversationList.tsx`)
  - Use Radix UI DropdownMenu inline (no separate component yet)
  - Three-dot trigger icon on hover using `<Icon name="more-horizontal" />` or similar
  - Menu items with icons: Star/Unstar (`star`), Rename (`edit`), Delete (`trash`)
  - Wire actions: `toggleStarred()`, inline rename state, `deleteConversation()`
  - Done when: Menu works with all actions

- [ ] **Add inline rename mode** (`src/components/sidebar/ConversationList.tsx`)
  - When "Rename" clicked, title becomes editable input
  - Enter to save (calls `updateTitle()`), Escape to cancel
  - Done when: Can rename directly in sidebar

- [ ] **Split list into Starred and Recents sections** (`src/components/sidebar/ConversationList.tsx`)
  - Filter conversations by `starred` field
  - "Starred" section header (only show if starred chats exist)
  - "Recents" section header for non-starred
  - Small, muted text for section labels
  - Done when: Two sections render correctly

### Phase 3: Chat Header with Dropdown

- [ ] **Create ChatHeader component** (`src/components/chat/ChatHeader.tsx`)
  - Display current conversation title
  - Dropdown arrow/chevron next to title using `<Icon name="chevron-down" />`
  - Click opens Radix DropdownMenu with same options (use Icon component for menu item icons)
  - Inline rename mode when "Rename" selected
  - Done when: Header renders with working dropdown

- [ ] **Integrate ChatHeader into chat area** (`src/components/chat/ChatContainer.tsx`)
  - Add ChatHeader at top of ChatContainer, above MessageList
  - Position at top-left of chat content area
  - Handle mobile layout (account for existing `pt-14` spacing in AppLayout)
  - Only show when a conversation is active (conversationId exists)
  - Done when: Header visible and functional

## Verification

✅ **Starring works**
   - Test: Click star → Chat moves to Starred section
   - Test: Click unstar → Chat returns to Recents section
   - Test: Refresh page → Starred state persists

✅ **Dropdown menus work**
   - Test: Hover chat → Three-dot icon appears
   - Test: Click icon → Menu opens with all options
   - Test: Each action performs correctly

✅ **Rename works**
   - Test: Click Rename → Title becomes editable
   - Test: Type new name + Enter → Title updates and persists
   - Test: Escape → Cancels edit

✅ **Header dropdown works**
   - Test: Click title/arrow in chat header → Menu opens
   - Test: Actions work same as sidebar

✅ **Sections display correctly**
   - Test: With starred chats → "Starred" section appears above "Recents"
   - Test: No starred chats → Only "Recents" section shows

✅ **Chat list stays stable**
   - Test: Click on a chat → It does NOT jump to top of list
   - Test: Send a new message → Chat stays in same position
   - Test: Create new chat → New chat appears at top

✅ **TypeScript compiles**
   - Run: `npx tsc --noEmit --jsx react-jsx --skipLibCheck`

## Definition of Done

- [ ] `starred` field added to conversation store
- [ ] Chat list sorted by `createdAt` (stable ordering)
- [ ] Starred/Recents sections in sidebar
- [ ] Dropdown menu on each chat with Star/Rename/Delete
- [ ] Inline rename functionality in sidebar
- [ ] Chat header with title and dropdown in chat area
- [ ] TypeScript passes
- [ ] Manual testing successful
- [ ] No console errors

## Future Enhancements (Out of Scope)

- AI-powered title generation ("Generate Title" menu option)
- Delete confirmation dialog
- Keyboard shortcuts for menu actions

---

_Created: 2026-01-30_
_Updated: 2026-01-30_
