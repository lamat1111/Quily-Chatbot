'use client';

import { useState } from 'react';
import { ConversationList } from './ConversationList';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { SettingsModal } from '@/src/components/ui/SettingsModal';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { useConversationStore } from '@/src/stores/conversationStore';
import { useChutesSession } from '@/src/hooks/useChutesSession';

/**
 * Main sidebar component containing settings and conversation history.
 *
 * Layout:
 * - Header with title and theme toggle
 * - New Chat button (fixed)
 * - Conversation list (scrollable, fills remaining space)
 * - Settings button (fixed at bottom)
 *
 * Responsive:
 * - Desktop (lg+): w-72, always visible
 * - Mobile: full width overlay when open, hidden when closed
 */
export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [providerId] = useLocalStorage<string>('selected-provider', 'openrouter');
  const [apiKey] = useLocalStorage<string>('openrouter-api-key', '');
  const { isSignedIn: isChutesSignedIn } = useChutesSession();
  const addConversation = useConversationStore((s) => s.addConversation);

  const isConnected =
    providerId === 'chutes' ? isChutesSignedIn : Boolean(apiKey);

  const handleNewChat = () => {
    addConversation();
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile header bar - takes space in layout, doesn't overlap content */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 cursor-pointer text-text-primary rounded-lg hover:bg-surface/10 dark:hover:bg-surface/15 transition-colors"
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? (
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
        <h1 className="ml-2 text-lg font-semibold text-text-primary">
          Quily Chat
          <sup className="ml-1 text-[10px] font-medium text-accent">beta</sup>
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
          bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header with title and theme toggle */}
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold text-text-primary">
            Quily Chat
            <sup className="ml-1 text-[10px] font-medium text-accent">beta</sup>
          </h1>
          <ThemeToggle />
        </div>

        {/* New Chat button - fixed at top */}
        <div className="px-2 pb-2">
          <button
            onClick={handleNewChat}
            className="
              w-full px-4 py-2
              text-sm font-medium
              text-accent
              bg-transparent
              border border-accent
              hover:bg-accent/10 dark:hover:bg-accent/20
              rounded-lg
              transition-colors
              flex items-center justify-center gap-2
            "
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Chat
          </button>
        </div>

        {/* Conversation list - scrollable, fills remaining space */}
        <ConversationList onNavigate={() => setSidebarOpen(false)} />

        {/* Settings at bottom - fixed */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <SettingsModal>
            <button
              style={{ cursor: 'pointer' }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg
              text-text-secondary
              hover:bg-surface/10 dark:hover:bg-surface/15
              transition-colors text-left">
              {/* Status indicator */}
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="flex-1">Settings</span>
              {/* Settings icon */}
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </SettingsModal>
        </div>
      </aside>
    </>
  );
}
