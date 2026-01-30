'use client';

import { useState, useRef, useEffect } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useConversationStore } from '@/src/stores/conversationStore';
import { Icon } from '@/src/components/ui/Icon';

interface ChatHeaderProps {
  conversationId: string;
}

/**
 * Truncate text to max length with ellipsis.
 */
function truncateTitle(title: string, maxLength: number = 40): string {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength) + '...';
}

/**
 * Chat header displaying conversation title with dropdown menu.
 * Provides same actions as sidebar: Star/Unstar, Rename, Delete.
 */
export function ChatHeader({ conversationId }: ChatHeaderProps) {
  const conversation = useConversationStore((s) =>
    s.conversations.find((c) => c.id === conversationId)
  );
  const toggleStarred = useConversationStore((s) => s.toggleStarred);
  const updateTitle = useConversationStore((s) => s.updateTitle);
  const deleteConversation = useConversationStore((s) => s.deleteConversation);
  const setActive = useConversationStore((s) => s.setActive);

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation?.title || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update rename value when conversation changes
  useEffect(() => {
    if (conversation) {
      setRenameValue(conversation.title);
    }
  }, [conversation?.title]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  if (!conversation) return null;

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conversation.title) {
      updateTitle(conversationId, trimmed);
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

  const handleConfirmDelete = () => {
    deleteConversation(conversationId);
    setActive(null);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3">
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleKeyDown}
            className="
              flex-1
              text-base font-medium
              bg-transparent
              border-none
              text-text-primary
              outline-none
              max-w-md
            "
          />
        ) : (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="
                  flex items-center gap-1.5
                  text-base font-medium text-text-primary
                  hover:text-text-primary/80
                  transition-colors
                  outline-none
                "
              >
                  <span className="truncate max-w-md">{conversation.title}</span>
                <Icon
                  name="chevron-down"
                  size={16}
                  className="text-gray-400 dark:text-gray-500"
                />
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
                align="start"
              >
                <DropdownMenu.Item
                  onClick={() => toggleStarred(conversationId)}
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
                  onClick={() => setIsRenaming(true)}
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
                  onClick={() => setShowDeleteConfirm(true)}
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
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
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
              This will permanently delete &quot;{truncateTitle(conversation.title)}&quot;. This action cannot be undone.
            </Dialog.Description>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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
