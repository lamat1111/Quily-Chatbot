'use client';

import { Sidebar } from '@/src/components/sidebar/Sidebar';
import { SearchProvider } from '@/src/contexts/SearchContext';

/**
 * Main application layout with persistent sidebar.
 *
 * This component keeps the Sidebar mounted across all page navigations
 * to prevent flickering/re-rendering when changing routes.
 *
 * Includes SearchProvider for global Ctrl/Cmd+K search shortcut.
 *
 * Layout:
 * - Mobile (< lg): Fixed header bar with hamburger + chat title, content has top padding
 * - Desktop (lg+): Collapsed icon sidebar (w-14) always visible, content has left padding
 * - Expanded sidebar is always an overlay (slides in from left)
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <div className="flex h-screen bg-bg-base">
        <Sidebar />
        {/* Main content area
            - pt-14 on mobile for fixed header bar
            - lg:pt-0 on desktop (no fixed header)
            - lg:pl-14 on desktop for collapsed sidebar width
        */}
        <main className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0 lg:pl-14">
          {children}
        </main>
      </div>
    </SearchProvider>
  );
}
