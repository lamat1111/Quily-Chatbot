'use client';

import { useState } from 'react';
import { ApiKeyConfig } from './ApiKeyConfig';
import { ModelSelector } from './ModelSelector';
import { ConversationList } from './ConversationList';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { useLocalStorage } from '@/src/hooks/useLocalStorage';
import { RECOMMENDED_MODELS } from '@/src/lib/openrouter';

/**
 * Main sidebar component containing API configuration and conversation history.
 *
 * Layout:
 * - API key config at top
 * - Model selector below
 * - Divider
 * - Conversation list (flex-1, scrollable)
 *
 * Responsive:
 * - Desktop (lg+): w-72, always visible
 * - Mobile: full width overlay when open, hidden when closed
 */
export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useLocalStorage<string>(
    'selected-model',
    RECOMMENDED_MODELS[0].id
  );

  return (
    <>
      {/* Mobile toggle button - fixed top-left, visible only when sidebar closed */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`
          lg:hidden
          fixed top-4 z-50
          p-2
          bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
          rounded-lg shadow-md border border-gray-200 dark:border-gray-700
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-all
          ${sidebarOpen ? 'left-[17rem]' : 'left-4'}
        `}
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

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/70"
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quilibrium Chat
          </h1>
          <ThemeToggle />
        </div>

        {/* Configuration section */}
        <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
          <ApiKeyConfig />
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        </div>

        {/* Conversation list - fills remaining space */}
        <ConversationList />
      </aside>
    </>
  );
}
