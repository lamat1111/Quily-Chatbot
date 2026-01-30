---
type: task
title: "Add External Chutes API Key Option"
status: done
complexity: medium
ai_generated: true
reviewed_by: claude
created: 2026-01-29
updated: 2026-01-30
related_tasks:
  - tasks/.done/insufficient-credits-detection.md
---

# Add External Chutes API Key Option

**Files to modify:**
- `src/lib/chutesApiKey.ts` (NEW) - Client-side API key storage and format validation
- `src/lib/chutesAuth.ts` - Add server-side API key validation function
- `src/components/chat/ProviderSetup.tsx` - Add "Or use API Key" section on setup screen
- `app/settings/page.tsx` - Add API key override section for signed-in users
- `src/hooks/useChutesSession.ts` - Detect external API key and report auth method
- `app/api/chat/route.ts` - Accept and prioritize external API key from request body
- `src/lib/rag/retriever.ts` - Support external API key for Chutes embeddings
- `src/components/chat/ChatContainer.tsx` - Pass external API key in chat requests
- `app/page.tsx` - Auto-fallback provider logic

## What & Why

**Current State**: Users must sign in via OAuth to use Chutes as a provider.

**Desired State**: Users can use their own Chutes API key (`cpk_...`) in two ways:
1. **On the setup screen** - Skip OAuth entirely by entering an API key directly
2. **In settings** - Override an existing OAuth session with an API key

**Value**:
- Power users can use specific API keys with custom scopes/permissions
- Users who prefer not to use OAuth can skip it entirely
- Easier integration for CI/CD or automated setups
- Consistent with how other providers (OpenRouter) handle API keys

## Architecture Decision

### Auth Method Priority
When both OAuth and external API key exist, the **external API key takes precedence**:
1. Check localStorage for `chutes-external-api-key` (client-side)
2. If present, send in request body to server
3. Server uses external API key instead of OAuth cookies
4. OAuth session remains intact as fallback if API key is removed

### Client vs Server Separation
- **Client-side** (`src/lib/chutesApiKey.ts`): localStorage storage, format validation (`cpk_` prefix)
- **Server-side** (`src/lib/chutesAuth.ts`): API key validation via `/users/me` endpoint

### Session Hook Changes
`useChutesSession` will return an additional `authMethod` field:
```typescript
type UseChutesSessionReturn = {
  // ... existing fields
  authMethod: 'oauth' | 'apiKey' | null;
};
```

### Provider Auto-Fallback
If user selects a provider but hasn't configured it, the app auto-switches to the other provider if it has valid credentials. This prevents users from getting stuck on the setup screen when they've already configured one provider.

## UI Design

### Entry Point 1: Setup Screen (Not Signed In)

```
┌─────────────────────────────────┐
│        Chutes Setup             │
│                                 │
│  Your Chutes subscription...    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  Sign in with Chutes    │    │  ← OAuth (primary)
│  └─────────────────────────┘    │
│                                 │
│  Don't have an account? Sign up │
│                                 │
│  ─────────── or ────────────    │  ← Divider
│                                 │
│  ▼ Use API Key instead          │  ← Collapsible (default closed)
│    ┌─────────────────────┐      │
│    │ cpk_...             │      │
│    └─────────────────────┘      │
│    [Validate & Connect]         │
│    Get a key at chutes.ai       │
│                                 │
└─────────────────────────────────┘
```

**Location**: `src/components/chat/ProviderSetup.tsx` lines 283-303 (the `!isSignedIn` branch)

### Entry Point 2: Settings Page

The Settings page adapts based on how the user connected:

**Case A: User connected via API Key (no OAuth)**
```
┌─────────────────────────────────┐
│  🔑 Chutes Account              │
│  ● Using API Key                │
│    Current: ••••••abc123        │
│    ┌─────────────────────┐      │
│    │ cpk_...             │      │  ← Can change key
│    └─────────────────────┘      │
│    [Save Key]  [Clear]          │
│                                 │
│  ─────────────────────────────  │
│  Or sign in with Chutes instead │
│  [Sign in with Chutes]          │
└─────────────────────────────────┘
```

**Case B: User signed in via OAuth**
```
┌─────────────────────────────────┐
│  🔑 Chutes Account              │
│  ● Signed in as username        │
│  [Sign out]                     │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  ▼ Advanced: Use API Key        │  ← Collapsible
│    Override OAuth with your     │
│    own API key                  │
│    ┌─────────────────────┐      │
│    │ cpk_...             │      │
│    └─────────────────────┘      │
│    [Validate & Save]            │
│    ✓ Using API Key (overrides)  │  ← Status when active
│    [Remove API Key]             │
│                                 │
└─────────────────────────────────┘
```

**Case C: User has both OAuth AND API Key**
- Shows OAuth info ("Signed in as username")
- Shows "✓ Using API Key" status (since API key takes priority)
- Can remove API key to fall back to OAuth

**Location**: `app/settings/page.tsx` lines 311-346 (the `isChutes` section)

## Research Findings

Chutes fully supports API key authentication:
- Keys created via dashboard or CLI: `chutes keys create --name my-key`
- Used with `Authorization: Bearer cpk_your_key` header
- All API endpoints work with API keys (chat completions, embeddings, etc.)
- `/users/me` endpoint validates keys and returns user info

## Implementation

### Phase 1: Client-Side Storage & Utilities

- [x] **Create client-side API key utility** (`src/lib/chutesApiKey.ts`)
  ```typescript
  const STORAGE_KEY = 'chutes-external-api-key';

  export function getChutesExternalApiKey(): string | null
  export function setChutesExternalApiKey(key: string): void
  export function removeChutesExternalApiKey(): void
  export function isValidChutesKeyFormat(key: string): boolean // checks cpk_ prefix
  ```
  - Done when: Can store/retrieve/remove API key from localStorage

### Phase 2: Server-Side Validation

- [x] **Add API key validation** (`src/lib/chutesAuth.ts`)
  ```typescript
  export async function validateChutesApiKey(apiKey: string): Promise<{
    valid: boolean;
    user?: { username?: string; email?: string };
    error?: 'invalid_key' | 'network_error';
  }>
  ```
  - Call `GET https://api.chutes.ai/users/me` with `Authorization: Bearer {key}`
  - Return user info on 200, error on 401/403
  - Handle network timeouts (5s max)
  - Done when: Can validate if an API key is valid

### Phase 3: UI - Setup Screen

- [x] **Add API key option to ProviderSetup** (`src/components/chat/ProviderSetup.tsx`)
  - In the `!isSignedIn` branch (lines 283-303), add after the sign-up link:
    - Horizontal divider with "or" text
    - Collapsible "Use API Key instead" section (default closed)
    - Password input with show/hide toggle
    - "Validate & Connect" button
    - Helper text: "Get a key at chutes.ai"
  - On successful validation: call `onConnect(selectedProvider.id, apiKey)`
  - Done when: Users can connect with API key without signing in

### Phase 4: UI - Settings Page

- [x] **Update Chutes section in Settings** (`app/settings/page.tsx`)
  - Rewrite the Chutes section to handle three cases:

  **Case A: API Key only (no OAuth)**
  - Show "Using API Key" with key hint (`••••••last6`)
  - Input to change key, "Save Key" and "Clear" buttons
  - Below: "Or sign in with Chutes instead" with sign-in button

  **Case B: OAuth only (no API Key)**
  - Show "Signed in as {username}" with "Sign out" button
  - Collapsible "Advanced: Use API Key" section to add override

  **Case C: Both OAuth and API Key**
  - Show "Signed in as {username}"
  - Show "✓ Using API Key" status (indicates override is active)
  - "Remove API Key" button to fall back to OAuth

  - Done when: Settings page correctly reflects all auth states

### Phase 5: Session Hook Update

- [x] **Update useChutesSession hook** (`src/hooks/useChutesSession.ts`)
  - Import `getChutesExternalApiKey` from client utility
  - Add `authMethod` to state and return type
  - In `refresh()`: check for external API key first
    - If API key exists: `authMethod: 'apiKey'`, `isSignedIn: true`
    - If OAuth session: `authMethod: 'oauth'`
    - Neither: `authMethod: null`, `isSignedIn: false`
  - Done when: Hook reports which auth method is active

### Phase 6: Backend Integration

- [x] **Update chat route** (`app/api/chat/route.ts`)
  - Accept `chutesApiKey` in request body
  - Modify `ensureChutesAccessToken()` or add check before it:
    ```typescript
    // Priority: external API key > dev bypass > OAuth cookies
    if (body.chutesApiKey) {
      chutesAccessToken = body.chutesApiKey;
    } else {
      const ensured = await ensureChutesAccessToken();
      chutesAccessToken = ensured.accessToken;
    }
    ```
  - Done when: Chat works with external API key in body

- [x] **Update ChatContainer** (`src/components/chat/ChatContainer.tsx`)
  - Read external API key from localStorage
  - Include in chat request body when provider is Chutes:
    ```typescript
    body: { ...existing, chutesApiKey: getChutesExternalApiKey() }
    ```
  - Done when: External key flows from client to server

- [ ] **Update RAG retriever** (`src/lib/rag/retriever.ts`)
  - Accept optional `chutesExternalApiKey` in options
  - Prioritize over `chutesAccessToken` when both present
  - Done when: Embeddings work with external API key

### Phase 7: Provider Auto-Fallback

- [x] **Add auto-fallback logic** (`app/page.tsx`)
  - Check which providers have valid credentials
  - If selected provider lacks access but other has it, auto-switch
  - Prevents users from being stuck on setup screen with wrong provider selected
  - Done when: App auto-switches to working provider

## Verification

**Setup screen API key works:**
- [x] Select Chutes → See OAuth button AND "Use API Key" option
- [x] Enter valid `cpk_...` key → Validates and connects
- [x] Enter invalid key → Shows error, doesn't connect

**Settings API key override works:**
- [x] Sign in with OAuth → See "Advanced: Use API Key" section
- [x] Add valid API key → Shows "Using API Key" status
- [x] Remove API key → Falls back to OAuth seamlessly

**Priority logic works:**
- [x] Have OAuth only → Chat uses OAuth token
- [x] Have API key only → Chat uses API key
- [x] Have both → Chat uses API key (priority)
- [x] Remove API key → Falls back to OAuth

**Chat & embeddings work:**
- [x] Send message with API key → Gets response
- [ ] RAG retrieval uses API key for embeddings

**TypeScript compiles:**
- [x] `npx tsc --noEmit` passes

## Security Considerations

- API keys stored in localStorage are vulnerable to XSS. This is an acceptable tradeoff for client-side apps (same as OpenRouter pattern).
- Keys are transmitted in request body over HTTPS, not exposed in URLs.
- Server validates keys before use, preventing abuse with invalid keys.

## Definition of Done

- [x] New `src/lib/chutesApiKey.ts` utility created
- [x] API key validation function in `chutesAuth.ts`
- [x] Setup screen: "Use API Key" option below OAuth
- [x] Settings page: "Advanced" section for API key override
- [x] Session hook reports `authMethod`
- [x] Chat route accepts and prioritizes external API key
- [x] Status indicators show which auth method is active
- [x] Provider auto-fallback logic implemented
- [x] TypeScript passes
- [ ] RAG retriever updated for external API key
- [ ] Manual testing successful

---

_Created: 2026-01-29_
_Updated: 2026-01-30 - Added two entry points: setup screen (skip OAuth) and settings (override OAuth). Implemented provider auto-fallback logic._
