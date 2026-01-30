---
type: task
title: "Implement Data Export/Import Feature"
status: open
complexity: medium-high
ai_generated: true
reviewed_by: feature-analyzer
created: 2026-01-30
updated: 2026-01-30
related_docs: []
related_tasks: []
---

# Implement Data Export/Import Feature

> **⚠️ AI-Generated**: May contain errors. Verify before use.
> **Reviewed by**: feature-analyzer agent

**Files**:
- `src/lib/dataBackup.ts` (new - consolidated encryption + export/import)
- `src/components/settings/DataManagement.tsx` (new - UI component)
- `src/stores/conversationStore.ts` - Zustand store for conversations
- `app/settings/page.tsx` - Settings page (add Data Management section)

## What & Why

**Current State**: User data (conversations, settings, API keys) is stored in localStorage. If a user clears browser data, switches devices, or uses a different browser, all data is lost.

**Desired State**: Users can export their data to an encrypted file and import it on any device/browser.

**Value**: Users don't lose their conversation history. No server storage needed = zero cost. Simple implementation, full user control over their data.

**Why NOT accounts**: After analysis, accounts would require server-side storage for user data sync. Even small amounts (settings, API keys) would hit Supabase free tier limits at scale. For a docs Q&A chatbot with low-sensitivity data, the complexity isn't justified. Export/import achieves the same goal with zero infrastructure cost.

---

## How It Works

1. **Export**: User clicks "Export Data" → enters a password → downloads encrypted `.quily` file
2. **Import**: User clicks "Import Data" → selects file → enters password → data restored (page reloads)

**What's exported**:
- All conversations (messages, timestamps, titles)
- Settings (selected provider, model preferences, theme)
- API keys (OpenRouter key, Chutes external key)
- Auth preference (OAuth vs API key for Chutes)

**What's NOT exported** (by design):
- Chutes OAuth session tokens (short-lived, security risk)
- Browser-specific data (cookies, session storage)

**Encryption Spec** (AES-256-GCM with PBKDF2):
- Random salt (16 bytes) for key derivation
- Random IV (12 bytes) for encryption
- 600,000 iterations (OWASP 2023 recommendation)
- SHA-256 hash function
- Format: `Base64(salt || iv || ciphertext)`
- Password never stored anywhere

---

## Data Structure

```typescript
interface ExportedData {
  version: 1
  exportedAt: string // ISO date
  conversations: Conversation[]
  settings: {
    selectedProvider: string | null
    openRouterModel: string | null
    chutesModel: string | null
    theme: string | null
  }
  apiKeys: {
    openRouter: string | null
    chutesExternal: string | null
  }
  authPreference: string | null // 'oauth' | 'apiKey' - critical for Chutes
}

// LocalStorage keys registry
const EXPORTABLE_KEYS = {
  'selected-provider': 'settings.selectedProvider',
  'openrouter-model': 'settings.openRouterModel',
  'chutes-model': 'settings.chutesModel',
  'openrouter-api-key': 'apiKeys.openRouter',
  'chutes-external-api-key': 'apiKeys.chutesExternal',
  'chutes-auth-preference': 'authPreference',
  'chat-conversations': 'conversations', // Zustand store
  // Theme handled by next-themes
} as const;

// NOT exported (security):
// - 'chutes-session' (OAuth tokens)
```

---

## Implementation

### Phase 1: Core Logic (`src/lib/dataBackup.ts`)

- [ ] **Create encryption utilities**
  - `deriveKey(password, salt)` - PBKDF2 with 600k iterations, SHA-256
  - `encrypt(data, password)` - Generate salt + IV, encrypt with AES-256-GCM
  - `decrypt(ciphertext, password)` - Extract salt + IV, decrypt
  - Use Web Crypto API (no dependencies)
  - Add browser compatibility check: `if (!window.crypto?.subtle) throw Error`
  - Done when: Can encrypt/decrypt strings with password

- [ ] **Create Zod validation schema**
  - Validate all fields of ExportedData
  - Validate conversation structure matches store
  - Reject invalid/corrupted data before import
  - Done when: Invalid JSON is rejected with clear error

- [ ] **Create export function**
  - Gather data from localStorage + Zustand store
  - Warn in dev mode if unknown localStorage keys found
  - Compress with CompressionStream API (optional, fallback if unsupported)
  - Encrypt with user password
  - Trigger download as `.quily` file
  - Done when: Clicking export downloads encrypted file

- [ ] **Create import function with atomic rollback**
  - Validate file size (max 10MB)
  - Decrypt with user password (handle wrong password gracefully)
  - Validate structure with Zod schema
  - **Create backup of current state before modifying**
  - Apply changes (merge or replace)
  - Handle MAX_CONVERSATIONS limit (50) - keep most recent
  - Handle localStorage quota exceeded errors
  - **On any failure: restore backup**
  - Force page reload for Zustand rehydration
  - Done when: Import is atomic - either fully succeeds or fully rolls back

### Phase 2: UI (`src/components/settings/DataManagement.tsx`)

- [ ] **Create Export UI**
  - "Export Data" button
  - Show conversation count and estimated file size
  - Password input with confirmation
  - Password strength indicator (min 8 chars, recommend 12+)
  - Loading state during encryption (can take a few seconds)
  - Success message with download
  - Done when: Full export flow works

- [ ] **Create Import UI**
  - "Import Data" button
  - File picker (accept `.quily` files only)
  - Password input
  - Merge vs Replace radio buttons (merge default)
  - **Confirmation dialog for Replace mode**: "This will delete X existing conversations"
  - Loading state during decryption
  - Error messages: wrong password, corrupted file, quota exceeded
  - Success message, page reloads automatically
  - Done when: Full import flow works

- [ ] **Add to Settings page**
  - Add "Data Management" section after existing sections
  - Include security warnings (see below)
  - Show last export date if tracked
  - Done when: Accessible from settings

### Phase 3: Polish

- [ ] **Add helpful UX touches**
  - Track last export timestamp in localStorage (not exported)
  - Show "Last export: 3 days ago" in settings
  - Clear error messages for all failure modes
  - Done when: Edge cases handled gracefully

---

## Security Considerations

### What is NOT Exported (By Design)
- **Chutes OAuth sessions** - OAuth tokens are short-lived and session-specific. After importing, users must sign in again with Chutes if using OAuth.
- **Browser-specific data** - Cookies, session storage, IndexedDB.

### Password Security
- Use a strong, unique password for your backup file
- Store your password in a password manager
- **If you lose your password, the backup cannot be recovered**
- We cannot help you recover a lost password

### File Security
- Backup files contain your API keys in encrypted form
- Do not share backup files with untrusted parties
- Store backup files securely (encrypted cloud storage, encrypted USB, etc.)
- Delete old backup files you no longer need

---

## Verification

✅ **Export works**
   - Test: Create conversations → Export with password → Check file downloads
   - Expected: `.quily` file downloads, contents are encrypted (not readable)

✅ **Import works**
   - Test: Clear localStorage → Import file with correct password
   - Expected: All conversations and settings restored, page reloads

✅ **Wrong password rejected**
   - Test: Try to import with wrong password
   - Expected: Clear error message, no data corruption, no partial import

✅ **Corrupted file rejected**
   - Test: Try to import a modified/corrupted file
   - Expected: Clear error message, no data corruption

✅ **Merge works**
   - Test: Have existing conversations → Import file with "merge" option
   - Expected: Both old and imported conversations present (up to 50 limit)

✅ **Replace works with confirmation**
   - Test: Have existing conversations → Import file with "replace" option
   - Expected: Confirmation dialog shown, only imported conversations after confirm

✅ **Atomic rollback works**
   - Test: Simulate failure mid-import (e.g., quota exceeded)
   - Expected: Original data restored, clear error message

✅ **OAuth session handling**
   - Test: Export while logged in via Chutes OAuth → Import on new device
   - Expected: Data restored, but user must sign in again with Chutes

✅ **TypeScript compiles**
   - Run: `npx tsc --noEmit`

✅ **Browser compatibility**
   - Test: Run in Chrome, Firefox, Safari, Edge
   - Expected: Works in all modern browsers, clear error in old browsers

---

## Definition of Done

- [ ] Single consolidated file `src/lib/dataBackup.ts`
- [ ] Users can export all data to encrypted file
- [ ] Users can import data from encrypted file
- [ ] Proper encryption: random salt, random IV, 600k iterations
- [ ] Zod validation for imported data
- [ ] Atomic import with rollback on failure
- [ ] Merge and replace options (with confirmation for replace)
- [ ] Clear error handling for wrong password / corrupted file / quota exceeded
- [ ] OAuth tokens NOT exported (with UI message)
- [ ] Page reload after import for Zustand rehydration
- [ ] Accessible from settings page
- [ ] TypeScript passes
- [ ] No external dependencies (uses Web Crypto API)

---

## Decisions Made

1. **No accounts** - Zero cost constraint means no server storage. Export/import achieves data portability without infrastructure.

2. **Single file** - Consolidate encryption, export, and import into `src/lib/dataBackup.ts`. No premature abstraction.

3. **Password-based encryption** - User chooses password, we derive encryption key with PBKDF2 (600k iterations, random salt).

4. **AES-256-GCM** - Industry standard, built into browsers via Web Crypto API, no dependencies.

5. **Atomic import** - Backup current state before import, rollback on any failure. Data integrity guaranteed.

6. **No OAuth export** - Chutes OAuth tokens are not exported for security. Users re-authenticate after import.

7. **`.quily` file extension** - Custom extension makes it clear what the file is for.

8. **Merge + Replace options** - Merge is default (safer). Replace requires explicit confirmation.

9. **Page reload after import** - Required for Zustand store rehydration. Simpler than manual rehydration.

10. **MAX_CONVERSATIONS limit** - Merge respects 50 conversation limit, keeps most recent.

---

## Features Intentionally Skipped

- **Import preview** - Complex to implement, low value
- **Auto-export** - Would need to store password (defeats encryption purpose)
- **Partial exports** - Adds complexity with minimal value

---

## Research Preserved

The original task researched authentication options (SIWE, Privy, GitHub OAuth, etc.) for a full account system. This research is preserved here for future reference if the project scales and accounts become viable:

- **SIWE (Sign-In with Ethereum)** - [docs.login.xyz](https://docs.login.xyz/) - Wallet-based auth
- **Privy** - [privy.io](https://www.privy.io/) - Web3 auth with embedded wallets
- **Dynamic.xyz** - [dynamic.xyz](https://www.dynamic.xyz/) - Multi-wallet auth
- **Thirdweb** - [thirdweb.com](https://thirdweb.com/in-app-wallets) - Wallet toolkit
- **SuperTokens** - [supertokens.io](https://supertokens.io/) - Self-hosted auth

If accounts are needed later, the existing Chutes OAuth pattern in `src/lib/chutesAuth.ts` provides a good template for adding GitHub OAuth or wallet auth.

---

_Created: 2026-01-30_
_Updated: 2026-01-30_
