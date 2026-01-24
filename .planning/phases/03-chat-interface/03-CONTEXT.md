# Phase 3: Chat Interface - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

User-facing chat interface with API key management and model selection. Users enter their OpenRouter API key, select an LLM model, chat with the assistant, and view streaming responses with source citations. Chat history persistence and conversation management included via sidebar.

</domain>

<decisions>
## Implementation Decisions

### API Key Entry
- Inline header section (always-visible settings area, collapsible after setup)
- Stored key always masked (show ••••••••abc123, no reveal option)
- Validation failures show inline error message below field
- Key persists in localStorage across sessions

### Chat Layout
- Sidebar + chat layout (navigation/settings on left, chat on right)
- Sidebar contains: API key config at top, conversation history below
- Message bubbles: both left-aligned, different background colors distinguish user vs assistant
- Message input: fixed at bottom, always visible, messages scroll above

### Source Citations
- Expandable footer ("3 sources" link at bottom of message, click to expand)
- Each source shows: title as clickable link (opens in new tab)
- Sources appear after response completes (not during streaming)

### Claude's Discretion
- Model selector placement (near API key or near input)
- Sidebar collapse behavior on mobile
- Exact color palette for message bubbles
- Typing indicator design during streaming
- Stop button styling and placement
- Empty state for new conversations
- Responsive breakpoints

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants familiar chat patterns (ChatGPT-style centered conversation, sidebar for history).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-chat-interface*
*Context gathered: 2026-01-24*
