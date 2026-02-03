'use client';

import { useState, useEffect } from 'react';
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
import { useSidebar } from '@/src/contexts/SidebarContext';

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
 * - Desktop (lg+): Sidebar open by default, pushes content; can collapse to icon bar
 */
export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen: sidebarOpen, open: openSidebar, close: closeSidebar, toggle: toggleSidebar } = useSidebar();
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

  // Track if we're on desktop for conditional behavior
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleNewChat = () => {
    addConversation();
    // Navigate to home if not already there
    if (pathname !== '/') {
      router.push('/');
    }
    // Only close sidebar on mobile
    if (!isDesktop) {
      closeSidebar();
    }
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
          onClick={toggleSidebar}
          className="p-2 cursor-pointer text-text-primary rounded-lg hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <Icon name={sidebarOpen ? 'x' : 'menu'} size={22} />
        </button>
        {showChatTitle && (
          <span className="ml-3 text-base sm:text-sm font-medium text-text-primary truncate flex-1 min-w-0">
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

      {/* Desktop collapsed sidebar - only visible on lg+ when sidebar is closed */}
      <TooltipProvider delayDuration={150}>
        <nav
          className={`
            hidden lg:flex fixed inset-y-0 left-0 z-40 w-14 bg-bg-muted flex-col items-center pt-2 pb-4 border-r border-surface/10
            transition-opacity duration-200
            ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          {/* Expand button */}
          <button
            onClick={openSidebar}
            className={iconButtonClass}
            aria-label="Expand sidebar"
          >
            <Icon name="menu" size={20} />
          </button>

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
              onClick={openSidebar}
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

      {/* Backdrop - only visible on mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 cursor-pointer lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Expanded Sidebar */}
      {/* Mobile: fixed overlay with transform animation */}
      {/* Desktop: static sidebar that pushes content, transitions width */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-[80vw] sm:w-72 h-screen-safe
          bg-bg-muted
          flex flex-col
          overflow-hidden
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:z-0 lg:shrink-0 lg:transform-none
          lg:transition-[width] lg:duration-200
          ${sidebarOpen ? 'lg:w-72 2xl:lg:w-80' : 'lg:w-0'}
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
            onClick={closeSidebar}
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
              w-full px-3 py-3 sm:py-2
              min-h-11 sm:min-h-0
              text-base sm:text-sm font-medium
              text-accent
              hover:bg-accent/10 dark:hover:bg-accent/15
              rounded-lg
              transition-colors
              flex items-center gap-3
              cursor-pointer
            "
          >
            <Icon name="plus" size={20} className="sm:w-4.5 sm:h-4.5 text-accent" />
            New Chat
          </button>

          {/* Search */}
          <button
            onClick={() => {
              openSearch();
              // Only close sidebar on mobile
              if (!isDesktop) {
                closeSidebar();
              }
            }}
            className="
              w-full px-3 py-3 sm:py-2
              min-h-11 sm:min-h-0
              text-base sm:text-sm
              text-text-primary sm:text-text-muted
              hover:text-text-brand
              hover:bg-surface/10 dark:hover:bg-surface/15
              rounded-lg
              transition-colors
              flex items-center gap-3
              cursor-pointer
            "
          >
            <Icon name="search" size={20} className="sm:w-4.5 sm:h-4.5" />
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
          onNavigate={() => {
            // Only close sidebar on mobile
            if (!isDesktop) {
              closeSidebar();
            }
          }}
          onSecondaryNavHidden={setShowNavSeparator}
          secondaryNav={
            <>
              <Link
                href="/about"
                onClick={() => {
                  if (!isDesktop) closeSidebar();
                }}
                className="
                  w-full px-3 py-3 sm:py-2
                  min-h-11 sm:min-h-0
                  text-base sm:text-sm
                  text-text-primary sm:text-text-muted
                  hover:text-text-brand
                  hover:bg-hover
                  rounded-lg
                  transition-colors
                  flex items-center gap-3
                "
              >
                <Icon name="info" size={20} className="sm:w-4.5 sm:h-4.5" />
                About
              </Link>

              <Link
                href="/links"
                onClick={() => {
                  if (!isDesktop) closeSidebar();
                }}
                className="
                  w-full px-3 py-3 sm:py-2
                  min-h-11 sm:min-h-0
                  text-base sm:text-sm
                  text-text-primary sm:text-text-muted
                  hover:text-text-brand
                  hover:bg-hover
                  rounded-lg
                  transition-colors
                  flex items-center gap-3
                "
              >
                <Icon name="link" size={20} className="sm:w-4.5 sm:h-4.5" />
                Quilibrium Links
              </Link>
            </>
          }
        />

        {/* Settings at bottom - fixed */}
        <div className="p-4">
          <Link
            href="/settings"
            onClick={() => {
              if (!isDesktop) closeSidebar();
            }}
            className="w-full flex items-center gap-3 px-3 py-3 sm:py-2 min-h-11 sm:min-h-0 text-base sm:text-sm rounded-lg
              text-text-primary sm:text-text-muted
              hover:bg-hover
              transition-colors text-left"
          >
            <span className={`w-2.5 sm:w-2 h-2.5 sm:h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="flex-1 truncate">
              {profileName}
            </span>
            <Icon name="settings" size={18} className="sm:w-4 sm:h-4 text-text-subtle" />
          </Link>
        </div>
      </aside>

      {/* Search Modal */}
      <SearchModal
        open={isSearchOpen}
        onOpenChange={(open) => (open ? openSearch() : closeSearch())}
        onCloseSidebar={() => {
          if (!isDesktop) closeSidebar();
        }}
      />
    </>
  );
}
