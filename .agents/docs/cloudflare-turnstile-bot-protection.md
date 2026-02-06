---
type: doc
title: "Cloudflare Turnstile Bot Protection"
status: done
ai_generated: true
reviewed_by: null
created: 2026-02-06
updated: 2026-02-06
related_docs:
  - "bugs/.solved/turnstile-token-reuse-verification-failure.md"
related_tasks: []
---

# Cloudflare Turnstile Bot Protection

> **⚠️ AI-Generated**: May contain errors. Verify before use.

## Overview

The chatbot uses Cloudflare Turnstile to protect its chat API from bots and automated abuse while maintaining a seamless experience for legitimate users. The implementation combines a client-side widget with server-side session persistence, ensuring users verify once per browser session and are never re-challenged when switching conversations.

Normal users never see the Turnstile widget — verification happens invisibly in the background. Only users flagged as suspicious by Cloudflare (e.g., VPN users, unusual traffic patterns) see a checkbox challenge, and only once per session.

## Architecture

The bot protection spans three layers: client widget, state management, and server verification.

```
┌─────────────────────────────────────────────────────┐
│  page.tsx (never remounts)                          │
│  ┌──────────────┐  turnstileToken (state)           │
│  │  <Turnstile>  │──── onVerify ──→ setToken        │
│  └──────────────┘                                   │
│           │                                          │
│           │ turnstileToken prop                       │
│           ▼                                          │
│  ┌──────────────────────────────────────┐           │
│  │  ChatContainer (key={activeId})       │           │
│  │  - reads token via ref                │           │
│  │  - sends token in first API request   │           │
│  │  - disables input while unverified    │           │
│  └──────────────┬───────────────────────┘           │
└─────────────────┼───────────────────────────────────┘
                  │ POST /api/chat (with token)
                  ▼
┌─────────────────────────────────────────────────────┐
│  route.ts (server)                                   │
│  1. Check for turnstile_verified cookie              │
│     → If present: skip verification                  │
│  2. If no cookie + token provided:                   │
│     → Verify token with Cloudflare siteverify API    │
│     → Set turnstile_verified session cookie          │
│  3. If no cookie + no token (production):            │
│     → Return 403                                     │
└─────────────────────────────────────────────────────┘
```

### Client Widget (`src/components/Turnstile.tsx`)

The Turnstile React component loads the Cloudflare challenge script and renders the widget.

**Key configuration:**
- `appearance: 'interaction-only'` — widget is invisible unless Cloudflare requires user interaction
- `refresh-expired: 'auto'` — automatically renews expired tokens without user action
- `size: 'normal'` — required value (note: `size: 'invisible'` is deprecated)
- `theme: 'auto'` — matches user's system preference

**Fail-open behavior:**
- If `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is not set: calls `onVerify('')` immediately (dev environments)
- If the Turnstile script fails to load: calls `onVerify('')` (graceful degradation)
- The server mirrors this: if `TURNSTILE_SECRET_KEY` is not set, verification is skipped

**Lifecycle:**
1. Component mounts → checks for site key
2. Loads Cloudflare script (`challenges.cloudflare.com/turnstile/v0/api.js`)
3. Renders widget in container div
4. On successful verification: calls `onVerify(token)`, hides widget via `isVisible` state
5. On token expiry: calls `onExpire()`, shows widget again
6. On unmount: removes widget via `window.turnstile.remove(widgetId)`

**Positioning:** Uses `absolute bottom-24 left-1/2 -translate-x-1/2 z-50` to appear centered above the chat input when visible.

### State Management (`app/page.tsx`)

Turnstile verification state lives in the page-level component, **not** in ChatContainer. This is critical because ChatContainer is rendered with `key={activeId || 'new-chat'}`, causing a full React remount on every conversation switch.

```tsx
// page.tsx — state persists across chat switches
const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

// Passed to ChatContainer as a prop
<ChatContainer turnstileToken={turnstileToken} ... />
```

Inside ChatContainer, the token is stored in a ref so the memoized transport closure always reads the current value:

```tsx
// ChatContainer.tsx — reads prop, uses ref for transport
const turnstileTokenRef = useRef<string | null>(turnstileToken);
turnstileTokenRef.current = turnstileToken;

// In transport's prepareSendMessagesRequest:
turnstileToken: turnstileTokenRef.current || undefined,
```

The input field is disabled with "Verifying you are human..." while `turnstileToken === null`.

### Server Verification (`app/api/chat/route.ts` + `src/lib/turnstile.ts`)

The server uses a two-tier verification strategy:

1. **Session cookie check**: If `turnstile_verified=true` cookie exists, skip verification entirely
2. **Token verification**: If no cookie and a token is provided, verify it with Cloudflare's siteverify API, then set the session cookie

```typescript
// route.ts — session cookie flow
const cookies = request.headers.get('cookie') || '';
const hasVerifiedSession = cookies.includes('turnstile_verified=true');

if (isProduction && !hasVerifiedSession && !turnstileToken) {
  return new Response(JSON.stringify({ error: 'Bot verification required' }), { status: 403 });
}

if (turnstileToken && !hasVerifiedSession) {
  const result = await verifyTurnstileToken(turnstileToken, clientIp);
  if (result.success) shouldSetVerifiedCookie = true;
  else return new Response(JSON.stringify({ error: 'Bot verification failed' }), { status: 403 });
}
```

**Session cookie properties:**
- `HttpOnly` — not accessible via JavaScript (prevents XSS token theft)
- `SameSite=Lax` — sent with same-site requests and top-level navigations
- `Secure` — only sent over HTTPS (in production)
- No `Max-Age` — session cookie, deleted when browser closes

**Token verification** (`src/lib/turnstile.ts`):
- POSTs to `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Sends `secret` (server key) + `response` (client token) + optional `remoteip`
- Returns `{ success: boolean, error?: string }`
- If `TURNSTILE_SECRET_KEY` is not set, returns `{ success: true }` (dev bypass)

## Configuration

### Environment Variables

| Variable | Side | Required | Description |
|----------|------|----------|-------------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | No | Cloudflare Turnstile site key. Without it, verification is skipped. |
| `TURNSTILE_SECRET_KEY` | Server | No | Cloudflare Turnstile secret key. Without it, server allows all requests. |

Both keys are obtained from the [Cloudflare Turnstile dashboard](https://dash.cloudflare.com/?to=/:account/turnstile). For development, the system works without either key — both client and server fail open.

### Cloudflare Test Keys

For local testing with the widget visible, use Cloudflare's test keys:
- **Site key** (always passes): `1x00000000000000000000AA`
- **Site key** (always blocks): `2x00000000000000000000AB`
- **Site key** (forces interaction): `3x00000000000000000000FF`
- **Secret key** (always passes): `1x0000000000000000000000000000000AA`
- **Secret key** (always fails): `2x0000000000000000000000000000000AA`

## Technical Decisions

### Session cookie over token caching
Turnstile tokens are single-use and expire after 5 minutes. Storing them in `sessionStorage` or `localStorage` for reuse causes server-side verification failures. An HTTP-only session cookie is more secure (not JS-accessible) and works naturally with the browser's cookie jar across all requests.

### State in page.tsx over ChatContainer
ChatContainer remounts on every conversation switch due to `key={activeId}`. Any React state inside it is destroyed. The page component never remounts, making it the correct location for session-duration state like Turnstile verification.

### Fail-open design
Missing environment variables cause the system to allow requests through. This prioritizes developer experience (no setup required for local dev) and availability (if Turnstile script fails to load, users aren't locked out). In production, both keys should always be set.

### `appearance: 'interaction-only'` over `size: 'invisible'`
The `size: 'invisible'` option is deprecated by Cloudflare and causes `Invalid value for parameter 'size'` errors. The `appearance: 'interaction-only'` option achieves the same UX: invisible for normal users, visible checkbox only when Cloudflare needs interaction.

## Critical Pitfalls

These issues were discovered during implementation and are not prominently documented by Cloudflare:

1. **Tokens are single-use** — Once verified server-side, a token cannot be used again. The server returns error codes if you try. This is the most common source of "Bot verification failed" errors.

2. **`size: 'invisible'` is deprecated** — Use `appearance: 'interaction-only'` with `size: 'normal'` instead. The deprecated option causes runtime errors.

3. **Never cache tokens client-side** — `sessionStorage`, `localStorage`, React state that persists — none of these work because the token is consumed on first server verification.

4. **Don't put verification state in remounting components** — If a component uses React's `key` prop for clean remounts, any Turnstile state inside it will be lost. Lift state to a parent that doesn't remount.

5. **Widget ID conflicts during HMR** — In development with hot module replacement, the Turnstile widget can conflict with itself (Cloudflare Error 300030). Always clean up in the `useEffect` return: call `window.turnstile.remove(widgetId)`.

6. **Script double-loading** — Check for existing script tags before adding a new one. The component handles this by checking `document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')`.

## Known Limitations

- **Session cookie is not persistent** — Users must re-verify after closing the browser. This is intentional for security but means returning users get verified again.
- **No server-side cookie reading from client** — The `HttpOnly` cookie cannot be read by JavaScript, so the client can't check if a session exists. The client always attempts to get a fresh token; the server simply ignores it if a session cookie already exists.
- **Fail-open in development** — Without environment variables, all requests are allowed. This must not be deployed to production without the keys set.
- **Single-domain only** — The Turnstile site key is bound to a specific domain in the Cloudflare dashboard. Different environments (staging, production) need separate keys.

## Files

| File | Role |
|------|------|
| `app/page.tsx` | Owns Turnstile state, renders widget, passes token as prop |
| `src/components/Turnstile.tsx` | Client-side Cloudflare Turnstile widget component |
| `src/components/chat/ChatContainer.tsx` | Consumes `turnstileToken` prop, sends in API requests, disables input while unverified |
| `app/api/chat/route.ts` | Server-side session cookie check/set, token verification orchestration |
| `src/lib/turnstile.ts` | Server-side token verification with Cloudflare siteverify API |

## Related Documentation

- [Turnstile Token Reuse Bug Report (Solved)](../bugs/.solved/turnstile-token-reuse-verification-failure.md)
- [Cloudflare Turnstile Docs — Server-Side Validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Turnstile Docs — Widget Configurations](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/)

---

_Updated: 2026-02-06_
