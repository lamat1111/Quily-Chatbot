---
type: task
title: "Implement Insufficient Credits Detection for Chutes and OpenRouter"
status: done
complexity: medium
ai_generated: true
reviewed_by: null
created: 2026-01-29
updated: 2026-01-29
related_docs: []
related_tasks: []
---

# Implement Insufficient Credits Detection for Chutes and OpenRouter

> **⚠️ AI-Generated**: May contain errors. Verify before use.

**Files**:
- `src/lib/chutesAuth.ts:249-316` - New `checkChutesBalance()` function
- `app/api/chat/route.ts:15-16` - Import balance check functions
- `app/api/chat/route.ts:335-407` - Proactive balance checking in parallel with RAG
- `app/api/chat/route.ts:439-458` - Streaming error handling for credits
- `app/api/chat/route.ts:500-531` - Global error handler for credits errors

## What & Why

**Current state**: When a Chutes user with zero credits sent a message, the bot simply didn't reply - no error was shown to the user. The error was only logged to the server console. OpenRouter had basic 402 detection but no proactive checking.

**Desired state**: Users see clear, actionable error messages when they run out of credits, with links to add more. Balance is checked proactively before making expensive LLM calls.

**Value**:
- Better UX - users understand why chat isn't working
- Reduced wasted API calls - detect zero balance before streaming starts
- Provider-specific messaging - direct users to correct billing page

## Implementation

### 1. Chutes Balance Check Function (`src/lib/chutesAuth.ts`)
- Added `checkChutesBalance()` using `/users/me/quotas` endpoint
- 3-second timeout to avoid slowing down chat
- Fails open (assumes credits exist) on network errors
- Detects 402 Payment Required as explicit "no credits"

### 2. Proactive Balance Checking (`app/api/chat/route.ts`)
- Balance check runs **in parallel** with RAG retrieval (zero added latency)
- Works for both Chutes and OpenRouter providers
- Returns 402 JSON response with provider-specific message if no credits
- OpenRouter reuses existing `validateApiKeyWithCredits()` function

### 3. Streaming Error Handler (Chutes-specific)
- Catches credits errors during streaming
- Shows markdown message with link: "Please add more credits at [chutes.ai](https://chutes.ai)"

### 4. Global Error Handler
- Detects credits-related errors: `402`, `insufficient`, `credit`, `balance`, `payment required`
- Provider detection from error message content
- Returns 402 status with actionable JSON error

## Error Detection Points

| Scenario | Detection Point | User Experience |
|----------|-----------------|-----------------|
| Zero credits (pre-flight) | Before LLM call | Immediate 402 JSON with helpful message |
| Zero credits (API error) | Catch block | 402 JSON, displayed in error bubble |
| Zero credits (streaming) | During streaming | Markdown message appended to chat |

## Verification

✅ **TypeScript compiles** - `npx tsc --noEmit --skipLibCheck` passes

✅ **Build succeeds** - `yarn build` completes without errors

✅ **Chutes zero credits** - Shows "Your Chutes account has run out of credits" message

✅ **OpenRouter zero credits** - Shows "Your OpenRouter account has run out of credits" message

✅ **No latency impact** - Balance check runs in parallel with RAG retrieval

---

_Completed: 2026-01-29_
