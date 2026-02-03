'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ConversationList } from './ConversationList';
import { SearchModal } from './SearchModal';
import { Icon } from '@/src/components/ui/Icon';
import { LogoIcon } from '@/src/components/ui/LogoIcon';
import { Tooltip, TooltipProvider } from '@/src/components/ui/Tooltip';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { useConversationStore } from '@/src/stores/conversationStore';
import { useChutesSession } from '@/src/hooks/useChutesSession';
import { useSearch } from '@/src/contexts/SearchContext';

/**
 * Main sidebar component containing navigation and conversation history.
 *
 * Layout:
 * - Header with logo + close button (when expanded)
 * - Navigation items (New Chat, Search, About, Links)
 * - Conversation list (scrollable, fills remaining space)
 * - Settings button (fixed at bottom)
 *
 * Responsive:
 * - Mobile (< lg): Fixed header bar with hamburger + chat title, sidebar slides in as overlay
 * - Desktop (lg+): Collapsed icon sidebar always visible, expands to full sidebar on click
 */
export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [providerId] = useLocalStorage<string>('selected-provider', 'openrouter');
  const [apiKey] = useLocalStorage<string>('openrouter-api-key', '');
  const [profileName] = useLocalStorage<string>('user-profile-name', 'You');
  const { isSignedIn: isChutesSignedIn } = useChutesSession();
  const addConversation = useConversationStore((s) => s.addConversation);
  const activeId = useConversationStore((s) => s.activeId);
  const conversations = useConversationStore((s) => s.conversations);
  const { isSearchOpen, openSearch, closeSearch } = useSearch();

  const isConnected =
    providerId === 'chutes' ? isChutesSignedIn : Boolean(apiKey);

  // Track when secondary nav items (About, Links) scroll out of view
  const [showNavSeparator, setShowNavSeparator] = useState(false);

  // Get active conversation title (only show on home page with active conversation)
  const activeConversation = conversations.find((c) => c.id === activeId);
  const showChatTitle = pathname === '/' && activeConversation;

  const handleNewChat = () => {
    addConversation();
    // Navigate to home if not already there
    if (pathname !== '/') {
      router.push('/');
    }
    setSidebarOpen(false);
  };

  // Icon button style for collapsed sidebar
  const iconButtonClass = `
    p-2.5 rounded-lg
    text-text-muted hover:text-text-primary
    hover:bg-surface/10 dark:hover:bg-surface/15
    transition-colors cursor-pointer
    flex items-center justify-center
  `;

  return (
    <>
      {/* Mobile header bar - only on smaller screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-bg-muted flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 cursor-pointer text-text-primary rounded-lg hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <Icon name={sidebarOpen ? 'x' : 'menu'} size={22} />
        </button>
        {showChatTitle && (
          <span className="ml-3 text-sm font-medium text-text-primary truncate flex-1 min-w-0">
            {activeConversation.title}
          </span>
        )}
        {/* Spacer to push logo to right */}
        {!showChatTitle && <div className="flex-1" />}
        {/* Logo on right side */}
        <button
          onClick={handleNewChat}
          className="p-1 ml-2 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="New conversation"
        >
          <LogoIcon size={32} />
        </button>
      </div>

      {/* Desktop collapsed sidebar - always visible on lg+ */}
      <TooltipProvider delayDuration={150}>
        <nav className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-14 bg-bg-muted flex-col items-center pt-2 pb-4 border-r border-surface/10">
          {/* Expand button */}
          <Tooltip content="Expand menu">
            <button
              onClick={() => setSidebarOpen(true)}
              className={iconButtonClass}
              aria-label="Expand sidebar"
            >
              <Icon name="menu" size={20} />
            </button>
          </Tooltip>

          {/* New Chat */}
          <Tooltip content="New chat">
            <button
              onClick={handleNewChat}
              className={`${iconButtonClass} mt-2 text-accent! hover:text-accent!`}
              aria-label="New chat"
            >
              <Icon name="plus" size={20} />
            </button>
          </Tooltip>

          {/* Chat List */}
          <Tooltip content="Chat history">
            <button
              onClick={() => setSidebarOpen(true)}
              className={iconButtonClass}
              aria-label="Chat history"
            >
              <Icon name="message-square" size={20} />
            </button>
          </Tooltip>

          {/* Search */}
          <Tooltip content="Search">
            <button
              onClick={openSearch}
              className={iconButtonClass}
              aria-label="Search"
            >
              <Icon name="search" size={20} />
            </button>
          </Tooltip>

          {/* About */}
          <Tooltip content="About">
            <Link
              href="/about"
              className={iconButtonClass}
              aria-label="About"
            >
              <Icon name="info" size={20} />
            </Link>
          </Tooltip>

          {/* Links */}
          <Tooltip content="Quilibrium Links">
            <Link
              href="/links"
              className={iconButtonClass}
              aria-label="Quilibrium Links"
            >
              <Icon name="link" size={20} />
            </Link>
          </Tooltip>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Settings at bottom */}
          <Tooltip content="Settings">
            <Link
              href="/settings"
              className={`${iconButtonClass} relative`}
              aria-label="Settings"
            >
              <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <Icon name="settings" size={20} />
            </Link>
          </Tooltip>
        </nav>
      </TooltipProvider>

      {/* Backdrop - visible on all screen sizes when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 cursor-pointer lg:bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Expanded Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-[80vw] sm:w-72 2xl:w-80 h-screen
          bg-bg-muted
          flex flex-col
          overflow-hidden
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header with logo and close button */}
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={handleNewChat}
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="New conversation"
          >
            <LogoIcon size={36} />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 cursor-pointer text-text-primary rounded-lg hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors"
            aria-label="Close sidebar"
          >
            <Icon name="x" size={22} />
          </button>
        </div>

        {/* Fixed navigation - stays visible, content scrolls under */}
        <nav className="px-2 shrink-0 bg-bg-muted relative z-10">
          {/* New Chat - accent colored */}
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

          {/* Search */}
          <button
            onClick={openSearch}
            className="
              w-full px-3 py-2
              text-sm
              text-text-primary sm:text-text-muted
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

          {/* Separator appears when secondary nav scrolls out of view */}
          <div
            className={`
              border-b border-surface/15 dark:border-surface/20
              transition-opacity duration-150
              -mx-2
              ${showNavSeparator ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </nav>

        {/* Conversation list - scrollable, fills remaining space */}
        {/* About/Links are inside the scroll area so they scroll away naturally */}
        <ConversationList
          onNavigate={() => setSidebarOpen(false)}
          onSecondaryNavHidden={setShowNavSeparator}
          secondaryNav={
            <>
              <Link
                href="/about"
                onClick={() => setSidebarOpen(false)}
                className="
                  w-full px-3 py-2
                  text-sm
                  text-text-primary sm:text-text-muted
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
                  text-text-primary sm:text-text-muted
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
            </>
          }
        />

        {/* Settings at bottom - fixed */}
        <div className="p-4">
          <Link
            href="/settings"
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
              text-text-primary sm:text-text-muted
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
