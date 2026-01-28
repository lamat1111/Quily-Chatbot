---
type: task
title: "Implement AI-Powered Chat Renaming Feature"
status: open
complexity: medium
ai_generated: true
reviewed_by: null
created: 2026-01-28
updated: 2026-01-28
related_docs: []
related_tasks: []
---

# Implement AI-Powered Chat Renaming Feature

> **⚠️ AI-Generated**: May contain errors. Verify before use.

**Files**:
- `src/components/ui/SettingsModal.tsx`
- `src/stores/conversationStore.ts`
- `app/api/chat/route.ts` (or new endpoint)

## What & Why

Currently, chat conversations are auto-titled using the first 50 characters of the user's first message, which often results in unclear or unhelpful names like "How do I..." or "Can you help me with...". Users should be able to generate meaningful, context-aware titles for their conversations using AI summarization.

This feature adds a "Conversations" section to the SettingsModal that allows users to:
1. View all their saved conversations
2. Generate AI-powered smart titles based on conversation content
3. Manually edit titles if desired

## Context

- **Existing pattern**: `updateTitle(id, title)` action already exists in `conversationStore.ts` but has no UI
- **Constraints**:
  - Max 50 conversations stored in localStorage
  - Need to minimize API calls (avoid renaming all at once)
  - Title generation should be fast and cost-effective
- **Dependencies**:
  - Existing chat API endpoint can be reused with a summarization prompt
  - Zustand store already supports title updates

## Implementation

### Phase 1: Add Conversations Section to SettingsModal
- [ ] **Add "Conversations" tab/section** (`src/components/ui/SettingsModal.tsx`)
  - Done when: New section visible in modal with list of conversations
  - Reference: Follow existing modal section patterns

- [ ] **Display conversation list with current titles** (`src/components/ui/SettingsModal.tsx`)
  - Show conversation title, message count, last updated date
  - Done when: All conversations visible in scrollable list

### Phase 2: Title Generation Logic
- [ ] **Create title generation utility** (new file or in existing utils)
  - Extract key messages from conversation (first few exchanges)
  - Build prompt asking for 3-5 word descriptive title
  - Done when: Function returns generated title string

- [ ] **Add API endpoint or reuse chat endpoint** (`app/api/chat/route.ts` or new)
  - Accept conversation content, return concise title
  - Use lightweight prompt for quick response
  - Done when: API returns meaningful titles

### Phase 3: UI Controls
- [ ] **Add "Generate Title" button per conversation** (`src/components/ui/SettingsModal.tsx`)
  - Shows loading state during generation
  - Updates title via `updateTitle()` store action
  - Done when: Button generates and saves new title

- [ ] **Add inline edit capability** (`src/components/ui/SettingsModal.tsx`)
  - Allow manual title editing with save/cancel
  - Done when: Users can manually rename conversations

- [ ] **Optional: Add "Rename All" batch action**
  - Iterate through conversations with default titles
  - Rate limit to avoid API overload
  - Done when: Batch rename completes with progress indicator

## Verification

✅ **Individual rename works**
   - Test: Click "Generate Title" → Title updates to meaningful summary

✅ **Manual edit works**
   - Test: Click edit → type new title → save → Title persists

✅ **Store persistence works**
   - Test: Rename → refresh page → Title remains

✅ **TypeScript compiles**
   - Run: `npx tsc --noEmit --jsx react-jsx --skipLibCheck`

✅ **Edge cases handled**
   - Empty conversations get appropriate fallback
   - Very long conversations use first few exchanges only
   - API errors show user-friendly message

## Definition of Done

- [ ] Conversations section added to SettingsModal
- [ ] AI title generation working for individual chats
- [ ] Manual edit capability functional
- [ ] TypeScript passes
- [ ] Manual testing successful
- [ ] No console errors

---

_Created: 2026-01-28_
