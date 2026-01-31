'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ConversationList } from './ConversationList';
import { SearchModal } from './SearchModal';
import { Icon } from '@/src/components/ui/Icon';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { useConversationStore } from '@/src/stores/conversationStore';
import { useChutesSession } from '@/src/hooks/useChutesSession';
import { useSearch } from '@/src/contexts/SearchContext';

/**
 * Main sidebar component containing navigation and conversation history.
 *
 * Layout:
 * - Header with title and theme toggle
 * - Navigation items (New Chat, About, Links) - collapses on scroll
 * - Conversation list (scrollable, fills remaining space)
 * - Settings button (fixed at bottom)
 *
 * Responsive:
 * - Desktop (lg+): w-72, always visible
 * - Mobile: full width overlay when open, hidden when closed
 */
export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [providerId] = useLocalStorage<string>('selected-provider', 'openrouter');
  const [apiKey] = useLocalStorage<string>('openrouter-api-key', '');
  const [profileName] = useLocalStorage<string>('user-profile-name', 'You');
  const { isSignedIn: isChutesSignedIn } = useChutesSession();
  const addConversation = useConversationStore((s) => s.addConversation);
  const { isSearchOpen, openSearch, closeSearch } = useSearch();

  const isConnected =
    providerId === 'chutes' ? isChutesSignedIn : Boolean(apiKey);

  const handleNewChat = () => {
    addConversation();
    // Navigate to home if not already there
    if (pathname !== '/') {
      router.push('/');
    }
    setSidebarOpen(false);
  };

  const handleScroll = (scrollTop: number) => {
    // Collapse secondary nav items as soon as scrolling starts
    setIsScrolled(scrollTop > 0);
  };

  return (
    <>
      {/* Mobile header bar - takes space in layout, doesn't overlap content */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-bg-muted flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 cursor-pointer text-text-primary rounded-lg hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? (
            <Icon name="x" size={24} />
          ) : (
            <Icon name="menu" size={24} />
          )}
        </button>
        <h1 className="ml-2 text-lg font-semibold text-text-primary flex-1 font-title">
          Quily Chat
          <sup className="ml-1 text-[10px] font-medium text-accent font-sans">beta</sup>
        </h1>
      </div>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/70 cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-72
          bg-bg-muted
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header with title */}
        <div className="p-4">
          <h1 className="text-lg font-semibold text-text-primary font-title">
            Quily Chat
            <sup className="ml-1 text-[10px] font-medium text-accent font-sans">beta</sup>
          </h1>
        </div>

        {/* Navigation items */}
        <nav className="px-2 pb-2">
          {/* New Chat - always visible, accent colored */}
          <button
            onClick={handleNewChat}
            className="
              w-full px-3 py-2
              text-sm font-medium
              text-accent
              hover:bg-accent/10 dark:hover:bg-accent/15
              rounded-lg
              transition-colors
              flex items-center gap-3
              cursor-pointer
            "
          >
            <Icon name="plus" size={18} className="text-accent" />
            New Chat
          </button>

          {/* Search - always visible */}
          <button
            onClick={openSearch}
            className="
              w-full px-3 py-2
              text-sm
              text-text-muted
              hover:text-text-brand
              hover:bg-surface/10 dark:hover:bg-surface/15
              rounded-lg
              transition-colors
              flex items-center gap-3
              cursor-pointer
            "
          >
            <Icon name="search" size={18} />
            Search
          </button>

          {/* Collapsible items */}
          <div
            className={`
              transition-all duration-150
              ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}
            `}
          >
            <Link
              href="/about"
              onClick={() => setSidebarOpen(false)}
              className="
                w-full px-3 py-2
                text-sm
                text-text-muted
                hover:text-text-brand
                hover:bg-hover
                rounded-lg
                transition-colors
                flex items-center gap-3
              "
            >
              <Icon name="info" size={18} />
              About
            </Link>

            <Link
              href="/links"
              onClick={() => setSidebarOpen(false)}
              className="
                w-full px-3 py-2
                text-sm
                text-text-muted
                hover:text-text-brand
                hover:bg-hover
                rounded-lg
                transition-colors
                flex items-center gap-3
              "
            >
              <Icon name="link" size={18} />
              Quilibrium Links
            </Link>
          </div>
        </nav>

        {/* Conversation list - scrollable, fills remaining space */}
        <ConversationList
          onNavigate={() => setSidebarOpen(false)}
          onScroll={handleScroll}
        />

        {/* Settings at bottom - fixed */}
        <div className="p-4">
          <Link
            href="/settings"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
              text-text-muted
              hover:bg-hover
              transition-colors text-left"
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="flex-1 truncate">
              {profileName}
            </span>
            <Icon name="settings" size={16} className="text-text-subtle" />
          </Link>
        </div>
      </aside>

      {/* Search Modal */}
      <SearchModal
        open={isSearchOpen}
        onOpenChange={(open) => (open ? openSearch() : closeSearch())}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
    </>
  );
}
