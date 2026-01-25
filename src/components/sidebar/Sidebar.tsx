'use client';

import { useState } from 'react';
import { ModelSelector } from './ModelSelector';
import { ConversationList } from './ConversationList';
import { ThemeToggle } from '@/src/components/ui/ThemeToggle';
import { ApiKeyModal } from '@/src/components/ui/ApiKeyModal';
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
  const [apiKey] = useLocalStorage<string>('openrouter-api-key', '');

  return (
    <>
      {/* Mobile toggle button - fixed top-left, visible only when sidebar closed */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`
          lg:hidden
          fixed top-4 z-50
          p-2 cursor-pointer
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Quilibrium Chat
          </h1>
          <ThemeToggle />
        </div>

        {/* Configuration section */}
        <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-700">
          {/* API Key Configuration */}
          <ApiKeyModal>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg cursor-pointer
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors text-left">
              {/* Status indicator */}
              <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="flex-1">
                {apiKey ? 'API Key Configured' : 'Configure API Key'}
              </span>
              {/* Settings icon */}
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </ApiKeyModal>
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
        </div>

        {/* Conversation list - fills remaining space */}
        <ConversationList />
      </aside>
    </>
  );
}
