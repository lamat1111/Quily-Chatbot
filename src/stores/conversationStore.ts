import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Message in a conversation.
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Conversation with message history.
 */
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Maximum number of conversations to keep in storage.
 * Oldest conversations are deleted when this limit is exceeded.
 */
const MAX_CONVERSATIONS = 50;

interface ConversationStore {
  conversations: Conversation[];
  activeId: string | null;
  _hasHydrated: boolean;

  // Actions
  addConversation: (title?: string) => string;
  setActive: (id: string | null) => void;
  updateMessages: (id: string, messages: Message[]) => void;
  updateTitle: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  getActiveConversation: () => Conversation | null;
}

/**
 * Zustand store for managing chat conversations.
 *
 * Persists to localStorage with automatic hydration.
 * Use `_hasHydrated` to prevent hydration mismatch in SSR.
 *
 * Usage:
 * ```tsx
 * const { conversations, activeId, addConversation } = useConversationStore();
 *
 * // Wait for hydration before rendering persisted state
 * const hasHydrated = useConversationStore((s) => s._hasHydrated);
 * if (!hasHydrated) return <Loading />;
 * ```
 */
export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,
      _hasHydrated: false,

      addConversation: (title?: string) => {
        const id = crypto.randomUUID();
        const now = Date.now();

        const newConversation: Conversation = {
          id,
          title: title || 'New conversation',
          messages: [],
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          // Add new conversation at the beginning
          let conversations = [newConversation, ...state.conversations];

          // Enforce max limit - remove oldest if exceeded
          if (conversations.length > MAX_CONVERSATIONS) {
            conversations = conversations.slice(0, MAX_CONVERSATIONS);
          }

          return {
            conversations,
            activeId: id,
          };
        });

        return id;
      },

      setActive: (id: string | null) => {
        set({ activeId: id });
      },

      updateMessages: (id: string, messages: Message[]) => {
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id !== id) return conv;

            // Auto-generate title from first user message if still default
            let title = conv.title;
            if (title === 'New conversation' && messages.length > 0) {
              const firstUserMsg = messages.find((m) => m.role === 'user');
              if (firstUserMsg) {
                title = firstUserMsg.content.slice(0, 50);
                if (firstUserMsg.content.length > 50) {
                  title += '...';
                }
              }
            }

            return {
              ...conv,
              messages,
              title,
              updatedAt: Date.now(),
            };
          });

          return { conversations };
        });
      },

      updateTitle: (id: string, title: string) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title, updatedAt: Date.now() } : conv
          ),
        }));
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const conversations = state.conversations.filter((c) => c.id !== id);
          const activeId = state.activeId === id ? null : state.activeId;
          return { conversations, activeId };
        });
      },

      getActiveConversation: () => {
        const state = get();
        if (!state.activeId) return null;
        return state.conversations.find((c) => c.id === state.activeId) || null;
      },
    }),
    {
      name: 'chat-conversations',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeId: state.activeId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);
