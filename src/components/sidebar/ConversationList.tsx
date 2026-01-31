'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useConversationStore, Conversation } from '@/src/stores/conversationStore';
import { Icon } from '@/src/components/ui/Icon';

/**
 * Truncate text to max length with ellipsis.
 */
function truncateTitle(title: string, maxLength: number = 30): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
}

interface ConversationListProps {
  onNavigate?: () => void;
  onScroll?: (scrollTop: number) => void;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onToggleStarred: () => void;
  onRename: (newTitle: string) => void;
  onRequestDelete: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onToggleStarred,
  onRename,
  onRequestDelete,
}: ConversationItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(trimmed);
    }
    setIsRenaming(false);
    setRenameValue(conversation.title);
  };

  const handleRenameCancel = () => {
    setIsRenaming(false);
    setRenameValue(conversation.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  return (
    <div
      className={`
        group relative
        px-3 py-2
        rounded-lg
        cursor-pointer
        transition-colors
        ${
          isActive
            ? 'bg-surface/15 dark:bg-surface/20'
            : 'hover:bg-surface/8 dark:hover:bg-surface/10'
        }
      `}
      onClick={() => !isRenaming && onSelect()}
    >
      <div className="pr-8">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="
              w-full
              text-sm font-medium
              bg-transparent
              border-b border-text-primary/30
              text-text-primary
              outline-none
              focus:border-text-primary
            "
          />
        ) : (
          <p
            className={`text-sm font-medium truncate ${
              isActive ? 'text-text-primary' : 'text-text-muted'
            }`}
          >
            {truncateTitle(conversation.title)}
          </p>
        )}
      </div>

      {/* Dropdown menu - always visible */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="
                p-1.5 rounded
                text-gray-400 dark:text-gray-500
                hover:text-text-primary
                hover:bg-surface/15 dark:hover:bg-surface/20
                transition-all
              "
              aria-label="Chat options"
            >
              <Icon name="more-horizontal" size={16} />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="
                min-w-40 p-1
                bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
                rounded-lg shadow-xl
                animate-in fade-in-0 zoom-in-95
                z-50
              "
              sideOffset={5}
              align="end"
            >
              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStarred();
                }}
                className="
                  flex items-center gap-2 px-2 py-1.5
                  text-sm text-text-primary
                  rounded cursor-pointer
                  outline-none
                  hover:bg-surface/10 dark:hover:bg-surface/15
                  focus:bg-surface/10 dark:focus:bg-surface/15
                "
              >
                <Icon
                  name={conversation.starred ? 'lucide:star-off' : 'star'}
                  size={16}
                />
                {conversation.starred ? 'Unstar' : 'Star'}
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
                className="
                  flex items-center gap-2 px-2 py-1.5
                  text-sm text-text-primary
                  rounded cursor-pointer
                  outline-none
                  hover:bg-surface/10 dark:hover:bg-surface/15
                  focus:bg-surface/10 dark:focus:bg-surface/15
                "
              >
                <Icon name="edit-2" size={16} />
                Rename
              </DropdownMenu.Item>

              <DropdownMenu.Item
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete();
                }}
                className="
                  flex items-center gap-2 px-2 py-1.5
                  text-sm text-red-500 dark:text-red-400
                  rounded cursor-pointer
                  outline-none
                  hover:bg-red-500/10 dark:hover:bg-red-400/10
                  focus:bg-red-500/10 dark:focus:bg-red-400/10
                "
              >
                <Icon name="trash-2" size={16} />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}

/**
 * Scrollable conversation history list.
 *
 * Uses Zustand store for conversation state.
 * Waits for hydration before rendering to prevent SSR mismatch.
 * New Chat button and Settings are handled by parent Sidebar component.
 */
export function ConversationList({ onNavigate, onScroll }: ConversationListProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const conversations = useConversationStore((s) => s.conversations);
  const activeId = useConversationStore((s) => s.activeId);
  const hasHydrated = useConversationStore((s) => s._hasHydrated);
  const setActive = useConversationStore((s) => s.setActive);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);
  const toggleStarred = useConversationStore((s) => s.toggleStarred);
  const updateTitle = useConversationStore((s) => s.updateTitle);

  // State for delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);

  // State for collapsible sections
  const [starredCollapsed, setStarredCollapsed] = useState(false);
  const [recentsCollapsed, setRecentsCollapsed] = useState(false);

  // Show skeleton while hydrating
  if (!hasHydrated) {
    return (
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <div className="h-14 bg-surface/10 dark:bg-surface/15 rounded-lg animate-pulse" />
        <div className="h-14 bg-surface/10 dark:bg-surface/15 rounded-lg animate-pulse" />
        <div className="h-14 bg-surface/10 dark:bg-surface/15 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Sort by createdAt (newest first) for stable positioning
  const sortedConversations = [...conversations].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  // Split into starred and recent sections
  const starredConversations = sortedConversations.filter((c) => c.starred);
  const recentConversations = sortedConversations.filter((c) => !c.starred);

  const handleSelect = (id: string) => {
    setActive(id);
    if (pathname !== '/') {
      router.push('/');
    }
    onNavigate?.();
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteConversation(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const renderConversation = (conversation: Conversation) => (
    <ConversationItem
      key={conversation.id}
      conversation={conversation}
      isActive={activeId === conversation.id}
      onSelect={() => handleSelect(conversation.id)}
      onToggleStarred={() => toggleStarred(conversation.id)}
      onRename={(newTitle) => updateTitle(conversation.id, newTitle)}
      onRequestDelete={() => setDeleteTarget(conversation)}
    />
  );

  return (
    <>
      <div
        className="flex-1 overflow-y-auto p-2 space-y-1 sidebar-scrollbar"
        onScroll={(e) => onScroll?.(e.currentTarget.scrollTop)}
      >
        {sortedConversations.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No conversations yet
          </p>
        ) : (
          <>
            {/* Starred section */}
            {starredConversations.length > 0 && (
              <div className="mb-2">
                <button
                  onClick={() => setStarredCollapsed(!starredCollapsed)}
                  className="
                    w-full flex items-center gap-1 px-3 py-1
                    text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
                    hover:text-text-primary transition-colors
                  "
                >
                  <Icon
                    name="chevron-down"
                    size={12}
                    className={`transition-transform ${starredCollapsed ? '-rotate-90' : ''}`}
                  />
                  Starred
                </button>
                {!starredCollapsed && (
                  <div className="space-y-1">
                    {starredConversations.map(renderConversation)}
                  </div>
                )}
              </div>
            )}

            {/* Recents section */}
            {recentConversations.length > 0 && (
              <div>
                {starredConversations.length > 0 && (
                  <button
                    onClick={() => setRecentsCollapsed(!recentsCollapsed)}
                    className="
                      w-full flex items-center gap-1 px-3 py-1
                      text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider
                      hover:text-text-primary transition-colors
                    "
                  >
                    <Icon
                      name="chevron-down"
                      size={12}
                      className={`transition-transform ${recentsCollapsed ? '-rotate-90' : ''}`}
                    />
                    Recents
                  </button>
                )}
                {!recentsCollapsed && (
                  <div className="space-y-1">
                    {recentConversations.map(renderConversation)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in-0 z-50" />
          <Dialog.Content
            className="
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              w-full max-w-sm p-6
              bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700
              rounded-xl shadow-xl
              animate-in fade-in-0 zoom-in-95
              z-50
            "
          >
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Delete chat?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will permanently delete &quot;{truncateTitle(deleteTarget?.title || '', 40)}&quot;. This action cannot be undone.
            </Dialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="
                  px-4 py-2
                  text-sm font-medium text-text-primary
                  bg-btn-secondary hover:bg-btn-secondary-hover
                  rounded-lg
                  transition-colors
                "
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="
                  px-4 py-2
                  text-sm font-medium text-white
                  bg-btn-danger hover:bg-btn-danger-hover
                  rounded-lg
                  transition-colors
                "
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
