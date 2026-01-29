---
type: task
title: "Add External Chutes API Key Option"
status: open
complexity: medium
ai_generated: true
reviewed_by: null
created: 2026-01-29
updated: 2026-01-29
related_tasks:
  - tasks/.done/insufficient-credits-detection.md
---

# Add External Chutes API Key Option

> **⚠️ AI-Generated**: May contain errors. Verify before use.

**Files**:
- `src/components/chat/ProviderSetup.tsx` - Add API key input field to advanced options
- `src/lib/chutesAuth.ts` - Add API key validation and storage logic
- `src/hooks/useChutesSession.ts` - Update session hook to check for external API key
- `app/api/chat/route.ts` - Use external API key when available
- `src/lib/rag/retriever.ts` - Use external API key for embeddings

## What & Why

**Current State**: Users must sign in via OAuth to use Chutes as a provider. This requires authentication through the Chutes IDP.

**Desired State**: Users can optionally provide their own Chutes API key (`cpk_...`) in advanced settings, which will be used instead of OAuth authentication when present.

**Value**:
- Power users can use specific API keys with custom scopes/permissions
- Users who prefer not to use OAuth can still access Chutes
- Easier integration for CI/CD or automated setups
- Consistent with how other providers (OpenRouter) handle API keys

## Context

- **Existing pattern**: OpenRouter already supports external API keys - follow that pattern
- **Chutes API keys**: Format is `cpk_...`, used with `Authorization: Bearer <key>` header
- **Priority logic**: External API key takes precedence over OAuth token when both exist
- **Validation endpoint**: `GET https://api.chutes.ai/users/me` can verify key validity

## Research Findings

Chutes fully supports API key authentication:
- Keys created via dashboard or CLI: `chutes keys create --name my-key`
- Used with `Authorization: Bearer cpk_your_key` header
- All API endpoints work with API keys (chat completions, embeddings, etc.)
- Other apps (Roo Code, Mastra) use API key-only authentication

## Implementation

### Phase 1: Storage & UI
- [ ] **Add API key storage** (`src/lib/chutesAuth.ts`)
  - Add localStorage key constant for Chutes API key
  - Create getter/setter functions for external API key
  - Done when: Can store and retrieve API key from localStorage

- [ ] **Add UI input field** (`src/components/chat/ProviderSetup.tsx`)
  - Add collapsible "Advanced Options" section for Chutes provider
  - Include password-type input for API key with show/hide toggle
  - Add helper text explaining when to use this option
  - Done when: Users can input and save their API key

### Phase 2: Validation
- [ ] **Implement API key validation** (`src/lib/chutesAuth.ts`)
  - Create function to validate key via `/users/me` endpoint
  - Return user info on success, error on failure
  - Done when: Can verify if an API key is valid before saving

- [ ] **Add validation feedback in UI** (`src/components/chat/ProviderSetup.tsx`)
  - Show loading state during validation
  - Display success/error message after validation
  - Done when: Users get clear feedback on key validity

### Phase 3: Integration
- [ ] **Update session hook** (`src/hooks/useChutesSession.ts`)
  - Check for external API key first
  - Return appropriate session state when API key is present
  - Done when: `useChutesSession` recognizes external API key as valid auth

- [ ] **Update chat route** (`app/api/chat/route.ts`)
  - Accept API key from request headers or body
  - Prioritize external API key over OAuth token
  - Done when: Chat works with external API key

- [ ] **Update RAG retriever** (`src/lib/rag/retriever.ts`)
  - Pass external API key for Chutes embeddings
  - Done when: Embeddings work with external API key

### Phase 4: UX Polish
- [ ] **Update provider status display**
  - Show "API Key" badge when using external key vs "Signed In" for OAuth
  - Done when: Users can distinguish auth method in use

- [ ] **Add key removal option**
  - Allow users to clear saved API key
  - Done when: Users can remove their API key and fall back to OAuth

## Verification

✅ **API key input works**
   - Test: Enter valid `cpk_...` key → Should validate and save
   - Test: Enter invalid key → Should show error message

✅ **Priority logic works**
   - Test: Have both OAuth and API key → Should use API key
   - Test: Remove API key → Should fall back to OAuth

✅ **Chat works with API key**
   - Test: Send message with only API key auth → Should get response

✅ **Embeddings work with API key**
   - Test: Create embedding with API key → Should succeed

✅ **TypeScript compiles**
   - Run: `npx tsc --noEmit`

## Definition of Done

- [ ] API key input field in advanced options
- [ ] Validation on key entry
- [ ] Chat completions work with external API key
- [ ] Embeddings work with external API key
- [ ] Clear indication of which auth method is active
- [ ] Option to remove saved API key
- [ ] TypeScript passes
- [ ] Manual testing successful

---

_Created: 2026-01-29_
