'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { Icon } from '@/src/components/ui/Icon';
import { useConversationStore, Conversation } from '@/src/stores/conversationStore';
import { getTimeGroup } from '@/src/lib/utils/time';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseSidebar?: () => void;
}

interface GroupedResults {
  today: Conversation[];
  past7Days: Conversation[];
  past30Days: Conversation[];
  older: Conversation[];
}

/**
 * Full-screen search modal for finding conversations.
 *
 * Features:
 * - Search by title and message content
 * - Time-based grouping (Today, Past 7 days, Past 30 days, Older)
 * - Keyboard navigation (arrows, enter, escape)
 * - 300ms debounced search
 */
export function SearchModal({ open, onOpenChange, onCloseSidebar }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const conversations = useConversationStore((s) => s.conversations);
  const setActive = useConversationStore((s) => s.setActive);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Filter conversations by title and message content
  const filteredConversations = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return conversations;
    }

    const query = debouncedQuery.toLowerCase();

    return conversations.filter((conv) => {
      // Check title
      if (conv.title.toLowerCase().includes(query)) {
        return true;
      }

      // Check message content (limit to first 100 messages)
      const messagesToSearch = conv.messages.slice(0, 100);
      return messagesToSearch.some((msg) =>
        msg.content.toLowerCase().includes(query)
      );
    });
  }, [conversations, debouncedQuery]);

  // Sort: title matches first, then by updatedAt
  const sortedConversations = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return filteredConversations;
    }

    const query = debouncedQuery.toLowerCase();

    return [...filteredConversations].sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(query);
      const bTitle = b.title.toLowerCase().includes(query);

      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;

      return b.updatedAt - a.updatedAt;
    });
  }, [filteredConversations, debouncedQuery]);

  // Group by time period
  const groupedResults = useMemo((): GroupedResults => {
    const groups: GroupedResults = {
      today: [],
      past7Days: [],
      past30Days: [],
      older: [],
    };

    sortedConversations.forEach((conv) => {
      const group = getTimeGroup(conv.updatedAt);
      switch (group) {
        case 'Today':
          groups.today.push(conv);
          break;
        case 'Past 7 days':
          groups.past7Days.push(conv);
          break;
        case 'Past 30 days':
          groups.past30Days.push(conv);
          break;
        default:
          groups.older.push(conv);
      }
    });

    return groups;
  }, [sortedConversations]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    return [
      ...groupedResults.today,
      ...groupedResults.past7Days,
      ...groupedResults.past30Days,
      ...groupedResults.older,
    ];
  }, [groupedResults]);

  // Handle result selection
  const handleSelect = useCallback(
    (conversationId: string) => {
      setActive(conversationId);
      onOpenChange(false);

      // Navigate to home if not already there
      if (pathname !== '/') {
        router.push('/');
      }

      // Close sidebar on mobile
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        onCloseSidebar?.();
      }
    },
    [setActive, onOpenChange, onCloseSidebar, pathname, router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex].id);
          }
          break;
      }
    },
    [flatResults, selectedIndex, handleSelect]
  );

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatResults.length]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedEl = resultsRef.current.querySelector('[data-selected="true"]');
      selectedEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const renderGroup = (title: string, items: Conversation[], startIndex: number) => {
    if (items.length === 0) return null;

    return (
      <div key={title}>
        <div className="text-xs text-text-muted uppercase tracking-wide px-3 py-2 font-medium">
          {title}
        </div>
        {items.map((conv, idx) => {
          const globalIndex = startIndex + idx;
          const isSelected = globalIndex === selectedIndex;

          return (
            <button
              key={conv.id}
              data-selected={isSelected}
              onClick={() => handleSelect(conv.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer
                transition-colors rounded-md mx-1
                ${
                  isSelected
                    ? 'bg-selected ring-1 ring-accent/50'
                    : 'hover:bg-hover'
                }
              `}
            >
              <Icon name="message-square" size={16} className="text-text-subtle flex-shrink-0" />
              <span className="flex-1 truncate text-sm text-text-base">
                {conv.title}
              </span>
              <span className="text-xs text-text-muted flex-shrink-0">
                {formatRelativeTime(conv.updatedAt)}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  // Calculate start indices for each group
  let currentIndex = 0;
  const todayStartIndex = currentIndex;
  currentIndex += groupedResults.today.length;
  const past7StartIndex = currentIndex;
  currentIndex += groupedResults.past7Days.length;
  const past30StartIndex = currentIndex;
  currentIndex += groupedResults.past30Days.length;
  const olderStartIndex = currentIndex;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[60] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-bg-elevated rounded-lg shadow-xl z-[60] focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border border-border"
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title className="sr-only">Search conversations</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search through your conversation history by title or message content
          </Dialog.Description>

          {/* Search input */}
          <div className="px-3 py-3 border-b border-border">
            <div className="flex items-center gap-2 bg-bg-inset rounded-lg px-3 py-2 border border-transparent focus-within:border-input-focus transition-colors">
              <Icon name="search" size={18} className="text-text-muted" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-sm text-text-base placeholder-text-muted focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-hover rounded cursor-pointer"
                  aria-label="Clear search"
                >
                  <Icon name="x" size={16} className="text-text-subtle" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-[50vh] overflow-y-auto p-2 modal-scrollbar"
          >
            {flatResults.length === 0 ? (
              <div className="text-center py-8 text-sm text-text-muted">
                {debouncedQuery ? 'No results found' : 'No conversations yet'}
              </div>
            ) : (
              <>
                {renderGroup('Today', groupedResults.today, todayStartIndex)}
                {renderGroup('Past 7 days', groupedResults.past7Days, past7StartIndex)}
                {renderGroup('Past 30 days', groupedResults.past30Days, past30StartIndex)}
                {renderGroup('Older', groupedResults.older, olderStartIndex)}
              </>
            )}
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Format a timestamp as relative time (e.g., "2h ago", "3d ago")
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'now';
  }

  if (diff < hour) {
    const mins = Math.floor(diff / minute);
    return `${mins}m ago`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h ago`;
  }

  const days = Math.floor(diff / day);
  if (days < 30) {
    return `${days}d ago`;
  }

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
